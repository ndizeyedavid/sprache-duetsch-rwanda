import { Prisma } from "../../generated/prisma/client.js";
import type { Role } from "../../generated/prisma/client.js";
import { writeAudit } from "../../lib/audit.js";
import { recalculateStudentFinance } from "../../lib/finance.js";
import { badRequest, conflict, forbidden, notFound } from "../../lib/http-error.js";
import { generateReceiptNumber } from "../../lib/ids.js";
import { buildPaginated, parsePagination } from "../../lib/pagination.js";
import { prisma } from "../../lib/prisma.js";
import type {
  CreateChargeInput,
  CreateDiscountInput,
  CreatePaymentInput,
  CreatePaymentMethodInput,
  CreateRefundInput,
  DeleteChargeInput,
  DeletePaymentInput,
  FinanceSummaryQuery,
  ListChargesQuery,
  ListDiscountsQuery,
  ListPaymentMethodQuery,
  ListPaymentsQuery,
  ListReceiptsQuery,
  MyReceiptsQuery,
  OutstandingQuery,
  RejectDiscountInput,
  RunRemindersInput,
  UpdateChargeInput,
  UpdatePaymentInput,
  UpdatePaymentMethodInput,
} from "./payments.schema.js";

const ZERO = new Prisma.Decimal(0);

// --- Shared selections ---

const studentSummarySelect = {
  id: true,
  studentCode: true,
  user: { select: { firstName: true, lastName: true, email: true } },
} as const;

const methodSummarySelect = {
  id: true,
  code: true,
  name: true,
  requiresReference: true,
  instructions: true,
} as const;

const paymentInclude = {
  method: { select: methodSummarySelect },
  receipt: true,
  student: { select: studentSummarySelect },
} as const;

const receiptInclude = {
  payment: {
    select: {
      id: true,
      amount: true,
      currency: true,
      txnType: true,
      reference: true,
      paidAt: true,
      student: {
        select: {
          id: true,
          studentCode: true,
          userId: true,
          user: { select: { firstName: true, lastName: true, email: true } },
        },
      },
      method: { select: methodSummarySelect },
    },
  },
} as const;

const dateFilter = (from?: Date, to?: Date): Prisma.DateTimeFilter | undefined => {
  if (!from && !to) return undefined;
  const filter: Prisma.DateTimeFilter = {};
  if (from) filter.gte = from;
  if (to) filter.lte = to;
  return filter;
};

// --- Payment methods ---

export const listPaymentMethods = async (query: ListPaymentMethodQuery) => {
  const where: Prisma.PaymentMethodConfigWhereInput = {};
  if (query.isActive !== undefined) where.isActive = query.isActive;

  return prisma.paymentMethodConfig.findMany({
    where,
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
};

export const createPaymentMethod = async (
  input: CreatePaymentMethodInput,
  actorId?: string,
) => {
  const existing = await prisma.paymentMethodConfig.findUnique({
    where: { code: input.code },
    select: { id: true },
  });
  if (existing) {
    throw conflict("A payment method with this code already exists");
  }

  const method = await prisma.paymentMethodConfig.create({
    data: {
      code: input.code,
      name: input.name,
      requiresReference: input.requiresReference ?? false,
      instructions: input.instructions ?? null,
      isActive: input.isActive ?? true,
      sortOrder: input.sortOrder ?? 0,
    },
  });

  await writeAudit({
    actorId: actorId ?? null,
    action: "PAYMENT_METHOD_CREATED",
    entityType: "PaymentMethodConfig",
    entityId: method.id,
    after: method,
  });

  return method;
};

export const updatePaymentMethod = async (
  id: string,
  input: UpdatePaymentMethodInput,
  actorId?: string,
) => {
  const before = await prisma.paymentMethodConfig.findUnique({ where: { id } });
  if (!before) {
    throw notFound("Payment method not found");
  }

  if (input.code && input.code !== before.code) {
    const duplicate = await prisma.paymentMethodConfig.findUnique({
      where: { code: input.code },
      select: { id: true },
    });
    if (duplicate) {
      throw conflict("A payment method with this code already exists");
    }
  }

  const method = await prisma.paymentMethodConfig.update({
    where: { id },
    data: {
      code: input.code,
      name: input.name,
      requiresReference: input.requiresReference,
      instructions: input.instructions,
      isActive: input.isActive,
      sortOrder: input.sortOrder,
    },
  });

  await writeAudit({
    actorId: actorId ?? null,
    action: "PAYMENT_METHOD_UPDATED",
    entityType: "PaymentMethodConfig",
    entityId: method.id,
    before,
    after: method,
  });

  return method;
};

export const disablePaymentMethod = async (id: string, actorId?: string) => {
  const before = await prisma.paymentMethodConfig.findUnique({ where: { id } });
  if (!before) {
    throw notFound("Payment method not found");
  }

  const method = await prisma.paymentMethodConfig.update({
    where: { id },
    data: { isActive: false },
  });

  await writeAudit({
    actorId: actorId ?? null,
    action: "PAYMENT_METHOD_DISABLED",
    entityType: "PaymentMethodConfig",
    entityId: method.id,
    before,
    after: method,
  });

  return method;
};

// --- Shared helpers ---

const assertStudentExists = async (studentId: string): Promise<void> => {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { id: true },
  });
  if (!student) {
    throw notFound("Student not found");
  }
};

const getEnrollmentForStudent = async (enrollmentId: string, studentId: string) => {
  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    select: {
      id: true,
      studentId: true,
      currency: true,
      totalFee: true,
      level: { select: { currency: true } },
    },
  });
  if (!enrollment) {
    throw notFound("Enrollment not found");
  }
  if (enrollment.studentId !== studentId) {
    throw badRequest("Enrollment does not belong to the student");
  }
  return enrollment;
};

const assertActiveMethod = async (methodId: string): Promise<void> => {
  const method = await prisma.paymentMethodConfig.findUnique({
    where: { id: methodId },
    select: { id: true, isActive: true },
  });
  if (!method) {
    throw notFound("Payment method not found");
  }
  if (!method.isActive) {
    throw badRequest("Payment method is not active");
  }
};

// --- Charges ---

export const createCharge = async (input: CreateChargeInput, actorId?: string) => {
  await assertStudentExists(input.studentId);
  const enrollment = input.enrollmentId
    ? await getEnrollmentForStudent(input.enrollmentId, input.studentId)
    : null;

  const currency = input.currency ?? enrollment?.level.currency ?? "RWF";

  const charge = await prisma.$transaction(async (tx) => {
    const created = await tx.charge.create({
      data: {
        studentId: input.studentId,
        enrollmentId: input.enrollmentId ?? null,
        type: input.type,
        description: input.description,
        amount: new Prisma.Decimal(input.amount),
        currency,
        dueDate: input.dueDate ?? null,
        createdById: actorId ?? null,
      },
    });

    await recalculateStudentFinance(tx, input.studentId);
    return created;
  });

  await writeAudit({
    actorId: actorId ?? null,
    action: "CHARGE_CREATED",
    entityType: "Charge",
    entityId: charge.id,
    after: charge,
  });

  return charge;
};

export const listCharges = async (query: ListChargesQuery) => {
  const pagination = parsePagination(query);

  const where: Prisma.ChargeWhereInput = {};
  if (query.studentId) where.studentId = query.studentId;
  if (query.enrollmentId) where.enrollmentId = query.enrollmentId;
  if (query.type) where.type = query.type;
  where.createdAt = dateFilter(query.from, query.to);

  const [rows, total] = await prisma.$transaction([
    prisma.charge.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: pagination.skip,
      take: pagination.take,
      include: {
        student: { select: studentSummarySelect },
        enrollment: { select: { id: true, levelId: true, currency: true } },
      },
    }),
    prisma.charge.count({ where }),
  ]);

  return buildPaginated(rows, total, pagination);
};

export const updateCharge = async (id: string, input: UpdateChargeInput, actorId?: string) => {
  const before = await prisma.charge.findUnique({ where: { id } });
  if (!before) {
    throw notFound("Charge not found");
  }

  const updated = await prisma.$transaction(async (tx) => {
    const charge = await tx.charge.update({
      where: { id },
      data: {
        description: input.description,
        amount: input.amount !== undefined ? new Prisma.Decimal(input.amount) : undefined,
        dueDate: input.dueDate,
      },
    });

    await recalculateStudentFinance(tx, before.studentId);
    return charge;
  });

  await writeAudit({
    actorId: actorId ?? null,
    action: "CHARGE_UPDATED",
    entityType: "Charge",
    entityId: id,
    before,
    after: updated,
    reason: input.reason,
  });

  return updated;
};

export const deleteCharge = async (id: string, input: DeleteChargeInput, actorId?: string) => {
  const before = await prisma.charge.findUnique({ where: { id } });
  if (!before) {
    throw notFound("Charge not found");
  }

  await prisma.$transaction(async (tx) => {
    await tx.charge.delete({ where: { id } });
    await recalculateStudentFinance(tx, before.studentId);
  });

  await writeAudit({
    actorId: actorId ?? null,
    action: "CHARGE_DELETED",
    entityType: "Charge",
    entityId: id,
    before,
    reason: input.reason,
  });

  return { id };
};

// --- Discounts ---

const sumStudentCharges = async (studentId: string): Promise<Prisma.Decimal> => {
  const agg = await prisma.charge.aggregate({
    where: { studentId },
    _sum: { amount: true },
  });
  return agg._sum.amount ?? ZERO;
};

export const createDiscount = async (input: CreateDiscountInput, actorId?: string) => {
  await assertStudentExists(input.studentId);
  const enrollment = input.enrollmentId
    ? await getEnrollmentForStudent(input.enrollmentId, input.studentId)
    : null;

  const base = enrollment ? enrollment.totalFee : await sumStudentCharges(input.studentId);
  const value = new Prisma.Decimal(input.value);
  const amount =
    input.type === "PERCENTAGE"
      ? base.times(value).dividedBy(100).toDecimalPlaces(2)
      : value;

  const discount = await prisma.discount.create({
    data: {
      studentId: input.studentId,
      enrollmentId: input.enrollmentId ?? null,
      type: input.type,
      value,
      amount,
      reason: input.reason,
      status: "PENDING",
      requestedById: actorId ?? null,
    },
  });

  await writeAudit({
    actorId: actorId ?? null,
    action: "DISCOUNT_REQUESTED",
    entityType: "Discount",
    entityId: discount.id,
    after: discount,
  });

  return discount;
};

export const listDiscounts = async (query: ListDiscountsQuery) => {
  const pagination = parsePagination(query);

  const where: Prisma.DiscountWhereInput = {};
  if (query.studentId) where.studentId = query.studentId;
  if (query.status) where.status = query.status;

  const [rows, total] = await prisma.$transaction([
    prisma.discount.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: pagination.skip,
      take: pagination.take,
      include: {
        student: { select: studentSummarySelect },
        enrollment: { select: { id: true, levelId: true, currency: true } },
      },
    }),
    prisma.discount.count({ where }),
  ]);

  return buildPaginated(rows, total, pagination);
};

export const approveDiscount = async (id: string, actorId?: string) => {
  const before = await prisma.discount.findUnique({ where: { id } });
  if (!before) {
    throw notFound("Discount not found");
  }
  if (before.status !== "PENDING") {
    throw badRequest("Only pending discounts can be approved");
  }

  const updated = await prisma.$transaction(async (tx) => {
    const discount = await tx.discount.update({
      where: { id },
      data: {
        status: "APPROVED",
        approvedById: actorId ?? null,
        approvedAt: new Date(),
      },
    });

    await recalculateStudentFinance(tx, before.studentId);
    return discount;
  });

  await writeAudit({
    actorId: actorId ?? null,
    action: "DISCOUNT_APPROVED",
    entityType: "Discount",
    entityId: id,
    before,
    after: updated,
  });

  return updated;
};

export const rejectDiscount = async (
  id: string,
  input: RejectDiscountInput,
  actorId?: string,
) => {
  const before = await prisma.discount.findUnique({ where: { id } });
  if (!before) {
    throw notFound("Discount not found");
  }
  if (before.status !== "PENDING") {
    throw badRequest("Only pending discounts can be rejected");
  }

  const updated = await prisma.discount.update({
    where: { id },
    data: { status: "REJECTED" },
  });

  await writeAudit({
    actorId: actorId ?? null,
    action: "DISCOUNT_REJECTED",
    entityType: "Discount",
    entityId: id,
    before,
    after: updated,
    reason: input.reason,
  });

  return updated;
};

// --- Payments ---

export const createPayment = async (input: CreatePaymentInput, actorId?: string) => {
  await assertStudentExists(input.studentId);
  await assertActiveMethod(input.methodId);
  const enrollment = input.enrollmentId
    ? await getEnrollmentForStudent(input.enrollmentId, input.studentId)
    : null;

  const paidAt = input.paidAt ?? new Date();

  const payment = await prisma.$transaction(async (tx) => {
    const created = await tx.payment.create({
      data: {
        studentId: input.studentId,
        enrollmentId: input.enrollmentId ?? null,
        methodId: input.methodId,
        amount: new Prisma.Decimal(input.amount),
        currency: input.currency ?? enrollment?.currency ?? "RWF",
        txnType: "PAYMENT",
        reference: input.reference ?? null,
        paidAt,
        receivedById: actorId ?? null,
        notes: input.notes ?? null,
      },
    });

    await tx.receipt.create({
      data: {
        paymentId: created.id,
        receiptNumber: await generateReceiptNumber(tx, paidAt),
        issuedById: actorId ?? null,
        issuedAt: new Date(),
      },
    });

    await recalculateStudentFinance(tx, input.studentId);

    return tx.payment.findUniqueOrThrow({ where: { id: created.id }, include: paymentInclude });
  });

  await writeAudit({
    actorId: actorId ?? null,
    action: "PAYMENT_RECORDED",
    entityType: "Payment",
    entityId: payment.id,
    after: payment,
  });

  return payment;
};

export const listPayments = async (query: ListPaymentsQuery) => {
  const pagination = parsePagination(query);

  const where: Prisma.PaymentWhereInput = {};
  if (query.studentId) where.studentId = query.studentId;
  if (query.enrollmentId) where.enrollmentId = query.enrollmentId;
  if (query.methodId) where.methodId = query.methodId;
  if (query.txnType) where.txnType = query.txnType;
  where.paidAt = dateFilter(query.from, query.to);

  const [rows, total] = await prisma.$transaction([
    prisma.payment.findMany({
      where,
      orderBy: { paidAt: "desc" },
      skip: pagination.skip,
      take: pagination.take,
      include: paymentInclude,
    }),
    prisma.payment.count({ where }),
  ]);

  return buildPaginated(rows, total, pagination);
};

export const getPayment = async (id: string) => {
  const payment = await prisma.payment.findUnique({ where: { id }, include: paymentInclude });
  if (!payment) {
    throw notFound("Payment not found");
  }
  return payment;
};

export const updatePayment = async (
  id: string,
  input: UpdatePaymentInput,
  actorId?: string,
) => {
  const before = await prisma.payment.findUnique({ where: { id } });
  if (!before) {
    throw notFound("Payment not found");
  }

  const updated = await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.update({
      where: { id },
      data: {
        amount: input.amount !== undefined ? new Prisma.Decimal(input.amount) : undefined,
        reference: input.reference,
        paidAt: input.paidAt,
        notes: input.notes,
      },
    });

    await recalculateStudentFinance(tx, before.studentId);
    return payment;
  });

  await writeAudit({
    actorId: actorId ?? null,
    action: "PAYMENT_UPDATED",
    entityType: "Payment",
    entityId: id,
    before,
    after: updated,
    reason: input.reason,
  });

  return updated;
};

export const deletePayment = async (id: string, input: DeletePaymentInput, actorId?: string) => {
  const before = await prisma.payment.findUnique({ where: { id } });
  if (!before) {
    throw notFound("Payment not found");
  }

  await prisma.$transaction(async (tx) => {
    await tx.receipt.deleteMany({ where: { paymentId: id } });
    await tx.payment.delete({ where: { id } });
    await recalculateStudentFinance(tx, before.studentId);
  });

  await writeAudit({
    actorId: actorId ?? null,
    action: "PAYMENT_DELETED",
    entityType: "Payment",
    entityId: id,
    before,
    reason: input.reason,
  });

  return { id };
};

export const createRefund = async (input: CreateRefundInput, actorId?: string) => {
  const original = await prisma.payment.findUnique({
    where: { id: input.paymentId },
    select: {
      id: true,
      studentId: true,
      enrollmentId: true,
      methodId: true,
      amount: true,
      currency: true,
      txnType: true,
    },
  });
  if (!original) {
    throw notFound("Payment not found");
  }
  if (original.txnType !== "PAYMENT") {
    throw badRequest("Refunds can only be created against a payment transaction");
  }

  const methodId = input.methodId ?? original.methodId;
  if (input.methodId) {
    await assertActiveMethod(input.methodId);
  }

  const refundAgg = await prisma.payment.aggregate({
    where: { parentPaymentId: input.paymentId, txnType: "REFUND" },
    _sum: { amount: true },
  });
  const alreadyRefunded = refundAgg._sum.amount ?? ZERO;
  const nextRefundTotal = alreadyRefunded.plus(new Prisma.Decimal(input.amount));
  if (nextRefundTotal.greaterThan(original.amount)) {
    throw badRequest("Refund amount exceeds the original payment amount");
  }

  const refund = await prisma.$transaction(async (tx) => {
    const created = await tx.payment.create({
      data: {
        studentId: original.studentId,
        enrollmentId: original.enrollmentId,
        methodId,
        amount: new Prisma.Decimal(input.amount),
        currency: original.currency,
        txnType: "REFUND",
        parentPaymentId: original.id,
        paidAt: new Date(),
        receivedById: actorId ?? null,
        notes: input.notes ?? null,
      },
    });

    await recalculateStudentFinance(tx, original.studentId);
    return created;
  });

  await writeAudit({
    actorId: actorId ?? null,
    action: "PAYMENT_REFUNDED",
    entityType: "Payment",
    entityId: refund.id,
    after: refund,
    reason: input.reason,
  });

  return refund;
};

// --- Receipts ---

export const listReceipts = async (query: ListReceiptsQuery) => {
  const pagination = parsePagination(query);

  const where: Prisma.ReceiptWhereInput = {};
  if (query.studentId) where.payment = { studentId: query.studentId };
  where.issuedAt = dateFilter(query.from, query.to);

  const [rows, total] = await prisma.$transaction([
    prisma.receipt.findMany({
      where,
      orderBy: { issuedAt: "desc" },
      skip: pagination.skip,
      take: pagination.take,
      include: receiptInclude,
    }),
    prisma.receipt.count({ where }),
  ]);

  return buildPaginated(rows, total, pagination);
};

export const getReceipt = async (id: string, user: { id: string; role: Role }) => {
  const receipt = await prisma.receipt.findUnique({ where: { id }, include: receiptInclude });
  if (!receipt) {
    throw notFound("Receipt not found");
  }

  if (user.role === "STUDENT" && receipt.payment.student.userId !== user.id) {
    throw forbidden("You can only view your own receipts");
  }

  return receipt;
};

// --- Student self-service ---

const resolveStudentId = async (userId: string): Promise<string> => {
  const student = await prisma.student.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!student) {
    throw notFound("Student profile not found");
  }
  return student.id;
};

export const getMyFinance = async (userId: string) => {
  const studentId = await resolveStudentId(userId);

  const [finance, charges, payments, discounts] = await Promise.all([
    prisma.studentFinance.findUnique({ where: { studentId } }),
    prisma.charge.findMany({ where: { studentId }, orderBy: { createdAt: "desc" } }),
    prisma.payment.findMany({
      where: { studentId },
      orderBy: { paidAt: "desc" },
      include: { method: { select: methodSummarySelect }, receipt: true },
    }),
    prisma.discount.findMany({ where: { studentId }, orderBy: { createdAt: "desc" } }),
  ]);

  return { finance, charges, payments, discounts };
};

export const getMyReceipts = async (userId: string, query: MyReceiptsQuery) => {
  const studentId = await resolveStudentId(userId);
  const pagination = parsePagination(query);

  const where: Prisma.ReceiptWhereInput = { payment: { studentId } };

  const [rows, total] = await prisma.$transaction([
    prisma.receipt.findMany({
      where,
      orderBy: { issuedAt: "desc" },
      skip: pagination.skip,
      take: pagination.take,
      include: receiptInclude,
    }),
    prisma.receipt.count({ where }),
  ]);

  return buildPaginated(rows, total, pagination);
};

// --- Reports ---

interface DimensionBucket {
  key: string;
  label: string;
  billed: Prisma.Decimal;
  collected: Prisma.Decimal;
  outstanding: Prisma.Decimal;
}

const addToBucket = (
  map: Map<string, DimensionBucket>,
  dimension: { key: string; label: string } | null,
  billed: Prisma.Decimal,
  collected: Prisma.Decimal,
  outstanding: Prisma.Decimal,
): void => {
  if (!dimension) return;
  const bucket =
    map.get(dimension.key) ??
    { key: dimension.key, label: dimension.label, billed: ZERO, collected: ZERO, outstanding: ZERO };
  bucket.billed = bucket.billed.plus(billed);
  bucket.collected = bucket.collected.plus(collected);
  bucket.outstanding = bucket.outstanding.plus(outstanding);
  map.set(dimension.key, bucket);
};

export const getFinanceSummary = async (query: FinanceSummaryQuery) => {
  const studentWhere: Prisma.StudentWhereInput = {};
  if (query.campusId) studentWhere.campusId = query.campusId;
  if (query.intakeId) studentWhere.intakeId = query.intakeId;
  if (query.levelId) studentWhere.currentLevelId = query.levelId;

  const students = await prisma.student.findMany({
    where: studentWhere,
    select: {
      id: true,
      currentLevel: { select: { id: true, code: true, title: true } },
      intake: { select: { id: true, code: true, name: true } },
      campus: { select: { id: true, code: true, name: true } },
    },
  });

  const ids = students.map((student) => student.id);
  const chargeDate = dateFilter(query.from, query.to);
  const payDate = dateFilter(query.from, query.to);

  if (ids.length === 0) {
    return {
      totalBilled: ZERO,
      totalCollected: ZERO,
      totalOutstanding: ZERO,
      collectionRate: 0,
      byMethod: [],
      byLevel: [],
      byIntake: [],
      byCampus: [],
    };
  }

  const [chargeGroups, paymentGroups, refundGroups, financeRows, methodGroups] =
    await Promise.all([
      prisma.charge.groupBy({
        by: ["studentId"],
        where: { studentId: { in: ids }, createdAt: chargeDate },
        _sum: { amount: true },
      }),
      prisma.payment.groupBy({
        by: ["studentId"],
        where: { studentId: { in: ids }, txnType: "PAYMENT", paidAt: payDate },
        _sum: { amount: true },
      }),
      prisma.payment.groupBy({
        by: ["studentId"],
        where: { studentId: { in: ids }, txnType: "REFUND", paidAt: payDate },
        _sum: { amount: true },
      }),
      prisma.studentFinance.findMany({
        where: { studentId: { in: ids } },
        select: { studentId: true, balance: true },
      }),
      prisma.payment.groupBy({
        by: ["methodId"],
        where: { studentId: { in: ids }, txnType: "PAYMENT", paidAt: payDate },
        _sum: { amount: true },
      }),
    ]);

  const chargeMap = new Map(chargeGroups.map((g) => [g.studentId, g._sum.amount ?? ZERO]));
  const payMap = new Map(paymentGroups.map((g) => [g.studentId, g._sum.amount ?? ZERO]));
  const refundMap = new Map(refundGroups.map((g) => [g.studentId, g._sum.amount ?? ZERO]));
  const balanceMap = new Map(financeRows.map((f) => [f.studentId, f.balance]));

  let totalBilled = ZERO;
  let totalCollected = ZERO;
  let totalOutstanding = ZERO;

  const levelBuckets = new Map<string, DimensionBucket>();
  const intakeBuckets = new Map<string, DimensionBucket>();
  const campusBuckets = new Map<string, DimensionBucket>();

  for (const student of students) {
    const billed = chargeMap.get(student.id) ?? ZERO;
    const collected = (payMap.get(student.id) ?? ZERO).minus(refundMap.get(student.id) ?? ZERO);
    const outstanding = balanceMap.get(student.id) ?? ZERO;

    totalBilled = totalBilled.plus(billed);
    totalCollected = totalCollected.plus(collected);
    totalOutstanding = totalOutstanding.plus(outstanding);

    addToBucket(
      levelBuckets,
      student.currentLevel
        ? { key: student.currentLevel.id, label: student.currentLevel.title }
        : null,
      billed,
      collected,
      outstanding,
    );
    addToBucket(
      intakeBuckets,
      student.intake ? { key: student.intake.id, label: student.intake.name } : null,
      billed,
      collected,
      outstanding,
    );
    addToBucket(
      campusBuckets,
      student.campus ? { key: student.campus.id, label: student.campus.name } : null,
      billed,
      collected,
      outstanding,
    );
  }

  const methodIds = methodGroups.map((g) => g.methodId);
  const methods = methodIds.length
    ? await prisma.paymentMethodConfig.findMany({
        where: { id: { in: methodIds } },
        select: { id: true, code: true, name: true },
      })
    : [];
  const methodMap = new Map(methods.map((m) => [m.id, m]));

  const collectionRate = totalBilled.greaterThan(ZERO)
    ? Math.round(totalCollected.dividedBy(totalBilled).times(100).toNumber() * 100) / 100
    : 0;

  return {
    totalBilled,
    totalCollected,
    totalOutstanding,
    collectionRate,
    byMethod: methodGroups.map((g) => ({
      methodId: g.methodId,
      methodCode: methodMap.get(g.methodId)?.code ?? null,
      methodName: methodMap.get(g.methodId)?.name ?? null,
      total: g._sum.amount ?? ZERO,
    })),
    byLevel: [...levelBuckets.values()],
    byIntake: [...intakeBuckets.values()],
    byCampus: [...campusBuckets.values()],
  };
};

export const listOutstanding = async (query: OutstandingQuery) => {
  const pagination = parsePagination(query);

  const studentWhere: Prisma.StudentWhereInput = {};
  if (query.campusId) studentWhere.campusId = query.campusId;
  if (query.levelId) studentWhere.currentLevelId = query.levelId;
  if (query.intakeId) studentWhere.intakeId = query.intakeId;

  const where: Prisma.StudentFinanceWhereInput = {
    balance: { gt: 0 },
    student: studentWhere,
  };

  const [rows, total] = await prisma.$transaction([
    prisma.studentFinance.findMany({
      where,
      orderBy: { balance: "desc" },
      skip: pagination.skip,
      take: pagination.take,
      include: { student: { select: studentSummarySelect } },
    }),
    prisma.studentFinance.count({ where }),
  ]);

  return buildPaginated(rows, total, pagination);
};

// --- Reminders ---

export const runPaymentReminders = async (input: RunRemindersInput, actorId?: string) => {
  const where: Prisma.StudentFinanceWhereInput = { balance: { gt: 0 } };
  if (input.overdueOnly) where.status = "OVERDUE";

  const rows = await prisma.studentFinance.findMany({
    where,
    select: {
      balance: true,
      currency: true,
      student: { select: { userId: true } },
    },
  });

  if (rows.length > 0) {
    const notifications: Prisma.NotificationCreateManyInput[] = rows.map((row) => ({
      userId: row.student.userId,
      type: "PAYMENT",
      channel: "IN_APP",
      title: "Outstanding balance reminder",
      body: `You have an outstanding balance of ${row.balance.toString()} ${row.currency}. Please settle your balance or contact the finance office.`,
      data: { balance: row.balance.toString(), currency: row.currency },
    }));

    await prisma.notification.createMany({ data: notifications });
  }

  await writeAudit({
    actorId: actorId ?? null,
    action: "PAYMENT_REMINDERS_SENT",
    entityType: "StudentFinance",
    entityId: "bulk",
    after: { sent: rows.length, overdueOnly: input.overdueOnly ?? false },
  });

  return { sent: rows.length };
};

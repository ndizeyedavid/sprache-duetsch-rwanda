export const paymentMethods = [
  {
    code: "MOMO",
    name: "MTN MoMo",
    requiresReference: true,
    sortOrder: 1,
    instructions: "Dial *182*1*1# and use the school code.",
  },
  { code: "AIRTEL", name: "Airtel Money", requiresReference: true, sortOrder: 2 },
  {
    code: "BANK",
    name: "Bank Transfer",
    requiresReference: true,
    sortOrder: 3,
    instructions: "Bank of Kigali · Acc 000123456789",
  },
  {
    code: "CARD",
    name: "Card",
    requiresReference: true,
    sortOrder: 4,
    instructions: "Card details are never stored by the platform.",
  },
  { code: "CASH", name: "Cash", requiresReference: false, sortOrder: 5 },
  { code: "SCHOLARSHIP", name: "Scholarship", requiresReference: false, sortOrder: 6 },
];

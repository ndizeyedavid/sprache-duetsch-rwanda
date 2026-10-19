import { useEffect,useState } from "react";
import { FiCheckCircle,FiCreditCard,FiPlus } from "react-icons/fi";
import { Link,useLocation } from "react-router-dom";
import { DiscountPanel } from "../../components/admin/DiscountPanel";
import { PaymentLedger } from "../../components/admin/PaymentLedger";
import { PaymentRecordPanel } from "../../components/admin/PaymentRecordPanel";
import { EmptyBlock,ErrorBlock } from "../../components/common/PageState";
import { heroAction,heroGhost } from "../../components/hero/hero-actions";
import { PageHero } from "../../components/hero/PageHero";
import { ApprovalQueue } from "../../components/payment-claims/ApprovalQueue";
import { MarkPaidDialog } from "../../components/payment-claims/MarkPaidDialog";
import { Modal } from "../../components/ui/Modal";
import { useApi } from "../../hooks/useApi";
import { currencyAmount } from "../../lib/format";
import { listClaims } from "../../lib/payment-claims";
import { getFinanceReportSummary,listPayments,listStudents,money } from "../../lib/services";

export function AdminTransactions() {
  const summary = useApi("finance-summary", getFinanceReportSummary);
  const payments = useApi("payments-list", listPayments);
  const students = useApi("finance-students", listStudents);
  const pendingClaims = useApi("payment-claims-count", () => listClaims("PENDING", 1, 1));
  const [recording, setRecording] = useState(false);
  const [markingPaid, setMarkingPaid] = useState(false);
  const { hash } = useLocation();
  // Notification links land on #approvals; scroll once the queue has rendered.
  useEffect(() => { if (hash === "#approvals") setTimeout(() => document.getElementById("approvals")?.scrollIntoView({ behavior: "smooth" }), 300); }, [hash]);
  const waiting = pendingClaims.data?.summary.pending ?? 0;
  const [success, setSuccess] = useState<string | null>(null);
  const totals = summary.data;
  const format = (value: Parameters<typeof money>[0]) => currencyAmount(money(value), totals?.currency);
  const canRecord = Boolean(students.data?.length);
  function onRecorded() {
    payments.refetch();
    summary.refetch();
    pendingClaims.refetch();
  }
  return (
    <div className="space-y-5">
      <PageHero eyebrow="Payment records" icon={FiCreditCard} title="Transactions" art="reports" scoped
        description="Approve payments students made outside the gateway, mark students as paid, record payments, refunds and discounts — every change is logged."
        meta={totals ? <>
          {waiting ? <a href="#approvals" className="hero-chip hero-chip-solid">{waiting} waiting for approval</a> : null}
          <span className="hero-chip hero-chip-solid">{format(totals.totalCollected)} collected</span>
          <span className="hero-chip">{format(totals.totalOutstanding)} outstanding</span>
          <span className="hidden sm:contents">
            <span className="hero-chip">{format(totals.totalBilled)} billed</span>
            <span className="hero-chip">{totals.collectionRate}% collection rate</span>
          </span>
        </> : null}
        actions={<>
          <button type="button" className={`${heroAction} disabled:border-primary-content disabled:bg-primary-content disabled:text-primary`} disabled={!canRecord} onClick={() => { setSuccess(null); setRecording(true); }}>
            {students.loading ? <span className="loading loading-spinner loading-xs" /> : <FiPlus aria-hidden />}Record payment
          </button>
          <button type="button" className={heroGhost} onClick={() => { setSuccess(null); setMarkingPaid(true); }}><FiCheckCircle aria-hidden />Mark as paid</button>
          <Link to="/admin/finance" className={heroGhost}>Finance overview</Link>
          <Link to="/admin/students" className={heroGhost}>Student balances</Link>
        </>} />
      {success ? <p role="status" className="alert alert-success alert-soft text-xs">{success}</p> : null}
      {summary.error ? <ErrorBlock message={summary.error} onRetry={summary.refetch} /> : null}
      {students.error ? (
        <ErrorBlock message={students.error} onRetry={students.refetch} />
      ) : students.data && !students.data.length ? (
        <EmptyBlock title="No students to reconcile yet" hint="Register a learner before recording payments or discounts." />
      ) : null}
      <ApprovalQueue onChanged={onRecorded} onMessage={setSuccess} />
      <PaymentLedger payments={payments} onChanged={onRecorded} />
      {students.data && <DiscountPanel students={students.data} onApproved={summary.refetch} />}
      <MarkPaidDialog open={markingPaid} onClose={() => setMarkingPaid(false)} onDone={(message) => { setMarkingPaid(false); setSuccess(message); onRecorded(); }} />
      <Modal open={recording} onClose={() => setRecording(false)} title="Record payment">
        <PaymentRecordPanel students={students.data ?? []} onRecorded={() => { onRecorded(); setRecording(false); setSuccess("Payment recorded."); }} />
      </Modal>
    </div>
  );
}

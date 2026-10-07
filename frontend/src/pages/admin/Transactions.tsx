import { AcademicModalAction } from "../../components/admin/AcademicModalAction";
import { AcademicSummary } from "../../components/admin/AcademicSummary";
import { DiscountPanel } from "../../components/admin/DiscountPanel";
import { PaymentLedger } from "../../components/admin/PaymentLedger";
import { PaymentRecordPanel } from "../../components/admin/PaymentRecordPanel";
import {
EmptyBlock,
ErrorBlock,
LoadingBlock,
} from "../../components/common/PageState";
import { useApi } from "../../hooks/useApi";
import { currencyAmount } from "../../lib/format";
import {
getFinanceReportSummary,
listPayments,
listStudents,
money,
} from "../../lib/services";

export function AdminTransactions() {
  const summary = useApi("finance-summary", getFinanceReportSummary);
  const payments = useApi("payments-list", listPayments);
  const students = useApi("finance-students", listStudents);
  function onRecorded() {
    payments.refetch();
    summary.refetch();
  }
  return (
    <div className="space-y-5">
      {summary.loading ? (
        <LoadingBlock label="Loading tuition summary…" />
      ) : summary.error ? (
        <ErrorBlock message={summary.error} onRetry={summary.refetch} />
      ) : (
        summary.data && (
          <AcademicSummary
            items={[
              {
                label: "Billed tuition",
                value: currencyAmount(money(summary.data.totalBilled), summary.data.currency),
                note: "Total recorded charges",
              },
              {
                label: "Collected",
                value: currencyAmount(money(summary.data.totalCollected), summary.data.currency),
                note: `${summary.data.collectionRate}% collection rate`,
              },
              {
                label: "Outstanding",
                value: currencyAmount(money(summary.data.totalOutstanding), summary.data.currency),
                note: "Remaining student balances",
              },
            ]}
          />
        )
      )}
      {students.loading ? (
        <LoadingBlock label="Loading payment form options…" />
      ) : students.error ? (
        <ErrorBlock message={students.error} onRetry={students.refetch} />
      ) : !students.data?.length ? (
        <EmptyBlock
          title="No students to reconcile yet"
          hint="Register a learner before recording payments or discounts."
        />
      ) : (
        <AcademicModalAction label="Record payment" title="Record payment">
          {(done) => (
            <PaymentRecordPanel
              students={students.data ?? []}
              onRecorded={() => {
                onRecorded();
                done("Payment recorded.");
              }}
            />
          )}
        </AcademicModalAction>
      )}
      <PaymentLedger payments={payments} onChanged={onRecorded} />
      {students.data && (
        <DiscountPanel students={students.data} onApproved={summary.refetch} />
      )}
    </div>
  );
}

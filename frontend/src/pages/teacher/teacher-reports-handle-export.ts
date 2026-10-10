import { apiErrorMessage,downloadFile } from "../../lib/api";
export function createHandleExport(context: { setExporting: import("react").Dispatch<import("react").SetStateAction<boolean>>; setExportError: import("react").Dispatch<import("react").SetStateAction<string | null>>; classId: string | null; attempts: never[]; preset: "all" | "7" | "30" | "90" | "custom" }) {
const { setExporting, setExportError, classId, attempts, preset } = context;
async function handleExport() {
    setExporting(true);
    setExportError(null);
    try {
      // Prefer server CSV when a class is selected (scoped), else build client CSV
      if (classId) {
        await downloadFile(
          `/assessments/attempts/export?classGroupId=${classId}`,
          `reports-${classId}.csv`,
        );
      } else {
        const headers = [
          "studentCode",
          "studentName",
          "assessment",
          "status",
          "score",
          "maxScore",
          "pass",
          "submittedAt",
        ];
        const lines = [headers.join(",")];
        for (const a of attempts as unknown as {
          student: {
            studentCode: string;
            user: { firstName: string; lastName: string };
          };
          assessment: { title: string };
          status: string;
          score: number | null;
          maxScore: unknown;
          passed: boolean | null;
          submittedAt: string | null;
        }[]) {
          const row = [
            a.student.studentCode,
            `"${a.student.user.firstName} ${a.student.user.lastName}"`,
            `"${a.assessment.title.replace(/"/g, '""')}"`,
            a.status,
            a.score ?? "",
            String(a.maxScore ?? ""),
            a.passed === null ? "" : String(a.passed),
            a.submittedAt ?? "",
          ];
          lines.push(row.join(","));
        }
        const blob = new Blob([lines.join("\n")], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `reports-${preset}.csv`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      setExportError(apiErrorMessage(err, "Could not export."));
    } finally {
      setExporting(false);
    }
  }
return handleExport;
}

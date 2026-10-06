import { useState } from "react";
import { FiCheckCircle,FiDownload,FiFileText } from "react-icons/fi";
import { apiErrorMessage,downloadFile } from "../../lib/api";
import { Panel,SectionHeader } from "../ui/Panel";

const reports = [
  {
    label: "Student register",
    path: "/students/export?pageSize=100",
    file: "students.csv",
  },
  {
    label: "Attendance records",
    path: "/attendance/export",
    file: "attendance.csv",
  },
  {
    label: "Assessment results",
    path: "/assessments/attempts/export",
    file: "attempts.csv",
  },
];
export function AcademicReports() {
  const [working, setWorking] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  async function download(report: (typeof reports)[number]) {
    setWorking(report.file);
    setError(null);
    setSuccess(null);
    try {
      await downloadFile(report.path, report.file);
      setSuccess(
        `${working === report.file ? "Downloading…" : report.label} downloaded.`,
      );
    } catch (err) {
      setError(apiErrorMessage(err, "Could not download the report."));
    } finally {
      setWorking(null);
    }
  }
  return (
    <Panel>
      <SectionHeader title="Export reports" />

      <div className="space-y-2">
        {reports.map((report) => (
          <button
            key={report.file}
            onClick={() => download(report)}
            disabled={working !== null}
            className="btn h-auto min-h-11 w-full justify-start gap-3 rounded-box border-base-300/60 bg-base-100 p-3 text-left font-normal"
          >
            <FiFileText aria-hidden className="shrink-0" />
            <span className="flex-1">
              <span className="block text-xs font-semibold">
                {working === report.file ? "Downloading…" : report.label}
              </span>
            </span>
            <FiDownload aria-hidden className="shrink-0" />
          </button>
        ))}
      </div>
      {error && (
        <p role="alert" className="mt-3 text-xs text-error">
          {error}
        </p>
      )}
      {success && (
        <p role="status" className="mt-3 flex gap-2 text-xs">
          <FiCheckCircle aria-hidden className="text-success" />
          {success}
        </p>
      )}
    </Panel>
  );
}

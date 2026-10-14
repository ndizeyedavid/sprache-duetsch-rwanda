import type { ReactNode } from "react";
import { useState } from "react";
import { FiPlus } from "react-icons/fi";
import { Modal } from "../ui/Modal";

type Props = {
  label: string;
  title: string;
  children: (done: (message: string) => void) => ReactNode;
  wide?: boolean;
};
export function AcademicModalAction({ label, title, children, wide }: Props) {
  const [open, setOpen] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  function done(message: string) {
    setOpen(false);
    setSuccess(message);
  }
  return (
    <div>
      <button
        type="button"
        className="btn btn-sm rounded-full"
        onClick={() => {
          setSuccess(null);
          setOpen(true);
        }}
      >
        <FiPlus aria-hidden />
        {label}
      </button>
      {success && (
        <p role="status" className="mt-2 text-xs text-muted">
          {success}
        </p>
      )}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={title}
        boxClassName={wide ? "max-w-3xl" : ""}
      >
        {children(done)}
      </Modal>
    </div>
  );
}

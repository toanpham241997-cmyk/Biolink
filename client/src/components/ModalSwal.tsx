import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Info } from "lucide-react";

export type SwalKind = "success" | "error" | "info";

export default function ModalSwal(props: {
  open: boolean;
  variant: SwalKind;
  title: string;
  message?: string;
  onClose: () => void;
}) {
  const { open, variant, title, message, onClose } = props;
  if (!open) return null;

  const Icon =
    variant === "success" ? CheckCircle2 : variant === "error" ? XCircle : Info;

  const color =
    variant === "success"
      ? "text-emerald-500"
      : variant === "error"
      ? "text-rose-500"
      : "text-sky-500";

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[999] bg-black/40 flex items-center justify-center px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-sm rounded-[28px] bg-white/95 backdrop-blur border-[3px] border-sky-300 p-5 shadow-[0_20px_60px_rgba(2,132,199,0.25)]"
          initial={{ opacity: 0, y: 18, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 18, scale: 0.96 }}
        >
          <div className="flex flex-col items-center text-center">
            <Icon className={`w-14 h-14 ${color}`} />
            <h3 className="mt-2 text-[18px] font-extrabold">{title}</h3>
            {message && <p className="mt-2 text-sm text-slate-600">{message}</p>}

            <button
              onClick={onClose}
              className="mt-4 w-full py-3 rounded-2xl bg-sky-500 text-white font-extrabold border-2 border-sky-600 shadow active:scale-[0.99] transition"
            >
              OK
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

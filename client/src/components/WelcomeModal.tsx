import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { X, Timer } from "lucide-react";

type WelcomeModalProps = {
  title?: string;
  description?: string;
  features?: string[];
  onClose?: () => void;
};

const STORAGE_KEY = "biolink_welcome_hide_until";

function nowMs() {
  return Date.now();
}

function getHideUntil(): number {
  const raw = localStorage.getItem(STORAGE_KEY);
  const n = raw ? Number(raw) : 0;
  return Number.isFinite(n) ? n : 0;
}

function setHideForOneHour() {
  const oneHourMs = 60 * 60 * 1000;
  localStorage.setItem(STORAGE_KEY, String(nowMs() + oneHourMs));
}

export default function WelcomeModal({
  title = "WELCOME CHÀO MỪNG BẠN",
  description = "Đây Là Trang Website Hỗ Trợ Về Mạng Xã Hội , Có Nhiều Tính Năng Và nhiều Chức Năng Độc Đáo , Sẽ Có Thể Giúp ích Cho Bạn Rất Nhiều 🌐",
  features = [
    "UP ẢNH LẤY LINK TRỰC TIẾP",
    "UP FILES LẤY LINK TRỰC TIẾP",
    "BOT TRỢ LÍ CỦA WEBSITE",
    "SOURE MIỄN PHÍ ĐA DẠNG",
    "SHOP BÁN ACCOUNT, HACK GAME , APP",
  ],
  onClose,
}: WelcomeModalProps) {
  const [open, setOpen] = useState(false);

  const shouldShow = useMemo(() => {
    if (typeof window === "undefined") return false;
    const hideUntil = getHideUntil();
    return nowMs() > hideUntil;
  }, []);

  useEffect(() => {
    if (!shouldShow) return;
    // mở sau 300ms cho mượt
    const t = setTimeout(() => setOpen(true), 300);
    return () => clearTimeout(t);
  }, [shouldShow]);

  const close = () => {
    setOpen(false);
    onClose?.();
  };

  const closeFor1Hour = () => {
    setHideForOneHour();
    close();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={close}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            role="dialog"
            aria-modal="true"
            className="
              relative w-full max-w-lg
              rounded-2xl
              border-2 border-sky-300/70
              bg-white/90 dark:bg-card/80
              shadow-2xl
              overflow-hidden
            "
            initial={{ y: 30, scale: 0.96, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 20, scale: 0.98, opacity: 0 }}
            transition={{ type: "spring", stiffness: 140, damping: 18 }}
          >
            {/* Top glow bar */}
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-400 via-yellow-300 to-pink-400" />

            <div className="p-5 sm:p-6">
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <motion.h2
                    className="text-2xl font-extrabold tracking-tight text-foreground"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 }}
                  >
                    {title}
                  </motion.h2>

                  <motion.p
                    className="mt-2 text-sm sm:text-base text-muted-foreground"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.14 }}
                  >
                    {description}
                  </motion.p>
                </div>

                <button
                  onClick={close}
                  className="
                    shrink-0 rounded-xl p-2
                    border border-transparent
                    hover:border-sky-300/60
                    hover:bg-sky-50
                    dark:hover:bg-primary/10
                    transition
                  "
                  aria-label="Đóng"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Feature list */}
              <motion.div
                className="mt-4 rounded-2xl border border-sky-200/60 bg-white/70 dark:bg-background/30 p-4"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="text-sm font-bold text-foreground mb-2">
                  TÍNH NĂNG TRÊN WEBSITE 
                </div>
                <ul className="space-y-2">
                  {features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="mt-1 inline-block h-2 w-2 rounded-full bg-sky-500 shadow-[0_0_10px_rgba(56,189,248,0.8)]" />
                      <span className="text-foreground/90">{f}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Buttons */}
              <motion.div
                className="mt-5 flex flex-col sm:flex-row gap-3"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.28 }}
              >
                <button
                  onClick={close}
                  className="
                    w-full sm:w-auto flex-1
                    rounded-2xl px-4 py-3
                    font-bold
                    bg-sky-500 text-white
                    hover:bg-sky-600
                    transition
                    shadow-[0_10px_30px_rgba(14,165,233,0.35)]
                  "
                >
                  CONTINUE INSET
                </button>

                <button
                  onClick={closeFor1Hour}
                  className="
                    w-full sm:w-auto flex-1
                    rounded-2xl px-4 py-3
                    font-bold
                    bg-white text-foreground
                    border-2 border-sky-200/80
                    hover:bg-sky-50
                    dark:bg-card dark:hover:bg-primary/10
                    transition
                    flex items-center justify-center gap-2
                  "
                >
                  <Timer className="w-5 h-5 text-sky-500" />
                  Đóng 1 giờ
                </button>
              </motion.div>

              {/* Footer note */}
              <div className="mt-4 text-xs text-muted-foreground">
                * Nút “Đóng 1 giờ” sẽ ẩn popup trong 60 phút trên thiết bị này.
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
  }

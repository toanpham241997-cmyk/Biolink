import { useMemo, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Copy, FileUp, Link2, Loader2, RotateCcw, CheckCircle2, XCircle, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type UploadResult = {
  url: string;
  name: string;
  size: number;
  type: string;
};

function formatBytes(bytes: number) {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(i ? 1 : 0)} ${sizes[i]}`;
}

// ✅ Modal swal-like không cần lib
function Modal({
  open,
  variant,
  title,
  message,
  onClose,
}: {
  open: boolean;
  variant: "success" | "error" | "info";
  title: string;
  message?: string;
  onClose: () => void;
}) {
  if (!open) return null;

  const Icon =
    variant === "success" ? CheckCircle2 : variant === "error" ? XCircle : Info;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-sm rounded-[28px] bg-white/90 dark:bg-card/90 backdrop-blur p-6 shadow-2xl game-border"
      >
        <div className="flex flex-col items-center text-center">
          <Icon className={`w-14 h-14 ${variant === "success" ? "text-green-500" : variant === "error" ? "text-red-500" : "text-blue-500"}`} />
          <h3 className="mt-3 text-xl font-extrabold">{title}</h3>
          {!!message && <p className="mt-2 text-sm text-muted-foreground">{message}</p>}

          <button
            onClick={onClose}
            className="mt-5 w-full py-3 rounded-2xl bg-primary text-white font-extrabold game-border hover:opacity-95 active:scale-[0.99] transition"
          >
            OK
          </button>
        </div>
      </motion.div>
    </div>

/** ===================== ENV ===================== */
const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim();
const SUPABASE_ANON_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim();
const BUCKET = (import.meta.env.VITE_SUPABASE_BUCKET as string | undefined)?.trim() || "uploads";

/** ===================== TYPES ===================== */
type ToastKind = "success" | "error" | "info";

type UploadItem = {
  id: string;
  name: string;
  size: number;
  type: string;
  path: string; // path inside bucket
  url: string; // public url
  createdAt: number;
};

function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

function formatBytes(bytes: number) {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(i ? 1 : 0)} ${sizes[i]}`;
}

/**
 * Upload file to Supabase Storage via XHR to get progress %.
 * (fetch không có upload progress chuẩn trên mọi browser)
 */
function uploadWithProgress(opts: {
  supabaseUrl: string;
  anonKey: string;
  bucket: string;
  path: string;
  file: File;
  onProgress: (pct: number) => void;
}): Promise<void> {
  const { supabaseUrl, anonKey, bucket, path, file, onProgress } = opts;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const url = `${supabaseUrl}/storage/v1/object/${bucket}/${encodeURIComponent(path)}`;

    xhr.open("POST", url, true);
    xhr.setRequestHeader("apikey", anonKey);
    xhr.setRequestHeader("Authorization", `Bearer ${anonKey}`);
    xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
    // Optional: avoid overwrite conflict by upsert=false
    xhr.setRequestHeader("x-upsert", "false");

    xhr.upload.onprogress = (evt) => {
      if (!evt.lengthComputable) return;
      const pct = Math.round((evt.loaded / evt.total) * 100);
      onProgress(pct);
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        // Supabase often returns JSON error, but xhr.responseText is enough
        reject(new Error(xhr.responseText || `Upload failed (${xhr.status})`));
      }
    };

    xhr.onerror = () => reject(new Error("Failed to fetch (network/CORS)"));
    xhr.send(file);
  });
}

/** ===================== UI: Toast + Modal (React, không cần thư viện) ===================== */
function Toast({
  open,
  kind,
  title,
  desc,
  onClose,
}: {
  open: boolean;
  kind: ToastKind;
  title: string;
  desc?: string;
  onClose: () => void;
}) {
  const icon =
    kind === "success" ? <CheckCircle2 className="w-5 h-5" /> :
    kind === "error" ? <XCircle className="w-5 h-5" /> :
    <Info className="w-5 h-5" />;

  const tone =
    kind === "success" ? "border-emerald-300/60 bg-emerald-50/70 text-emerald-900" :
    kind === "error" ? "border-rose-300/60 bg-rose-50/70 text-rose-900" :
    "border-sky-300/60 bg-sky-50/70 text-sky-900";

  if (!open) return null;

  return (
    <div className="fixed top-4 left-0 right-0 z-[999] px-4">
      <div className={`mx-auto max-w-md rounded-2xl border backdrop-blur-md shadow-lg ${tone}`}>
        <div className="p-3 flex gap-3 items-start">
          <div className="mt-0.5">{icon}</div>
          <div className="flex-1">
            <p className="font-extrabold">{title}</p>
            {desc && <p className="text-sm opacity-90 mt-0.5">{desc}</p>}
          </div>
          <button
            onClick={onClose}
            className="px-2 py-1 rounded-xl hover:bg-black/5 active:scale-[0.98] transition font-bold"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmModal({
  open,
  title,
  desc,
  confirmText = "OK",
  cancelText = "Huỷ",
  danger,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  desc?: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[998] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-3xl bg-white/85 dark:bg-zinc-900/85 backdrop-blur-md shadow-2xl border border-white/20 overflow-hidden">
        <div className="p-5">
          <p className="text-lg font-extrabold">{title}</p>
          {desc && <p className="text-sm text-muted-foreground mt-2">{desc}</p>}

          <div className="mt-5 grid grid-cols-2 gap-2">
            <button
              onClick={onClose}
              className="rounded-2xl px-4 py-3 font-bold bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/15 transition active:scale-[0.99]"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`rounded-2xl px-4 py-3 font-extrabold text-white transition active:scale-[0.99] ${
                danger ? "bg-rose-500 hover:bg-rose-600" : "bg-sky-600 hover:bg-sky-700"
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** ===================== MAIN PAGE ===================== */
const LS_KEY = "uploads_history_v1";

export default function FilesPage() {
  const [file, setFile] = useState<File | null>(null);

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const [latest, setLatest] = useState<UploadItem | null>(null);
  const [history, setHistory] = useState<UploadItem[]>([]);

  const [toast, setToast] = useState<{ open: boolean; kind: ToastKind; title: string; desc?: string }>({
    open: false,
    kind: "info",
    title: "",
  });

  const [confirmClear, setConfirmClear] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as UploadItem[];
      if (Array.isArray(parsed)) setHistory(parsed);
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(history.slice(0, 12)));
  }, [history]);

  const preview = useMemo(() => {
    if (!file) return { name: "", size: "", type: "" };
    return {
      name: file.name,
      size: formatBytes(file.size),
      type: file.type || "unknown",
    };
  }, [file]);

  const showToast = (kind: ToastKind, title: string, desc?: string) => {
    setToast({ open: true, kind, title, desc });
    window.setTimeout(() => setToast((t) => ({ ...t, open: false })), 2400);
  };

  const reset = () => {
    setFile(null);
    setLatest(null);
    setProgress(0);
    if (inputRef.current) inputRef.current.value = "";
    showToast("info", "Đã làm mới");
  };

  const makePublicUrl = (path: string) => {
    return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
  };

  const upload = async () => {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      showToast(
        "error",
        "Thiếu ENV Supabase",
        "Bạn cần set VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY"
      );
      return;
    }
    if (!file) {
      showToast("error", "Bạn chưa chọn file");
      return;
    }

    // Giới hạn nhẹ để tránh crash điện thoại
    const MAX_MB = 50;
    if (file.size > MAX_MB * 1024 * 1024) {
      showToast("error", "File quá lớn", `Giới hạn gợi ý: ≤ ${MAX_MB}MB`);
      return;
    }

    setUploading(true);
    setProgress(0);
    setLatest(null);

    // path an toàn: folder theo ngày + timestamp
    const ext = file.name.includes(".") ? file.name.split(".").pop() : "";
    const safeBase = file.name.replace(/[^\w.\-() ]/g, "_").slice(0, 80);
    const day = new Date().toISOString().slice(0, 10);
    const path = `${day}/${Date.now()}-${safeBase}${ext && !safeBase.endsWith(`.${ext}`) ? `.${ext}` : ""}`;

    try {
      await uploadWithProgress({
        supabaseUrl: SUPABASE_URL,
        anonKey: SUPABASE_ANON_KEY,
        bucket: BUCKET,
        path,
        file,
        onProgress: (pct) => setProgress(pct),
      });

      const url = makePublicUrl(path);

      const item: UploadItem = {
        id: uid("up"),
        name: file.name,
        size: file.size,
        type: file.type || "unknown",
        path,
        url,
        createdAt: Date.now(),
      };

      setLatest(item);
      setHistory((prev) => [item, ...prev].slice(0, 12));
      showToast("success", "Upload thành công!", "Bạn có thể copy link hoặc mở link.");

      // giữ file để user upload tiếp hoặc reset tuỳ bạn
      // setFile(null); if (inputRef.current) inputRef.current.value = "";
    } catch (e: any) {
      const msg = String(e?.message || "Upload lỗi");
      // Lỗi phổ biến: Bucket chưa public / thiếu policy / sai URL/Key / mạng chặn
      showToast("error", "Upload thất bại", msg.includes("Failed to fetch") ? "Failed to fetch (mạng/CORS/URL sai)" : msg);
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 800);
    }
  };

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast("success", "Đã copy link!");
    } catch {
      showToast("error", "Không copy được", "Trình duyệt chặn clipboard, hãy copy thủ công.");
    }
  };

  const clearHistory = () => {
    setHistory([]);
    setLatest(null);
    showToast("info", "Đã xoá lịch sử");
  };

  return (
    <div className="min-h-screen px-4 pt-24 pb-16 max-w-3xl mx-auto">
      <Toast
        open={toast.open}
        kind={toast.kind}
        title={toast.title}
        desc={toast.desc}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
      />

      <ConfirmModal
        open={confirmClear}
        title="Xoá lịch sử upload?"
        desc="Sẽ xoá danh sách link gần đây trên máy của bạn (localStorage). Không ảnh hưởng file trên Supabase."
        confirmText="Xoá"
        cancelText="Huỷ"
        danger
        onConfirm={clearHistory}
        onClose={() => setConfirmClear(false)}
      />

      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/70 dark:bg-card/60 game-border hover:scale-[1.02] active:scale-[0.99] transition font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          Về Home
        </Link>

        <div className="flex gap-2">
          <button
            onClick={() => setConfirmClear(true)}
            className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/70 dark:bg-card/60 game-border hover:scale-[1.02] active:scale-[0.99] transition font-bold"
          >
            <Trash2 className="w-4 h-4" />
            Xoá lịch sử
          </button>

          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/70 dark:bg-card/60 game-border hover:scale-[1.02] active:scale-[0.99] transition font-bold"
          >
            Làm mới
          </button>
        </div>
      </div>

      {/* Title */}
      <div className="rounded-3xl bg-white/60 dark:bg-card/60 game-border backdrop-blur-sm p-5">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-3xl bg-primary/10 game-border flex items-center justify-center">
            <FileUp className="w-6 h-6 text-primary" />
          </div>

          <div className="flex-1">
            <h1 className="text-2xl font-extrabold">Up file & lấy link tải</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Upload lên <b>Supabase Storage</b> (Bucket public). Không cần npm, không cần SDK.
            </p>

            <div className="mt-3 text-xs text-muted-foreground space-y-1">
              <p>• Bucket đang dùng: <b>{BUCKET}</b></p>
              <p>
                • Trạng thái ENV:{" "}
                {SUPABASE_URL && SUPABASE_ANON_KEY ? (
                  <span className="font-bold text-emerald-600">OK</span>
                ) : (
                  <span className="font-bold text-rose-600">THIẾU</span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Box */}
      <div className="mt-5 rounded-3xl bg-white/60 dark:bg-card/60 game-border backdrop-blur-sm p-5">
        <p className="font-extrabold mb-2">1) Chọn file</p>

        <input
          ref={inputRef}
          type="file"
          className="w-full"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />

        {file && (
          <div className="mt-3 p-4 rounded-2xl bg-white/70 dark:bg-card/60 game-border">
            <p className="font-bold break-all">{preview.name}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {preview.type} • {preview.size}
            </p>
          </div>
        )}

        <button
          onClick={upload}
          disabled={uploading}
          className="mt-4 w-full rounded-2xl bg-primary text-white font-extrabold px-4 py-3 shadow hover:opacity-95 disabled:opacity-60 transition flex items-center justify-center gap-2"
        >
          {uploading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Đang upload... {progress ? `${progress}%` : ""}
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              Upload & tạo link
            </>
          )}
        </button>

        {/* Progress bar */}
        {uploading && (
          <div className="mt-3">
            <div className="h-3 rounded-full bg-black/10 overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {progress ? `Tiến độ: ${progress}%` : "Đang chuẩn bị..."}
            </p>
          </div>
        )}
      </div>

      {/* Latest result */}
      {latest?.url && (
        <div className="mt-5 rounded-3xl bg-white/60 dark:bg-card/60 game-border backdrop-blur-sm p-5">
          <p className="font-extrabold">2) Link tải (mới nhất)</p>

          <div className="mt-3 p-4 rounded-2xl bg-white/70 dark:bg-card/60 game-border">
            <p className="font-bold break-all">{latest.name}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {formatBytes(latest.size)} • {new Date(latest.createdAt).toLocaleString()}
            </p>

            <a
              href={latest.url}
              target="_blank"
              rel="noreferrer"
              className="block mt-3 break-all text-primary underline font-semibold"
            >
              {latest.url}
            </a>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                onClick={() => copy(latest.url)}
                className="rounded-2xl px-4 py-3 font-extrabold bg-primary/10 hover:bg-primary/20 transition flex items-center justify-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Copy link
              </button>

              <a
                href={latest.url}
                target="_blank"
                rel="noreferrer"
                className="rounded-2xl px-4 py-3 font-extrabold bg-white/70 dark:bg-card/60 game-border hover:scale-[1.01] active:scale-[0.99] transition flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Mở link
              </a>
            </div>
          </div>
        </div>
      )}

      {/* History */}
      <div className="mt-5 rounded-3xl bg-white/60 dark:bg-card/60 game-border backdrop-blur-sm p-5">
        <p className="font-extrabold mb-3">Lịch sử gần đây (tối đa 12)</p>

        {history.length === 0 ? (
          <p className="text-sm text-muted-foreground">Chưa có lịch sử upload.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {history.map((it) => (
              <div key={it.id} className="p-4 rounded-2xl bg-white/70 dark:bg-card/60 game-border">
                <p className="font-bold break-all line-clamp-2">{it.name}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatBytes(it.size)} • {new Date(it.createdAt).toLocaleString()}
                </p>

                <a
                  href={it.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block mt-2 text-sm break-all text-primary underline font-semibold"
                >
                  {it.url}
                </a>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => copy(it.url)}
                    className="rounded-xl px-3 py-2 font-extrabold bg-primary/10 hover:bg-primary/20 transition flex items-center justify-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Copy
                  </button>
                  <a
                    href={it.url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl px-3 py-2 font-extrabold bg-white/70 dark:bg-card/60 game-border hover:scale-[1.01] active:scale-[0.99] transition flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Mở
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="mt-5 p-4 rounded-3xl bg-white/50 dark:bg-card/50 game-border text-sm text-muted-foreground">
        <p className="font-bold text-foreground mb-1">Gợi ý fix lỗi “Failed to fetch”</p>
        <p>• Kiểm tra <b>VITE_SUPABASE_URL</b> đúng dạng https://xxxxx.supabase.co</p>
        <p>• Bucket phải bật <b>Public</b></p>
        <p>• Thử mạng khác (3G/4G). Một số mạng chặn request.</p>
      </div>
    </div>
  );
}
                  }

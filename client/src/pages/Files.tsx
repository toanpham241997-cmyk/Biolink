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
  );
}

/**
 * ✅ Cloudinary config
 * Bạn set vào .env (Vite):
 * VITE_CLOUDINARY_CLOUD_NAME="xxx"
 * VITE_CLOUDINARY_UPLOAD_PRESET="xxx"
 */
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string | undefined;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string | undefined;

export default function FilesPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);

  const [modal, setModal] = useState<{ open: boolean; variant: "success" | "error" | "info"; title: string; message?: string }>({
    open: false,
    variant: "info",
    title: "",
  });

  const previewName = useMemo(() => file?.name ?? "", [file]);
  const previewSize = useMemo(() => (file ? formatBytes(file.size) : ""), [file]);

  const resetAll = () => {
    setFile(null);
    setResult(null);
    setModal({ open: true, variant: "info", title: "Đã làm mới", message: "Bạn có thể chọn file mới để upload." });
  };

  const uploadFile = async () => {
    setResult(null);

    if (!file) {
      setModal({ open: true, variant: "info", title: "Chưa chọn file", message: "Hãy chọn file trước khi upload." });
      return;
    }
    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      setModal({
        open: true,
        variant: "error",
        title: "Thiếu cấu hình Cloudinary",
        message: "Bạn cần set VITE_CLOUDINARY_CLOUD_NAME và VITE_CLOUDINARY_UPLOAD_PRESET trong .env",
      });
      return;
    }

    try {
      setIsUploading(true);

      const form = new FormData();
      form.append("file", file);
      form.append("upload_preset", UPLOAD_PRESET);

      // ✅ auto-detect loại file (image/video/raw)
      // Cloudinary sẽ tự xử lý, nhưng để chắc ăn: resource_type=auto
      const endpoint = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`;

      const res = await fetch(endpoint, { method: "POST", body: form });
      const json = await res.json().catch(() => ({}));

      if (!res.ok || !json?.secure_url) {
        throw new Error(json?.error?.message || "Upload thất bại");
      }

      setResult({
        url: String(json.secure_url),
        name: file.name,
        size: file.size,
        type: file.type || "file",
      });

      setModal({ open: true, variant: "success", title: "Upload thành công 🎉", message: "Bạn có thể copy link hoặc mở link." });
    } catch (e: any) {
      setModal({ open: true, variant: "error", title: "Upload thất bại", message: e?.message || "Failed to fetch" });
    } finally {
      setIsUploading(false);
    }
  };

  const copyLink = async () => {
    if (!result?.url) return;
    try {
      await navigator.clipboard.writeText(result.url);
      setModal({ open: true, variant: "success", title: "Copy thành công", message: "Link đã được copy vào clipboard." });
    } catch {
      setModal({ open: true, variant: "error", title: "Không copy được", message: "Trình duyệt chặn clipboard. Hãy copy thủ công." });
    }
  };

  return (
    <div className="min-h-screen px-4 pt-24 pb-16 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/70 dark:bg-card/60 game-border hover:scale-[1.02] active:scale-[0.99] transition font-extrabold"
          >
            <ArrowLeft className="w-4 h-4" />
            Về Home
          </Link>

          <button
            onClick={resetAll}
            className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/70 dark:bg-card/60 game-border hover:scale-[1.02] active:scale-[0.99] transition font-extrabold"
          >
            <RotateCcw className="w-4 h-4" />
            Làm mới
          </button>
        </div>

        <h1 className="text-2xl font-extrabold mb-3">Up file & lấy link tải</h1>

        <Card className="game-border bg-white/60 dark:bg-card/60 backdrop-blur-sm rounded-[28px]">
          <CardContent className="pt-6 space-y-4">
            {/* HDSD */}
            <div className="p-4 rounded-[22px] bg-white/70 dark:bg-card/60 game-border">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center game-border">
                  <FileUp className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-extrabold">Cách dùng</p>
                  <p className="text-sm text-muted-foreground">
                    Chọn file → Upload → Copy link. (Không cần server, dùng Cloudinary free)
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Hỗ trợ: ảnh / video / file thường.
                  </p>
                </div>
              </div>
            </div>

            {/* Pick */}
            <div className="space-y-2">
              <input
                type="file"
                className="w-full"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />

              {file && (
                <div className="p-4 rounded-[22px] bg-white/70 dark:bg-card/60 game-border">
                  <p className="font-extrabold break-all">{previewName}</p>
                  <p className="text-sm text-muted-foreground">Dung lượng: {previewSize}</p>
                </div>
              )}

              <button
                onClick={uploadFile}
                disabled={isUploading}
                className="w-full p-3 rounded-[22px] bg-primary text-white font-extrabold shadow game-border hover:opacity-95 disabled:opacity-60 transition flex items-center justify-center gap-2"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Đang upload...
                  </>
                ) : (
                  <>
                    <FileUp className="w-5 h-5" />
                    Upload file
                  </>
                )}
              </button>
            </div>

            {/* Result */}
            {result?.url && (
              <div className="p-4 rounded-[22px] bg-white/70 dark:bg-card/60 game-border space-y-3">
                <div className="flex items-center gap-2">
                  <Link2 className="w-5 h-5 text-primary" />
                  <p className="font-extrabold">Link tải:</p>
                </div>

                <a
                  href={result.url}
                  target="_blank"
                  rel="noreferrer"
                  className="break-all text-primary underline font-bold"
                >
                  {result.url}
                </a>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={copyLink}
                    className="w-full p-3 rounded-[18px] bg-primary/10 hover:bg-primary/20 font-extrabold transition game-border flex items-center justify-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Copy link
                  </button>

                  <a
                    href={result.url}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full p-3 rounded-[18px] bg-primary text-white font-extrabold transition game-border flex items-center justify-center gap-2 hover:opacity-95"
                  >
                    Mở link
                  </a>
                </div>

                <p className="text-xs text-muted-foreground">
                  Tên: <b>{result.name}</b> • Dung lượng: <b>{formatBytes(result.size)}</b> • Loại: <b>{result.type}</b>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <Modal
        open={modal.open}
        variant={modal.variant}
        title={modal.title}
        message={modal.message}
        onClose={() => setModal((m) => ({ ...m, open: false }))}
      />
    </div>
  );
        }

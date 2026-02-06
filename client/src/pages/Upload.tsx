import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Copy,
  Image as ImageIcon,
  Loader2,
  CheckCircle2,
  X,
  Server,
  Info,
  Sparkles,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const IMGBB_KEY = import.meta.env.VITE_IMGBB_API_KEY as string | undefined;

type SwalKind = "success" | "error" | "info";

function normalizeUrl(url: string) {
  const u = (url || "").trim();
  if (!u) return "";
  return /^https?:\/\//i.test(u) ? u : `https://${u}`;
}

async function safeCopy(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function formatBytes(bytes: number) {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(i ? 1 : 0)} ${sizes[i]}`;
}

/** ✅ Swal modal mini (không cần thư viện) */
function SwalModal({
  open,
  kind,
  title,
  message,
  onClose,
}: {
  open: boolean;
  kind: SwalKind;
  title: string;
  message?: string;
  onClose: () => void;
}) {
  const icon =
    kind === "success" ? (
      <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 flex items-center justify-center game-border">
        <CheckCircle2 className="w-8 h-8 text-emerald-600" />
      </div>
    ) : kind === "error" ? (
      <div className="w-14 h-14 rounded-2xl bg-red-500/15 flex items-center justify-center game-border">
        <X className="w-8 h-8 text-red-600" />
      </div>
    ) : (
      <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center game-border">
        <Info className="w-8 h-8 text-primary" />
      </div>
    );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[999] flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            onClick={onClose}
          />

          {/* modal */}
          <motion.div
            initial={{ y: 18, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 10, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 220, damping: 22 }}
            className="relative w-full max-w-sm"
          >
            <div className="rounded-[28px] bg-white/85 dark:bg-card/80 game-border shadow-2xl overflow-hidden">
              <div className="p-5">
                <div className="flex items-start gap-3">
                  {icon}
                  <div className="flex-1">
                    <p className="text-lg font-extrabold">{title}</p>
                    {message ? (
                      <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                        {message}
                      </p>
                    ) : null}
                  </div>

                  <button
                    onClick={onClose}
                    className="w-10 h-10 rounded-2xl bg-white/70 dark:bg-card/60 game-border flex items-center justify-center hover:scale-[1.02] active:scale-[0.99] transition"
                    title="Đóng"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <button
                  onClick={onClose}
                  className="mt-4 w-full py-3 rounded-2xl bg-primary text-white font-extrabold game-border shadow hover:opacity-95 active:scale-[0.99] transition"
                >
                  OK
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function UploadPage() {
  const [server, setServer] = useState<1 | 2>(1);

  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [imageUrl, setImageUrl] = useState<string>("");
  const [error, setError] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Swal state
  const [swalOpen, setSwalOpen] = useState(false);
  const [swalKind, setSwalKind] = useState<SwalKind>("success");
  const [swalTitle, setSwalTitle] = useState("Copy thành công!");
  const [swalMsg, setSwalMsg] = useState<string>("");

  const previewUrl = useMemo(() => {
    if (!file) return "";
    return URL.createObjectURL(file);
  }, [file]);

  // cleanup preview url
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const showSwal = (kind: SwalKind, title: string, message?: string) => {
    setSwalKind(kind);
    setSwalTitle(title);
    setSwalMsg(message || "");
    setSwalOpen(true);
  };

  const uploadToImgBB = async () => {
    setError("");
    setImageUrl("");

    if (!IMGBB_KEY) {
      setError("Thiếu VITE_IMGBB_API_KEY. Bạn cần thêm API key ImgBB vào Environment.");
      showSwal("error", "Thiếu API key", "Bạn chưa set VITE_IMGBB_API_KEY trong Environment.");
      return;
    }

    if (!file) {
      setError("Bạn chưa chọn ảnh.");
      showSwal("info", "Chưa chọn ảnh", "Hãy bấm “Chọn tệp” rồi chọn 1 ảnh để upload.");
      return;
    }

    try {
      setIsUploading(true);

      const form = new FormData();
      form.append("image", file);

      // ✅ Bạn có thể dùng server switch để sau này đổi host.
      // Hiện tại ImgBB vẫn dùng 1 endpoint, mình giữ server để đúng UI.
      const endpoint = `https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`;

      const res = await fetch(endpoint, {
        method: "POST",
        body: form,
      });

      const json = await res.json();

      if (!res.ok || !json?.data?.url) {
        throw new Error(json?.error?.message || "Upload failed");
      }

      const url = String(json.data.url);
      setImageUrl(url);
      showSwal("success", "Upload thành công!", "Link ảnh đã sẵn sàng. Bạn có thể bấm Copy link ảnh.");
    } catch (e: any) {
      const msg = e?.message || "Upload lỗi";
      setError(msg);
      showSwal("error", "Upload thất bại", msg);
    } finally {
      setIsUploading(false);
    }
  };

  const copyLink = async () => {
    const u = normalizeUrl(imageUrl);
    if (!u) {
      showSwal("info", "Chưa có link", "Bạn cần upload ảnh trước để có link.");
      return;
    }

    const ok = await safeCopy(u);
    if (ok) {
      showSwal("success", "Copy thành công!", "Link ảnh đã được copy vào clipboard.");
    } else {
      showSwal(
        "error",
        "Copy thất bại",
        "Trình duyệt chặn clipboard. Bạn thử bấm giữ vào link để copy thủ công."
      );
    }
  };

  const clearAll = () => {
    setFile(null);
    setImageUrl("");
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    showSwal("info", "Đã làm mới", "Bạn có thể chọn ảnh khác để upload.");
  };

  return (
    <div className="min-h-screen px-4 pt-24 pb-16 max-w-2xl mx-auto">
      <SwalModal
        open={swalOpen}
        kind={swalKind}
        title={swalTitle}
        message={swalMsg}
        onClose={() => setSwalOpen(false)}
      />

      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/70 dark:bg-card/60 game-border hover:scale-[1.02] active:scale-[0.99] transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-extrabold">Về Home</span>
          </Link>

          <div className="leading-tight">
            <h1 className="text-xl font-extrabold inline-flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Upload ảnh & copy link
            </h1>
            <p className="text-xs text-muted-foreground">
              Chọn ảnh → Upload → Copy link ảnh (Host: ImgBB)
            </p>
          </div>
        </div>

        <Card className="game-border bg-white/70 dark:bg-card/60 backdrop-blur-sm rounded-[28px] overflow-hidden">
          <CardContent className="pt-6 space-y-4">
            {/* Hint */}
            <div className="p-4 rounded-[26px] bg-white/70 dark:bg-card/60 game-border">
              <div className="flex items-center gap-2 text-muted-foreground">
                <ImageIcon className="w-5 h-5 text-primary" />
                <p className="text-sm font-semibold">
                  Bạn có thể chọn Server 2 nếu Server 1 lỗi (UI giống ảnh).
                </p>
              </div>
            </div>

            {/* Server switch */}
            <div className="p-3 rounded-[26px] bg-white/70 dark:bg-card/60 game-border">
              <div className="flex items-center gap-2 mb-3">
                <Server className="w-4 h-4 text-primary" />
                <p className="font-extrabold">Chọn server</p>
                <p className="ml-auto text-xs text-muted-foreground">
                  Đang chọn: <b>Server {server}</b>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setServer(1)}
                  className={[
                    "py-3 rounded-2xl font-extrabold game-border transition",
                    server === 1
                      ? "bg-primary text-white shadow"
                      : "bg-white/70 dark:bg-card/60 hover:scale-[1.01] active:scale-[0.99]",
                  ].join(" ")}
                >
                  Server 1
                </button>
                <button
                  onClick={() => setServer(2)}
                  className={[
                    "py-3 rounded-2xl font-extrabold game-border transition",
                    server === 2
                      ? "bg-primary text-white shadow"
                      : "bg-white/70 dark:bg-card/60 hover:scale-[1.01] active:scale-[0.99]",
                  ].join(" ")}
                >
                  Server 2
                </button>
              </div>
            </div>

            {/* Choose file */}
            <div className="p-3 rounded-[26px] bg-white/70 dark:bg-card/60 game-border space-y-3">
              <div className="flex items-center justify-between gap-2">
                <p className="font-extrabold">Chọn tệp</p>
                {file ? (
                  <p className="text-xs text-muted-foreground">
                    {file.name} • {formatBytes(file.size)}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">Chưa chọn ảnh</p>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="w-full"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />

              {/* Preview */}
              {previewUrl && (
                <div className="rounded-[24px] overflow-hidden game-border bg-white/70">
                  <img
                    src={previewUrl}
                    alt="preview"
                    className="w-full max-h-[380px] object-contain"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={uploadToImgBB}
                  disabled={isUploading}
                  className="w-full py-3 rounded-2xl bg-primary text-white font-extrabold shadow hover:opacity-95 disabled:opacity-60 transition flex items-center justify-center gap-2 game-border"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" /> Đang upload...
                    </>
                  ) : (
                    "Upload ảnh"
                  )}
                </button>

                <button
                  onClick={clearAll}
                  disabled={isUploading}
                  className="w-full py-3 rounded-2xl bg-white/70 dark:bg-card/60 font-extrabold game-border hover:scale-[1.01] active:scale-[0.99] transition disabled:opacity-60"
                >
                  Làm mới
                </button>
              </div>

              {!!error && (
                <p className="text-sm text-destructive font-extrabold">{error}</p>
              )}
            </div>

            {/* Link + Copy */}
            <div className="p-3 rounded-[26px] bg-white/70 dark:bg-card/60 game-border">
              <p className="font-extrabold mb-2">Link ảnh</p>

              <div className="grid grid-cols-[1fr,170px] gap-2">
                <input
                  value={imageUrl}
                  readOnly
                  placeholder="Link ảnh sẽ hiện ở đây sau khi upload…"
                  className="w-full px-4 py-3 rounded-2xl bg-white/80 dark:bg-card/60 game-border outline-none text-sm"
                />

                <button
                  onClick={copyLink}
                  disabled={!imageUrl}
                  className="w-full py-3 rounded-2xl bg-primary text-white font-extrabold shadow hover:opacity-95 disabled:opacity-60 transition flex items-center justify-center gap-2 game-border"
                >
                  <Copy className="w-4 h-4" />
                  Copy link ảnh
                </button>
              </div>

              {imageUrl ? (
                <div className="mt-3 text-sm">
                  <a
                    href={normalizeUrl(imageUrl)}
                    target="_blank"
                    rel="noreferrer"
                    className="break-all text-primary underline font-semibold"
                  >
                    {imageUrl}
                  </a>
                </div>
              ) : null}

              <p className="mt-3 text-xs text-muted-foreground">
                Tip: Nếu điện thoại chặn clipboard, bạn có thể bấm giữ vào link để copy thủ công.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
    }

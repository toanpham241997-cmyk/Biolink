import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Copy,
  ExternalLink,
  FileUp,
  Link2,
  Loader2,
  Trash2,
  CheckCircle2,
  XCircle,
  Info,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** =========================
 *  ENV (Vite)
 *  ========================= */
const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim();
const SUPABASE_ANON_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim();
const BUCKET = ((import.meta.env.VITE_SUPABASE_BUCKET as string | undefined)?.trim() || "upload").trim();

/** =========================
 *  Types
 *  ========================= */
type ToastKind = "success" | "error" | "info";

type UploadItem = {
  id: string;
  name: string;
  size: number;
  type: string;
  path: string; // path trong bucket
  url: string; // public url
  createdAt: number;
};

/** =========================
 *  Utils
 *  ========================= */
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

function safeFileName(name: string) {
  // bỏ ký tự lạ để URL đẹp hơn
  const cleaned = name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
  return cleaned || `file_${Date.now()}`;
}

function isLikelyImage(type: string, name: string) {
  if (type.startsWith("image/")) return true;
  return /\.(png|jpg|jpeg|gif|webp|bmp)$/i.test(name);
}

/** =========================
 *  Modal "Swal-like" (No library)
 *  ========================= */
function SwalModal({
  open,
  kind,
  title,
  message,
  buttonText = "OK",
  onClose,
}: {
  open: boolean;
  kind: ToastKind;
  title: string;
  message?: string;
  buttonText?: string;
  onClose: () => void;
}) {
  if (!open) return null;

  const Icon =
    kind === "success" ? CheckCircle2 : kind === "error" ? XCircle : Info;

  const ring =
    kind === "success"
      ? "ring-green-500/30"
      : kind === "error"
      ? "ring-rose-500/30"
      : "ring-sky-500/30";

  const iconColor =
    kind === "success"
      ? "text-green-500"
      : kind === "error"
      ? "text-rose-500"
      : "text-sky-500";

  return (
    <div className="fixed inset-0 z-[60] bg-black/45 backdrop-blur-[2px] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        className={`w-full max-w-sm rounded-[26px] bg-white/95 dark:bg-card/95 shadow-2xl ring-1 ${ring} game-border`}
      >
        <div className="p-6 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-[22px] bg-white/70 dark:bg-card/60 game-border flex items-center justify-center">
            <Icon className={`w-10 h-10 ${iconColor}`} />
          </div>

          <h3 className="mt-4 text-2xl font-extrabold">{title}</h3>

          {message ? (
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              {message}
            </p>
          ) : null}

          <button
            onClick={onClose}
            className="mt-5 w-full py-3 rounded-2xl bg-primary text-white font-extrabold game-border hover:opacity-95 active:scale-[0.99] transition"
          >
            {buttonText}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/** =========================
 *  Toast (top) - cũng không cần lib
 *  ========================= */
function Toast({
  open,
  kind,
  title,
  onClose,
}: {
  open: boolean;
  kind: ToastKind;
  title: string;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => onClose(), 2200);
    return () => clearTimeout(t);
  }, [open, onClose]);

  const Icon =
    kind === "success" ? CheckCircle2 : kind === "error" ? XCircle : Info;

  const bg =
    kind === "success"
      ? "bg-green-500/15"
      : kind === "error"
      ? "bg-rose-500/15"
      : "bg-sky-500/15";

  const color =
    kind === "success"
      ? "text-green-700 dark:text-green-300"
      : kind === "error"
      ? "text-rose-700 dark:text-rose-300"
      : "text-sky-700 dark:text-sky-300";

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0, y: -14, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -14, scale: 0.98 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[70] w-[92%] max-w-md"
        >
          <div className={`rounded-2xl p-3 ${bg} game-border backdrop-blur-sm`}>
            <div className="flex items-center gap-2">
              <Icon className={`w-5 h-5 ${color}`} />
              <p className={`text-sm font-extrabold ${color}`}>{title}</p>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

/** =========================
 *  Main Page
 *  ========================= */
export default function FilesPage() {
  const [file, setFile] = useState<File | null>(null);
  const [items, setItems] = useState<UploadItem[]>(() => {
    // lưu lịch sử local cho đẹp
    try {
      const raw = localStorage.getItem("uploads_history_v1");
      const parsed = raw ? (JSON.parse(raw) as UploadItem[]) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string>("");

  const [toast, setToast] = useState<{ open: boolean; kind: ToastKind; title: string }>({
    open: false,
    kind: "info",
    title: "",
  });

  const [modal, setModal] = useState<{
    open: boolean;
    kind: ToastKind;
    title: string;
    message?: string;
  }>({
    open: false,
    kind: "info",
    title: "",
    message: "",
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const previewName = useMemo(() => file?.name ?? "", [file]);
  const previewSize = useMemo(() => (file ? formatBytes(file.size) : ""), [file]);
  const previewType = useMemo(() => file?.type || "", [file]);

  const supabase: SupabaseClient | null = useMemo(() => {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
    return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("uploads_history_v1", JSON.stringify(items.slice(0, 30)));
    } catch {}
  }, [items]);

  const showToast = (kind: ToastKind, title: string) => {
    setToast({ open: true, kind, title });
  };

  const showModal = (kind: ToastKind, title: string, message?: string) => {
    setModal({ open: true, kind, title, message });
  };

  const closeModal = () => setModal((p) => ({ ...p, open: false }));

  const resetAll = () => {
    setFile(null);
    setError("");
    setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
    showToast("info", "Đã làm mới");
  };

  /** Upload lên Supabase Storage (public bucket) */
  const uploadFile = async () => {
    setError("");
    setProgress(0);

    if (!supabase) {
      showModal(
        "error",
        "Thiếu ENV Supabase",
        "Bạn cần set VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY trong Environment (Render) hoặc .env"
      );
      return;
    }

    if (!file) {
      showToast("error", "Bạn chưa chọn file");
      return;
    }

    try {
      setIsUploading(true);

      // Tạo path unique trong bucket
      const ext = file.name.includes(".") ? file.name.split(".").pop() : "";
      const base = safeFileName(file.name.replace(/\.[^/.]+$/, ""));
      const stamp = new Date().toISOString().replace(/[:.]/g, "-");
      const path = `${stamp}_${base}${ext ? `.${ext}` : ""}`;

      // Supabase upload (không có progress native trên fetch, mình fake progress mượt)
      let fake = 0;
      const fakeTimer = window.setInterval(() => {
        fake = Math.min(95, fake + Math.random() * 10);
        setProgress(Math.round(fake));
      }, 180);

      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type || "application/octet-stream",
        });

      window.clearInterval(fakeTimer);

      if (upErr) {
        // Hay gặp: 403 policy / 401
        throw new Error(
          upErr.message ||
            "Upload lỗi. Nếu báo 403/401: bạn chưa tạo Storage Policy cho bucket."
        );
      }

      // Lấy public url
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);

      const url = data?.publicUrl;
      if (!url) throw new Error("Không lấy được publicUrl. Kiểm tra bucket có PUBLIC không.");

      setProgress(100);

      const newItem: UploadItem = {
        id: uid("u"),
        name: file.name,
        size: file.size,
        type: file.type || "application/octet-stream",
        path,
        url,
        createdAt: Date.now(),
      };

      setItems((prev) => [newItem, ...prev].slice(0, 30));
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

      showToast("success", "Upload thành công!");
      showModal("success", "Upload thành công", "Link tải đã tạo. Bấm Copy để dùng ngay.");
    } catch (e: any) {
      const msg = String(e?.message || "Upload thất bại");
      setError(msg);
      setProgress(0);
      showModal("error", "Upload thất bại", msg);
    } finally {
      setIsUploading(false);
    }
  };

  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast("success", "Đã copy link!");
      showModal("success", "Copy thành công", "Link đã được copy vào clipboard.");
    } catch {
      showModal(
        "error",
        "Copy thất bại",
        "Trình duyệt chặn clipboard. Bạn hãy nhấn giữ vào link để copy thủ công."
      );
    }
  };

  const openLink = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const removeLocalItem = (id: string) => {
    setItems((prev) => prev.filter((x) => x.id !== id));
    showToast("info", "Đã xoá khỏi danh sách");
  };

  const clearHistory = () => {
    setItems([]);
    showToast("info", "Đã xoá lịch sử");
  };

  return (
    <div className="min-h-screen px-4 pt-24 pb-16 max-w-3xl mx-auto">
      {/* Toast */}
      <Toast
        open={toast.open}
        kind={toast.kind}
        title={toast.title}
        onClose={() => setToast((p) => ({ ...p, open: false }))}
      />

      {/* Modal */}
      <SwalModal
        open={modal.open}
        kind={modal.kind}
        title={modal.title}
        message={modal.message}
        onClose={closeModal}
      />

      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/70 dark:bg-card/60 game-border hover:scale-[1.02] active:scale-[0.99] transition font-extrabold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Về Home</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={resetAll}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/70 dark:bg-card/60 game-border hover:scale-[1.02] active:scale-[0.99] transition font-extrabold"
              title="Làm mới"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Làm mới</span>
            </button>

            <button
              onClick={clearHistory}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/70 dark:bg-card/60 game-border hover:scale-[1.02] active:scale-[0.99] transition font-extrabold"
              title="Xoá lịch sử"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Xoá</span>
            </button>
          </div>
        </div>

        {/* Title */}
        <div className="mb-4">
          <h1 className="text-2xl sm:text-3xl font-extrabold">Up file & lấy link tải</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Upload file lên <b>Supabase Storage</b> (bucket <b>{BUCKET}</b>) → tạo <b>public link</b> để tải.
          </p>
        </div>

        <Card className="game-border bg-white/60 dark:bg-card/60 backdrop-blur-sm">
          <CardContent className="pt-6 space-y-4">
            {/* Guide */}
            <div className="p-4 rounded-[22px] bg-white/70 dark:bg-card/60 game-border">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center game-border">
                  <FileUp className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-extrabold">Cách dùng</p>
                  <ul className="mt-1 text-sm text-muted-foreground leading-relaxed list-disc pl-5 space-y-1">
                    <li>Chọn file → bấm <b>Upload</b></li>
                    <li>Upload xong sẽ hiện <b>Link tải</b> → bấm <b>Copy</b></li>
                    <li>Nếu lỗi <b>401/403</b>: bạn cần tạo <b>Storage Policy</b> cho bucket để cho phép upload (insert).</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Picker */}
            <div className="p-4 rounded-[22px] bg-white/70 dark:bg-card/60 game-border space-y-3">
              <div className="flex items-center justify-between gap-2">
                <p className="font-extrabold">Chọn file</p>
                <span className="text-xs text-muted-foreground">
                  Tips: file name sẽ được làm “safe” để link đẹp hơn.
                </span>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                className="w-full"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />

              {file ? (
                <div className="rounded-[22px] p-4 bg-white/60 dark:bg-card/60 game-border">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-extrabold break-all">{previewName}</p>
                      <p className="text-sm text-muted-foreground">
                        {previewSize} • {previewType || "unknown"}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                        showToast("info", "Đã bỏ chọn file");
                      }}
                      className="px-3 py-2 rounded-xl bg-white/70 dark:bg-card/60 game-border font-bold hover:scale-[1.02] active:scale-[0.99] transition"
                    >
                      Bỏ chọn
                    </button>
                  </div>

                  {isLikelyImage(file.type, file.name) ? (
                    <div className="mt-3 rounded-[18px] overflow-hidden bg-white/60 game-border">
                      <img
                        src={URL.createObjectURL(file)}
                        alt="preview"
                        className="w-full max-h-[260px] object-contain"
                        onLoad={(e) => {
                          // tránh leak (release objectURL)
                          const img = e.currentTarget;
                          const src = img.src;
                          setTimeout(() => URL.revokeObjectURL(src), 800);
                        }}
                      />
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  Chưa chọn file.
                </div>
              )}

              {/* Upload Button */}
              <button
                onClick={uploadFile}
                disabled={isUploading}
                className="w-full py-3 rounded-[22px] bg-primary text-white font-extrabold shadow hover:opacity-95 disabled:opacity-60 transition flex items-center justify-center gap-2 game-border"
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

              {/* Progress */}
              {isUploading || progress > 0 ? (
                <div className="mt-1">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>Tiến trình</span>
                    <span className="font-bold">{progress}%</span>
                  </div>
                  <div className="h-3 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden game-border">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                    />
                  </div>
                </div>
              ) : null}

              {!!error ? (
                <p className="text-sm text-destructive font-bold mt-2">{error}</p>
              ) : null}

              {/* ENV Warning */}
              {!SUPABASE_URL || !SUPABASE_ANON_KEY ? (
                <div className="mt-2 p-3 rounded-[18px] bg-rose-500/10 game-border">
                  <p className="text-sm font-extrabold text-rose-600 dark:text-rose-300">
                    Bạn chưa set ENV Supabase (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).
                  </p>
                </div>
              ) : null}
            </div>

            {/* History */}
            <div className="p-4 rounded-[22px] bg-white/70 dark:bg-card/60 game-border">
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <Link2 className="w-5 h-5 text-primary" />
                  <p className="font-extrabold">Lịch sử link đã tạo</p>
                </div>
                <span className="text-xs text-muted-foreground">
                  Lưu local (tối đa 30)
                </span>
              </div>

              {items.length === 0 ? (
                <p className="text-sm text-muted-foreground">Chưa có file nào.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {items.map((it) => (
                    <div
                      key={it.id}
                      className="rounded-[22px] p-4 bg-white/60 dark:bg-card/60 game-border"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-extrabold break-all">{it.name}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatBytes(it.size)} •{" "}
                            {new Date(it.createdAt).toLocaleString()}
                          </p>
                        </div>

                        <button
                          onClick={() => removeLocalItem(it.id)}
                          className="p-2 rounded-xl bg-white/70 dark:bg-card/60 game-border hover:scale-[1.02] active:scale-[0.99] transition"
                          title="Xoá khỏi danh sách"
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </button>
                      </div>

                      <a
                        href={it.url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 block break-all text-primary underline font-bold"
                      >
                        {it.url}
                      </a>

                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => copyText(it.url)}
                          className="flex-1 py-2 rounded-2xl bg-primary/10 hover:bg-primary/20 font-extrabold transition flex items-center justify-center gap-2 game-border"
                        >
                          <Copy className="w-4 h-4" />
                          Copy
                        </button>

                        <button
                          onClick={() => openLink(it.url)}
                          className="flex-1 py-2 rounded-2xl bg-white/70 dark:bg-card/60 font-extrabold transition flex items-center justify-center gap-2 game-border hover:scale-[1.01] active:scale-[0.99]"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Mở
                        </button>
                      </div>

                      <div className="mt-3 text-xs text-muted-foreground">
                        Bucket: <b>{BUCKET}</b> • Path: <span className="break-all">{it.path}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Help / Policy */}
            <div className="p-4 rounded-[22px] bg-white/70 dark:bg-card/60 game-border">
              <p className="font-extrabold">Nếu upload bị 401/403 (Policy)</p>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                Vào <b>Supabase → Storage → Policies</b> tạo policy cho bucket <b>{BUCKET}</b> để
                cho phép <b>insert</b> (upload) với user anonymous.
                <br />
                Bucket PUBLIC chỉ giúp <b>ai cũng mở link</b>, còn upload vẫn cần policy.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

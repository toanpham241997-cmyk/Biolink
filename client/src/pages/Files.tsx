import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Copy,
  ExternalLink,
  FileUp,
  Loader2,
  Trash2,
  CheckCircle2,
  XCircle,
  Info,
  Image as ImageIcon,
  FileText,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

/* =========================
   ENV (Vite)
========================= */
const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim();
const SUPABASE_ANON_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim();
const BUCKET = ((import.meta.env.VITE_SUPABASE_BUCKET as string | undefined)?.trim() || "upload").trim();

/* =========================
   TYPES
========================= */
type ToastKind = "success" | "error" | "info";

type UploadedItem = {
  id: string;
  name: string;
  size: number;
  type: string;
  path: string; // path trong bucket
  url: string; // public url
  createdAt: number;
};

type ModalState = {
  open: boolean;
  kind: ToastKind;
  title: string;
  message?: string;
};

type ToastState = {
  open: boolean;
  kind: ToastKind;
  message: string;
};

/* =========================
   HELPERS
========================= */
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

async function safeCopy(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function buildPublicUrl(bucket: string, path: string) {
  // Public URL chuẩn của Supabase Storage:
  // https://xxxx.supabase.co/storage/v1/object/public/<bucket>/<path>
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
}

function requireEnv() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return {
      ok: false as const,
      error:
        "Thiếu ENV. Bạn cần set VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY trong Render Environment hoặc file .env",
    };
  }
  return { ok: true as const };
}

/* =========================
   UI: Toast
========================= */
function Toast({
  open,
  kind,
  message,
  onClose,
}: ToastState & { onClose: () => void }) {
  if (!open) return null;
  const Icon = kind === "success" ? CheckCircle2 : kind === "error" ? XCircle : Info;

  return (
    <div className="fixed top-4 left-0 right-0 z-50 px-4 flex justify-center">
      <motion.div
        initial={{ opacity: 0, y: -12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -12 }}
        className="w-full max-w-md rounded-2xl bg-white/90 dark:bg-card/90 backdrop-blur-sm game-border px-4 py-3 shadow-lg flex items-center gap-3"
      >
        <Icon className="w-5 h-5 text-primary" />
        <p className="text-sm font-semibold flex-1">{message}</p>
        <button
          onClick={onClose}
          className="text-xs font-bold px-3 py-1 rounded-xl bg-primary/10 hover:bg-primary/20 transition"
        >
          Đóng
        </button>
      </motion.div>
    </div>
  );
}

/* =========================
   UI: Modal (swal-like)
========================= */
function Modal({
  open,
  kind,
  title,
  message,
  onClose,
}: ModalState & { onClose: () => void }) {
  if (!open) return null;
  const Icon = kind === "success" ? CheckCircle2 : kind === "error" ? XCircle : Info;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-sm rounded-[28px] bg-white dark:bg-card p-6 text-center game-border shadow-2xl"
      >
        <div className="w-16 h-16 mx-auto rounded-3xl bg-primary/10 flex items-center justify-center game-border">
          <Icon className="w-9 h-9 text-primary" />
        </div>
        <h3 className="mt-4 text-xl font-extrabold">{title}</h3>
        {message && (
          <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">{message}</p>
        )}
        <button
          onClick={onClose}
          className="mt-5 w-full py-3 rounded-2xl bg-primary text-white font-extrabold game-border hover:opacity-95 active:scale-[0.99] transition"
        >
          OK
        </button>
      </motion.div>
    </div>
  );
}

/* =========================
   XHR upload with progress
   (fetch không có progress chuẩn)
========================= */
function uploadToSupabaseXHR(opts: {
  bucket: string;
  path: string;
  file: File;
  onProgress: (pct: number) => void;
}): Promise<void> {
  const { bucket, path, file, onProgress } = opts;

  return new Promise((resolve, reject) => {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      reject(new Error("Thiếu SUPABASE_URL hoặc SUPABASE_ANON_KEY"));
      return;
    }

    const endpoint = `${SUPABASE_URL}/storage/v1/object/${bucket}/${encodeURIComponent(path)}`;

    const xhr = new XMLHttpRequest();
    xhr.open("POST", endpoint, true);
    xhr.setRequestHeader("Authorization", `Bearer ${SUPABASE_ANON_KEY}`);
    xhr.setRequestHeader("x-upsert", "false");

    xhr.upload.onprogress = (e) => {
      if (!e.lengthComputable) return;
      const pct = Math.round((e.loaded / e.total) * 100);
      onProgress(pct);
    };

    xhr.onerror = () => reject(new Error("Failed to fetch (mạng/CORS)"));
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(xhr.responseText || `Upload lỗi: ${xhr.status}`));
    };

    xhr.send(file);
  });
}

/* =========================
   Delete file (OPTIONAL)
   -> chỉ hoạt động nếu bạn set policy cho phép delete
========================= */
async function deleteFromSupabase(bucket: string, path: string) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("Thiếu SUPABASE_URL hoặc SUPABASE_ANON_KEY");
  }
  const endpoint = `${SUPABASE_URL}/storage/v1/object/${bucket}/${encodeURIComponent(path)}`;

  const res = await fetch(endpoint, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
  });

  // Nếu policy không cho delete -> sẽ lỗi 401/403
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Không xoá được (status ${res.status}). Có thể policy chưa cho phép.`);
  }
}

/* =========================
   LocalStorage store
========================= */
const LS_KEY = "uploaded_files_v1";

function loadLocal(): UploadedItem[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as UploadedItem[];
    if (!Array.isArray(arr)) return [];
    return arr
      .filter((x) => x && x.id && x.url)
      .sort((a, b) => b.createdAt - a.createdAt);
  } catch {
    return [];
  }
}

function saveLocal(list: UploadedItem[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(list.slice(0, 50))); // giữ tối đa 50
}

/* =========================
   PAGE
========================= */
export default function FilesPage() {
  const [picked, setPicked] = useState<File[]>([]);
  const [items, setItems] = useState<UploadedItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const [toast, setToast] = useState<ToastState>({ open: false, kind: "info", message: "" });
  const [modal, setModal] = useState<ModalState>({ open: false, kind: "info", title: "" });

  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setItems(loadLocal());
  }, []);

  // Auto hide toast
  useEffect(() => {
    if (!toast.open) return;
    const t = setTimeout(() => setToast((p) => ({ ...p, open: false })), 2200);
    return () => clearTimeout(t);
  }, [toast.open]);

  const canUpload = useMemo(() => picked.length > 0 && !isUploading, [picked.length, isUploading]);

  const pickFiles = (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files);

    const MAX_FILES = 6;
    const MAX_EACH_MB = 50;

    const ok = arr
      .slice(0, MAX_FILES)
      .filter((f) => f.size <= MAX_EACH_MB * 1024 * 1024);

    if (ok.length !== arr.slice(0, MAX_FILES).length) {
      setToast({
        open: true,
        kind: "info",
        message: `Giới hạn: tối đa ${MAX_FILES} file, mỗi file ≤ ${MAX_EACH_MB}MB`,
      });
    }

    setPicked(ok);
  };

  const clearPicked = () => {
    setPicked([]);
    if (inputRef.current) inputRef.current.value = "";
  };

  const openUrl = (url: string) => window.open(url, "_blank", "noopener,noreferrer");

  const onCopy = async (text: string) => {
    const ok = await safeCopy(text);
    if (ok) {
      setModal({
        open: true,
        kind: "success",
        title: "Copy thành công",
        message: "Link đã được copy vào clipboard.",
      });
    } else {
      setModal({
        open: true,
        kind: "error",
        title: "Copy thất bại",
        message: "Trình duyệt chặn clipboard. Hãy copy thủ công.",
      });
    }
  };

  const uploadAll = async () => {
    const env = requireEnv();
    if (!env.ok) {
      setModal({ open: true, kind: "error", title: "Thiếu cấu hình", message: env.error });
      return;
    }
    if (!picked.length) {
      setToast({ open: true, kind: "error", message: "Bạn chưa chọn file." });
      return;
    }

    try {
      setIsUploading(true);
      setProgress(0);

      const newItems: UploadedItem[] = [];

      for (let i = 0; i < picked.length; i++) {
        const f = picked[i];
        const safeName = f.name.replace(/[^\w.\-()+ ]+/g, "_");
        const path = `${Date.now()}_${i + 1}_${safeName}`;

        setProgress(0);

        await uploadToSupabaseXHR({
          bucket: BUCKET,
          path,
          file: f,
          onProgress: (pct) => setProgress(pct),
        });

        const url = buildPublicUrl(BUCKET, path);

        newItems.push({
          id: uid("file"),
          name: f.name,
          size: f.size,
          type: f.type || "application/octet-stream",
          path,
          url,
          createdAt: Date.now(),
        });
      }

      const merged = [...newItems, ...items].sort((a, b) => b.createdAt - a.createdAt);
      setItems(merged);
      saveLocal(merged);

      clearPicked();

      setModal({
        open: true,
        kind: "success",
        title: "Upload thành công",
        message: `Đã upload ${newItems.length} file.\nLink tải đã sẵn sàng.`,
      });
    } catch (e: any) {
      setModal({
        open: true,
        kind: "error",
        title: "Upload thất bại",
        message: String(e?.message || e || "Failed to fetch"),
      });
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  const clearHistory = () => {
    setItems([]);
    saveLocal([]);
    setToast({ open: true, kind: "success", message: "Đã xoá lịch sử hiển thị." });
  };

  const removeItemUIOnly = (id: string) => {
    const next = items.filter((x) => x.id !== id);
    setItems(next);
    saveLocal(next);
  };

  const deleteOnSupabaseThenRemove = async (it: UploadedItem) => {
    try {
      setModal({
        open: true,
        kind: "info",
        title: "Đang xoá...",
        message: "Vui lòng đợi.",
      });

      await deleteFromSupabase(BUCKET, it.path);

      removeItemUIOnly(it.id);

      setModal({
        open: true,
        kind: "success",
        title: "Đã xoá",
        message: "File đã được xoá khỏi Supabase (nếu policy cho phép).",
      });
    } catch (e: any) {
      setModal({
        open: true,
        kind: "error",
        title: "Không xoá được",
        message: String(e?.message || e),
      });
    }
  };

  const isImage = (mime: string) => mime.startsWith("image/");

  return (
    <div className="min-h-screen px-4 pt-24 pb-16 max-w-3xl mx-auto">
      {/* Toast + Modal */}
      <AnimatePresence>
        {toast.open && (
          <Toast
            open={toast.open}
            kind={toast.kind}
            message={toast.message}
            onClose={() => setToast((p) => ({ ...p, open: false }))}
          />
        )}
      </AnimatePresence>

      <Modal
        open={modal.open}
        kind={modal.kind}
        title={modal.title}
        message={modal.message}
        onClose={() => setModal((p) => ({ ...p, open: false }))}
      />

      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/70 dark:bg-card/60 game-border hover:scale-[1.02] active:scale-[0.99] transition font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            Về Home
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={clearHistory}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/70 dark:bg-card/60 game-border hover:scale-[1.02] active:scale-[0.99] transition font-bold"
              title="Xoá lịch sử hiển thị"
            >
              <Trash2 className="w-4 h-4" />
              Xoá
            </button>

            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/70 dark:bg-card/60 game-border hover:scale-[1.02] active:scale-[0.99] transition font-bold"
              title="Reload"
            >
              <RefreshCw className="w-4 h-4" />
              Làm mới
            </button>
          </div>
        </div>

        <div className="mb-4">
          <h1 className="text-2xl font-extrabold">Up files & lấy link tải</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Upload file lên <b>Supabase Storage</b> (bucket <b>{BUCKET}</b>) → lấy link public để tải.
          </p>
        </div>

        {/* Upload box */}
        <Card className="game-border bg-white/60 dark:bg-card/60 backdrop-blur-sm">
          <CardContent className="pt-6 space-y-4">
            {/* Info box */}
            <div className="p-4 rounded-3xl bg-white/70 dark:bg-card/60 game-border">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center game-border">
                  <FileUp className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-extrabold">Cách dùng</p>
                  <ul className="mt-1 text-sm text-muted-foreground space-y-1 list-disc pl-4">
                    <li>Chọn tối đa 6 file (≤ 50MB/file) rồi bấm Upload.</li>
                    <li>Upload xong sẽ có link tải public.</li>
                    <li>Nếu “Failed to fetch” → thường do mạng/CORS/ENV sai.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* File input */}
            <div className="space-y-3">
              <input
                ref={inputRef}
                type="file"
                multiple
                className="w-full"
                onChange={(e) => pickFiles(e.target.files)}
              />

              {!!picked.length && (
                <div className="p-4 rounded-3xl bg-white/70 dark:bg-card/60 game-border">
                  <p className="font-extrabold mb-2">File đã chọn ({picked.length})</p>
                  <div className="space-y-2">
                    {picked.map((f, idx) => (
                      <div
                        key={`${f.name}_${idx}`}
                        className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-white/60 game-border"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {isImage(f.type) ? (
                            <ImageIcon className="w-5 h-5 text-primary" />
                          ) : (
                            <FileText className="w-5 h-5 text-primary" />
                          )}
                          <div className="min-w-0">
                            <p className="font-bold break-all line-clamp-1">{f.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatBytes(f.size)} • {f.type || "file"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={clearPicked}
                      className="flex-1 py-3 rounded-2xl bg-white/70 dark:bg-card/60 game-border font-extrabold hover:scale-[1.01] active:scale-[0.99] transition"
                    >
                      Bỏ chọn
                    </button>

                    <button
                      onClick={uploadAll}
                      disabled={!canUpload}
                      className="flex-1 py-3 rounded-2xl bg-primary text-white font-extrabold game-border hover:opacity-95 disabled:opacity-60 transition flex items-center justify-center gap-2"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Đang upload {progress}%
                        </>
                      ) : (
                        <>
                          <FileUp className="w-5 h-5" />
                          Upload
                        </>
                      )}
                    </button>
                  </div>

                  {isUploading && (
                    <div className="mt-3">
                      <div className="h-3 rounded-full bg-black/10 overflow-hidden game-border">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                        />
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Tiến trình: {progress}% (XHR upload)
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* List uploaded */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-extrabold">Lịch sử link đã tạo</h2>
            <p className="text-xs text-muted-foreground">{items.length} mục</p>
          </div>

          {!items.length ? (
            <div className="p-5 rounded-3xl bg-white/60 dark:bg-card/60 game-border text-sm text-muted-foreground">
              Chưa có file nào. Hãy upload để có link tải.
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((it) => (
                <Card key={it.id} className="game-border bg-white/60 dark:bg-card/60">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center game-border">
                        {isImage(it.type) ? (
                          <ImageIcon className="w-6 h-6 text-primary" />
                        ) : (
                          <FileText className="w-6 h-6 text-primary" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-extrabold break-all line-clamp-1">{it.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatBytes(it.size)} • {new Date(it.createdAt).toLocaleString()}
                        </p>

                        <a
                          href={it.url}
                          target="_blank"
                          rel="noreferrer"
                          className="block mt-2 break-all text-primary underline font-semibold"
                        >
                          {it.url}
                        </a>

                        <div className="mt-3 grid grid-cols-3 gap-2">
                          <button
                            onClick={() => onCopy(it.url)}
                            className="py-2 rounded-2xl bg-primary/10 hover:bg-primary/20 font-extrabold transition flex items-center justify-center gap-2"
                          >
                            <Copy className="w-4 h-4" />
                            Copy
                          </button>

                          <button
                            onClick={() => openUrl(it.url)}
                            className="py-2 rounded-2xl bg-white/70 dark:bg-card/60 game-border font-extrabold transition flex items-center justify-center gap-2"
                          >
                            <ExternalLink className="w-4 h-4" />
                            Mở
                          </button>

                          <button
                            onClick={() => deleteOnSupabaseThenRemove(it)}
                            className="py-2 rounded-2xl bg-white/70 dark:bg-card/60 game-border font-extrabold transition flex items-center justify-center gap-2"
                            title="Xoá trên Supabase (cần policy cho phép)"
                          >
                            <Trash2 className="w-4 h-4" />
                            Xoá
                          </button>
                        </div>

                        <p className="mt-2 text-[11px] text-muted-foreground">
                          Nếu nút “Xoá” báo lỗi 401/403: bucket/policy chưa cho xoá bằng anon key
                          (front-end). Bạn vẫn có thể “Xoá lịch sử hiển thị” ở trên.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

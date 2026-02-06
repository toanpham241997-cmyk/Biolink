import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Copy,
  ExternalLink,
  FileUp,
  Trash2,
  Upload,
  Loader2,
  CheckCircle2,
  XCircle,
  Info,
  RefreshCw,
  Download,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

/** =========================
 *  ENV
 *  ========================= */
const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim();
const SUPABASE_ANON_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim();
const BUCKET = ((import.meta.env.VITE_SUPABASE_BUCKET as string | undefined)?.trim() || "upload").trim();

/** =========================
 *  TYPES
 *  ========================= */
type ToastKind = "success" | "error" | "info" | "warning";

type UiModal = {
  open: boolean;
  kind: ToastKind;
  title: string;
  message?: string;
};

type UploadItem = {
  id: string;
  name: string;
  size: number;
  type: string;
  path: string; // path in bucket
  url: string; // public url (with ?download)
  createdAt: number;
};

type UploadJob = {
  id: string;
  file: File;
  progress: number; // 0..100
  status: "idle" | "uploading" | "success" | "error";
  message?: string;
  result?: UploadItem;
};

type StorageListItem = {
  name: string;
  id?: string;
  updated_at?: string;
  created_at?: string;
  metadata?: any;
};

/** =========================
 *  HELPERS
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

function isMissingEnv() {
  return !SUPABASE_URL || !SUPABASE_ANON_KEY || !BUCKET;
}

function publicUrl(bucket: string, path: string) {
  // ép download bằng ?download
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${encodeURIComponent(path).replaceAll("%2F", "/")}?download`;
}

function storageObjectUrl(bucket: string, path: string) {
  // endpoint object (upload/delete)
  return `${SUPABASE_URL}/storage/v1/object/${bucket}/${encodeURIComponent(path).replaceAll("%2F", "/")}`;
}

function storageListUrl(bucket: string) {
  return `${SUPABASE_URL}/storage/v1/object/list/${bucket}`;
}

/** =========================
 *  LOCAL STORAGE (history)
 *  ========================= */
const HISTORY_KEY = "files_upload_history_v1";

function loadHistory(): UploadItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr as UploadItem[];
  } catch {
    return [];
  }
}

function saveHistory(items: UploadItem[]) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(items.slice(0, 50))); // keep 50
  } catch {}
}

/** =========================
 *  MODAL (swal-like, no lib)
 *  ========================= */
function PrettyModal(props: {
  modal: UiModal;
  onClose: () => void;
}) {
  const { modal, onClose } = props;

  const Icon =
    modal.kind === "success"
      ? CheckCircle2
      : modal.kind === "error"
      ? XCircle
      : modal.kind === "warning"
      ? Info
      : Info;

  const iconClass =
    modal.kind === "success"
      ? "text-emerald-500"
      : modal.kind === "error"
      ? "text-rose-500"
      : modal.kind === "warning"
      ? "text-amber-500"
      : "text-sky-500";

  return (
    <AnimatePresence>
      {modal.open && (
        <motion.div
          className="fixed inset-0 z-50 bg-black/45 flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-md rounded-[26px] bg-white/90 dark:bg-card/90 backdrop-blur p-6 shadow-2xl game-border"
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/70 dark:bg-card/70 game-border flex items-center justify-center shadow">
                <Icon className={`w-10 h-10 ${iconClass}`} />
              </div>

              <h3 className="mt-4 text-xl font-extrabold">{modal.title}</h3>

              {modal.message && (
                <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap break-words">
                  {modal.message}
                </p>
              )}

              <button
                onClick={onClose}
                className="mt-5 w-full py-3 rounded-2xl bg-primary text-white font-extrabold game-border hover:opacity-95 active:scale-[0.99] transition"
              >
                OK
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** =========================
 *  REST: Upload with progress (XHR)
 *  ========================= */
function uploadToSupabaseWithProgress(opts: {
  bucket: string;
  path: string;
  file: File;
  onProgress: (pct: number) => void;
}): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      reject(new Error("Thiếu ENV Supabase."));
      return;
    }

    const xhr = new XMLHttpRequest();
    xhr.open("POST", storageObjectUrl(opts.bucket, opts.path), true);

    // IMPORTANT headers
    xhr.setRequestHeader("Authorization", `Bearer ${SUPABASE_ANON_KEY}`);
    xhr.setRequestHeader("apikey", SUPABASE_ANON_KEY);
    xhr.setRequestHeader("x-upsert", "true");
    xhr.setRequestHeader("Content-Type", opts.file.type || "application/octet-stream");

    xhr.upload.onprogress = (e) => {
      if (!e.lengthComputable) return;
      const pct = Math.round((e.loaded / e.total) * 100);
      opts.onProgress(Math.max(0, Math.min(100, pct)));
    };

    xhr.onload = () => {
      // Supabase Storage upload usually returns 200/201
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        // try parse error json
        try {
          const data = JSON.parse(xhr.responseText || "{}");
          reject(new Error(data?.message || data?.error || xhr.responseText || `HTTP ${xhr.status}`));
        } catch {
          reject(new Error(xhr.responseText || `HTTP ${xhr.status}`));
        }
      }
    };

    xhr.onerror = () => reject(new Error("Failed to fetch (mạng/CORS)"));
    xhr.ontimeout = () => reject(new Error("Upload timeout"));

    xhr.send(opts.file);
  });
}

/** =========================
 *  REST: List files
 *  ========================= */
async function listSupabaseFiles(opts: { bucket: string; prefix: string }): Promise<StorageListItem[]> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) throw new Error("Thiếu ENV Supabase.");

  const res = await fetch(storageListUrl(opts.bucket), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({
      prefix: opts.prefix,
      limit: 100,
      offset: 0,
      sortBy: { column: "updated_at", order: "desc" },
    }),
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(json?.message || json?.error || `List failed (HTTP ${res.status})`);
  }

  if (!Array.isArray(json)) return [];
  return json as StorageListItem[];
}

/** =========================
 *  REST: Delete file
 *  ========================= */
async function deleteSupabaseFile(opts: { bucket: string; path: string }): Promise<void> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) throw new Error("Thiếu ENV Supabase.");

  const res = await fetch(storageObjectUrl(opts.bucket, opts.path), {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      apikey: SUPABASE_ANON_KEY,
    },
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(json?.message || json?.error || `Delete failed (HTTP ${res.status})`);
  }
}

/** =========================
 *  PAGE
 *  ========================= */
export default function FilesPage() {
  // UI
  const [modal, setModal] = useState<UiModal>({
    open: false,
    kind: "info",
    title: "",
    message: "",
  });

  const showModal = (kind: ToastKind, title: string, message?: string) => {
    setModal({ open: true, kind, title, message });
  };

  const closeModal = () => setModal((m) => ({ ...m, open: false }));

  // Files
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [pickedFiles, setPickedFiles] = useState<File[]>([]);
  const [jobs, setJobs] = useState<UploadJob[]>([]);
  const [prefix, setPrefix] = useState<string>("public"); // folder in bucket
  const [isListing, setIsListing] = useState(false);
  const [remoteList, setRemoteList] = useState<StorageListItem[]>([]);
  const [history, setHistory] = useState<UploadItem[]>(() => loadHistory());

  const totalPickedSize = useMemo(
    () => pickedFiles.reduce((sum, f) => sum + (f.size || 0), 0),
    [pickedFiles]
  );

  // constraints
  const MAX_FILES = 6;
  const MAX_MB_PER_FILE = 50;

  useEffect(() => {
    saveHistory(history);
  }, [history]);

  const resetAll = () => {
    setPickedFiles([]);
    setJobs([]);
    if (inputRef.current) inputRef.current.value = "";
    showModal("info", "Đã làm mới", "Bạn có thể chọn file và upload lại.");
  };

  const onPickFiles = (files: FileList | null) => {
    if (!files) return;

    const arr = Array.from(files);

    if (arr.length > MAX_FILES) {
      showModal("warning", "Chọn quá nhiều file", `Tối đa ${MAX_FILES} file/lần.`);
      return;
    }

    const tooBig = arr.find((f) => f.size > MAX_MB_PER_FILE * 1024 * 1024);
    if (tooBig) {
      showModal(
        "warning",
        "File quá nặng",
        `File "${tooBig.name}" > ${MAX_MB_PER_FILE}MB. Hãy chọn file nhỏ hơn.`
      );
      return;
    }

    setPickedFiles(arr);

    // create jobs
    const newJobs: UploadJob[] = arr.map((f) => ({
      id: uid("job"),
      file: f,
      progress: 0,
      status: "idle",
    }));
    setJobs(newJobs);
  };

  const buildPath = (file: File) => {
    // path inside bucket
    const safeName = file.name.replaceAll("..", ".").replaceAll("\\", "_").replaceAll("/", "_");
    const stamp = Date.now();
    return `${prefix}/${stamp}_${safeName}`;
  };

  const uploadAll = async () => {
    if (isMissingEnv()) {
      showModal(
        "error",
        "Thiếu ENV Supabase",
        "Bạn cần set:\nVITE_SUPABASE_URL\nVITE_SUPABASE_ANON_KEY\nVITE_SUPABASE_BUCKET"
      );
      return;
    }

    if (!pickedFiles.length) {
      showModal("warning", "Bạn chưa chọn file", "Bấm 'Chọn file' để chọn file trước.");
      return;
    }

    // upload sequential (ổn định trên mobile)
    for (const job of jobs) {
      // skip success
      if (job.status === "success") continue;

      setJobs((prev) =>
        prev.map((j) => (j.id === job.id ? { ...j, status: "uploading", progress: 0 } : j))
      );

      const path = buildPath(job.file);
      const url = publicUrl(BUCKET, path);

      try {
        await uploadToSupabaseWithProgress({
          bucket: BUCKET,
          path,
          file: job.file,
          onProgress: (pct) => {
            setJobs((prev) =>
              prev.map((j) => (j.id === job.id ? { ...j, progress: pct } : j))
            );
          },
        });

        const item: UploadItem = {
          id: uid("file"),
          name: job.file.name,
          size: job.file.size,
          type: job.file.type || "application/octet-stream",
          path,
          url,
          createdAt: Date.now(),
        };

        setJobs((prev) =>
          prev.map((j) =>
            j.id === job.id ? { ...j, status: "success", progress: 100, result: item } : j
          )
        );

        setHistory((prev) => [item, ...prev]);
      } catch (e: any) {
        const msg = String(e?.message || e || "Upload lỗi");

        setJobs((prev) =>
          prev.map((j) =>
            j.id === job.id ? { ...j, status: "error", message: msg } : j
          )
        );

        // Nếu gặp lỗi 401/403 -> thường là policy
        showModal(
          "error",
          "Upload thất bại",
          msg.includes("401") || msg.includes("403")
            ? `${msg}\n\nGợi ý: bucket PUBLIC vẫn cần Policy cho INSERT (upload). Xem phần Policy bên dưới.`
            : msg
        );

        // dừng luôn để bạn xử lý (đỡ spam lỗi)
        return;
      }
    }

    showModal("success", "Upload thành công!", "File đã có link tải public.");
  };

  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showModal("success", "Copy thành công", "Link đã được copy vào clipboard.");
    } catch {
      showModal("warning", "Không copy được", "Trình duyệt chặn clipboard. Bạn hãy copy thủ công.");
    }
  };

  const forceDownload = (url: string) => {
    // ép download (mobile friendly)
    const a = document.createElement("a");
    a.href = url.includes("?download") ? url : `${url}?download`;
    a.download = "";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const refreshRemoteList = async () => {
    if (isMissingEnv()) {
      showModal("error", "Thiếu ENV Supabase", "Bạn chưa set đủ ENV Supabase.");
      return;
    }

    try {
      setIsListing(true);
      const items = await listSupabaseFiles({ bucket: BUCKET, prefix });
      setRemoteList(items);
      showModal("success", "Đã làm mới", `Đã tải danh sách: ${items.length} mục.`);
    } catch (e: any) {
      showModal("error", "Không lấy được danh sách", String(e?.message || e || "List lỗi"));
    } finally {
      setIsListing(false);
    }
  };

  const deleteOne = async (path: string) => {
    if (isMissingEnv()) {
      showModal("error", "Thiếu ENV Supabase", "Bạn chưa set đủ ENV Supabase.");
      return;
    }

    try {
      await deleteSupabaseFile({ bucket: BUCKET, path });
      setHistory((prev) => prev.filter((x) => x.path !== path));
      setJobs((prev) =>
        prev.map((j) =>
          j.result?.path === path ? { ...j, result: undefined, status: "idle", progress: 0 } : j
        )
      );
      showModal("success", "Đã xoá", "File đã được xoá khỏi Storage.");
      // refresh list
      refreshRemoteList();
    } catch (e: any) {
      showModal(
        "error",
        "Xoá thất bại",
        String(e?.message || e || "Delete lỗi") +
          "\n\nGợi ý: cần Policy cho DELETE (nếu muốn xoá bằng client)."
      );
    }
  };

  const clearHistory = () => {
    setHistory([]);
    showModal("info", "Đã xoá lịch sử", "Lịch sử link đã tạo đã được xoá.");
  };

  // auto list once
  useEffect(() => {
    // đừng auto nếu thiếu env
    if (!isMissingEnv()) refreshRemoteList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen px-4 pt-24 pb-16 max-w-2xl mx-auto">
      <PrettyModal modal={modal} onClose={closeModal} />

      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/70 dark:bg-card/60 game-border hover:scale-[1.02] active:scale-[0.99] transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-extrabold">Về Home</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={refreshRemoteList}
              disabled={isListing}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/70 dark:bg-card/60 game-border hover:scale-[1.02] active:scale-[0.99] transition font-extrabold disabled:opacity-60"
            >
              {isListing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Làm mới
            </button>

            <button
              onClick={resetAll}
              className="px-3 py-2 rounded-2xl bg-white/70 dark:bg-card/60 game-border hover:scale-[1.02] active:scale-[0.99] transition font-extrabold"
            >
              Reset
            </button>
          </div>
        </div>

        <h1 className="text-2xl font-extrabold mb-2">Up file & lấy link tải</h1>
        <p className="text-sm text-muted-foreground mb-4">
          <span className="font-bold">Công Cụ Miễn Phí</span> • Bucket:{" "}
          <span className="font-bold">{BUCKET}</span>
        </p>

        <Card className="game-border bg-white/60 dark:bg-card/60 backdrop-blur-sm">
          <CardContent className="pt-6 space-y-4">
            {/* How to */}
            <div className="p-4 rounded-[26px] bg-white/70 dark:bg-card/60 game-border">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center game-border">
                  <Upload className="w-6 h-6 text-primary" />
                </div>

                <div className="space-y-2">
                  <p className="font-extrabold text-lg">Cách dùng</p>
                  <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                    <li>Chọn tối đa <b>{MAX_FILES}</b> file (≤ <b>{MAX_MB_PER_FILE}MB/file</b>) rồi bấm Upload.</li>
                    <li>Upload xong sẽ có <b>link tải public</b> (ép tải bằng <b>?download</b>).</li>
                  
                  </ul>
                </div>
              </div>
            </div>

            {/* ENV warn */}
            {isMissingEnv() && (
              <div className="p-4 rounded-[26px] bg-rose-50 dark:bg-rose-950/20 game-border">
                <p className="font-extrabold text-rose-600 dark:text-rose-400">
                  Thiếu ENV Supabase
                </p>
                <p className="text-sm text-rose-600/90 dark:text-rose-400/90 mt-1 whitespace-pre-wrap">
                  Bạn cần set:
                  {"\n"}- VITE_SUPABASE_URL
                  {"\n"}- VITE_SUPABASE_ANON_KEY (Publishable/anon JWT)
                  {"\n"}- VITE_SUPABASE_BUCKET
                </p>
              </div>
            )}

            {/* Pick files */}
            <div className="space-y-3">
              <input
                ref={inputRef}
                type="file"
                multiple
                className="w-full"
                onChange={(e) => onPickFiles(e.target.files)}
              />

              {pickedFiles.length > 0 && (
                <div className="p-4 rounded-[26px] bg-white/70 dark:bg-card/60 game-border">
                  <p className="font-extrabold">
                    Đã chọn: {pickedFiles.length} file • Tổng dung lượng: {formatBytes(totalPickedSize)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Gợi ý: Upload tuần tự để ổn định trên điện thoại.
                  </p>
                </div>
              )}

              <button
                onClick={uploadAll}
                className="w-full py-4 rounded-[28px] bg-primary text-white font-extrabold shadow-lg hover:opacity-95 active:scale-[0.99] transition flex items-center justify-center gap-2 game-border"
              >
                <FileUp className="w-5 h-5" />
                Upload
              </button>
            </div>

            {/* Jobs */}
            {jobs.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-extrabold text-lg">Tiến trình</p>
                  <p className="text-xs text-muted-foreground">{jobs.length} mục</p>
                </div>

                {jobs.map((j) => {
                  const statusColor =
                    j.status === "success"
                      ? "bg-emerald-500"
                      : j.status === "error"
                      ? "bg-rose-500"
                      : "bg-primary";

                  return (
                    <div key={j.id} className="p-4 rounded-[26px] bg-white/70 dark:bg-card/60 game-border">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-extrabold break-all">{j.file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatBytes(j.file.size)} • {j.file.type || "file"}
                          </p>
                        </div>

                        <div className="shrink-0">
                          {j.status === "uploading" && <Loader2 className="w-5 h-5 animate-spin" />}
                          {j.status === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                          {j.status === "error" && <XCircle className="w-5 h-5 text-rose-500" />}
                        </div>
                      </div>

                      <div className="mt-3">
                        <div className="w-full h-3 rounded-full bg-black/10 overflow-hidden">
                          <div
                            className={`h-full ${statusColor}`}
                            style={{ width: `${j.progress}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-muted-foreground">
                            {j.status === "error" ? "Lỗi" : "Progress"}: <b>{j.progress}%</b>
                          </p>
                          {j.status === "error" && (
                            <p className="text-xs text-rose-600 dark:text-rose-400 break-words max-w-[65%] text-right">
                              {j.message}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Result actions */}
                      {j.result?.url && (
                        <div className="mt-3 p-3 rounded-2xl bg-white/70 dark:bg-card/60 game-border space-y-2">
                          <p className="font-extrabold">Link tải (public)</p>

                          <a
                            href={j.result.url}
                            className="text-primary underline break-all font-bold"
                            target="_blank"
                            rel="noreferrer"
                          >
                            {j.result.url}
                          </a>

                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => copyText(j.result!.url)}
                              className="py-3 rounded-2xl bg-primary/10 hover:bg-primary/20 font-extrabold transition flex items-center justify-center gap-2"
                            >
                              <Copy className="w-4 h-4" />
                              Copy
                            </button>

                            <button
                              onClick={() => forceDownload(j.result!.url)}
                              className="py-3 rounded-2xl bg-primary text-white hover:opacity-95 font-extrabold transition flex items-center justify-center gap-2 game-border"
                            >
                              <Download className="w-4 h-4" />
                              Tải về
                            </button>
                          </div>

                          <button
                            onClick={() => deleteOne(j.result!.path)}
                            className="w-full py-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-extrabold transition flex items-center justify-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            Xoá file
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Remote list */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-extrabold text-lg">Files Của Bạn</p>
                <p className="text-xs text-muted-foreground">{remoteList.length} mục</p>
              </div>

              {remoteList.length === 0 ? (
                <div className="p-4 rounded-[26px] bg-white/70 dark:bg-card/60 game-border text-sm text-muted-foreground">
                  Chưa có file nào. Hãy upload để tạo link tải.
                </div>
              ) : (
                <div className="space-y-2">
                  {remoteList.map((it, idx) => {
                    const path = `${prefix}/${it.name}`;
                    const url = publicUrl(BUCKET, path);

                    return (
                      <div key={`${it.name}_${idx}`} className="p-4 rounded-[26px] bg-white/70 dark:bg-card/60 game-border">
                        <p className="font-extrabold break-all">{it.name}</p>

                        <div className="mt-3 grid grid-cols-3 gap-2">
                          <button
                            onClick={() => copyText(url)}
                            className="py-3 rounded-2xl bg-primary/10 hover:bg-primary/20 font-extrabold transition flex items-center justify-center gap-2"
                          >
                            <Copy className="w-4 h-4" />
                            Copy
                          </button>

                          <button
                            onClick={() => forceDownload(url)}
                            className="py-3 rounded-2xl bg-primary text-white hover:opacity-95 font-extrabold transition flex items-center justify-center gap-2 game-border"
                          >
                            <Download className="w-4 h-4" />
                            Tải
                          </button>

                          <button
                            onClick={() => deleteOne(path)}
                            className="py-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-extrabold transition flex items-center justify-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            Xoá
                          </button>
                        </div>

                        <a
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-3 inline-flex items-center gap-2 text-primary underline break-all font-bold"
                        >
                          <ExternalLink className="w-4 h-4" />
                          {url}
                        </a>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* History */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-extrabold text-lg">Lịch sử link đã tạo</p>
                <button
                  onClick={clearHistory}
                  className="text-xs font-extrabold px-3 py-2 rounded-2xl bg-white/70 dark:bg-card/60 game-border hover:scale-[1.02] active:scale-[0.99] transition"
                >
                  Xoá lịch sử
                </button>
              </div>

              {history.length === 0 ? (
                <div className="p-4 rounded-[26px] bg-white/70 dark:bg-card/60 game-border text-sm text-muted-foreground">
                  Chưa có file nào. Hãy upload để có link tải.
                </div>
              ) : (
                <div className="space-y-2">
                  {history.slice(0, 12).map((h) => (
                    <div key={h.id} className="p-4 rounded-[26px] bg-white/70 dark:bg-card/60 game-border">
                      <p className="font-extrabold break-all">{h.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatBytes(h.size)} • {new Date(h.createdAt).toLocaleString()}
                      </p>

                      <a
                        href={h.url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 block text-primary underline break-all font-bold"
                      >
                        {h.url}
                      </a>

                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <button
                          onClick={() => copyText(h.url)}
                          className="py-3 rounded-2xl bg-primary/10 hover:bg-primary/20 font-extrabold transition flex items-center justify-center gap-2"
                        >
                          <Copy className="w-4 h-4" />
                          Copy
                        </button>

                        <button
                          onClick={() => forceDownload(h.url)}
                          className="py-3 rounded-2xl bg-primary text-white hover:opacity-95 font-extrabold transition flex items-center justify-center gap-2 game-border"
                        >
                          <Download className="w-4 h-4" />
                          Tải về
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Policy note */}
            <div className="p-4 rounded-[26px] bg-amber-50 dark:bg-amber-950/20 game-border">
              <p className="font-extrabold text-amber-700 dark:text-amber-300">Nếu bạn bị lỗi hãy liên hệ với chúng tôi</p>
              <p className="text-sm text-amber-700/90 dark:text-amber-300/90 mt-2 whitespace-pre-wrap">
                Bucket PUBLIC vẫn cần Policy để client (anon) được phép upload.
                {"\n\n"}Hãy Chỉ Liên Hệ Khi Đã Thực Sự lỗi "{BUCKET}".
                {"\n\n"}Ví dụ Policy (chọn INSERT/SELECT/DELETE nếu cần):
                {"\n"}- Ấn Vào Icon Zalo (home)
                {"\n"}- Ấn Vào Icon Facebook (home)
                {"\n"}- Ấn Vào Icon Telegram (home)
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

import { useMemo, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import { ArrowLeft, Copy, FileUp, Link2, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type UploadResult = {
  link: string;
  name: string;
  size: number;
};

function formatBytes(bytes: number) {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(i ? 1 : 0)} ${sizes[i]}`;
}

export default function FilesPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState("");

  const previewName = useMemo(() => file?.name ?? "", [file]);
  const previewSize = useMemo(() => (file ? formatBytes(file.size) : ""), [file]);

  const toast = Swal.mixin({
    toast: true,
    position: "top",
    showConfirmButton: false,
    timer: 2200,
    timerProgressBar: true,
  });

  const uploadFile = async () => {
    setError("");
    setResult(null);

    if (!file) {
      toast.fire({ icon: "warning", title: "Bạn chưa chọn file" });
      return;
    }

    try {
      setIsUploading(true);

      // Upload lên file.io
      const form = new FormData();
      form.append("file", file);

      const res = await fetch("https://file.io", {
        method: "POST",
        body: form,
      });

      const json = await res.json().catch(() => null);

      if (!res.ok || !json?.link) {
        throw new Error(json?.message || "Upload thất bại. Hãy thử lại.");
      }

      setResult({
        link: String(json.link),
        name: file.name,
        size: file.size,
      });

      toast.fire({ icon: "success", title: "Upload thành công!" });
    } catch (e: any) {
      const msg = e?.message || "Upload lỗi";
      setError(msg);

      Swal.fire({
        icon: "error",
        title: "Upload thất bại",
        text: msg,
        confirmButtonText: "OK",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const copyLink = async () => {
    if (!result?.link) return;
    try {
      await navigator.clipboard.writeText(result.link);
      toast.fire({ icon: "success", title: "Đã copy link!" });
    } catch {
      Swal.fire({
        icon: "warning",
        title: "Không copy được",
        text: "Trình duyệt chặn clipboard. Bạn hãy copy thủ công.",
      });
    }
  };

  const resetAll = () => {
    setFile(null);
    setResult(null);
    setError("");
    toast.fire({ icon: "info", title: "Đã làm mới" });
  };

  return (
    <div className="min-h-screen px-4 pt-24 pb-16 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/70 dark:bg-card/60 game-border hover:scale-[1.02] active:scale-[0.99] transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-semibold">Về Home</span>
          </Link>

          <button
            onClick={resetAll}
            className="px-3 py-2 rounded-xl bg-white/70 dark:bg-card/60 game-border hover:scale-[1.02] active:scale-[0.99] transition font-semibold"
          >
            Làm mới
          </button>
        </div>

        <h1 className="text-xl font-bold mb-3">Up file & lấy link tải</h1>

        <Card className="game-border bg-white/60 dark:bg-card/60 backdrop-blur-sm">
          <CardContent className="pt-6 space-y-4">
            {/* 안내 */}
            <div className="p-4 rounded-2xl bg-white/70 dark:bg-card/60 game-border">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center game-border">
                  <FileUp className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-bold">Cách dùng</p>
                  <p className="text-sm text-muted-foreground">
                    Chọn file → Upload → Copy link để tải. (Host demo: file.io)
                  </p>
                </div>
              </div>
            </div>

            {/* Pick file */}
            <div className="space-y-2">
              <input
                type="file"
                className="w-full"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />

              {file && (
                <div className="p-4 rounded-2xl bg-white/70 dark:bg-card/60 game-border">
                  <p className="font-bold break-all">{previewName}</p>
                  <p className="text-sm text-muted-foreground">Dung lượng: {previewSize}</p>
                </div>
              )}

              <button
                onClick={uploadFile}
                disabled={isUploading}
                className="w-full p-3 rounded-2xl bg-primary text-white font-bold shadow hover:opacity-95 disabled:opacity-60 transition flex items-center justify-center gap-2"
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

              {!!error && <p className="text-sm text-destructive font-semibold">{error}</p>}
            </div>

            {/* Result */}
            {result?.link && (
              <div className="p-4 rounded-2xl bg-white/70 dark:bg-card/60 game-border space-y-3">
                <div className="flex items-center gap-2">
                  <Link2 className="w-5 h-5 text-primary" />
                  <p className="font-bold">Link tải:</p>
                </div>

                <a
                  href={result.link}
                  target="_blank"
                  rel="noreferrer"
                  className="break-all text-primary underline font-semibold"
                >
                  {result.link}
                </a>

                <button
                  onClick={copyLink}
                  className="w-full p-3 rounded-2xl bg-primary/10 hover:bg-primary/20 font-bold transition flex items-center justify-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copy link
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

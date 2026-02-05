import { useMemo, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Copy, Image as ImageIcon, Loader2, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const IMGBB_KEY = import.meta.env.VITE_IMGBB_API_KEY as string | undefined;

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [error, setError] = useState<string>("");

  const previewUrl = useMemo(() => {
    if (!file) return "";
    return URL.createObjectURL(file);
  }, [file]);

  const uploadToImgBB = async () => {
    setError("");
    setImageUrl("");

    if (!IMGBB_KEY) {
      setError("Thiếu VITE_IMGBB_API_KEY. Bạn cần thêm API key ImgBB vào Environment.");
      return;
    }
    if (!file) {
      setError("Bạn chưa chọn ảnh.");
      return;
    }

    try {
      setIsUploading(true);

      const form = new FormData();
      form.append("image", file);

      const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`, {
        method: "POST",
        body: form,
      });

      const json = await res.json();

      if (!res.ok || !json?.data?.url) {
        throw new Error(json?.error?.message || "Upload failed");
      }

      setImageUrl(json.data.url as string);
    } catch (e: any) {
      setError(e?.message || "Upload lỗi");
    } finally {
      setIsUploading(false);
    }
  };

  const copyLink = async () => {
    if (!imageUrl) return;
    await navigator.clipboard.writeText(imageUrl);
    // nếu bạn có toast thì gọi toast ở đây
    alert("Đã copy link!");
  };

  return (
    <div className="min-h-screen px-4 pt-24 pb-16 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/70 dark:bg-card/60 game-border hover:scale-[1.02] active:scale-[0.99] transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-semibold">Về Home</span>
          </Link>

          <h1 className="text-xl font-bold">Upload ảnh & lấy link</h1>
        </div>

        <Card className="game-border bg-white/60 dark:bg-card/60 backdrop-blur-sm">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <ImageIcon className="w-5 h-5" />
              <p className="text-sm">
                Chọn ảnh → Upload → Copy link. (Host: ImgBB)
              </p>
            </div>

            <div className="space-y-3">
              <input
                type="file"
                accept="image/*"
                className="w-full"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />

              {previewUrl && (
                <div className="rounded-2xl overflow-hidden game-border bg-white/70">
                  <img src={previewUrl} alt="preview" className="w-full max-h-[360px] object-contain" />
                </div>
              )}

              <button
                onClick={uploadToImgBB}
                disabled={isUploading}
                className="w-full p-3 rounded-2xl bg-primary text-white font-bold shadow hover:opacity-95 disabled:opacity-60 transition flex items-center justify-center gap-2"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Đang upload...
                  </>
                ) : (
                  "Upload ảnh"
                )}
              </button>

              {!!error && (
                <p className="text-sm text-destructive font-semibold">{error}</p>
              )}

              {imageUrl && (
                <div className="p-4 rounded-2xl bg-white/70 dark:bg-card/60 game-border space-y-3">
                  <p className="font-bold">Link ảnh:</p>
                  <a
                    href={imageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="break-all text-primary underline"
                  >
                    {imageUrl}
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
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
  }

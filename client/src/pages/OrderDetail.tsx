import { Link, useRoute } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Download, Copy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ORDERS } from "@/pages/Orders";

function normalizeUrl(url: string) {
  const u = (url || "").trim();
  if (!u) return "";
  return /^https?:\/\//i.test(u) ? u : `https://${u}`;
}

// ✅ mở link chắc chắn (popup bị chặn vẫn chuyển trang)
function openLinkSafe(url: string) {
  const finalUrl = normalizeUrl(url);
  if (!finalUrl) return;

  const w = window.open(finalUrl, "_blank", "noopener,noreferrer");
  if (!w) window.location.href = finalUrl;
}

async function safeCopy(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export default function OrderDetailPage() {
  const [, params] = useRoute("/orders/:id");
  const id = params?.id || "";
  const item = ORDERS.find((x) => x.id === id);

  if (!item) {
    return (
      <div className="min-h-screen px-4 pt-24 pb-16 max-w-3xl mx-auto">
        <Link
          href="/orders"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/70 dark:bg-card/60 game-border"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-bold">Về danh sách</span>
        </Link>

        <div className="mt-6 p-5 rounded-3xl game-border bg-white/70 dark:bg-card/60">
          <p className="font-extrabold text-xl">Không tìm thấy đơn hàng</p>
          <p className="text-sm text-muted-foreground mt-2">
            ID: <b>{id}</b>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 pt-24 pb-16 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <Link
          href="/orders"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/70 dark:bg-card/60 game-border hover:scale-[1.02] active:scale-[0.99] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-bold">Về danh sách</span>
        </Link>

        <button
          onClick={() => openLinkSafe(item.downloadUrl)}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-primary text-white game-border font-extrabold shadow hover:opacity-95 active:scale-[0.99] transition"
        >
          <Download className="w-5 h-5" />
          Nhận ngay
        </button>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="game-border bg-white/70 dark:bg-card/60 backdrop-blur-sm overflow-hidden rounded-[28px]">
          <CardContent className="p-0">
            {/* Banner */}
            <div className="relative">
              <div className="aspect-[16/9] w-full overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Ribbon vàng chói */}
              <div className="absolute top-4 left-[-60px] rotate-[-35deg]">
                <div
                  className="px-16 py-2 text-[12px] font-extrabold tracking-wide text-black shadow-2xl"
                  style={{
                    background:
                      "linear-gradient(90deg,#FFD700,#FFB000,#FFD700)",
                    borderRadius: 999,
                    border: "2px solid rgba(0,0,0,0.14)",
                    textShadow: "0 1px 0 rgba(255,255,255,0.35)",
                  }}
                >
                  FREE DOWNLOAD
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-5 space-y-3">
              <h1 className="text-2xl font-extrabold">{item.title}</h1>

              <div className="text-sm text-muted-foreground">
                <p>
                  ID: <b>#{item.id}</b>
                </p>
              </div>

              {/* Giá */}
              <div className="flex items-end gap-2">
                <p className="text-primary font-extrabold text-2xl leading-none">
                  0₫
                </p>
                <p className="text-sm text-muted-foreground line-through">
                  250.000₫
                </p>
                <span className="ml-auto px-3 py-1 rounded-full text-[12px] font-extrabold bg-primary/15 text-primary game-border">
                  100% OFF
                </span>
              </div>

              {/* Nội dung */}
              <div className="p-4 rounded-[26px] game-border bg-white/80 dark:bg-card/60">
                <p className="font-extrabold mb-2">Mô tả đơn hàng</p>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {item.detail}
                </p>

                {/* Link hiển thị (để bạn kiểm tra đúng link) */}
                <div className="mt-3 p-3 rounded-2xl bg-white/70 dark:bg-card/60 game-border">
                  <p className="text-xs text-muted-foreground font-bold mb-1">
                    Link nhận riêng:
                  </p>
                  <p className="text-xs break-all">
                    {normalizeUrl(item.downloadUrl)}
                  </p>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    onClick={async () => {
                      const ok = await safeCopy(normalizeUrl(item.downloadUrl));
                      alert(ok ? "Đã copy link!" : "Copy thất bại (trình duyệt chặn).");
                    }}
                    className="w-full min-h-[48px] inline-flex items-center justify-center gap-2 px-3 py-3 rounded-2xl bg-white/70 dark:bg-card/60 game-border font-extrabold hover:scale-[1.01] active:scale-[0.99] transition"
                  >
                    <Copy className="w-4 h-4" />
                    Copy link
                  </button>

                  <button
                    onClick={() => openLinkSafe(item.downloadUrl)}
                    className="w-full min-h-[48px] inline-flex items-center justify-center gap-2 px-3 py-3 rounded-2xl bg-primary text-white game-border font-extrabold shadow hover:opacity-95 active:scale-[0.99] transition"
                  >
                    <Download className="w-4 h-4" />
                    Nhận ngay
                  </button>
                </div>

                <p className="mt-3 text-xs text-muted-foreground">
                  Nếu điện thoại chặn popup, nút “Nhận ngay” sẽ tự chuyển trang thay vì mở tab mới.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

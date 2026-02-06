import { Link, useRoute } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Download, Copy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ORDERS } from "@/pages/Orders";

function openLink(url: string) {
  if (!url) return;
  window.open(url, "_blank", "noopener,noreferrer");
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
          onClick={() => openLink(item.downloadUrl)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-primary text-white game-border font-extrabold shadow hover:opacity-95 active:scale-[0.99] transition"
        >
          <Download className="w-4 h-4" />
          Nhận ngay
        </button>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="game-border bg-white/70 dark:bg-card/60 backdrop-blur-sm overflow-hidden">
          <CardContent className="p-0">
            {/* Banner ảnh */}
            <div className="relative">
              <div className="aspect-[16/9] w-full overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Tem cong */}
              <div className="absolute top-3 left-3">
                <div
                  className="px-3 py-1 text-[11px] font-extrabold text-white rounded-full shadow-lg bg-primary/90"
                  style={{ transform: "rotate(-10deg)" }}
                >
                  FREE DOWNLOAD
                </div>
              </div>
            </div>

            {/* Nội dung */}
            <div className="p-5 space-y-3">
              <h1 className="text-2xl font-extrabold">{item.title}</h1>

              <div className="text-sm text-muted-foreground">
                <p>
                  ID: <b>#{item.id}</b>
                </p>
                {item.meta && <p>{item.meta}</p>}
              </div>

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

              <div className="p-4 rounded-3xl game-border bg-white/80 dark:bg-card/60">
                <p className="font-bold mb-2">Mô tả đơn hàng</p>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {item.desc}
                  {"\n\n"}• Link tải riêng: {item.downloadUrl}
                  {"\n"}• Nhấn “Nhận ngay” để mở trang tải trong tab mới.
                </p>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    onClick={async () => {
                      const ok = await safeCopy(item.downloadUrl);
                      if (!ok) alert("Copy thất bại (trình duyệt chặn).");
                      else alert("Đã copy link tải!");
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 px-3 py-3 rounded-2xl bg-white/70 dark:bg-card/60 game-border font-extrabold hover:scale-[1.01] active:scale-[0.99] transition"
                  >
                    <Copy className="w-4 h-4" />
                    Copy link
                  </button>

                  <button
                    onClick={() => openLink(item.downloadUrl)}
                    className="w-full inline-flex items-center justify-center gap-2 px-3 py-3 rounded-2xl bg-primary text-white game-border font-extrabold shadow hover:opacity-95 active:scale-[0.99] transition"
                  >
                    <Download className="w-4 h-4" />
                    Nhận ngay
                  </button>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                Tip: Bạn chỉ cần đổi <b>downloadUrl</b> trong mảng <b>ORDERS</b> là mỗi đơn có link riêng.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

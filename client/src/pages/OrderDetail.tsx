import { Link, useRoute } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Download } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ORDERS } from "@/pages/Orders";

function openLink(url: string) {
  if (!url) return;
  if (url.startsWith("/")) {
    window.location.href = url;
  } else {
    window.open(url, "_blank", "noopener,noreferrer");
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
          onClick={() => openLink(item.claimUrl)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-primary text-white game-border font-extrabold shadow hover:opacity-95 active:scale-[0.99] transition"
        >
          <Download className="w-4 h-4" />
          Nhận ngay
        </button>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="game-border bg-white/60 dark:bg-card/60 backdrop-blur-sm overflow-hidden">
          <CardContent className="p-0">
            <div className="aspect-[16/9] w-full overflow-hidden">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-5 space-y-3">
              <h1 className="text-2xl font-extrabold">{item.detailTitle || item.title}</h1>
              <p className="text-sm text-muted-foreground">{item.desc}</p>

              <div className="p-4 rounded-3xl game-border bg-white/70 dark:bg-card/60">
                <p className="font-bold mb-2">Nội dung:</p>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {item.detailText || "Chưa có mô tả chi tiết. Bạn có thể bổ sung trong mảng ORDERS."}
                </p>

                {!!item.guide?.length && (
                  <div className="mt-4">
                    <p className="font-bold mb-2">Hướng dẫn nhanh:</p>
                    <ul className="list-disc pl-5 text-sm space-y-1">
                      {item.guide.map((g, i) => (
                        <li key={i}>{g}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="text-xs text-muted-foreground">
                Tip: Bạn có thể thay link “Nhận ngay” thành link tải/nhận tài nguyên của bạn.
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
                                      }

import { useMemo, useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Eye, Gift, ExternalLink, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type OrderItem = {
  id: string;
  title: string;
  desc: string;
  image: string;
  link: string;
  reward?: string;
  tags?: string[];
};

function openLink(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
}

export default function OrdersPage() {
  const orders: OrderItem[] = useMemo(
    () => [
      {
        id: "OD-001",
        title: "Bio UI Kit",
        desc: "UI bio phong cách game-like + animation.",
        image:
          "https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&w=1200&q=80",
        link: "https://render.com/",
        reward: "Free pack",
        tags: ["React", "UI"],
      },
      {
        id: "OD-002",
        title: "Icon Pack",
        desc: "Icon đẹp cho menu & header.",
        image:
          "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80",
        link: "https://lucide.dev/",
        reward: "Free",
        tags: ["Icon"],
      },
      {
        id: "OD-003",
        title: "Landing Sections",
        desc: "Section sẵn, responsive.",
        image:
          "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?auto=format&fit=crop&w=1200&q=80",
        link: "https://tailwindcss.com/",
        reward: "Free",
        tags: ["Tailwind"],
      },
      {
        id: "OD-004",
        title: "Motion FX",
        desc: "Hiệu ứng mượt, dễ gắn vào UI.",
        image:
          "https://images.unsplash.com/photo-1527482797697-8795b05a13fe?auto=format&fit=crop&w=1200&q=80",
        link: "https://www.framer.com/motion/",
        reward: "Free download",
        tags: ["Motion"],
      },
      {
        id: "OD-005",
        title: "shadcn UI",
        desc: "Component UI chuẩn, đẹp.",
        image:
          "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
        link: "https://ui.shadcn.com/",
        reward: "Free",
        tags: ["UI"],
      },
      {
        id: "OD-006",
        title: "Button FX",
        desc: "Hover/active + border game.",
        image:
          "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80",
        link: "https://developer.mozilla.org/",
        reward: "Free",
        tags: ["CSS"],
      },
      {
        id: "OD-007",
        title: "Upload ảnh",
        desc: "Trang upload ảnh lấy link nhanh.",
        image:
          "https://images.unsplash.com/photo-1487611459768-bd414656ea10?auto=format&fit=crop&w=1200&q=80",
        link: "https://imgbb.com/",
        reward: "Free",
        tags: ["Upload"],
      },
      {
        id: "OD-008",
        title: "Chat UI",
        desc: "Giao diện chat đẹp + animation.",
        image:
          "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80",
        link: "https://react.dev/",
        reward: "Free download",
        tags: ["React"],
      },
      {
        id: "OD-009",
        title: "Deploy Tips",
        desc: "Tool deploy & hosting free.",
        image:
          "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80",
        link: "https://render.com/",
        reward: "Free",
        tags: ["Deploy"],
      },
      {
        id: "OD-010",
        title: "Theme Toggle",
        desc: "Light/Dark toggle đẹp.",
        image:
          "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80",
        link: "https://github.com/",
        reward: "Free",
        tags: ["Theme"],
      },
      {
        id: "OD-011",
        title: "Accordion",
        desc: "Accordion mượt, gọn.",
        image:
          "https://images.unsplash.com/photo-1508780709619-79562169bc64?auto=format&fit=crop&w=1200&q=80",
        link: "https://ui.shadcn.com/docs/components/accordion",
        reward: "Free",
        tags: ["UI"],
      },
      {
        id: "OD-012",
        title: "Free Tools List",
        desc: "Danh sách tool free.",
        image:
          "https://images.unsplash.com/photo-1454165205744-3b78555e5572?auto=format&fit=crop&w=1200&q=80",
        link: "https://render.com/",
        reward: "Free download",
        tags: ["Tools"],
      },
    ],
    [],
  );

  const [selected, setSelected] = useState<OrderItem | null>(null);

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 py-4 flex justify-between items-center backdrop-blur-sm bg-white/10 border-b border-white/20">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/70 dark:bg-card/60 game-border hover:scale-[1.02] active:scale-[0.99] transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-semibold">Về Home</span>
          </Link>

          <div className="leading-tight">
            <p className="font-bold">Coder free</p>
            <p className="text-xs text-muted-foreground">
              12 đơn hàng • Free Download
            </p>
          </div>
        </div>
      </header>

      {/* Grid orders */}
      <div className="pt-24 pb-16 px-4 sm:px-6 max-w-5xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {orders.map((o, idx) => (
            <motion.div
              key={o.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(idx * 0.03, 0.25) }}
            >
              <Card className="game-border bg-white/60 dark:bg-card/60 backdrop-blur-sm overflow-hidden">
                <CardContent className="p-0">
                  {/* image + tem */}
                  <div className="relative">
                    <img
                      src={o.image}
                      alt={o.title}
                      className="w-full h-28 sm:h-32 object-cover"
                    />

                    {/* Tem FREE DOWNLOAD */}
                    <div className="absolute top-2 left-2 px-2 py-1 rounded-xl bg-primary text-white text-[10px] font-extrabold shadow game-border">
                      FREE DOWNLOAD
                    </div>

                    {/* reward */}
                    {!!o.reward && (
                      <div className="absolute bottom-2 right-2 px-2 py-1 rounded-xl bg-white/80 dark:bg-card/70 text-[10px] font-bold game-border">
                        {o.reward}
                      </div>
                    )}
                  </div>

                  <div className="p-3 space-y-2">
                    <div>
                      <p className="font-bold text-sm line-clamp-1">
                        {o.title}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {o.desc}
                      </p>
                    </div>

                    {!!o.tags?.length && (
                      <div className="flex flex-wrap gap-1">
                        {o.tags.slice(0, 3).map((t) => (
                          <span
                            key={t}
                            className="text-[10px] px-2 py-1 rounded-xl bg-primary/10 game-border font-semibold"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => setSelected(o)}
                        className="px-3 py-2 rounded-2xl bg-white/70 dark:bg-card/60 game-border text-xs font-bold hover:scale-[1.02] active:scale-[0.99] transition flex items-center justify-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        Chi tiết
                      </button>

                      <button
                        onClick={() => openLink(o.link)}
                        className="px-3 py-2 rounded-2xl bg-primary text-white game-border text-xs font-extrabold hover:opacity-95 active:scale-[0.99] transition flex items-center justify-center gap-2"
                      >
                        <Gift className="w-4 h-4" />
                        Nhận ngay
                      </button>
                    </div>

                    <button
                      onClick={() => openLink(o.link)}
                      className="w-full mt-1 px-3 py-2 rounded-2xl bg-primary/10 hover:bg-primary/20 game-border text-xs font-bold transition flex items-center justify-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Mở link
                    </button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Modal chi tiết */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/40 z-[60]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelected(null)}
            />
            <motion.div
              className="fixed z-[70] left-1/2 top-1/2 w-[92vw] max-w-xl -translate-x-1/2 -translate-y-1/2"
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 220, damping: 24 }}
            >
              <Card className="game-border bg-white/80 dark:bg-card/80 backdrop-blur-sm overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative">
                    <img
                      src={selected.image}
                      alt={selected.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-2xl bg-primary text-white text-xs font-extrabold shadow game-border">
                      FREE DOWNLOAD
                    </div>
                    <button
                      onClick={() => setSelected(null)}
                      className="absolute top-3 right-3 w-10 h-10 rounded-2xl bg-white/80 dark:bg-card/70 game-border flex items-center justify-center hover:scale-[1.02] active:scale-[0.99] transition"
                      title="Đóng"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="p-5 space-y-3">
                    <div>
                      <p className="text-lg font-extrabold">{selected.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {selected.desc}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs px-3 py-2 rounded-2xl bg-primary/10 game-border font-bold">
                        Mã: {selected.id}
                      </span>
                      {selected.reward && (
                        <span className="text-xs px-3 py-2 rounded-2xl bg-white/70 dark:bg-card/60 game-border font-bold">
                          Quà: {selected.reward}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => openLink(selected.link)}
                        className="px-4 py-3 rounded-2xl bg-primary text-white game-border font-extrabold hover:opacity-95 active:scale-[0.99] transition flex items-center justify-center gap-2"
                      >
                        <Gift className="w-5 h-5" />
                        Nhận ngay
                      </button>
                      <button
                        onClick={() => openLink(selected.link)}
                        className="px-4 py-3 rounded-2xl bg-white/70 dark:bg-card/60 game-border font-bold hover:scale-[1.02] active:scale-[0.99] transition flex items-center justify-center gap-2"
                      >
                        <ExternalLink className="w-5 h-5" />
                        Mở link
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
        }

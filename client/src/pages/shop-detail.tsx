import { useMemo, useState } from "react";
import { useLocation, useRoute, Link } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Star,
  ShieldCheck,
  ShoppingCart,
  BadgeCheck,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type ParentOrder = {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  thumb: string;
};

type ChildOrder = {
  id: string;
  parentId: string;
  title: string;
  sub: string;
  price: string;
  stock: number;
  rating: number;
  badge: string; // "VIP", "REG", "FLASH",...
  thumb: string;
};

function cn(...cls: (string | false | undefined | null)[]) {
  return cls.filter(Boolean).join(" ");
}

export default function ShopDetailPage() {
  const [, navigate] = useLocation();
  const [, params] = useRoute("/shop/:id");
  const parentId = params?.id || "";

  const parents: ParentOrder[] = useMemo(
    () => [
      {
        id: "p1",
        title: "Kho Nick Liên Quân",
        subtitle: "Nhiều loại nick • giao dịch nhanh",
        tag: "HOT",
        thumb:
          "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1400&auto=format&fit=crop",
      },
      {
        id: "p2",
        title: "Acc Free Fire",
        subtitle: "Nick VIP • giá rẻ • uy tín",
        tag: "SALE",
        thumb:
          "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=1400&auto=format&fit=crop",
      },
      {
        id: "p3",
        title: "Acc Roblox / Grow a Garden",
        subtitle: "Acc ngon • nhiều lựa chọn",
        tag: "NEW",
        thumb:
          "https://images.unsplash.com/photo-1535223289827-42f1e9919769?q=80&w=1400&auto=format&fit=crop",
      },
      {
        id: "p4",
        title: "Acc Liên Minh / TFT",
        subtitle: "Rank cao • skin xịn",
        tag: "HOT",
        thumb:
          "https://images.unsplash.com/photo-1511882150382-421056c89033?q=80&w=1400&auto=format&fit=crop",
      },
      {
        id: "p5",
        title: "Dịch vụ Shop",
        subtitle: "Cày thuê • nạp hộ • hỗ trợ nhanh",
        tag: "PRO",
        thumb:
          "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1400&auto=format&fit=crop",
      },
    ],
    []
  );

  // 5 đơn con mỗi parent (demo)
  const childs: ChildOrder[] = useMemo(() => {
    const mk = (pid: string, idx: number): ChildOrder => {
      const badges = ["VIP", "REG", "FLASH", "INFO", "BEST"];
      const prices = ["29.000đ", "39.000đ", "49.000đ", "79.000đ", "99.000đ"];
      const thumbs = [
        "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1553877522-43269d4ea984?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop",
      ];
      return {
        id: `${pid}-c${idx}`,
        parentId: pid,
        title: `Đơn hàng ${idx} • ${badges[idx - 1]}`,
        sub: "Mô tả ngắn: random skin/đồ/level tuỳ gói",
        price: prices[idx - 1],
        stock: 100 + idx * 7,
        rating: 4.0 + (idx % 2) * 0.5,
        badge: badges[idx - 1],
        thumb: thumbs[idx - 1],
      };
    };

    const all: ChildOrder[] = [];
    for (const p of ["p1", "p2", "p3", "p4", "p5"]) {
      for (let i = 1; i <= 5; i++) all.push(mk(p, i));
    }
    return all;
  }, []);

  const parent = parents.find((p) => p.id === parentId);
  const list = childs.filter((c) => c.parentId === parentId);

  const [tab, setTab] = useState<"detail" | "child">("child");

  if (!parent) {
    return (
      <div className="min-h-screen px-4 pt-24 pb-16 max-w-3xl mx-auto">
        <Card className="game-border bg-white/70 dark:bg-card/60">
          <CardContent className="pt-6 space-y-4">
            <p className="font-extrabold text-lg">Không tìm thấy đơn hàng</p>
            <button
              onClick={() => navigate("/shop")}
              className="w-full py-3 rounded-2xl bg-primary text-white font-extrabold"
            >
              Quay lại shop
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky header */}
      <div className="sticky top-0 z-40 bg-white/70 dark:bg-card/60 backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate("/shop")}
              className="px-3 py-2 rounded-2xl bg-white/70 dark:bg-card/60 game-border font-bold flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Về shop
            </button>

            <div className="text-right leading-tight">
              <p className="font-extrabold text-sm uppercase">{parent.tag}</p>
              <p className="text-xs text-muted-foreground">Tab chi tiết & mua nhanh</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              onClick={() => setTab("child")}
              className={cn(
                "py-3 rounded-2xl game-border font-extrabold text-sm transition",
                tab === "child"
                  ? "bg-primary text-white shadow"
                  : "bg-white/70 dark:bg-card/60 hover:bg-primary/10"
              )}
            >
              5 đơn hàng con
            </button>
            <button
              onClick={() => setTab("detail")}
              className={cn(
                "py-3 rounded-2xl game-border font-extrabold text-sm transition",
                tab === "detail"
                  ? "bg-primary text-white shadow"
                  : "bg-white/70 dark:bg-card/60 hover:bg-primary/10"
              )}
            >
              Mô tả / bảo hành
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-4 pb-16">
        {/* Parent hero */}
        <div className="rounded-3xl overflow-hidden game-border bg-white/60 dark:bg-card/60">
          <div className="relative h-[210px]">
            <img src={parent.thumb} alt={parent.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />

            <div className="absolute left-4 right-4 bottom-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-extrabold text-lg drop-shadow">
                    {parent.title}
                  </p>
                  <p className="text-white/90 text-sm drop-shadow">{parent.subtitle}</p>
                </div>
                <div className="px-3 py-1 rounded-full bg-white/80 text-[11px] font-extrabold game-border">
                  {parent.tag}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab content */}
        {tab === "detail" ? (
          <div className="mt-4 space-y-3">
            <Card className="game-border bg-white/70 dark:bg-card/60">
              <CardContent className="pt-5 space-y-3">
                <p className="font-extrabold">Mô tả</p>
                <p className="text-sm text-muted-foreground">
                  Đây là trang chi tiết của đơn hàng cha. Bạn có thể đặt nội dung thật:
                  mô tả gói, điều kiện, cách nhận tài khoản, v.v...
                </p>

                <div className="p-4 rounded-2xl bg-primary/10 game-border">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-extrabold">Bảo hành</p>
                      <p className="text-sm text-muted-foreground">
                        Hỗ trợ đổi nếu lỗi đăng nhập theo quy định (demo).
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {/* 5 child cards */}
            {list.map((c, idx) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="rounded-3xl overflow-hidden bg-white/70 dark:bg-card/60 game-border shadow-sm"
              >
                <div className="flex gap-3 p-3">
                  {/* thumb */}
                  <div className="relative w-[110px] h-[92px] rounded-2xl overflow-hidden game-border shrink-0">
                    <img src={c.thumb} alt={c.title} className="w-full h-full object-cover" />
                    <div className="absolute top-2 left-2">
                      <div
                        className={cn(
                          "px-2 py-1 rounded-full text-[10px] font-extrabold shadow",
                          c.badge === "VIP" && "bg-yellow-300 text-black",
                          c.badge === "REG" && "bg-white/85 text-black game-border",
                          c.badge === "FLASH" && "bg-red-500 text-white",
                          c.badge === "INFO" && "bg-sky-500 text-white",
                          c.badge === "BEST" && "bg-emerald-500 text-white"
                        )}
                      >
                        {c.badge}
                      </div>
                    </div>
                  </div>

                  {/* content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-extrabold text-sm line-clamp-1">{c.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{c.sub}</p>
                      </div>

                      <div className="text-right">
                        <p className="font-extrabold text-primary">{c.price}</p>
                        <p className="text-[11px] text-muted-foreground">Còn {c.stock}</p>
                      </div>
                    </div>

                    {/* rating + actions */}
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="font-bold text-foreground">{c.rating.toFixed(1)}</span>
                        <span>•</span>
                        <BadgeCheck className="w-4 h-4 text-primary" />
                        <span>Uy tín</span>
                      </div>

                      <button
                        onClick={() => alert(`Mua ngay: ${c.title} (demo)`)}
                        className="px-4 py-2 rounded-2xl bg-primary text-white font-extrabold text-sm shadow hover:opacity-95 active:scale-[0.99] transition inline-flex items-center gap-2"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Mua ngay
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            <div className="rounded-3xl bg-primary/10 game-border p-4">
              <p className="font-extrabold">Gợi ý</p>
              <p className="text-sm text-muted-foreground mt-1">
                Bạn có thể đổi dữ liệu 5 đơn con theo đúng sản phẩm thật (giá, ảnh, tồn kho).
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
        }

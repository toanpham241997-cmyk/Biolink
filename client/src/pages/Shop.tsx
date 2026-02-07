import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import {
  Menu,
  X,
  Search,
  LogIn,
  UserPlus,
  ArrowRight,
  ShieldCheck,
  Flame,
  Sparkles,
  LogOut,
  Wallet,
  BadgeCheck,
  User2,
} from "lucide-react";
import { parents } from "./shop.data";

type ParentItem = {
  id: string;
  title: string;
  subtitle: string;
  cover: string;
  tag?: string;
};

type AuthUser = {
  name: string;
  email: string;
  role?: "member" | "vip";
  balance?: number; // VND
  status?: "active" | "locked";
  avatar?: string; // url
};

function cn(...cls: (string | false | undefined | null)[]) {
  return cls.filter(Boolean).join(" ");
}

function formatMoneyVND(v?: number) {
  const n = typeof v === "number" ? v : 0;
  try {
    return n.toLocaleString("vi-VN") + "₫";
  } catch {
    return `${n}₫`;
  }
}

const AUTH_KEY = "hvh_user";

function readAuthUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    const u = JSON.parse(raw) as AuthUser;
    if (!u?.email) return null;
    return {
      name: u.name || u.email.split("@")[0],
      email: u.email,
      role: u.role ?? "member",
      balance: typeof u.balance === "number" ? u.balance : 0,
      status: u.status ?? "active",
      avatar: u.avatar,
    };
  } catch {
    return null;
  }
}

function writeAuthUser(u: AuthUser | null) {
  if (!u) localStorage.removeItem(AUTH_KEY);
  else localStorage.setItem(AUTH_KEY, JSON.stringify(u));
}

export default function Shop() {
  const [, navigate] = useLocation();

  const [q, setQ] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setUser(readAuthUser());

    const onStorage = (e: StorageEvent) => {
      if (e.key === AUTH_KEY) setUser(readAuthUser());
    };
    window.addEventListener("storage", onStorage);

    // Nếu auth page cùng tab -> ta poll nhẹ (đỡ trường hợp không trigger storage)
    const t = window.setInterval(() => setUser(readAuthUser()), 800);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.clearInterval(t);
    };
  }, []);

  const filtered = useMemo(() => {
    const k = q.trim().toLowerCase();
    const list = parents as ParentItem[];
    if (!k) return list;
    return list.filter((p) =>
      (p.title + " " + p.subtitle).toLowerCase().includes(k)
    );
  }, [q]);

  const goAuth = (mode: "login" | "register") => {
    // bạn có thể đọc query này bên Auth.tsx để hiển thị đúng tab
    navigate(`/auth?mode=${mode}`);
  };

  const logout = () => {
    writeAuthUser(null);
    setUser(null);
    setMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#eaf6ff]">
      {/* ===== HEADER (compact) ===== */}
      <div className="sticky top-0 z-40">
        <div className="px-3 pt-3 pb-2">
          <div className="max-w-3xl mx-auto">
            <div className="rounded-[22px] bg-white/80 backdrop-blur-md border-[2px] border-sky-400 shadow-[0_10px_26px_rgba(2,132,199,0.16)]">
              {/* Row 1: menu + brand + actions */}
              <div className="px-3 py-3 flex items-center gap-2">
                {/* Menu */}
                <button
                  onClick={() => setMenuOpen(true)}
                  className="w-10 h-10 rounded-2xl bg-white border-2 border-sky-300 shadow-sm flex items-center justify-center active:scale-[0.98] transition"
                  aria-label="Menu"
                >
                  <Menu className="w-5 h-5 text-sky-700" />
                </button>

                {/* Brand */}
                <div className="flex-1 min-w-0 leading-tight">
                  <p className="font-extrabold text-[14px] tracking-wide truncate">
                    SHOP DEV HVH
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">
                    Shop dữ liệu & tài nguyên dev
                  </p>
                </div>

                {/* Actions */}
                {!user ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => goAuth("login")}
                      className="h-10 px-3 rounded-2xl bg-sky-50 text-sky-800 font-extrabold text-[12px] border-2 border-sky-200 active:scale-[0.98] transition inline-flex items-center gap-2"
                    >
                      <LogIn className="w-4 h-4" />
                      Đăng nhập
                    </button>

                    <button
                      onClick={() => goAuth("register")}
                      className="h-10 px-3 rounded-2xl bg-sky-500 text-white font-extrabold text-[12px] border-2 border-sky-600 shadow active:scale-[0.98] transition inline-flex items-center gap-2"
                    >
                      <UserPlus className="w-4 h-4" />
                      Đăng ký
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setMenuOpen(true)}
                    className="h-10 px-2 pr-3 rounded-2xl bg-white border-2 border-sky-200 shadow-sm active:scale-[0.99] transition inline-flex items-center gap-2"
                    title="Tài khoản"
                  >
                    <div className="w-8 h-8 rounded-full bg-sky-100 border-2 border-sky-200 flex items-center justify-center overflow-hidden">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          className="w-full h-full object-cover"
                          alt="avatar"
                        />
                      ) : (
                        <User2 className="w-4 h-4 text-sky-700" />
                      )}
                    </div>
                    <div className="text-left leading-tight">
                      <p className="font-extrabold text-[12px] max-w-[120px] truncate">
                        {user.name}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {user.role ?? "member"}
                      </p>
                    </div>
                  </button>
                )}
              </div>

              {/* Row 2: search (small) */}
              <div className="px-3 pb-3">
                <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border-2 border-sky-200 shadow-sm">
                  <Search className="w-5 h-5 text-slate-400" />
                  <input
                    className="w-full bg-transparent outline-none text-[13px]"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Tìm đơn hàng..."
                  />
                  {!!q && (
                    <button
                      onClick={() => setQ("")}
                      className="px-3 py-1 rounded-xl bg-sky-50 border border-sky-200 font-extrabold text-[11px] text-sky-800"
                    >
                      Xoá
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== SLIDE MENU ===== */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
            />
            <motion.aside
              className="fixed left-0 top-0 bottom-0 z-50 w-[86%] max-w-sm bg-white border-r-[2px] border-sky-300 rounded-r-[26px] p-4 shadow-[0_22px_55px_rgba(2,132,199,0.22)]"
              initial={{ x: -420 }}
              animate={{ x: 0 }}
              exit={{ x: -420 }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-11 h-11 rounded-2xl bg-sky-50 border-2 border-sky-200 flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6 text-sky-700" />
                  </div>
                  <div>
                    <p className="font-extrabold">Menu</p>
                    <p className="text-xs text-slate-500">Điều hướng nhanh</p>
                  </div>
                </div>

                <button
                  onClick={() => setMenuOpen(false)}
                  className="w-11 h-11 rounded-2xl bg-white border-2 border-sky-200 flex items-center justify-center"
                  aria-label="Close"
                >
                  <X className="w-6 h-6 text-sky-700" />
                </button>
              </div>

              {/* Account card */}
              <div className="mt-4 rounded-[22px] bg-sky-50 border-2 border-sky-200 p-4">
                {!user ? (
                  <>
                    <p className="font-extrabold text-slate-900">Chưa đăng nhập</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Đăng nhập để xem số dư & trạng thái.
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          goAuth("login");
                        }}
                        className="h-11 rounded-2xl bg-white border-2 border-sky-200 font-extrabold text-[12px] text-sky-800 inline-flex items-center justify-center gap-2"
                      >
                        <LogIn className="w-4 h-4" /> Đăng nhập
                      </button>
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          goAuth("register");
                        }}
                        className="h-11 rounded-2xl bg-sky-500 border-2 border-sky-600 text-white font-extrabold text-[12px] inline-flex items-center justify-center gap-2 shadow"
                      >
                        <UserPlus className="w-4 h-4" /> Đăng ký
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-white border-2 border-sky-200 overflow-hidden flex items-center justify-center">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            className="w-full h-full object-cover"
                            alt="avatar"
                          />
                        ) : (
                          <User2 className="w-5 h-5 text-sky-700" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-extrabold truncate">{user.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <div className="rounded-2xl bg-white border-2 border-sky-200 p-3">
                        <p className="text-[11px] text-slate-500 font-bold flex items-center gap-2">
                          <Wallet className="w-4 h-4 text-sky-700" />
                          Số dư
                        </p>
                        <p className="font-extrabold text-sky-800 mt-1">
                          {formatMoneyVND(user.balance)}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-white border-2 border-sky-200 p-3">
                        <p className="text-[11px] text-slate-500 font-bold flex items-center gap-2">
                          <BadgeCheck className="w-4 h-4 text-sky-700" />
                          Tài khoản
                        </p>
                        <p className="font-extrabold text-slate-800 mt-1">
                          {user.role ?? "member"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-2 rounded-2xl bg-white border-2 border-sky-200 p-3">
                      <p className="text-[11px] text-slate-500 font-bold">Trạng thái</p>
                      <p className="font-extrabold text-slate-800 mt-1">
                        {user.status === "locked" ? "Bị khoá" : "Hoạt động"}
                      </p>
                    </div>

                    <button
                      onClick={logout}
                      className="mt-3 w-full h-11 rounded-2xl bg-white border-2 border-sky-200 font-extrabold text-[12px] text-red-600 inline-flex items-center justify-center gap-2 active:scale-[0.99] transition"
                    >
                      <LogOut className="w-4 h-4" />
                      Đăng xuất
                    </button>
                  </>
                )}
              </div>

              {/* Menu buttons */}
              <div className="mt-4 space-y-2">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="w-full text-left p-4 rounded-2xl bg-white border-2 border-sky-200 font-extrabold active:scale-[0.99] transition"
                >
                  Lên đầu trang
                  <p className="text-xs text-slate-500 font-normal mt-1">Header + search</p>
                </button>

                <button
                  onClick={() => {
                    setMenuOpen(false);
                    const el = document.getElementById("orders");
                    el?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className="w-full text-left p-4 rounded-2xl bg-white border-2 border-sky-200 font-extrabold active:scale-[0.99] transition"
                >
                  Danh sách đơn hàng
                  <p className="text-xs text-slate-500 font-normal mt-1">
                    Bấm để xem đơn hàng cha
                  </p>
                </button>

                <button
                  onClick={() => alert("Liên hệ (demo)")}
                  className="w-full text-left p-4 rounded-2xl bg-white border-2 border-sky-200 font-extrabold active:scale-[0.99] transition"
                >
                  Liên hệ / hỗ trợ
                  <p className="text-xs text-slate-500 font-normal mt-1">Zalo / FB</p>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ===== INTRO ===== */}
      <div className="max-w-3xl mx-auto px-3 pt-3">
        <div className="rounded-[26px] bg-white border-2 border-sky-300 shadow-[0_16px_34px_rgba(2,132,199,0.14)] p-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 border-2 border-sky-200 flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-sky-700" />
            </div>
            <div className="flex-1">
              <p className="font-extrabold text-[16px] text-slate-900">Giới thiệu</p>
              <p className="text-[13px] text-slate-600 mt-1">
                Đây là trang shop demo. Bấm vào <b>đơn hàng cha</b> để xem danh sách{" "}
                <b>đơn hàng con</b>. (Trang con nằm ở <b>/shop/p/:parentId</b>)
              </p>

              <div className="mt-3 rounded-[22px] bg-sky-50 border-2 border-sky-200 p-4">
                <ul className="space-y-2 text-[13px] text-slate-700">
                  <li>✅ Giao diện gọn, dễ bấm trên điện thoại.</li>
                  <li>✅ Có tìm kiếm nhanh theo tên/mô tả.</li>
                  <li>✅ Có menu + trạng thái tài khoản.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== ORDERS (PARENTS) ===== */}
      <div id="orders" className="max-w-3xl mx-auto px-3 pt-5 pb-10">
        <div className="flex items-center justify-between px-1">
          <p className="font-extrabold text-[15px] text-slate-900">Đơn hàng cha</p>
          <p className="text-[12px] text-slate-500">{filtered.length} mục</p>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-4">
          {filtered.map((p) => (
            <button
              key={p.id}
              onClick={() => navigate(`/shop/p/${p.id}`)}
              className="text-left rounded-[26px] overflow-hidden bg-white border-2 border-sky-300 shadow-[0_14px_30px_rgba(2,132,199,0.14)] active:scale-[0.995] transition"
            >
              <div className="relative">
                <img src={p.cover} className="w-full h-[180px] object-cover" alt={p.title} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                {p.tag && (
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 rounded-full bg-white/90 border border-white font-extrabold text-[11px]">
                      {p.tag}
                    </span>
                  </div>
                )}

                <div className="absolute bottom-3 left-4 right-4">
                  <p className="text-white font-extrabold text-[18px] drop-shadow">
                    {p.title}
                  </p>
                  <p className="text-white/90 text-[13px] drop-shadow">{p.subtitle}</p>
                </div>
              </div>

              <div className="p-4 flex items-center justify-between gap-3">
                <div className="text-slate-600 text-[13px]">
                  Bấm để mở đơn con (demo)
                </div>

                <div className="px-4 py-2 rounded-2xl bg-sky-500 text-white font-extrabold text-[13px] border-2 border-sky-600 shadow inline-flex items-center gap-2">
                  Xem đơn <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Contact / footer */}
        <div className="mt-6 rounded-[26px] bg-white border-2 border-sky-300 p-4 shadow-[0_14px_30px_rgba(2,132,199,0.12)]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-sky-50 border-2 border-sky-200 flex items-center justify-center">
              <Flame className="w-6 h-6 text-sky-700" />
            </div>
            <div>
              <p className="font-extrabold">Liên hệ</p>
              <p className="text-[13px] text-slate-600">
                Zalo/FB: (bạn thay link) • Hỗ trợ nhanh • Uy tín
              </p>
            </div>
          </div>
        </div>

        {/* Tiny bottom note */}
        <div className="mt-4 text-center text-[11px] text-slate-500">
          © {new Date().getFullYear()} SHOP DEV HVH • Demo UI
        </div>
      </div>
    </div>
  );
}

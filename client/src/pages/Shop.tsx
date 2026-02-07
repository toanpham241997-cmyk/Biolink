import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import {
  Menu,
  X,
  Search,
  LogIn,
  UserPlus,
  ShieldCheck,
  Flame,
  ArrowRight,
  LogOut,
  UserCircle2,
} from "lucide-react";
import ModalSwal, { SwalKind } from "../components/ModalSwal";
import { supabase } from "../lib/supabaseClient";
import { parents as parentsData } from "./shop.data";

function cn(...cls: (string | false | undefined | null)[]) {
  return cls.filter(Boolean).join(" ");
}

type Profile = {
  id: string;
  email: string | null;
  name: string | null;
  avatar: string | null;
  role: string | null;
  status: string | null;
  balance: number | null; // bigint -> trả về number (tùy client), hoặc string nếu bạn dùng typed
};

function formatVND(n: number) {
  try {
    return n.toLocaleString("vi-VN") + "₫";
  } catch {
    return `${n}₫`;
  }
}

export default function Shop() {
  const [, navigate] = useLocation();

  // ===== auth state =====
  const [loadingSession, setLoadingSession] = useState(true);
  const [sessionUserId, setSessionUserId] = useState<string | null>(null);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // ===== ui state =====
  const [q, setQ] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  // swal notify
  const [swal, setSwal] = useState<{
    open: boolean;
    variant: SwalKind;
    title: string;
    message?: string;
  }>({ open: false, variant: "info", title: "" });

  const openSwal = (variant: SwalKind, title: string, message?: string) =>
    setSwal({ open: true, variant, title, message });

  // ===== DATA SAFE =====
  const parents = Array.isArray(parentsData) ? parentsData : [];

  const filtered = useMemo(() => {
    const k = q.trim().toLowerCase();
    if (!k) return parents;
    return parents.filter((p: any) =>
      `${p?.title || ""} ${p?.subtitle || ""}`.toLowerCase().includes(k)
    );
  }, [q, parents]);

  // ===== load session + listen =====
  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      const uid = data.session?.user?.id ?? null;
      setSessionUserId(uid);
      setLoadingSession(false);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      const uid = sess?.user?.id ?? null;
      setSessionUserId(uid);
      if (!uid) setProfile(null);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // ===== load profile when logged in =====
  useEffect(() => {
    if (!sessionUserId) return;

    let mounted = true;
    setLoadingProfile(true);

    (async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id,email,name,avatar,role,status,balance")
        .eq("id", sessionUserId)
        .maybeSingle();

      if (!mounted) return;

      if (error) {
        setProfile(null);
      } else {
        // balance có thể là string nếu là bigint, normalize:
        const balRaw: any = (data as any)?.balance ?? 0;
        const balNum =
          typeof balRaw === "string" ? Number(balRaw) : Number(balRaw || 0);

        setProfile({
          id: data?.id,
          email: data?.email ?? null,
          name: data?.name ?? null,
          avatar: data?.avatar ?? null,
          role: data?.role ?? "member",
          status: data?.status ?? "active",
          balance: Number.isFinite(balNum) ? balNum : 0,
        });
      }
      setLoadingProfile(false);
    })();

    return () => {
      mounted = false;
    };
  }, [sessionUserId]);

  const isLoggedIn = !!sessionUserId;

  const logout = async () => {
    await supabase.auth.signOut();
    setMenuOpen(false);
    openSwal("success", "Đã đăng xuất", "Bạn đã thoát tài khoản.");
  };

  const goLogin = () => navigate("/auth?mode=login");
  const goRegister = () => navigate("/auth?mode=register");

  // ===== FIX lỗi "Không tìm thấy đơn hàng" =====
  // nguyên nhân thường gặp: id rỗng/undefined → navigate sai.
  // ở đây mình chặn: nếu parent không có id → không navigate.
  const openParent = (p: any) => {
    const id = String(p?.id || "");
    if (!id) {
      openSwal(
        "error",
        "Dữ liệu shop.data lỗi",
        "Parent id bị rỗng. Hãy kiểm tra parents[] trong shop.data.ts có field id không."
      );
      return;
    }
    navigate(`/shop/p/${id}`);
  };

  return (
    <div className="min-h-screen bg-[#eaf6ff]">
      {/* HEADER (gọn, không tụt) */}
      <div className="sticky top-0 z-40 px-3 pt-3">
        <div className="max-w-3xl mx-auto">
          <div className="rounded-[28px] bg-white/90 backdrop-blur-md border-[3px] border-sky-500 shadow-[0_10px_30px_rgba(2,132,199,0.18)] p-3">
            <div className="flex items-center gap-2">
              {/* menu */}
              <button
                onClick={() => setMenuOpen(true)}
                className="w-11 h-11 shrink-0 rounded-2xl bg-white border-[3px] border-sky-400 shadow-sm flex items-center justify-center active:scale-[0.98] transition"
                aria-label="Menu"
              >
                <Menu className="w-6 h-6 text-sky-600" />
              </button>

              {/* brand */}
              <div className="min-w-0 flex-1 leading-tight">
                <p className="font-extrabold text-[14px] tracking-wide truncate">
                  SHOP DEV HVH
                </p>
                <p className="text-[12px] text-slate-500 truncate">
                  Shop dữ liệu & tài nguyên dev
                </p>
              </div>

              {/* auth / profile (FIX: không bao giờ hiện "..." sai) */}
              {!loadingSession && !isLoggedIn && (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={goLogin}
                    className="px-3 py-2 rounded-2xl bg-sky-100 text-sky-800 font-extrabold text-[13px] border-2 border-sky-300 active:scale-[0.98] transition inline-flex items-center gap-2"
                  >
                    <LogIn className="w-4 h-4" />
                    <span className="hidden sm:inline">Đăng nhập</span>
                    <span className="sm:hidden">ĐN</span>
                  </button>
                  <button
                    onClick={goRegister}
                    className="px-3 py-2 rounded-2xl bg-sky-500 text-white font-extrabold text-[13px] border-2 border-sky-600 shadow active:scale-[0.98] transition inline-flex items-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span className="hidden sm:inline">Đăng ký</span>
                    <span className="sm:hidden">ĐK</span>
                  </button>
                </div>
              )}

              {!loadingSession && isLoggedIn && (
                <button
                  onClick={() => setMenuOpen(true)}
                  className="shrink-0 px-3 py-2 rounded-2xl bg-white border-2 border-sky-300 shadow-sm inline-flex items-center gap-2 active:scale-[0.99] transition"
                  aria-label="Tài khoản"
                >
                  {profile?.avatar ? (
                    <img
                      src={profile.avatar}
                      className="w-8 h-8 rounded-full object-cover border-2 border-sky-200"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-sky-100 border-2 border-sky-200 flex items-center justify-center">
                      <UserCircle2 className="w-5 h-5 text-sky-700" />
                    </div>
                  )}
                  <div className="text-left leading-tight">
                    <p className="font-extrabold text-[12px] max-w-[90px] truncate">
                      {profile?.name || "Tài khoản"}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {formatVND(profile?.balance ?? 0)}
                    </p>
                  </div>
                </button>
              )}
            </div>

            {/* Search */}
            <div className="mt-3">
              <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white border-2 border-sky-200 shadow-sm">
                <Search className="w-5 h-5 text-slate-400" />
                <input
                  className="w-full bg-transparent outline-none text-[14px]"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Tìm đơn hàng..."
                />
                {q && (
                  <button
                    onClick={() => setQ("")}
                    className="px-3 py-1 rounded-xl bg-sky-100 border border-sky-200 font-bold text-[12px]"
                  >
                    Xoá
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SLIDE MENU */}
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
              className="fixed left-0 top-0 bottom-0 z-50 w-[85%] max-w-sm bg-white border-r-[3px] border-sky-400 rounded-r-[30px] p-4 shadow-[0_20px_50px_rgba(2,132,199,0.25)]"
              initial={{ x: -420 }}
              animate={{ x: 0 }}
              exit={{ x: -420 }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-11 h-11 rounded-2xl bg-sky-100 border-2 border-sky-300 flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6 text-sky-600" />
                  </div>
                  <div>
                    <p className="font-extrabold">Menu</p>
                    <p className="text-xs text-slate-500">Điều hướng nhanh</p>
                  </div>
                </div>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="w-11 h-11 rounded-2xl bg-white border-2 border-sky-300 flex items-center justify-center"
                >
                  <X className="w-6 h-6 text-sky-600" />
                </button>
              </div>

              {/* user card */}
              <div className="mt-4 rounded-[26px] bg-sky-50 border-[3px] border-sky-200 p-4">
                {!isLoggedIn ? (
                  <div>
                    <p className="font-extrabold text-slate-800">Chưa đăng nhập</p>
                    <p className="text-[12px] text-slate-600 mt-1">
                      Đăng nhập để mua hàng và kiểm tra số dư.
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button
                        onClick={goLogin}
                        className="h-11 rounded-2xl bg-white border-2 border-sky-300 font-extrabold text-sky-700"
                      >
                        Đăng nhập
                      </button>
                      <button
                        onClick={goRegister}
                        className="h-11 rounded-2xl bg-sky-500 border-2 border-sky-600 text-white font-extrabold shadow"
                      >
                        Đăng ký
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-3">
                      {profile?.avatar ? (
                        <img
                          src={profile.avatar}
                          className="w-12 h-12 rounded-2xl object-cover border-2 border-sky-200"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-2xl bg-white border-2 border-sky-200 flex items-center justify-center">
                          <UserCircle2 className="w-7 h-7 text-sky-700" />
                        </div>
                      )}

                      <div className="min-w-0">
                        <p className="font-extrabold truncate">
                          {profile?.name || "Tài khoản"}
                        </p>
                        <p className="text-[12px] text-slate-500 truncate">
                          {profile?.email || ""}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-[12px]">
                      <div className="rounded-2xl bg-white border-2 border-sky-200 p-3">
                        <p className="text-slate-500 font-bold">Số dư</p>
                        <p className="font-extrabold text-sky-700">
                          {formatVND(profile?.balance ?? 0)}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-white border-2 border-sky-200 p-3">
                        <p className="text-slate-500 font-bold">Tài khoản</p>
                        <p className="font-extrabold">
                          {profile?.role || "member"}
                        </p>
                        <p className="text-slate-500 mt-1">
                          Trạng thái: {profile?.status || "active"}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={logout}
                      className="mt-3 w-full h-11 rounded-2xl bg-rose-50 border-2 border-rose-200 font-extrabold text-rose-700 inline-flex items-center justify-center gap-2"
                    >
                      <LogOut className="w-4 h-4" /> Đăng xuất
                    </button>
                  </div>
                )}
              </div>

              {/* actions */}
              <div className="mt-4 space-y-2">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="w-full text-left p-4 rounded-2xl bg-white border-2 border-sky-200 font-bold active:scale-[0.99] transition"
                >
                  Lên đầu trang
                  <p className="text-xs text-slate-500 font-normal mt-1">
                    Header + search
                  </p>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* INTRO (KHÔNG CÓ NÚT TEST DEMO NỮA) */}
      <div className="max-w-3xl mx-auto px-3 pt-4">
        <div className="rounded-[30px] bg-white border-[3px] border-sky-400 shadow-[0_18px_40px_rgba(2,132,199,0.18)] p-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 border-2 border-sky-300 flex items-center justify-center">
              <Flame className="w-7 h-7 text-sky-600" />
            </div>
            <div className="flex-1">
              <p className="font-extrabold text-[18px]">Giới thiệu</p>
              <p className="text-[14px] text-slate-600 mt-1">
                Bấm vào <b>đơn hàng cha</b> để mở danh sách <b>đơn hàng con</b>.
                Trong đơn hàng con có nút <b>Mua ngay</b> + nhập <b>mã giảm giá</b>.
              </p>

              <div className="mt-4 rounded-[26px] bg-sky-50 border-[3px] border-sky-300 p-4 shadow-sm">
                <ul className="space-y-2 text-[14px] text-slate-700">
                  <li>✅ Giao diện gọn, bấm dễ trên điện thoại.</li>
                  <li>✅ Mua hàng kiểm tra số dư + coupon qua server.</li>
                  <li>✅ Không đủ số dư sẽ không mua được.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ORDERS (CHA) */}
      <div id="orders" className="max-w-3xl mx-auto px-3 pt-5 pb-10">
        <div className="flex items-center justify-between px-1">
          <p className="font-extrabold text-[16px] text-slate-900">Đơn hàng cha</p>
          <p className="text-[12px] text-slate-500">{filtered.length} mục</p>
        </div>

        {/* nếu parents rỗng -> báo rõ */}
        {parents.length === 0 ? (
          <div className="mt-4 rounded-[30px] bg-white border-[3px] border-rose-300 p-4 shadow">
            <p className="font-extrabold text-rose-700">Không có dữ liệu shop.data</p>
            <p className="text-[13px] text-slate-600 mt-2">
              Kiểm tra <b>shop.data.ts</b> có export <b>parents</b> là mảng không.
              Ví dụ: <code className="font-bold">export const parents = [...]</code>
            </p>
          </div>
        ) : (
          <div className="mt-3 grid grid-cols-1 gap-4">
            {filtered.map((p: any) => (
              <button
                key={String(p?.id || Math.random())}
                onClick={() => openParent(p)}
                className="text-left rounded-[30px] overflow-hidden bg-white border-[3px] border-sky-400 shadow-[0_16px_35px_rgba(2,132,199,0.16)] active:scale-[0.995] transition"
              >
                <div className="relative">
                  <img
                    src={p.cover}
                    className="w-full h-[190px] object-cover"
                    alt={p.title}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 rounded-full bg-white/90 border-2 border-white font-extrabold text-[12px]">
                      {p.tag}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-4 right-4">
                    <p className="text-white font-extrabold text-[18px] drop-shadow">
                      {p.title}
                    </p>
                    <p className="text-white/90 text-[13px] drop-shadow">
                      {p.subtitle}
                    </p>
                  </div>
                </div>

                <div className="p-4 flex items-center justify-between gap-3">
                  <div className="text-slate-600 text-[13px]">
                    Bấm để mở đơn con
                  </div>
                  <div className="px-4 py-2 rounded-2xl bg-sky-500 text-white font-extrabold text-[13px] border-2 border-sky-600 shadow inline-flex items-center gap-2">
                    Xem đơn <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <ModalSwal
        open={swal.open}
        variant={swal.variant}
        title={swal.title}
        message={swal.message}
        onClose={() => setSwal((s) => ({ ...s, open: false }))}
      />
    </div>
  );
                   }

import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import {
  ArrowLeft,
  UserCircle2,
  Wallet,
  Shield,
  Mail,
  BadgeCheck,
  Save,
  LogOut,
  KeyRound,
  Link as LinkIcon,
  Loader2,
} from "lucide-react";
import ModalSwal, { SwalKind } from "../components/ModalSwal";
import { supabase } from "../lib/supabaseClient";

function cn(...cls: (string | false | undefined | null)[]) {
  return cls.filter(Boolean).join(" ");
}
function formatVND(n: number) {
  try {
    return n.toLocaleString("vi-VN") + "₫";
  } catch {
    return `${n}₫`;
  }
}

type Profile = {
  id: string;
  email: string | null;
  name: string | null;
  avatar: string | null;
  role: string | null;
  status: string | null;
  balance: number | null;
};

export default function AccountPage() {
  const [, navigate] = useLocation();

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [profile, setProfile] = useState<Profile | null>(null);

  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");

  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");

  const [swal, setSwal] = useState<{
    open: boolean;
    variant: SwalKind;
    title: string;
    message?: string;
  }>({ open: false, variant: "info", title: "" });

  const openSwal = (variant: SwalKind, title: string, message?: string) =>
    setSwal({ open: true, variant, title, message });

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.auth.getSession();
    const uid = data.session?.user?.id ?? null;

    if (!uid) {
      setLoading(false);
      openSwal("warning", "Chưa đăng nhập", "Vui lòng đăng nhập để xem tài khoản.");
      setTimeout(() => navigate("/auth?mode=login"), 500);
      return;
    }

    const { data: p, error } = await supabase
      .from("profiles")
      .select("id,email,name,avatar,role,status,balance")
      .eq("id", uid)
      .single();

    if (error || !p) {
      setProfile(null);
      setLoading(false);
      openSwal("error", "Không tải được tài khoản", error?.message || "profiles không tồn tại.");
      return;
    }

    const prof = p as Profile;
    setProfile(prof);
    setName(prof.name ?? "");
    setAvatar(prof.avatar ?? "");
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const canSave = useMemo(() => {
    if (!profile) return false;
    const nChanged = (name ?? "") !== (profile.name ?? "");
    const aChanged = (avatar ?? "") !== (profile.avatar ?? "");
    return nChanged || aChanged;
  }, [profile, name, avatar]);

  const saveProfile = async () => {
    if (!profile) return;
    setBusy(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          name: name.trim() || null,
          avatar: avatar.trim() || null,
        })
        .eq("id", profile.id);

      if (error) {
        openSwal("error", "Lưu thất bại", error.message);
        return;
      }

      await load();
      openSwal("success", "Đã lưu", "Thông tin tài khoản đã được cập nhật.");
    } finally {
      setBusy(false);
    }
  };

  const changePassword = async () => {
    if (!pw1 || pw1.length < 6) {
      return openSwal("warning", "Mật khẩu quá ngắn", "Mật khẩu tối thiểu 6 ký tự.");
    }
    if (pw1 !== pw2) {
      return openSwal("warning", "Không khớp", "Nhập lại mật khẩu xác nhận cho đúng.");
    }

    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: pw1 });
      if (error) {
        openSwal("error", "Đổi mật khẩu thất bại", error.message);
        return;
      }
      setPw1("");
      setPw2("");
      openSwal("success", "Đổi mật khẩu thành công", "Hãy nhớ mật khẩu mới của bạn.");
    } finally {
      setBusy(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    openSwal("success", "Đã đăng xuất");
    setTimeout(() => navigate("/shop"), 500);
  };

  return (
    <div className="min-h-screen bg-[#eaf6ff]">
      {/* Header */}
      <div className="sticky top-0 z-40 px-3 pt-3">
        <div className="max-w-3xl mx-auto rounded-[28px] bg-white/90 backdrop-blur border-[3px] border-sky-500 shadow p-3">
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => navigate("/shop")}
              className="px-3 py-2 rounded-2xl bg-sky-100 border-2 border-sky-300 font-extrabold inline-flex items-center gap-2 active:scale-[0.99] transition"
              type="button"
            >
              <ArrowLeft className="w-4 h-4" /> Quay lại Shop
            </button>

            <div className="text-right leading-tight">
              <p className="font-extrabold text-[14px]">Tài khoản</p>
              <p className="text-[12px] text-slate-500">Quản lý hồ sơ & bảo mật</p>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-3xl mx-auto px-3 pt-4 pb-12 space-y-4">
        {/* Profile card */}
        <div className="rounded-[30px] bg-white border-[3px] border-sky-400 shadow-[0_18px_40px_rgba(2,132,199,0.16)] p-4">
          {loading ? (
            <div className="p-6 rounded-2xl bg-sky-50 border-2 border-sky-200 text-center text-slate-600 font-bold">
              Đang tải...
            </div>
          ) : !profile ? (
            <div className="p-6 rounded-2xl bg-sky-50 border-2 border-sky-200 text-center text-slate-600">
              Không có dữ liệu tài khoản.
            </div>
          ) : (
            <div className="flex items-start gap-3">
              <div className="w-14 h-14 rounded-full bg-sky-100 border-2 border-sky-300 flex items-center justify-center overflow-hidden">
                {profile.avatar ? (
                  <img src={profile.avatar} className="w-full h-full object-cover" />
                ) : (
                  <UserCircle2 className="w-8 h-8 text-sky-700" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-extrabold text-[18px] truncate">{profile.name || "Member"}</p>

                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="rounded-2xl bg-sky-50 border-2 border-sky-200 p-3">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-sky-700" />
                      <p className="text-xs text-slate-500 font-bold">Email</p>
                    </div>
                    <p className="font-extrabold text-slate-700 mt-1 truncate">
                      {profile.email || "-"}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-sky-50 border-2 border-sky-200 p-3">
                    <div className="flex items-center gap-2">
                      <Wallet className="w-4 h-4 text-sky-700" />
                      <p className="text-xs text-slate-500 font-bold">Số dư</p>
                    </div>
                    <p className="font-extrabold text-sky-700 mt-1">
                      {formatVND(Number(profile.balance ?? 0))}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-sky-50 border-2 border-sky-200 p-3">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-sky-700" />
                      <p className="text-xs text-slate-500 font-bold">Role</p>
                    </div>
                    <p className="font-extrabold text-slate-700 mt-1">{profile.role || "member"}</p>
                  </div>

                  <div className="rounded-2xl bg-sky-50 border-2 border-sky-200 p-3">
                    <div className="flex items-center gap-2">
                      <BadgeCheck className="w-4 h-4 text-sky-700" />
                      <p className="text-xs text-slate-500 font-bold">Status</p>
                    </div>
                    <p className="font-extrabold text-slate-700 mt-1">{profile.status || "active"}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Edit profile */}
        {!!profile && (
          <div className="rounded-[30px] bg-white border-[3px] border-sky-300 shadow p-4">
            <p className="font-extrabold text-[16px]">Chỉnh sửa hồ sơ</p>

            <div className="mt-3 grid grid-cols-1 gap-3">
              <div className="rounded-2xl bg-white border-2 border-sky-200 p-3">
                <p className="text-xs font-bold text-slate-500">Tên hiển thị</p>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-2 w-full h-11 rounded-2xl border-2 border-sky-200 px-3 outline-none font-bold"
                  placeholder="Nhập tên..."
                  disabled={busy}
                />
              </div>

              <div className="rounded-2xl bg-white border-2 border-sky-200 p-3">
                <div className="flex items-center gap-2">
                  <LinkIcon className="w-4 h-4 text-slate-400" />
                  <p className="text-xs font-bold text-slate-500">Avatar URL</p>
                </div>
                <input
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="mt-2 w-full h-11 rounded-2xl border-2 border-sky-200 px-3 outline-none font-bold"
                  placeholder="https://..."
                  disabled={busy}
                />
                <p className="text-[11px] text-slate-500 mt-2">
                  Gợi ý: dùng link ảnh https trực tiếp (png/jpg).
                </p>
              </div>

              <button
                onClick={saveProfile}
                disabled={!canSave || busy}
                className={cn(
                  "h-12 rounded-2xl font-extrabold border-2 shadow inline-flex items-center justify-center gap-2 active:scale-[0.99] transition",
                  canSave && !busy
                    ? "bg-sky-500 text-white border-sky-600"
                    : "bg-sky-200 text-sky-900 border-sky-300"
                )}
                type="button"
              >
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Lưu thay đổi
              </button>
            </div>
          </div>
        )}

        {/* Security */}
        {!!profile && (
          <div className="rounded-[30px] bg-white border-[3px] border-sky-300 shadow p-4">
            <p className="font-extrabold text-[16px]">Bảo mật</p>

            <div className="mt-3 grid grid-cols-1 gap-3">
              <div className="rounded-2xl bg-white border-2 border-sky-200 p-3">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-slate-400" />
                  <p className="text-xs font-bold text-slate-500">Mật khẩu mới</p>
                </div>
                <input
                  type="password"
                  value={pw1}
                  onChange={(e) => setPw1(e.target.value)}
                  className="mt-2 w-full h-11 rounded-2xl border-2 border-sky-200 px-3 outline-none font-bold"
                  placeholder="******"
                  disabled={busy}
                />
              </div>

              <div className="rounded-2xl bg-white border-2 border-sky-200 p-3">
                <p className="text-xs font-bold text-slate-500">Nhập lại mật khẩu</p>
                <input
                  type="password"
                  value={pw2}
                  onChange={(e) => setPw2(e.target.value)}
                  className="mt-2 w-full h-11 rounded-2xl border-2 border-sky-200 px-3 outline-none font-bold"
                  placeholder="******"
                  disabled={busy}
                />
              </div>

              <button
                onClick={changePassword}
                disabled={busy}
                className="h-12 rounded-2xl bg-white border-2 border-sky-300 font-extrabold text-sky-700 shadow-sm active:scale-[0.99] transition inline-flex items-center justify-center gap-2"
                type="button"
              >
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                Đổi mật khẩu
              </button>

              <button
                onClick={logout}
                className="h-12 rounded-2xl bg-rose-50 border-2 border-rose-200 font-extrabold text-rose-700 shadow-sm active:scale-[0.99] transition inline-flex items-center justify-center gap-2"
                type="button"
              >
                <LogOut className="w-4 h-4" />
                Đăng xuất
              </button>
            </div>
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

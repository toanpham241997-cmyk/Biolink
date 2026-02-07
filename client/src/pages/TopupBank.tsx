import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Landmark, Copy, Loader2, Wallet } from "lucide-react";
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

type Profile = { id: string; balance: number | null; name: string | null };

export default function TopupBankPage() {
  const [, navigate] = useLocation();

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);

  const [amount, setAmount] = useState(50000);

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
      openSwal("warning", "Chưa đăng nhập", "Vui lòng đăng nhập để nạp bank.");
      setTimeout(() => navigate("/auth?mode=login"), 500);
      return;
    }

    const { data: p } = await supabase.from("profiles").select("id,balance,name").eq("id", uid).single();
    setProfile((p as Profile) ?? null);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const bankInfo = useMemo(() => {
    return {
      bank: "Vietcombank",
      accountName: "SHOP DEV HVH",
      accountNumber: "0123456789",
    };
  }, []);

  const transferContent = useMemo(() => {
    const uid = profile?.id ? profile.id.slice(0, 8) : "UNKNOWN";
    return `TOPUP_${uid}`;
  }, [profile?.id]);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      openSwal("success", "Đã copy", text);
    } catch {
      openSwal("error", "Copy thất bại", "Trình duyệt không hỗ trợ clipboard.");
    }
  };

  // Optional: tạo yêu cầu nạp bank (để admin/cron xác nhận)
  const createBankIntent = async () => {
    if (!profile) return;
    setBusy(true);
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        openSwal("warning", "Phiên hết hạn", "Vui lòng đăng nhập lại.");
        navigate("/auth?mode=login");
        return;
      }

      const res = await fetch("/api/topup/bank-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          amount,
          content: transferContent,
        }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) return openSwal("error", "Tạo yêu cầu thất bại", json?.message || "Có lỗi xảy ra.");

      openSwal("success", "Đã tạo yêu cầu", json?.message || "Vui lòng chuyển khoản theo nội dung.");
    } catch (e: any) {
      openSwal("error", "Lỗi mạng", e?.message || "Không thể kết nối server.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#eaf6ff]">
      <div className="sticky top-0 z-40 px-3 pt-3">
        <div className="max-w-3xl mx-auto rounded-[28px] bg-white/90 border-[3px] border-sky-500 shadow p-3">
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => navigate("/shop")}
              className="px-3 py-2 rounded-2xl bg-sky-100 border-2 border-sky-300 font-extrabold inline-flex items-center gap-2"
              type="button"
            >
              <ArrowLeft className="w-4 h-4" /> Quay lại
            </button>
            <div className="text-right leading-tight">
              <p className="font-extrabold text-[14px]">Nạp Bank</p>
              <p className="text-[12px] text-slate-500">Chuyển khoản ngân hàng</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-3 pt-4 pb-12 space-y-4">
        <div className="rounded-[30px] bg-white border-[3px] border-sky-400 shadow-[0_18px_40px_rgba(2,132,199,0.16)] p-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 border-2 border-sky-300 flex items-center justify-center">
              <Landmark className="w-7 h-7 text-sky-700" />
            </div>
            <div className="flex-1">
              <p className="font-extrabold text-[18px]">Thông tin chuyển khoản</p>
              <p className="text-[13px] text-slate-600 mt-1">
                Chuyển khoản đúng <b>nội dung</b> để hệ thống tự nhận (hoặc admin duyệt).
              </p>

              <div className="mt-3 rounded-2xl bg-sky-50 border-2 border-sky-200 p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-sky-700" />
                  <p className="text-[13px] font-extrabold text-slate-700">Số dư</p>
                </div>
                <p className="text-[13px] font-extrabold text-sky-700">
                  {loading ? "..." : formatVND(Number(profile?.balance ?? 0))}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[30px] bg-white border-[3px] border-sky-300 shadow p-4 space-y-3">
          <div className="rounded-2xl bg-white border-2 border-sky-200 p-3">
            <p className="text-xs font-bold text-slate-500">Ngân hàng</p>
            <p className="mt-1 font-extrabold text-slate-800">{bankInfo.bank}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white border-2 border-sky-200 p-3">
              <p className="text-xs font-bold text-slate-500">Số tài khoản</p>
              <div className="mt-2 flex items-center justify-between gap-2">
                <p className="font-extrabold text-slate-800">{bankInfo.accountNumber}</p>
                <button
                  onClick={() => copy(bankInfo.accountNumber)}
                  className="h-10 px-3 rounded-2xl bg-sky-50 border-2 border-sky-200 font-extrabold text-slate-700 inline-flex items-center gap-2"
                  type="button"
                >
                  <Copy className="w-4 h-4" /> Copy
                </button>
              </div>
            </div>

            <div className="rounded-2xl bg-white border-2 border-sky-200 p-3">
              <p className="text-xs font-bold text-slate-500">Chủ tài khoản</p>
              <p className="mt-1 font-extrabold text-slate-800">{bankInfo.accountName}</p>
            </div>
          </div>

          <div className="rounded-2xl bg-white border-2 border-sky-200 p-3">
            <p className="text-xs font-bold text-slate-500">Nội dung chuyển khoản</p>
            <div className="mt-2 flex items-center justify-between gap-2">
              <p className="font-extrabold text-sky-700">{transferContent}</p>
              <button
                onClick={() => copy(transferContent)}
                className="h-10 px-3 rounded-2xl bg-sky-50 border-2 border-sky-200 font-extrabold text-slate-700 inline-flex items-center gap-2"
                type="button"
              >
                <Copy className="w-4 h-4" /> Copy
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              * Bắt buộc đúng nội dung để nhận tiền nhanh.
            </p>
          </div>

          <div className="rounded-2xl bg-white border-2 border-sky-200 p-3">
            <p className="text-xs font-bold text-slate-500">Số tiền dự kiến</p>
            <select
              className="mt-2 w-full h-11 rounded-2xl border-2 border-sky-200 px-3 font-extrabold outline-none"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              disabled={busy}
            >
              <option value={50000}>50.000</option>
              <option value={100000}>100.000</option>
              <option value={200000}>200.000</option>
              <option value={500000}>500.000</option>
              <option value={1000000}>1.000.000</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              onClick={load}
              disabled={busy}
              className="h-12 rounded-2xl bg-white border-2 border-sky-300 font-extrabold text-sky-700 shadow-sm active:scale-[0.99] transition"
              type="button"
            >
              Refresh số dư
            </button>

            <button
              onClick={createBankIntent}
              disabled={busy}
              className={cn(
                "h-12 rounded-2xl font-extrabold border-2 shadow active:scale-[0.99] transition inline-flex items-center justify-center gap-2",
                busy ? "bg-sky-200 text-sky-900 border-sky-300" : "bg-sky-500 text-white border-sky-600"
              )}
              type="button"
            >
              {busy && <Loader2 className="w-4 h-4 animate-spin" />}
              {busy ? "Đang tạo..." : "Tạo yêu cầu nạp"}
            </button>
          </div>

          <p className="text-[11px] text-slate-500">
            Bạn có thể xử lý auto đối soát ở backend (webhook ngân hàng / admin confirm).
          </p>
        </div>
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

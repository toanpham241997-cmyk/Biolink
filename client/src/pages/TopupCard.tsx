import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, CreditCard, Loader2, Wallet } from "lucide-react";
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
  balance: number | null;
};

export default function TopupCardPage() {
  const [, navigate] = useLocation();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [provider, setProvider] = useState("VIETTEL");
  const [amount, setAmount] = useState(10000);
  const [serial, setSerial] = useState("");
  const [pin, setPin] = useState("");

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
      openSwal("warning", "Chưa đăng nhập", "Vui lòng đăng nhập để nạp tiền.");
      setTimeout(() => navigate("/auth?mode=login"), 500);
      return;
    }

    const { data: p } = await supabase.from("profiles").select("id,balance").eq("id", uid).single();
    setProfile((p as Profile) ?? null);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async () => {
    if (!serial.trim() || !pin.trim()) {
      return openSwal("warning", "Thiếu thông tin", "Vui lòng nhập serial và mã thẻ.");
    }

    setBusy(true);
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        openSwal("warning", "Phiên hết hạn", "Vui lòng đăng nhập lại.");
        navigate("/auth?mode=login");
        return;
      }

      const res = await fetch("/api/topup/card", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          provider,
          amount,
          serial: serial.trim(),
          pin: pin.trim(),
        }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        openSwal("error", "Nạp thất bại", json?.message || "Có lỗi xảy ra.");
        return;
      }

      openSwal("success", "Nạp thành công", json?.message || "Số dư đã được cập nhật.");
      setSerial("");
      setPin("");
      await load();
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
              <p className="font-extrabold text-[14px]">Nạp thẻ</p>
              <p className="text-[12px] text-slate-500">Nạp tiền nhanh</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-3 pt-4 pb-12 space-y-4">
        <div className="rounded-[30px] bg-white border-[3px] border-sky-400 shadow-[0_18px_40px_rgba(2,132,199,0.16)] p-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 border-2 border-sky-300 flex items-center justify-center">
              <CreditCard className="w-7 h-7 text-sky-700" />
            </div>
            <div className="flex-1">
              <p className="font-extrabold text-[18px]">Nạp thẻ cào</p>
              <p className="text-[13px] text-slate-600 mt-1">
                Nhập đúng serial + mã thẻ. Hệ thống sẽ xử lý trên server.
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white border-2 border-sky-200 p-3">
              <p className="text-xs font-bold text-slate-500">Nhà mạng</p>
              <select
                className="mt-2 w-full h-11 rounded-2xl border-2 border-sky-200 px-3 font-extrabold outline-none"
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                disabled={busy}
              >
                <option value="VIETTEL">Viettel</option>
                <option value="VINAPHONE">Vinaphone</option>
                <option value="MOBIFONE">Mobifone</option>
                <option value="ZING">Zing</option>
              </select>
            </div>

            <div className="rounded-2xl bg-white border-2 border-sky-200 p-3">
              <p className="text-xs font-bold text-slate-500">Mệnh giá</p>
              <select
                className="mt-2 w-full h-11 rounded-2xl border-2 border-sky-200 px-3 font-extrabold outline-none"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                disabled={busy}
              >
                <option value={10000}>10.000</option>
                <option value={20000}>20.000</option>
                <option value={50000}>50.000</option>
                <option value={100000}>100.000</option>
                <option value={200000}>200.000</option>
                <option value={500000}>500.000</option>
              </select>
            </div>
          </div>

          <div className="rounded-2xl bg-white border-2 border-sky-200 p-3">
            <p className="text-xs font-bold text-slate-500">Serial</p>
            <input
              className="mt-2 w-full h-11 rounded-2xl border-2 border-sky-200 px-3 font-extrabold outline-none"
              value={serial}
              onChange={(e) => setSerial(e.target.value)}
              placeholder="Nhập serial..."
              disabled={busy}
            />
          </div>

          <div className="rounded-2xl bg-white border-2 border-sky-200 p-3">
            <p className="text-xs font-bold text-slate-500">Mã thẻ</p>
            <input
              className="mt-2 w-full h-11 rounded-2xl border-2 border-sky-200 px-3 font-extrabold outline-none"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Nhập mã thẻ..."
              disabled={busy}
            />
          </div>

          <button
            onClick={submit}
            disabled={busy}
            className={cn(
              "h-12 rounded-2xl font-extrabold border-2 shadow active:scale-[0.99] transition inline-flex items-center justify-center gap-2",
              busy ? "bg-sky-200 text-sky-900 border-sky-300" : "bg-sky-500 text-white border-sky-600"
            )}
            type="button"
          >
            {busy && <Loader2 className="w-4 h-4 animate-spin" />}
            {busy ? "Đang xử lý..." : "Nạp ngay"}
          </button>

          <p className="text-[11px] text-slate-500">
            Gợi ý: Sau khi bạn làm backend, hãy validate thẻ ở server và update profiles.balance.
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

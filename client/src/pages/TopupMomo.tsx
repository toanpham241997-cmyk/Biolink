import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { QRCodeCanvas } from "qrcode.react";
import { ArrowLeft, Wallet, Loader2, ExternalLink } from "lucide-react";
import ModalSwal, { SwalKind } from "@/components/ModalSwal";
import { supabase } from "@/lib/supabaseClient";

function formatVND(n: number) {
  try { return n.toLocaleString("vi-VN") + "₫"; } catch { return `${n}₫`; }
}

export default function TopupMomo() {
  const [, navigate] = useLocation();

  const [amount, setAmount] = useState(50000);
  const [busy, setBusy] = useState(false);

  const [payUrl, setPayUrl] = useState<string | null>(null);
  const [deeplink, setDeeplink] = useState<string | null>(null);
  const [qrData, setQrData] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  const [swal, setSwal] = useState<{open:boolean;variant:SwalKind;title:string;message?:string}>({
    open:false,variant:"info",title:""
  });

  const quickAmounts = useMemo(() => [20000, 50000, 100000, 200000, 500000], []);

  const openSwal = (variant: SwalKind, title: string, message?: string) =>
    setSwal({ open: true, variant, title, message });

  const createPayment = async () => {
    setBusy(true);
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        openSwal("warning", "Chưa đăng nhập", "Vui lòng đăng nhập để nạp tiền.");
        navigate("/auth?mode=login");
        return;
      }

      const res = await fetch("/api/topup/momo/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        openSwal("error", "Tạo giao dịch thất bại", json?.message || "Có lỗi xảy ra");
        return;
      }

      setPayUrl(json.payUrl || null);
      setDeeplink(json.deeplink || null);
      setQrData(json.qrData || null);
      setOrderId(json.orderId || null);

      openSwal("success", "Đã tạo giao dịch", "Quét QR hoặc mở MoMo để thanh toán.");
    } catch (e: any) {
      openSwal("error", "Lỗi mạng", e?.message || "Không thể kết nối server");
    } finally {
      setBusy(false);
    }
  };

  // UI
  return (
    <div className="min-h-screen bg-[#eaf6ff] px-3 pt-3 pb-10">
      <div className="max-w-3xl mx-auto">
        {/* header */}
        <div className="rounded-[26px] bg-white/90 border-[3px] border-sky-500 shadow p-3 flex items-center justify-between">
          <button
            onClick={() => navigate("/shop")}
            className="px-3 py-2 rounded-2xl bg-sky-100 border-2 border-sky-300 font-extrabold inline-flex items-center gap-2"
            type="button"
          >
            <ArrowLeft className="w-4 h-4" /> Quay lại
          </button>
          <div className="text-right">
            <p className="font-extrabold text-[14px]">Nạp MoMo</p>
            <p className="text-[12px] text-slate-500">QR / PayUrl / Auto cộng tiền</p>
          </div>
        </div>

        {/* card */}
        <div className="mt-4 rounded-[30px] bg-white border-[3px] border-sky-300 shadow p-4">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-sky-700" />
            <p className="font-extrabold text-[16px]">Chọn số tiền</p>
          </div>

          <div className="mt-3 grid grid-cols-3 sm:grid-cols-5 gap-2">
            {quickAmounts.map((a) => (
              <button
                key={a}
                onClick={() => setAmount(a)}
                className={`h-11 rounded-2xl border-2 font-extrabold text-[12px] ${
                  amount === a ? "bg-sky-500 text-white border-sky-600" : "bg-white text-sky-700 border-sky-200"
                }`}
                type="button"
              >
                {formatVND(a)}
              </button>
            ))}
          </div>

          <button
            onClick={createPayment}
            disabled={busy}
            className="mt-4 w-full h-12 rounded-2xl bg-sky-500 border-2 border-sky-600 text-white font-extrabold shadow inline-flex items-center justify-center gap-2 disabled:opacity-60"
            type="button"
          >
            {busy && <Loader2 className="w-4 h-4 animate-spin" />}
            {busy ? "Đang tạo giao dịch..." : "Tạo QR thanh toán"}
          </button>

          {/* result */}
          {(qrData || payUrl || deeplink) && (
            <div className="mt-4 rounded-[26px] bg-sky-50 border-2 border-sky-200 p-4">
              <p className="font-extrabold text-slate-800">Thông tin thanh toán</p>
              {orderId && <p className="text-xs text-slate-500 mt-1">Mã: {orderId}</p>}

              {qrData && (
                <div className="mt-3 flex flex-col items-center">
                  <div className="bg-white p-3 rounded-2xl border-2 border-sky-200">
                    <QRCodeCanvas value={qrData} size={210} includeMargin />
                  </div>
                  <p className="text-[12px] text-slate-600 mt-2 text-center">
                    Dùng MoMo quét QR để thanh toán.
                  </p>
                </div>
              )}

              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {deeplink && (
                  <a
                    href={deeplink}
                    className="h-11 rounded-2xl bg-sky-500 border-2 border-sky-600 text-white font-extrabold inline-flex items-center justify-center gap-2"
                  >
                    Mở MoMo <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                {payUrl && (
                  <a
                    href={payUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="h-11 rounded-2xl bg-white border-2 border-sky-300 text-sky-700 font-extrabold inline-flex items-center justify-center gap-2"
                  >
                    Mở PayUrl <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>

              <p className="mt-3 text-[11px] text-slate-500">
                Sau khi thanh toán thành công, MoMo sẽ gọi IPN về server để tự cộng tiền.
              </p>
            </div>
          )}
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

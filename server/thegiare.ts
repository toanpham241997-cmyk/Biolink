type TheGiareSubmitPayload = {
  telco: string;
  amount: number;
  serial: string;
  pin: string;
  request_id: string;
  callback_url: string;
};

export async function thegiareSubmitCard(payload: TheGiareSubmitPayload) {
  // ⚠️ Đây là ví dụ kiểu chung. Bạn sửa URL + field đúng theo doc thegiare.
  const url = "https://thegiare.vn/api/card/submit"; // <-- sửa theo doc thật

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      partner_id: process.env.THEGIARE_PARTNER_ID,
      api_key: process.env.THEGIARE_API_KEY,
      telco: payload.telco,
      amount: payload.amount,
      serial: payload.serial,
      pin: payload.pin,
      request_id: payload.request_id,
      callback_url: payload.callback_url,
    }),
  });

  const json = await res.json().catch(() => ({}));
  return { ok: res.ok, json };
}

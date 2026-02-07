export async function purchaseItem(input: {
  itemId: string;
  qty: number;
  coupon: string | null;
}) {
  const r = await fetch("/api/purchase", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const data = await r.json().catch(() => ({}));
  if (!r.ok) return { ok: false, message: data?.message || "Request failed" };

  // server trả về: { charged, balance_after }
  return { ok: true, ...data } as any;
}

import crypto from "crypto";

export function hmacSHA256(secret: string, raw: string) {
  return crypto.createHmac("sha256", secret).update(raw).digest("hex");
}

// build rawSignature theo đúng docs/model MoMo bạn đang dùng.
// Ở đây mình để helper generic: bạn truyền đúng rawSignature string.
export function signMomo(secretKey: string, rawSignature: string) {
  return hmacSHA256(secretKey, rawSignature);
}

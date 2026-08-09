// lib/qr.ts — QR Code data URL generator using 'qrcode' library with HMAC security
import QRCode from "qrcode";
import crypto from "crypto";

const QR_SECRET = process.env.QR_SIGNING_SECRET || "crrdc-clsu-qr-secret-key-2026";

export function signQRPayload(orderId: string, totalPhp: number, issuedAt: string): string {
  const data = `${orderId}:${totalPhp}:${issuedAt}`;
  return crypto.createHmac("sha256", QR_SECRET).update(data).digest("hex");
}

export function verifyQRPayload(orderId: string, totalPhp: number, issuedAt: string, signature: string): boolean {
  const expected = signQRPayload(orderId, totalPhp, issuedAt);
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

export async function generateQRDataURL(payload: string): Promise<string> {
  try {
    const dataUrl = await QRCode.toDataURL(payload, {
      width: 320,
      margin: 2,
      color: {
        dark: "#1E6031", // Green Cobra brand color
        light: "#FFFFFF",
      },
      errorCorrectionLevel: "M",
    });
    return dataUrl;
  } catch (err) {
    console.error("QR Code Generation Error:", err);
    throw new Error("Failed to generate QR code");
  }
}

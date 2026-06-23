export type Mode = "text" | "link" | "email" | "phone" | "sms" | "wifi" | "vcard";
export type ErrorCorrectionLevel = "L" | "M" | "Q" | "H";
export type QRCodeStyle = "dots" | "squares" | "rounded";

export interface QRCodeOptions {
  bgColor: string;
  fgColor: string;
  size: number;
  errorCorrectionLevel: ErrorCorrectionLevel;
  style: QRCodeStyle;
  includeMargin: boolean;
  logoImage: string | null;
  logoWidth: number;
  logoHeight: number;
}

export interface SavedQRCode {
  id: string;
  name: string;
  mode: Mode;
  input: string;
  options: QRCodeOptions;
  createdAt: number;
}
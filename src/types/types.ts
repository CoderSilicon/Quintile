export type Mode =
  | "text"
  | "link"
  | "email"
  | "phone"
  | "sms"
  | "wifi"
  | "vcard";
export type ErrorCorrectionLevel = "L" | "M" | "Q" | "H";

// Comprehensive shape & styling presets matching qr-code-styling
export type QRShape = "square" | "circle";
export type DotStyle =
  | "square"
  | "dots"
  | "rounded"
  | "extra-rounded"
  | "classy"
  | "classy-rounded";
export type CornerSquareStyle = "square" | "dot" | "extra-rounded";
export type CornerDotStyle = "square" | "dot";
export type ColorMode = "single" | "gradient";
export type GradientType = "linear" | "radial";
export type FrameStyle = "none" | "bottom-text" | "outline";

export interface QRGradient {
  type: GradientType;
  rotation: number;
  colorStops: { offset: number; color: string }[];
}

export interface QRCodeOptions {
  shape: QRShape;
  size: number;
  margin: number;
  errorCorrectionLevel: ErrorCorrectionLevel;
  includeMargin: boolean;
  dotsColorMode: ColorMode;
  dotsColor: string;
  dotsGradient: QRGradient;
  dotStyle: DotStyle;
  cornerSquareColorMode: ColorMode;
  cornerSquareColor: string;
  cornerSquareGradient: QRGradient;
  cornerSquareStyle: CornerSquareStyle;
  cornerDotColorMode: ColorMode;
  cornerDotColor: string;
  cornerDotGradient: QRGradient;
  cornerDotStyle: CornerDotStyle;
  bgColorMode: ColorMode;
  bgColor: string;
  bgGradient: QRGradient;
  fgColor: string;
  logoImage: string | null;
  logoSize: number;
  logoMargin: number;
  hideBackgroundDots: boolean;
  frameStyle: FrameStyle;
  frameText: string;
  frameColor: string;
}

export interface SavedQRCode {
  id: string;
  name: string;
  mode: Mode;
  input: string;
  options: QRCodeOptions;
  createdAt: number;
}

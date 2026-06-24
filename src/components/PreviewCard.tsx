import { useEffect, useRef, useState } from "react";
import { MdFileDownload, MdCheck } from "react-icons/md";
import * as htmlToImage from "html-to-image";
import QRCodeStyling from "qr-code-styling";
import type { QRCodeOptions } from "../types/types";

interface PreviewCardProps {
  qrValue: string;
  options: QRCodeOptions;
}

type GradientType = "linear" | "radial";

export default function PreviewCard({ qrValue, options }: PreviewCardProps) {
  const exportRef = useRef<HTMLDivElement>(null);
  const qrWrapperRef = useRef<HTMLDivElement>(null);
  const [downloadStatus, setDownloadStatus] = useState<
    "idle" | "downloading" | "success" | "error"
  >("idle");

  const [qrCode] = useState(
    () =>
      new QRCodeStyling({
        type: "svg",
        width: 240,
        height: 240,
      }),
  );

  useEffect(() => {
    const isFramed = options.frameStyle && options.frameStyle !== "none";
    const activeSize = isFramed ? 200 : 240;

    const formatColorOption = (
      mode: "single" | "gradient",
      color: string,
      grad?: {
        type?: GradientType;
        rotation?: number;
        colorStops?: { offset: number; color: string }[];
      },
    ) => {
      if (mode === "single" || !grad) {
        return { color: color || "#000000", gradient: undefined };
      }

      return {
        color: undefined,
        gradient: {
          type: grad.type || "linear",
          rotation: ((grad.rotation || 0) * Math.PI) / 180,
          colorStops: grad.colorStops || [
            { offset: 0, color: color || "#000000" },
            { offset: 1, color: color || "#ffffff" },
          ],
        },
      };
    };

    qrCode.update({
      data: qrValue || "https://quintile.vercel.app",
      width: activeSize,
      height: activeSize,
      margin: options.margin || 0,
      shape: options.shape || "square",
      qrOptions: {
        errorCorrectionLevel: options.errorCorrectionLevel || "M",
      },
      dotsOptions: {
        type: options.dotStyle || "square",
        ...formatColorOption(
          options.dotsColorMode,
          options.dotsColor,
          options.dotsGradient,
        ),
      },
      cornersSquareOptions: {
        type: options.cornerSquareStyle || "square",
        ...formatColorOption(
          options.cornerSquareColorMode,
          options.cornerSquareColor,
          options.cornerSquareGradient,
        ),
      },
      cornersDotOptions: {
        type: options.cornerDotStyle || "square",
        ...formatColorOption(
          options.cornerDotColorMode,
          options.cornerDotColor,
          options.cornerDotGradient,
        ),
      },
      backgroundOptions: {
        ...formatColorOption(
          options.bgColorMode,
          options.bgColor,
          options.bgGradient,
        ),
      },
      image: options.logoImage || undefined,
      imageOptions: {
        crossOrigin: "anonymous",
        hideBackgroundDots: options.hideBackgroundDots ?? true,
        imageSize: options.logoSize || 0.4,
        margin: options.logoMargin || 0,
        saveAsBlob: true,
      },
    });

    if (qrWrapperRef.current) {
      qrWrapperRef.current.innerHTML = "";
      qrCode.append(qrWrapperRef.current);
    }
  }, [qrCode, qrValue, options]);

  const downloadQRCode = async () => {
    if (!exportRef.current) return;
    setDownloadStatus("downloading");

    try {
      const dataUrl = await htmlToImage.toSvg(exportRef.current);
      const link = document.createElement("a");
      link.download = `quintile-${Date.now()}.svg`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloadStatus("success");
      setTimeout(() => setDownloadStatus("idle"), 2000);
    } catch {
      setDownloadStatus("error");
    }
  };

  return (
    <div className="sticky top-8 flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xs  tracking-widest text-slate-500 dark:text-slate-400 lexend-400">
          Output:
        </h2>
        <span className="text-[10px]  tracking-widest text-slate-400 flex items-center gap-1.5 lexend-300">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
          Ready (SVG)
        </span>
      </div>

      <div className="flex justify-center items-center p-8 border border-slate-200 dark:border-slate-800 rounded-lg mb-6 bg-slate-50 dark:bg-slate-900/50">
        <div ref={exportRef} className="relative flex justify-center">
          {/* Default Unframed Render */}
          {(!options.frameStyle || options.frameStyle === "none") && (
            <div
              className="p-4 rounded-xl shadow-sm"
              style={{
                backgroundColor:
                  options.bgColorMode === "single"
                    ? options.bgColor
                    : "transparent",
              }}
            >
              <div ref={qrWrapperRef} />
            </div>
          )}

          {/* Bottom Label Block */}
          {options.frameStyle === "bottom-text" && (
            <div
              className="flex flex-col items-center p-4 pt-5 pb-3 rounded-2xl shadow-xl"
              style={{ backgroundColor: options.frameColor || "#0f172a" }}
            >
              <div className="bg-white p-2 rounded-lg mb-3">
                <div ref={qrWrapperRef} />
              </div>
              <span className="text-white font-bold tracking-widest uppercase text-sm px-4">
                {options.frameText || "SCAN ME"}
              </span>
            </div>
          )}

          {/* Floating Outline Badge Layout */}
          {options.frameStyle === "outline" && (
            <div
              className="flex flex-col items-center p-5 pt-8 rounded-xl border-4 mt-4"
              style={{
                borderColor: options.frameColor || "#0f172a",
                backgroundColor:
                  options.bgColorMode === "single"
                    ? options.bgColor
                    : "transparent",
              }}
            >
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1.5 rounded-full font-bold tracking-widest uppercase text-xs text-white shadow-sm whitespace-nowrap"
                style={{ backgroundColor: options.frameColor || "#0f172a" }}
              >
                {options.frameText || "SCAN ME"}
              </div>
              <div ref={qrWrapperRef} />
            </div>
          )}
        </div>
      </div>

      <button
        onClick={downloadQRCode}
        disabled={downloadStatus === "downloading"}
        className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 lexend-400"
      >
        {downloadStatus === "success" ? (
          <MdCheck size={18} />
        ) : (
          <MdFileDownload size={18} />
        )}
        {downloadStatus === "success" ? "Vector Saved" : "Download"}
      </button>
    </div>
  );
}

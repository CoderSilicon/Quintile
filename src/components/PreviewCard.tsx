import { useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { MdFileDownload, MdCheck } from "react-icons/md";
import type { QRCodeOptions } from "../types/types";

interface PreviewCardProps {
  qrValue: string;
  options: QRCodeOptions;
  onSave: () => void;
}

export default function PreviewCard({ qrValue, options }: PreviewCardProps) {
  const qrCodeRef = useRef<HTMLDivElement>(null);
  const [downloadStatus, setDownloadStatus] = useState<"idle" | "downloading" | "success" | "error">("idle");

  const downloadQRCode = () => {
    setDownloadStatus("downloading");
    const canvas = qrCodeRef.current?.querySelector("canvas");
    if (!canvas) {
      setDownloadStatus("error");
      return;
    }
    const link = document.createElement("a");
    link.download = `quintile-qr-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setDownloadStatus("success");
    setTimeout(() => setDownloadStatus("idle"), 2000);
  };

  return (
    <div className="sticky top-8 flex flex-col">
      {/* Structural header matching the form panels */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
          Preview
        </h2>
        <span className="text-[10px] uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          Live
        </span>
      </div>

      {/* Stark QR Code Container */}
      <div 
        ref={qrCodeRef} 
        className="flex justify-center items-center p-8 border border-slate-200 dark:border-slate-800 rounded-lg mb-6 transition-colors"
        style={{ backgroundColor: options.bgColor }}
      >
        <QRCodeCanvas
          value={qrValue || "https://quintile.com"}
          size={240}
          bgColor={options.bgColor}
          fgColor={options.fgColor}
          level={options.errorCorrectionLevel}
          includeMargin={options.includeMargin}
          imageSettings={
            options.logoImage 
              ? { src: options.logoImage, height: options.logoHeight, width: options.logoWidth, excavate: true } 
              : undefined
          }
        />
      </div>

      {/* Utilitarian Action Buttons */}
      <div className="space-y-3">
        <button 
          onClick={downloadQRCode} 
          disabled={downloadStatus === "downloading"}
          className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
        >
          {downloadStatus === "success" ? <MdCheck size={18} /> : <MdFileDownload size={18} />}
          {downloadStatus === "success" ? "Saved Successfully" : "Download PNG"}
        </button>
        
      </div>
    </div>
  );
}
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import QRCode from "react-qr-code";
import {
  MdOutlineDarkMode,
  MdOutlineLightMode,
  MdFileDownload,
} from "react-icons/md";
import { ThemeProvider, useTheme } from "./ThemeContext";
import "./index.css";

type Mode = "text" | "link";

interface QRCodeOptions {
  size: number;
  bgColor: string;
  fgColor: string;
}

const QRCodeGenerator: React.FC = () => {
  const [mode, setMode] = useState<Mode>("text");
  const [input, setInput] = useState<string>("");
  const [options, setOptions] = useState<QRCodeOptions>({
    size: 256,
    bgColor: "#FFFFFF",
    fgColor: "#000000",
  });
  const { theme, toggleTheme } = useTheme();
  const [qrSize, setQrSize] = useState(256);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 340) {
        setQrSize(Math.min(width - 32, 200));
      } else if (width < 640) {
        setQrSize(Math.min(width - 64, 256));
      } else {
        setQrSize(256);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleOptionChange = (
    key: keyof QRCodeOptions,
    value: string | number
  ) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
  };

  const downloadQRCode = () => {
    const svg = document.querySelector(".qrcode-container svg");
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.onload = () => {
        canvas.width = qrSize;
        canvas.height = qrSize;
        ctx?.drawImage(img, 0, 0);
        const pngFile = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.download = "qrcode.png";
        downloadLink.href = pngFile;
        downloadLink.click();
      };
      img.src = "data:image/svg+xml;base64," + btoa(svgData);
    } else {
      console.error("QR code SVG element not found.");
    }
  };

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-4xl">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-4 sm:mb-8 text-gray-900 dark:text-gray-100"
      >
        QR Code Generator
      </motion.h1>
      <motion.button
        className="fixed top-2 right-2 sm:top-4 sm:right-4 p-2 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 z-10"
        onClick={toggleTheme}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {theme === "light" ? (
          <MdOutlineDarkMode size={20} />
        ) : (
          <MdOutlineLightMode size={20} />
        )}
      </motion.button>
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-8">
        <motion.div
          className="w-full lg:w-1/2 space-y-4 sm:space-y-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 sm:p-4 md:p-6">
            <h2 className="text-base sm:text-lg md:text-xl font-semibold mb-2 sm:mb-4 text-gray-900 dark:text-gray-100">
              Mode
            </h2>
            <div className="flex space-x-2 sm:space-x-4">
              {(["text", "link"] as const).map((option) => (
                <motion.button
                  key={option}
                  onClick={() => setMode(option)}
                  className={`flex-1 py-1 sm:py-2 px-2 sm:px-4 rounded-md transition-colors text-xs sm:text-sm md:text-base ${
                    mode === option
                      ? "bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </motion.button>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 sm:p-4 md:p-6">
            <h2 className="text-base sm:text-lg md:text-xl font-semibold mb-2 sm:mb-4 text-gray-900 dark:text-gray-100">
              Input
            </h2>
            <motion.textarea
              placeholder={
                mode === "text"
                  ? "Enter your text here"
                  : "Enter URL (e.g., example.com)"
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full p-2 text-xs sm:text-sm md:text-base border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              whileFocus={{ scale: 1.02 }}
              rows={1}
            />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 sm:p-4 md:p-6">
            <h2 className="text-base sm:text-lg md:text-xl font-semibold mb-2 sm:mb-4 text-gray-900 dark:text-gray-100">
              Options
            </h2>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label
                  htmlFor="size"
                  className="block text-xs sm:text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
                >
                  Size: {options.size}px
                </label>
                <input
                  type="range"
                  id="size"
                  min="128"
                  max="512"
                  step="8"
                  value={options.size}
                  onChange={(e) =>
                    handleOptionChange("size", Number(e.target.value))
                  }
                  className="w-full"
                />
              </div>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                <div className="flex-1">
                  <label
                    htmlFor="bgColor"
                    className="block text-xs sm:text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
                  >
                    Background
                  </label>
                  <div className="relative">
                    <input
                      type="color"
                      id="bgColor"
                      value={options.bgColor}
                      onChange={(e) =>
                        handleOptionChange("bgColor", e.target.value)
                      }
                      className="w-full h-8 sm:h-10 rounded-md cursor-pointer"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <label
                    htmlFor="fgColor"
                    className="block text-xs sm:text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
                  >
                    Foreground
                  </label>
                  <div className="relative">
                    <input
                      type="color"
                      id="fgColor"
                      value={options.fgColor}
                      onChange={(e) =>
                        handleOptionChange("fgColor", e.target.value)
                      }
                      className="w-full h-8 sm:h-10 rounded-md cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="w-full lg:w-1/2 flex flex-col items-center justify-center mt-4 lg:mt-0"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <AnimatePresence mode="wait">
            {input ? (
              <motion.div
                key="qr-code"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white qrcode-container dark:bg-gray-700 p-2 sm:p-4 rounded-lg shadow-lg"
              >
                <QRCode
                  value={input}
                  size={qrSize}
                  bgColor={options.bgColor}
                  fgColor={options.fgColor}
                />
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="text-center text-gray-500 dark:text-gray-400 text-xs sm:text-sm md:text-base"
              >
                Enter {mode === "text" ? "Text" : "URL"} to generate QR code
              </motion.div>
            )}
          </AnimatePresence>
          {input && (
            <motion.button
              onClick={downloadQRCode}
              className="mt-4 px-4 py-2 bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900 rounded-md flex items-center justify-center text-xs sm:text-sm md:text-base"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <MdFileDownload className="mr-2" />
              Download QR Code
            </motion.button>
          )}
        </motion.div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <QRCodeGenerator />
    </ThemeProvider>
  );
};

export default App;

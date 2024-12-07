import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import QRCode from "react-qr-code";
import { MdOutlineDarkMode, MdOutlineLightMode } from "react-icons/md";
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

  const handleOptionChange = (
    key: keyof QRCodeOptions,
    value: string | number
  ) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-3xl md:text-4xl font-bold text-center mb-8"
      >
        QR Code Generator
      </motion.h1>
      <motion.button
        className="fixed top-4 right-4 p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
        onClick={toggleTheme}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {theme === "light" ? (
          <MdOutlineDarkMode size={24} />
        ) : (
          <MdOutlineLightMode size={24} />
        )}
      </motion.button>
      <div className="flex flex-col md:flex-row gap-8">
        <motion.div
          className="w-full md:w-1/2 space-y-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Mode</h2>
            <div className="flex space-x-4">
              {(["text", "link"] as const).map((option) => (
                <motion.button
                  key={option}
                  onClick={() => setMode(option)}
                  className={`flex-1 py-2 px-4 rounded-md transition-colors ${
                    mode === option
                      ? "bg-blue-500 text-white"
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

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Input</h2>
            <motion.input
              type={mode === "link" ? "url" : "text"}
              placeholder={
                mode === "text"
                  ? "Enter your text here"
                  : "Enter URL (e.g., example.com)"
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              whileFocus={{ scale: 1.02 }}
            />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Options</h2>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="size"
                  className="block text-sm font-medium mb-1"
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
              <div className="flex space-x-4">
                <div className="flex-1">
                  <label
                    htmlFor="bgColor"
                    className="block text-sm font-medium mb-1"
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
                      className="w-full h-10 rounded-md cursor-pointer"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <label
                    htmlFor="fgColor"
                    className="block text-sm font-medium mb-1"
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
                      className="w-full h-10 rounded-md cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="w-full md:w-1/2 flex items-center justify-center"
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
                className="bg-white p-4 rounded-lg shadow-lg"
              >
                <QRCode
                  value={input}
                  size={options.size}
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
                className="text-center text-gray-500 dark:text-gray-400"
              >
                Enter {mode === "text" ? "Text" : "URL"} to generate QR code
              </motion.div>
            )}
          </AnimatePresence>
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

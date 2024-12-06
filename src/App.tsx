import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import QRCode from "react-qr-code"; // Using react-qr-code
import { MdOutlineDarkMode, MdOutlineLightMode } from "react-icons/md";
import { ThemeProvider, useTheme } from "./ThemeContext";
import "./App.css";

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
    <div className="container nova-square-regular">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="title text- lg:text-2xl"
      >
        QR Code Generator
      </motion.h1>
      <motion.button
        className="theme-toggle"
        onClick={toggleTheme}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {theme === "light" ? <MdOutlineLightMode /> : <MdOutlineDarkMode />}
      </motion.button>
      <div className="content">
        <motion.div
          className="options"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="option-group">
            <h2>Mode</h2>
            <div className="mode-buttons">
              {(["text", "link"] as const).map((option) => (
                <motion.button
                  key={option}
                  onClick={() => setMode(option)}
                  className={`mode-button ${mode === option ? "active" : ""}`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </motion.button>
              ))}
            </div>
          </div>

          <div className="option-group">
            <h2>Input</h2>
            <motion.input
              type={mode === "link" ? "url" : "text"}
              placeholder={
                mode === "text"
                  ? "Enter your text here"
                  : "Enter URL (e.g., example.com)"
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="input-field"
              whileFocus={{ scale: 1.02 }}
            />
          </div>

          <div className="option-group">
            <h2>Options</h2>
            <div className="option-controls">
              <div className="option-control">
                <label htmlFor="size">Size: {options.size}px</label>
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
                  className="range-input"
                />
              </div>
              <div className="color-options">
                <div className="color-option">
                  <label htmlFor="bgColor">Background</label>
                  <div className="color-input-wrapper">
                    <input
                      type="color"
                      id="bgColor"
                      value={options.bgColor}
                      onChange={(e) =>
                        handleOptionChange("bgColor", e.target.value)
                      }
                      className="color-input"
                    />
                  </div>
                </div>
                <div className="color-option">
                  <label htmlFor="fgColor">Foreground</label>
                  <div className="color-input-wrapper">
                    <input
                      type="color"
                      id="fgColor"
                      value={options.fgColor}
                      onChange={(e) =>
                        handleOptionChange("fgColor", e.target.value)
                      }
                      className="color-input"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="qr-code-container"
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
                className="qr-code"
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
                className="qr-placeholder"
              >
                Enter {mode === "text" ? "Text" : "URL"} == Get QR code
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

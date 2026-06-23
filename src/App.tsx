"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

import Header from "./components/header";
import ModeSelector from "./components/ModeSelector";
import InputFields from "./components/InputFields";
import CustomizationPanel from "./components/CustomizationPanel";
import PreviewCard from "./components/PreviewCard";

import type { Mode, QRCodeOptions, SavedQRCode } from "./types/types";
import "./index.css"; // Your tailwind directives

const DEFAULT_OPTIONS: QRCodeOptions = {
  bgColor: "#FFFFFF",
  fgColor: "#0F172A",
  size: 280,
  errorCorrectionLevel: "H",
  style: "squares",
  includeMargin: true,
  logoImage: null,
  logoWidth: 60,
  logoHeight: 60,
};

export default function App() {
  const [mode, setMode] = useState<Mode>("link");
  const [qrValue, setQrValue] = useState<string>("https://quintile.vercel.app");
  const [options, setOptions] = useState<QRCodeOptions>(DEFAULT_OPTIONS);

  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [savedQRCodes, setSavedQRCodes] = useState<SavedQRCode[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Initialize from LocalStorage
  useEffect(() => {
    const savedCodes = localStorage.getItem("savedQRCodes");
    if (savedCodes) setSavedQRCodes(JSON.parse(savedCodes));
    const savedTheme = localStorage.getItem("qrTheme");
    if (savedTheme) setTheme(savedTheme as "light" | "dark");
  }, []);

  // Sync theme changes to DOM
  useEffect(() => {
    localStorage.setItem("qrTheme", theme);
    if (theme === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [theme]);

  // Sync saved items to LocalStorage
  useEffect(() => {
    localStorage.setItem("savedQRCodes", JSON.stringify(savedQRCodes));
  }, [savedQRCodes]);

  // Actions
  const toggleTheme = () => setTheme((p) => (p === "light" ? "dark" : "light"));

  const handleSaveQRCode = useCallback(() => {
    if (!qrValue) return;
    const newQRCode: SavedQRCode = {
      id: Date.now().toString(),
      name: `${mode.toUpperCase()} QR Code`,
      mode,
      input: qrValue,
      options,
      createdAt: Date.now(),
    };
    setSavedQRCodes((prev) => [newQRCode, ...prev]);
  }, [qrValue, mode, options]);

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${theme === "dark" ? "bg-[#0B0F19] text-white" : "bg-[#F8FAFC] text-slate-900"}`}
    >
      <div className="container mx-auto px-4 py-8 lg:py-12 relative z-10">
        <Header
          theme={theme}
          toggleTheme={toggleTheme}
          onToggleHistory={() => setShowHistory(!showHistory)}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Panel - Configurations */}
          <motion.div
            className="lg:col-span-8 space-y-8"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <ModeSelector mode={mode} setMode={setMode} />
            <InputFields mode={mode} onValueChange={setQrValue} />
            <CustomizationPanel options={options} setOptions={setOptions} />
          </motion.div>

          {/* Right Panel - Sticky Preview */}
          <motion.div
            className="lg:col-span-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <PreviewCard
              qrValue={qrValue}
              options={options}
              onSave={handleSaveQRCode}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

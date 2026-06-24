"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

import Header from "./components/header";
import ModeSelector from "./components/ModeSelector";
import InputFields from "./components/InputFields";
import CustomizationPanel from "./components/CustomizationPanel";
import PreviewCard from "./components/PreviewCard";

import type { Mode, QRCodeOptions } from "./types/types";
import { MdBolt, MdBrush, MdCode } from "react-icons/md";
import Footer from "./components/footer";

const DEFAULT_OPTIONS: QRCodeOptions = {
  // Base Geometry
  shape: "square",
  size: 280,
  margin: 0,
  errorCorrectionLevel: "H",
  includeMargin: true,

  // Global Fallbacks
  fgColor: "#0F172A",
  bgColor: "#FFFFFF",

  // Matrix Dots
  dotsColorMode: "single",
  dotsColor: "#0F172A",
  dotsGradient: {
    type: "linear",
    rotation: 0,
    colorStops: [
      { offset: 0, color: "#0F172A" },
      { offset: 1, color: "#0F172A" },
    ],
  },
  dotStyle: "square",

  cornerSquareColorMode: "single",
  cornerSquareColor: "#0F172A",
  cornerSquareGradient: {
    type: "linear",
    rotation: 0,
    colorStops: [
      { offset: 0, color: "#0F172A" },
      { offset: 1, color: "#0F172A" },
    ],
  },
  cornerSquareStyle: "square",

  cornerDotColorMode: "single",
  cornerDotColor: "#0F172A",
  cornerDotGradient: {
    type: "linear",
    rotation: 0,
    colorStops: [
      { offset: 0, color: "#0F172A" },
      { offset: 1, color: "#0F172A" },
    ],
  },
  cornerDotStyle: "square",

  bgColorMode: "single",
  bgGradient: {
    type: "linear",
    rotation: 0,
    colorStops: [
      { offset: 0, color: "#FFFFFF" },
      { offset: 1, color: "#FFFFFF" },
    ],
  },

  logoImage: null,
  logoSize: 0.4,
  logoMargin: 0,
  hideBackgroundDots: true,

  // Outer Frames & CTA
  frameStyle: "none",
  frameText: "SCAN ME",
  frameColor: "#0F172A",
};
export default function App() {
  const [mode, setMode] = useState<Mode>("link");
  const [qrValue, setQrValue] = useState<string>("https://quintile.vercel.app");
  const [options, setOptions] = useState<QRCodeOptions>(DEFAULT_OPTIONS);

  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("qrTheme");
    if (savedTheme) setTheme(savedTheme as "light" | "dark");
  }, []);

  useEffect(() => {
    localStorage.setItem("qrTheme", theme);
    if (theme === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [theme]);

  const toggleTheme = () => setTheme((p) => (p === "light" ? "dark" : "light"));

  return (
    <>
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
              <PreviewCard qrValue={qrValue} options={options} />
            </motion.div>
          </div>
        </div>
      </div>
      <div className="w-full border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B0F19] transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
          {/* --- ABOUT SECTION --- */}
          <div className="text-center max-w-3xl mx-auto mb-32">
            <div className="flex items-center justify-center text-3xl mx-auto mb-8 dark:invert">
              <img src="/logo.svg" alt="" />
            </div>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-4 lexend-600">
              About Quintile
            </h2>
            <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl lexend-300">
              The absolute pinnacle of QR.
            </p>
            <p className="mt-6 text-lg text-slate-600 dark:text-slate-400 leading-relaxed lexend-400">
              Quintile is, was and will a simple app which was primarily made
              for custom QR codes. But it got abondoned later on due to other
              services. It has been revived again and is now actively
              maintained. This app allows you to generate custom qr codes
              according to your likings for various tasks and purposes. You can
              do whatever you want in this as It is not able to track or send
              anything outside your local machine - means it's privacy slop.
            </p>
          </div>

          {/* --- FEATURES GRID --- */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-32">
            <div className="flex flex-col space-y-4">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-center text-slate-800 dark:text-slate-200">
                <MdBrush size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white lexend-400">
                Vector Output
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed lexend-300">
                Ditch the pixelated PNGs. Quintile renders pure SVG matrices
                that scale from business cards to billboards with zero loss in
                fidelity.
              </p>
            </div>

            <div className="flex flex-col space-y-4">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-center text-slate-800 dark:text-slate-200">
                <MdBolt size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white lexend-400">
                Client-Side Rendering
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed lexend-300">
                Your data never leaves your browser. Our engine compiles the QR
                entirely client-side, ensuring absolute privacy and
                instantaneous updates.
              </p>
            </div>

            <div className="flex flex-col space-y-4">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-center text-slate-800 dark:text-slate-200">
                <MdCode size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white lexend-400">
                Advanced Topologies
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed lexend-300">
                Unlock halftone circular routing, fluid block connections, and
                custom target eyes. Full control over the error-correction
                matrix.
              </p>
            </div>
          </div>
        </div>

        {/* --- MINIMAL FOOTER --- */}
        <Footer />
      </div>
    </>
  );
}

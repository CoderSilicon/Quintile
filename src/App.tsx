"use client";

import type React from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import QRCode from "react-qr-code";
import { QRCodeCanvas } from "qrcode.react"; // For advanced QR code features
import {
  MdOutlineDarkMode,
  MdOutlineLightMode,
  MdFileDownload,
  MdHistory,
  MdSave,
  MdDelete,
  MdEdit,
  MdClose,
  MdAdd,
  MdCheck,
  MdChevronLeft,
} from "react-icons/md";
import "./index.css";

type Mode = "text" | "link" | "email" | "phone" | "sms" | "wifi" | "vcard";
type ErrorCorrectionLevel = "L" | "M" | "Q" | "H";
type QRCodeStyle = "dots" | "squares" | "rounded";

interface QRCodeOptions {
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

interface SavedQRCode {
  id: string;
  name: string;
  mode: Mode;
  input: string;
  options: QRCodeOptions;
  createdAt: number;
}

const DEFAULT_OPTIONS: QRCodeOptions = {
  bgColor: "#FFFFFF",
  fgColor: "#000000",
  size: 256,
  errorCorrectionLevel: "M",
  style: "squares",
  includeMargin: true,
  logoImage: null,
  logoWidth: 50,
  logoHeight: 50,
};

const QRCodeGenerator: React.FC = () => {
  const [mode, setMode] = useState<Mode>("text");
  const [input, setInput] = useState<string>("");
  const [options, setOptions] = useState<QRCodeOptions>(DEFAULT_OPTIONS);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [savedQRCodes, setSavedQRCodes] = useState<SavedQRCode[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [qrName, setQrName] = useState<string>("");
  const [advancedMode, setAdvancedMode] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const [errorCorrectionOpen, setErrorCorrectionOpen] = useState(false);
  const [qrStyleOpen, setQrStyleOpen] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState<
    "idle" | "downloading" | "success" | "error"
  >("idle");

  const qrCodeRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const saveDialogRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Form fields for different modes
  const [emailFields, setEmailFields] = useState({
    to: "",
    subject: "",
    body: "",
  });
  const [phoneField, setPhoneField] = useState("");
  const [smsFields, setSmsFields] = useState({ number: "", message: "" });
  const [wifiFields, setWifiFields] = useState({
    ssid: "",
    password: "",
    encryption: "WPA",
  });
  const [vcardFields, setVcardFields] = useState({
    firstName: "",
    lastName: "",
    organization: "",
    title: "",
    email: "",
    phone: "",
    website: "",
    address: "",
  });

  // Handle clicks outside of modals
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        saveDialogRef.current &&
        !saveDialogRef.current.contains(event.target as Node)
      ) {
        setShowSaveDialog(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    // Load saved QR codes from localStorage
    const savedCodes = localStorage.getItem("savedQRCodes");
    if (savedCodes) {
      setSavedQRCodes(JSON.parse(savedCodes));
    }

    // Load theme preference
    const savedTheme = localStorage.getItem("qrTheme");
    if (savedTheme) {
      setTheme(savedTheme as "light" | "dark");
    }

    // Handle responsive sizing
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 340) {
        setOptions((prev) => ({ ...prev, size: Math.min(width - 32, 200) }));
      } else if (width < 640) {
        setOptions((prev) => ({ ...prev, size: Math.min(width - 64, 256) }));
      } else {
        setOptions((prev) => ({ ...prev, size: 256 }));
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    // Save theme preference
    localStorage.setItem("qrTheme", theme);

    // Apply theme to document
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  useEffect(() => {
    // Save QR codes to localStorage when they change
    localStorage.setItem("savedQRCodes", JSON.stringify(savedQRCodes));
  }, [savedQRCodes]);

  useEffect(() => {
    // Handle logo file upload
    if (logoFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setOptions((prev) => ({
            ...prev,
            logoImage: e.target?.result as string,
          }));
        }
      };
      reader.readAsDataURL(logoFile);
    }
  }, [logoFile]);

  // Generate QR code value based on mode
  const getQRValue = useCallback((): string => {
    switch (mode) {
      case "text":
        return input;
      case "link":
        return input.startsWith("http") ? input : `https://${input}`;
      case "email":
        return `mailto:${emailFields.to}?subject=${encodeURIComponent(
          emailFields.subject
        )}&body=${encodeURIComponent(emailFields.body)}`;
      case "phone":
        return `tel:${phoneField}`;
      case "sms":
        return `sms:${smsFields.number}?body=${encodeURIComponent(
          smsFields.message
        )}`;
      case "wifi":
        return `WIFI:S:${wifiFields.ssid};T:${wifiFields.encryption};P:${wifiFields.password};;`;
      case "vcard":
        return `BEGIN:VCARD
VERSION:3.0
N:${vcardFields.lastName};${vcardFields.firstName};;;
FN:${vcardFields.firstName} ${vcardFields.lastName}
ORG:${vcardFields.organization}
TITLE:${vcardFields.title}
EMAIL:${vcardFields.email}
TEL:${vcardFields.phone}
URL:${vcardFields.website}
ADR:;;${vcardFields.address};;;
END:VCARD`;
      default:
        return input;
    }
  }, [
    mode,
    input,
    emailFields,
    phoneField,
    smsFields,
    wifiFields,
    vcardFields,
  ]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  const downloadQRCode = () => {
    if (!qrCodeRef.current) return;

    setDownloadStatus("downloading");

    try {
      // Get the QR code SVG element
      const svgElement = qrCodeRef.current.querySelector("svg");
      const canvas = qrCodeRef.current.querySelector("canvas");

      if (canvas) {
        // If we have a canvas element (from QRCodeCanvas), use it directly
        downloadFromCanvas(canvas);
      } else if (svgElement) {
        // If we have an SVG element (from QRCode), convert it to canvas first
        convertSvgToCanvas(svgElement);
      } else {
        console.error("No QR code element found");
        setDownloadStatus("error");
      }
    } catch (error) {
      console.error("Error in download process:", error);
      setDownloadStatus("error");
    }
  };

  const convertSvgToCanvas = (svgElement: SVGElement) => {
    // Get the SVG data
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgSize = options.size;

    // Create a canvas element
    const canvas = document.createElement("canvas");
    canvas.width = svgSize;
    canvas.height = svgSize;
    canvasRef.current = canvas;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.error("Could not get canvas context");
      setDownloadStatus("error");
      return;
    }

    // Create an image to draw on canvas
    const img = new Image();
    img.onload = () => {
      // Fill with white background (in case of transparency)
      ctx.fillStyle = options.bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw the SVG image on the canvas
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Download the canvas as PNG
      downloadFromCanvas(canvas);
    };

    img.onerror = (error) => {
      console.error("Error loading SVG image:", error);
      setDownloadStatus("error");
    };

    // Set the source of the image to the SVG data
    img.src =
      "data:image/svg+xml;base64," +
      btoa(unescape(encodeURIComponent(svgData)));
  };

  const downloadFromCanvas = (canvas: HTMLCanvasElement) => {
    try {
      // Create a temporary link element
      const link = document.createElement("a");

      // Set the download attribute and file name
      link.download = "qrcode.png";

      // Convert canvas to data URL
      link.href = canvas.toDataURL("image/png");

      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();

      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
        setDownloadStatus("success");

        // Reset status after a delay
        setTimeout(() => {
          setDownloadStatus("idle");
        }, 2000);
      }, 100);
    } catch (error) {
      console.error("Error downloading from canvas:", error);
      setDownloadStatus("error");
    }
  };

  const saveQRCode = () => {
    if (!input) return;

    const newQRCode: SavedQRCode = {
      id: Date.now().toString(),
      name: qrName || `QR Code ${savedQRCodes.length + 1}`,
      mode,
      input: getQRValue(),
      options,
      createdAt: Date.now(),
    };

    setSavedQRCodes((prev) => [newQRCode, ...prev]);
    setQrName("");
    setShowSaveDialog(false);
  };

  const deleteQRCode = (id: string) => {
    setSavedQRCodes((prev) => prev.filter((code) => code.id !== id));
  };

  const loadQRCode = (saved: SavedQRCode) => {
    setMode(saved.mode);
    setInput(saved.input);
    setOptions(saved.options);
    setShowHistory(false);
  };

  const handleLogoUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const removeLogo = () => {
    setOptions((prev) => ({ ...prev, logoImage: null }));
    setLogoFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const renderInputFields = () => {
    switch (mode) {
      case "text":
      case "link":
        return (
          <div className="space-y-2">
            <label
              htmlFor="input"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {mode === "text" ? "Text Content" : "URL"}
            </label>
            <input
              id="input"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder={
                mode === "text"
                  ? "Enter your text here"
                  : "Enter URL (e.g., example.com)"
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </div>
        );

      case "email":
        return (
          <div className="space-y-4">
            <div>
              <label
                htmlFor="email-to"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Email Address
              </label>
              <input
                id="email-to"
                type="email"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="recipient@example.com"
                value={emailFields.to}
                onChange={(e) =>
                  setEmailFields({ ...emailFields, to: e.target.value })
                }
              />
            </div>
            <div>
              <label
                htmlFor="email-subject"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Subject
              </label>
              <input
                id="email-subject"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Email subject"
                value={emailFields.subject}
                onChange={(e) =>
                  setEmailFields({ ...emailFields, subject: e.target.value })
                }
              />
            </div>
            <div>
              <label
                htmlFor="email-body"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Message
              </label>
              <textarea
                id="email-body"
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Email body"
                rows={3}
                value={emailFields.body}
                onChange={(e) =>
                  setEmailFields({ ...emailFields, body: e.target.value })
                }
              />
            </div>
          </div>
        );

      case "phone":
        return (
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Phone Number
            </label>
            <input
              id="phone"
              type="tel"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="+1234567890"
              value={phoneField}
              onChange={(e) => setPhoneField(e.target.value)}
            />
          </div>
        );

      case "sms":
        return (
          <div className="space-y-4">
            <div>
              <label
                htmlFor="sms-number"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Phone Number
              </label>
              <input
                id="sms-number"
                type="tel"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="+1234567890"
                value={smsFields.number}
                onChange={(e) =>
                  setSmsFields({ ...smsFields, number: e.target.value })
                }
              />
            </div>
            <div>
              <label
                htmlFor="sms-message"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Message
              </label>
              <textarea
                id="sms-message"
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="SMS message"
                rows={3}
                value={smsFields.message}
                onChange={(e) =>
                  setSmsFields({ ...smsFields, message: e.target.value })
                }
              />
            </div>
          </div>
        );

      case "wifi":
        return (
          <div className="space-y-4">
            <div>
              <label
                htmlFor="wifi-ssid"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Network Name (SSID)
              </label>
              <input
                id="wifi-ssid"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="WiFi network name"
                value={wifiFields.ssid}
                onChange={(e) =>
                  setWifiFields({ ...wifiFields, ssid: e.target.value })
                }
              />
            </div>
            <div>
              <label
                htmlFor="wifi-password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Password
              </label>
              <input
                id="wifi-password"
                type="password"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="WiFi password"
                value={wifiFields.password}
                onChange={(e) =>
                  setWifiFields({ ...wifiFields, password: e.target.value })
                }
              />
            </div>
            <div>
              <label
                htmlFor="wifi-encryption"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Encryption Type
              </label>
              <div className="relative">
                <select
                  id="wifi-encryption"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white appearance-none"
                  value={wifiFields.encryption}
                  onChange={(e) =>
                    setWifiFields({ ...wifiFields, encryption: e.target.value })
                  }
                >
                  <option value="WPA">WPA/WPA2</option>
                  <option value="WEP">WEP</option>
                  <option value="nopass">No Password</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <MdChevronLeft className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        );

      case "vcard":
        return (
          <div className="space-y-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="vcard-firstname"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                First Name
              </label>
              <input
                id="vcard-firstname"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="First name"
                value={vcardFields.firstName}
                onChange={(e) =>
                  setVcardFields({ ...vcardFields, firstName: e.target.value })
                }
              />
            </div>
            <div>
              <label
                htmlFor="vcard-lastname"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Last Name
              </label>
              <input
                id="vcard-lastname"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Last name"
                value={vcardFields.lastName}
                onChange={(e) =>
                  setVcardFields({ ...vcardFields, lastName: e.target.value })
                }
              />
            </div>
            <div>
              <label
                htmlFor="vcard-organization"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Organization
              </label>
              <input
                id="vcard-organization"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Company or organization"
                value={vcardFields.organization}
                onChange={(e) =>
                  setVcardFields({
                    ...vcardFields,
                    organization: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <label
                htmlFor="vcard-title"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Job Title
              </label>
              <input
                id="vcard-title"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Job title"
                value={vcardFields.title}
                onChange={(e) =>
                  setVcardFields({ ...vcardFields, title: e.target.value })
                }
              />
            </div>
            <div>
              <label
                htmlFor="vcard-email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Email
              </label>
              <input
                id="vcard-email"
                type="email"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Email address"
                value={vcardFields.email}
                onChange={(e) =>
                  setVcardFields({ ...vcardFields, email: e.target.value })
                }
              />
            </div>
            <div>
              <label
                htmlFor="vcard-phone"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Phone
              </label>
              <input
                id="vcard-phone"
                type="tel"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Phone number"
                value={vcardFields.phone}
                onChange={(e) =>
                  setVcardFields({ ...vcardFields, phone: e.target.value })
                }
              />
            </div>
            <div>
              <label
                htmlFor="vcard-website"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Website
              </label>
              <input
                id="vcard-website"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Website URL"
                value={vcardFields.website}
                onChange={(e) =>
                  setVcardFields({ ...vcardFields, website: e.target.value })
                }
              />
            </div>
            <div className="md:col-span-2">
              <label
                htmlFor="vcard-address"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Address
              </label>
              <textarea
                id="vcard-address"
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Full address"
                rows={2}
                value={vcardFields.address}
                onChange={(e) =>
                  setVcardFields({ ...vcardFields, address: e.target.value })
                }
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Update input when form fields change
  useEffect(() => {
    if (mode !== "text" && mode !== "link") {
      setInput(getQRValue());
    }
  }, [mode, getQRValue]);

  // Custom tooltip component
  const Tooltip = ({ id, text }: { id: string; text: string }) => {
    return (
      <div
        className={`absolute z-10 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded-md shadow-sm transition-opacity duration-200 ${
          showTooltip === id ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        style={{
          bottom: "100%",
          left: "50%",
          transform: "translateX(-50%) translateY(-4px)",
        }}
      >
        {text}
        <div
          className="absolute w-2 h-2 bg-gray-900 transform rotate-45"
          style={{ bottom: "-4px", left: "50%", marginLeft: "-4px" }}
        ></div>
      </div>
    );
  };

  // Custom slider component
  const Slider = ({
    value,
    min,
    max,
    step,
    onChange,
  }: {
    value: number;
    min: number;
    max: number;
    step: number;
    onChange: (value: number) => void;
  }) => {
    return (
      <div className="relative w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
        <div
          className="absolute h-2 bg-blue-500 rounded-full"
          style={{ width: `${((value - min) / (max - min)) * 100}%` }}
        ></div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute w-full h-2 opacity-0 cursor-pointer"
        />
      </div>
    );
  };

  // Custom switch component
  const Switch = ({
    checked,
    onChange,
  }: {
    checked: boolean;
    onChange: (checked: boolean) => void;
  }) => {
    return (
      <button
        type="button"
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          checked ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-700"
        }`}
        onClick={() => onChange(!checked)}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform ${
            checked ? "translate-x-5" : "translate-x-1"
          }`}
        />
      </button>
    );
  };

  return (
    <div
      className={`container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-6xl ${theme}`}
    >
      <motion.div
        className="flex justify-between items-center mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100">
          Quintile - QR Code Generator
        </h1>

        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              className="p-2 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={toggleTheme}
              onMouseEnter={() => setShowTooltip("theme")}
              onMouseLeave={() => setShowTooltip(null)}
            >
              {theme === "light" ? (
                <MdOutlineDarkMode size={20} />
              ) : (
                <MdOutlineLightMode size={20} />
              )}
              <span className="sr-only">Toggle theme</span>
            </button>
            <Tooltip id="theme" text="Toggle theme" />
          </div>

          <div className="relative">
            <button
              className="p-2 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={() => setShowHistory(!showHistory)}
              onMouseEnter={() => setShowTooltip("history")}
              onMouseLeave={() => setShowTooltip(null)}
            >
              <MdHistory size={20} />
              <span className="sr-only">History</span>
            </button>
            <Tooltip id="history" text="View saved QR codes" />
          </div>
        </div>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-4 sm:gap-8">
        {/* Left Panel - QR Code Options */}
        <motion.div
          className="w-full lg:w-1/2 space-y-4 sm:space-y-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              QR Code Type
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {(
                [
                  "text",
                  "link",
                  "email",
                  "phone",
                  "sms",
                  "wifi",
                  "vcard",
                ] as const
              ).map((option) => (
                <motion.button
                  key={option}
                  onClick={() => setMode(option)}
                  className={`py-2 px-3 rounded-md transition-colors text-sm ${
                    mode === option
                      ? "bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </motion.button>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Content
            </h2>
            {renderInputFields()}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Customization
              </h2>
              <div className="flex items-center gap-2">
                <label
                  htmlFor="advanced-mode"
                  className="text-sm text-gray-700 dark:text-gray-300"
                >
                  Advanced
                </label>
                <Switch checked={advancedMode} onChange={setAdvancedMode} />
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Background
                  </label>
                  <input
                    type="color"
                    value={options.bgColor}
                    onChange={(e) =>
                      setOptions({ ...options, bgColor: e.target.value })
                    }
                    className="w-full h-10 rounded-md cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Foreground
                  </label>
                  <input
                    type="color"
                    value={options.fgColor}
                    onChange={(e) =>
                      setOptions({ ...options, fgColor: e.target.value })
                    }
                    className="w-full h-10 rounded-md cursor-pointer"
                  />
                </div>
              </div>

              {advancedMode && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      QR Code Size
                    </label>
                    <Slider
                      value={options.size}
                      min={128}
                      max={512}
                      step={8}
                      onChange={(value) =>
                        setOptions({ ...options, size: value })
                      }
                    />
                    <div className="text-xs text-right text-gray-500 dark:text-gray-400 mt-1">
                      {options.size}px
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Error Correction
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        className="relative w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        onClick={() =>
                          setErrorCorrectionOpen(!errorCorrectionOpen)
                        }
                      >
                        <span className="block truncate">
                          {options.errorCorrectionLevel === "L" && "Low (7%)"}
                          {options.errorCorrectionLevel === "M" &&
                            "Medium (15%)"}
                          {options.errorCorrectionLevel === "Q" &&
                            "Quartile (25%)"}
                          {options.errorCorrectionLevel === "H" && "High (30%)"}
                        </span>
                        <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                          <MdChevronLeft
                            className="h-5 w-5 text-gray-400"
                            aria-hidden="true"
                          />
                        </span>
                      </button>

                      {errorCorrectionOpen && (
                        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                          {(["L", "M", "Q", "H"] as const).map((level) => (
                            <button
                              key={level}
                              className={`${
                                options.errorCorrectionLevel === level
                                  ? "text-white bg-blue-600"
                                  : "text-gray-900 dark:text-gray-100"
                              } cursor-default select-none relative py-2 pl-3 pr-9 w-full text-left hover:bg-gray-100 dark:hover:bg-gray-600`}
                              onClick={() => {
                                setOptions({
                                  ...options,
                                  errorCorrectionLevel: level,
                                });
                                setErrorCorrectionOpen(false);
                              }}
                            >
                              <span className="block truncate">
                                {level === "L" && "Low (7%)"}
                                {level === "M" && "Medium (15%)"}
                                {level === "Q" && "Quartile (25%)"}
                                {level === "H" && "High (30%)"}
                              </span>
                              {options.errorCorrectionLevel === level && (
                                <span className="absolute inset-y-0 right-0 flex items-center pr-4">
                                  <MdCheck
                                    className="h-5 w-5"
                                    aria-hidden="true"
                                  />
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Higher correction allows for more damage to the QR code
                      while remaining scannable.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      QR Style
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        className="relative w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        onClick={() => setQrStyleOpen(!qrStyleOpen)}
                      >
                        <span className="block truncate">
                          {options.style === "squares" && "Squares"}
                          {options.style === "dots" && "Dots"}
                          {options.style === "rounded" && "Rounded"}
                        </span>
                        <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                          <MdChevronLeft
                            className="h-5 w-5 text-gray-400"
                            aria-hidden="true"
                          />
                        </span>
                      </button>

                      {qrStyleOpen && (
                        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                          {(["squares", "dots", "rounded"] as const).map(
                            (style) => (
                              <button
                                key={style}
                                className={`${
                                  options.style === style
                                    ? "text-white bg-blue-600"
                                    : "text-gray-900 dark:text-gray-100"
                                } cursor-default select-none relative py-2 pl-3 pr-9 w-full text-left hover:bg-gray-100 dark:hover:bg-gray-600`}
                                onClick={() => {
                                  setOptions({ ...options, style: style });
                                  setQrStyleOpen(false);
                                }}
                              >
                                <span className="block truncate">
                                  {style.charAt(0).toUpperCase() +
                                    style.slice(1)}
                                </span>
                                {options.style === style && (
                                  <span className="absolute inset-y-0 right-0 flex items-center pr-4">
                                    <MdCheck
                                      className="h-5 w-5"
                                      aria-hidden="true"
                                    />
                                  </span>
                                )}
                              </button>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Include Margin
                    </label>
                    <div className="flex items-center">
                      <Switch
                        checked={options.includeMargin}
                        onChange={(checked) =>
                          setOptions({ ...options, includeMargin: checked })
                        }
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        {options.includeMargin ? "Yes" : "No"}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Logo
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onClick={handleLogoUpload}
                      >
                        <MdAdd className="inline-block mr-1" /> Add Logo
                      </button>

                      {options.logoImage && (
                        <button
                          className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          onClick={removeLogo}
                        >
                          <MdDelete className="inline-block mr-1" /> Remove Logo
                        </button>
                      )}

                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setLogoFile(e.target.files[0]);
                          }
                        }}
                      />
                    </div>

                    {options.logoImage && (
                      <div className="mt-2">
                        <div className="flex items-center gap-4 mt-2">
                          <img
                            src={options.logoImage || "/placeholder.svg"}
                            alt="Logo"
                            className="w-12 h-12 object-contain border rounded"
                          />
                          <div className="flex-1">
                            <label className="text-xs text-gray-700 dark:text-gray-300">
                              Logo Size
                            </label>
                            <Slider
                              value={options.logoWidth}
                              min={20}
                              max={150}
                              step={5}
                              onChange={(value) =>
                                setOptions({
                                  ...options,
                                  logoWidth: value,
                                  logoHeight: value,
                                })
                              }
                            />
                            <div className="text-xs text-right text-gray-500 dark:text-gray-400">
                              {options.logoWidth}px
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Use high error correction when adding a logo
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* Right Panel - QR Code Preview */}
        <motion.div
          className="w-full lg:w-1/2 flex flex-col items-center justify-start"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 w-full">
            <h2 className="text-lg font-semibold mb-4 text-center text-gray-900 dark:text-gray-100">
              Preview
            </h2>

            <div className="flex flex-col items-center">
              <AnimatePresence mode="wait">
                {getQRValue() && (
                  <motion.div
                    key="qr-code"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-lg mb-4"
                    ref={qrCodeRef}
                  >
                    {advancedMode ? (
                      <QRCodeCanvas
                        value={getQRValue()}
                        size={options.size}
                        bgColor={options.bgColor}
                        fgColor={options.fgColor}
                        level={options.errorCorrectionLevel}
                        includeMargin={options.includeMargin}
                        imageSettings={
                          options.logoImage
                            ? {
                                src: options.logoImage,
                                x: undefined,
                                y: undefined,
                                height: options.logoHeight,
                                width: options.logoWidth,
                                excavate: true,
                              }
                            : undefined
                        }
                      />
                    ) : (
                      <QRCode
                        value={getQRValue()}
                        size={options.size}
                        bgColor={options.bgColor}
                        fgColor={options.fgColor}
                      />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {!getQRValue() && (
                <div className="text-center text-gray-500 dark:text-gray-400 mb-4">
                  Enter content to generate a QR code
                </div>
              )}

              {getQRValue() && (
                <div className="w-full space-y-4">
                  <div className="flex flex-wrap gap-2 justify-center">
                    <button
                      className={`flex items-center px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        downloadStatus === "downloading"
                          ? "bg-blue-400 text-white cursor-wait"
                          : downloadStatus === "success"
                          ? "bg-green-600 text-white"
                          : downloadStatus === "error"
                          ? "bg-red-600 text-white"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                      onClick={downloadQRCode}
                      disabled={downloadStatus === "downloading"}
                    >
                      <MdFileDownload className="mr-2" />
                      {downloadStatus === "downloading"
                        ? "Downloading..."
                        : downloadStatus === "success"
                        ? "Downloaded!"
                        : downloadStatus === "error"
                        ? "Try Again"
                        : "Download "}
                    </button>

                    <button
                      className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      onClick={() => setShowSaveDialog(true)}
                    >
                      <MdSave className="mr-2" /> Save
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            ref={saveDialogRef}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Save QR Code
              </h3>
              <button
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
                onClick={() => setShowSaveDialog(false)}
              >
                <MdClose size={20} />
                <span className="sr-only">Close</span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="qr-name"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Name
                </label>
                <input
                  id="qr-name"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter a name for this QR code"
                  value={qrName}
                  onChange={(e) => setQrName(e.target.value)}
                />
              </div>
              <button
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                onClick={saveQRCode}
              >
                Save QR Code
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Sidebar */}
      {showHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Saved QR Codes
              </h3>
              <button
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
                onClick={() => setShowHistory(false)}
              >
                <MdClose size={20} />
                <span className="sr-only">Close</span>
              </button>
            </div>

            <div className="overflow-y-auto flex-1">
              {savedQRCodes.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No saved QR codes yet
                </div>
              ) : (
                <div className="space-y-4">
                  {savedQRCodes.map((saved) => (
                    <div
                      key={saved.id}
                      className="flex items-center gap-4 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <div className="bg-white p-2 rounded">
                        <QRCode
                          value={saved.input}
                          size={60}
                          bgColor={saved.options.bgColor}
                          fgColor={saved.options.fgColor}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate text-gray-900 dark:text-gray-100">
                          {saved.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {new Date(saved.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          className="p-1 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
                          onClick={() => loadQRCode(saved)}
                        >
                          <MdEdit size={18} />
                          <span className="sr-only">Edit</span>
                        </button>
                        <button
                          className="p-1 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
                          onClick={() => deleteQRCode(saved.id)}
                        >
                          <MdDelete size={18} />
                          <span className="sr-only">Delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRCodeGenerator;

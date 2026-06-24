import { useState, useEffect } from "react";
import type { Mode } from "../types/types";

interface InputFieldsProps {
  mode: Mode;
  onValueChange: (value: string) => void;
}

const InputClass = "w-full px-3 py-2 bg-transparent border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-slate-900 dark:focus:border-slate-100 transition-colors text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 lexend-300";
const SelectClass = "w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-slate-900 dark:focus:border-slate-100 transition-colors text-sm text-slate-900 dark:text-slate-100";
const LabelClass = "block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5";

export default function InputFields({ mode, onValueChange }: InputFieldsProps) {
  // State definitions for all modes
  const [basicInput, setBasicInput] = useState("https://quintile.vercel.app");
  const [emailFields, setEmailFields] = useState({ to: "", subject: "", body: "" });
  const [phoneField, setPhoneField] = useState("");
  const [smsFields, setSmsFields] = useState({ phone: "", message: "" });
  const [wifiFields, setWifiFields] = useState({ ssid: "", password: "", encryption: "WPA" });
  const [vcardFields, setVcardFields] = useState({
    firstName: "",
    lastName: "",
    organization: "",
    phone: "",
    email: "",
    url: ""
  });

  // Comprehensive standard-compliant string serialization loop
  useEffect(() => {
    let finalValue = "";
    switch (mode) {
      case "text":
        finalValue = `TEXT:${basicInput}`;
        break;
      case "link":
        finalValue = basicInput.startsWith("http") ? basicInput : `https://${basicInput}`;
        break;
      case "email":
        finalValue = `mailto:${emailFields.to}?subject=${encodeURIComponent(emailFields.subject)}&body=${encodeURIComponent(emailFields.body)}`;
        break;
      case "phone":
        finalValue = `tel:${phoneField}`;
        break;
      case "sms":
        finalValue = `SMSTO:${smsFields.phone}:${smsFields.message}`;
        break;
      case "wifi":
        finalValue = `WIFI:S:${wifiFields.ssid};T:${wifiFields.encryption};P:${wifiFields.password};;`;
        break;
      case "vcard":
        finalValue = [
          "BEGIN:VCARD",
          "VERSION:3.0",
          `N:${vcardFields.lastName};${vcardFields.firstName};;;`,
          `FN:${vcardFields.firstName} ${vcardFields.lastName}`.trim(),
          vcardFields.organization ? `ORG:${vcardFields.organization}` : "",
          vcardFields.phone ? `TEL:${vcardFields.phone}` : "",
          vcardFields.email ? `EMAIL:${vcardFields.email}` : "",
          vcardFields.url ? `URL:${vcardFields.url}` : "",
          "END:VCARD"
        ].filter(Boolean).join("\n");
        break;
      default:
        finalValue = basicInput;
    }
    onValueChange(finalValue);
  }, [mode, basicInput, emailFields, phoneField, smsFields, wifiFields, vcardFields, onValueChange]);

  return (
    <div className="flex flex-col space-y-4">
      <h2 className="text-xs tracking-widest text-slate-500 dark:text-slate-400 lexend-400">
        2. Enter Details
      </h2>
      
      <div className="space-y-4">
        {/* TEXT & LINK */}
        {(mode === "text" || mode === "link") && (
          <div>
            <label className={LabelClass}>{mode === "text" ? "Text Content" : "URL Destination"}</label>
            <input
              className={InputClass}
              placeholder={mode === "text" ? "Type something interesting..." : "example.com"}
              value={basicInput}
              onChange={(e) => setBasicInput(e.target.value)}
            />
          </div>
        )}

        {/* EMAIL */}
        {mode === "email" && (
          <div className="space-y-4">
            <div>
              <label className={LabelClass}>Recipient Email</label>
              <input type="email" className={InputClass} placeholder="hello@world.com" value={emailFields.to} onChange={(e) => setEmailFields({ ...emailFields, to: e.target.value })} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={LabelClass}>Subject</label>
                <input className={InputClass} placeholder="Meeting notes" value={emailFields.subject} onChange={(e) => setEmailFields({ ...emailFields, subject: e.target.value })} />
              </div>
              <div>
                <label className={LabelClass}>Message</label>
                <input className={InputClass} placeholder="Body content..." value={emailFields.body} onChange={(e) => setEmailFields({ ...emailFields, body: e.target.value })} />
              </div>
            </div>
          </div>
        )}

        {/* PHONE */}
        {mode === "phone" && (
          <div>
             <label className={LabelClass}>Phone Number</label>
             <input type="tel" className={InputClass} placeholder="+1 234 567 8900" value={phoneField} onChange={(e) => setPhoneField(e.target.value)} />
          </div>
        )}

        {/* SMS */}
        {mode === "sms" && (
          <div className="space-y-4">
            <div>
              <label className={LabelClass}>Recipient Phone Number</label>
              <input type="tel" className={InputClass} placeholder="+1 234 567 8900" value={smsFields.phone} onChange={(e) => setSmsFields({ ...smsFields, phone: e.target.value })} />
            </div>
            <div>
              <label className={LabelClass}>Message</label>
              <textarea className={InputClass} rows={3} placeholder="Type your text message here..." value={smsFields.message} onChange={(e) => setSmsFields({ ...smsFields, message: e.target.value })} />
            </div>
          </div>
        )}

        {/* WIFI */}
        {mode === "wifi" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={LabelClass}>Network Name (SSID)</label>
                <input className={InputClass} placeholder="Home_Network" value={wifiFields.ssid} onChange={(e) => setWifiFields({ ...wifiFields, ssid: e.target.value })} />
              </div>
              <div>
                <label className={LabelClass}>Network Type</label>
                <select className={SelectClass} value={wifiFields.encryption} onChange={(e) => setWifiFields({ ...wifiFields, encryption: e.target.value })}>
                  <option value="WPA">WPA/WPA2</option>
                  <option value="WEP">WEP</option>
                  <option value="nopass">Unencrypted (Open)</option>
                </select>
              </div>
            </div>
            {wifiFields.encryption !== "nopass" && (
              <div>
                <label className={LabelClass}>Password</label>
                <input type="password" className={InputClass} placeholder="••••••••" value={wifiFields.password} onChange={(e) => setWifiFields({ ...wifiFields, password: e.target.value })} />
              </div>
            )}
          </div>
        )}

        {/* VCARD (CONTACT) */}
        {mode === "vcard" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={LabelClass}>First Name</label>
                <input className={InputClass} placeholder="Jane" value={vcardFields.firstName} onChange={(e) => setVcardFields({ ...vcardFields, firstName: e.target.value })} />
              </div>
              <div>
                <label className={LabelClass}>Last Name</label>
                <input className={InputClass} placeholder="Doe" value={vcardFields.lastName} onChange={(e) => setVcardFields({ ...vcardFields, lastName: e.target.value })} />
              </div>
            </div>
            <div>
              <label className={LabelClass}>Organization</label>
              <input className={InputClass} placeholder="Acme Corp" value={vcardFields.organization} onChange={(e) => setVcardFields({ ...vcardFields, organization: e.target.value })} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={LabelClass}>Phone Number</label>
                <input type="tel" className={InputClass} placeholder="+1 234 567 8900" value={vcardFields.phone} onChange={(e) => setVcardFields({ ...vcardFields, phone: e.target.value })} />
              </div>
              <div>
                <label className={LabelClass}>Email Address</label>
                <input type="email" className={InputClass} placeholder="jane.doe@example.com" value={vcardFields.email} onChange={(e) => setVcardFields({ ...vcardFields, email: e.target.value })} />
              </div>
            </div>
            <div>
              <label className={LabelClass}>Website URL</label>
              <input className={InputClass} placeholder="www.janedoe.me" value={vcardFields.url} onChange={(e) => setVcardFields({ ...vcardFields, url: e.target.value })} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
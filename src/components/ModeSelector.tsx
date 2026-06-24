import { 
  MdTextFields, MdLink, MdEmail, MdPhone, 
  MdSms, MdWifi, MdContacts 
} from "react-icons/md";
import type { Mode } from "../types/types";

const ICONS: Record<Mode, JSX.Element> = {
  text: <MdTextFields size={18} />,
  link: <MdLink size={18} />,
  email: <MdEmail size={18} />,
  phone: <MdPhone size={18} />,
  sms: <MdSms size={18} />,
  wifi: <MdWifi size={18} />,
  vcard: <MdContacts size={18} />,
};

interface ModeSelectorProps {
  mode: Mode;
  setMode: (mode: Mode) => void;
}

export default function ModeSelector({ mode, setMode }: ModeSelectorProps) {
  const modes: Mode[] = ["link", "text", "email", "phone", "sms", "wifi", "vcard"];

  return (
    <div className="flex flex-col space-y-4">
      <h2 className="text-xs tracking-widest text-slate-500 dark:text-slate-400 lexend-400">
        1. Select Type
      </h2>
      
      <div className="flex flex-wrap gap-2">
        {modes.map((opt) => {
          const isActive = mode === opt;
          return (
            <button
              key={opt}
              onClick={() => setMode(opt)}
              className={`
                flex items-center gap-2 px-4 py-2 text-sm transition-all duration-200 border rounded-lg
                ${isActive 
                  ? "bg-slate-900 border-slate-900 text-white dark:bg-slate-100 dark:border-slate-100 dark:text-slate-900" 
                  : "bg-transparent border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:bg-slate-800/50"
                }
              `}
            >
              <span className={isActive ? "opacity-100" : "opacity-70"}>
                {ICONS[opt]}
              </span>
              <span className="capitalize lexend-400">{opt}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
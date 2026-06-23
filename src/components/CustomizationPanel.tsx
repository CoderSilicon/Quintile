import { useRef } from "react";
import { MdImage } from "react-icons/md";
import type { QRCodeOptions } from "../types/types";

interface CustomizationPanelProps {
  options: QRCodeOptions;
  setOptions: React.Dispatch<React.SetStateAction<QRCodeOptions>>;
}

const InputClass = "w-full px-3 py-2 bg-transparent border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-slate-900 dark:focus:border-slate-100 transition-colors text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400";
const LabelClass = "block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5";

export default function CustomizationPanel({ options, setOptions }: CustomizationPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setOptions((prev) => ({ ...prev, logoImage: event.target?.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      {/* Structural typography matching the previous sections */}
      <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
        3. Customize Design
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={LabelClass}>Foreground Color</label>
          <div className="flex items-center gap-2">
            {/* Native color picker styled to be minimal and flat */}
            <input 
              type="color" 
              value={options.fgColor} 
              onChange={(e) => setOptions({ ...options, fgColor: e.target.value })} 
              className="w-10 h-10 p-0 border-0 rounded bg-transparent cursor-pointer" 
            />
            <input 
              type="text" 
              value={options.fgColor} 
              onChange={(e) => setOptions({ ...options, fgColor: e.target.value })} 
              className={InputClass} 
              placeholder="#000000"
            />
          </div>
        </div>
        
        <div>
          <label className={LabelClass}>Background Color</label>
          <div className="flex items-center gap-2">
            <input 
              type="color" 
              value={options.bgColor} 
              onChange={(e) => setOptions({ ...options, bgColor: e.target.value })} 
              className="w-10 h-10 p-0 border-0 rounded bg-transparent cursor-pointer" 
            />
            <input 
              type="text" 
              value={options.bgColor} 
              onChange={(e) => setOptions({ ...options, bgColor: e.target.value })} 
              className={InputClass} 
              placeholder="#FFFFFF"
            />
          </div>
        </div>
        
        <div className="md:col-span-2 mt-2">
          <label className={LabelClass}>Center Logo (Optional)</label>
          <input 
            type="file" 
            ref={fileInputRef} 
            accept="image/*" 
            className="hidden" 
            onChange={handleLogoUpload} 
          />
          {/* Stark dashed button instead of a large bubbly dropzone */}
          <button 
            onClick={() => fileInputRef.current?.click()} 
            className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg hover:border-slate-400 hover:bg-slate-50 dark:hover:border-slate-500 dark:hover:bg-slate-800/50 transition-colors text-sm text-slate-600 dark:text-slate-400"
          >
            <MdImage size={18} /> 
            {options.logoImage ? "Replace Logo Image" : "Upload Logo Image"}
          </button>
        </div>
      </div>
    </div>
  );
}
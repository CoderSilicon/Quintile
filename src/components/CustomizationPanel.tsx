import { useRef } from "react";
import { MdImage } from "react-icons/md";
import type {
  QRCodeOptions,
  ColorMode,
  GradientType,
  QRGradient,
} from "../types/types";

interface CustomizationPanelProps {
  options: QRCodeOptions;
  setOptions: React.Dispatch<React.SetStateAction<QRCodeOptions>>;
}

const InputClass =
  "w-full px-0 py-2 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none lexend-300 transition-colors";

const SelectClass =
  "w-full px-2 py-2 bg-slate-50 dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 focus:outline-none lexend-400 transition-colors cursor-pointer rounded-md";

const LabelClass =
  "block text-[10px] lexend-400 tracking-widest text-slate-400 dark:text-slate-500 mb-1 ";

const SectionHeader =
  "text-xs lexend-400 tracking-[0.2em] text-slate-900 dark:text-slate-100 pb-2 mb-6 mt-10 ";

type TargetPrefix = "dots" | "cornerSquare" | "cornerDot" | "bg";

export default function CustomizationPanel({
  options,
  setOptions,
}: CustomizationPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setOptions((prev) => ({
            ...prev,
            logoImage: event.target?.result as string,
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const setOptionValue = <K extends keyof QRCodeOptions>(
    key: K,
    value: QRCodeOptions[K],
  ) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
  };

  // ----------------------------------------------------------------------
  // UNIFIED MASTER COLOR/GRADIENT CONTROLLER
  // Syncs arrays of targets (e.g. ['dots', 'cornerSquare', 'cornerDot']) simultaneously
  // ----------------------------------------------------------------------
  const renderUnifiedGradientControls = (
    labelPrefix: string,
    targets: TargetPrefix[],
  ) => {
    const primary = targets[0];
    const mode = options[
      `${primary}ColorMode` as keyof QRCodeOptions
    ] as ColorMode;
    const color = options[`${primary}Color` as keyof QRCodeOptions] as string;
    const targetGrad = (options[
      `${primary}Gradient` as keyof QRCodeOptions
    ] as QRGradient) || {
      type: "linear",
      rotation: 0,
      colorStops: [
        { offset: 0, color: "#000000" },
        { offset: 1, color: "#000000" },
      ],
    };

    const updateAll = (
      payloadFn: (
        t: TargetPrefix,
        old: QRCodeOptions,
      ) => Record<string, unknown>,
    ) => {
      setOptions((prev) => {
        const next = { ...prev };
        targets.forEach((t) => Object.assign(next, payloadFn(t, next)));

        // Ensure the base fgColor/bgColor fallback strings are updated for the wrapper frames
        if (targets.includes("dots")) {
          next.fgColor = next.dotsColor;
          next.frameColor = next.dotsColor; // Sync CTA frame to main color
        }

        return next;
      });
    };

    const handleMode = (m: ColorMode) =>
      updateAll((t) => ({ [`${t}ColorMode`]: m }));
    const handleColor = (c: string) => updateAll((t) => ({ [`${t}Color`]: c }));
    const handleGradType = (ty: GradientType) =>
      updateAll((t, old) => ({
        [`${t}Gradient`]: {
          ...(old[`${t}Gradient` as keyof QRCodeOptions] as QRGradient),
          type: ty,
        },
      }));
    const handleGradRot = (r: number) =>
      updateAll((t, old) => ({
        [`${t}Gradient`]: {
          ...(old[`${t}Gradient` as keyof QRCodeOptions] as QRGradient),
          rotation: r,
        },
      }));
    const handleGradStop = (idx: number, c: string) =>
      updateAll((t, old) => {
        const oldGrad = old[
          `${t}Gradient` as keyof QRCodeOptions
        ] as QRGradient;
        const newStops = [...oldGrad.colorStops];
        newStops[idx] = { ...newStops[idx], color: c };
        return { [`${t}Gradient`]: { ...oldGrad, colorStops: newStops } };
      });

    return (
      <div className="space-y-6 p-4 bg-slate-50 dark:bg-slate-900/30 rounded-xl border border-slate-100 dark:border-slate-800/50">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 lexend-400 border-b border-slate-200/50 dark:border-slate-800/50 pb-2 mb-3">
          {labelPrefix}
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={LabelClass}>Render Mode</label>
            <select
              className={SelectClass}
              value={mode}
              onChange={(e) => handleMode(e.target.value as ColorMode)}
            >
              <option value="single">Single Hex Color</option>
              <option value="gradient">Multi-Stop Gradient</option>
            </select>
          </div>

          {mode === "single" ? (
            <div>
              <label className={LabelClass}>Primary Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={color || "#000000"}
                  onChange={(e) => handleColor(e.target.value)}
                  className="w-10 h-10 p-0 border-0 rounded bg-transparent cursor-pointer"
                />
                <input
                  type="text"
                  value={color || ""}
                  onChange={(e) => handleColor(e.target.value)}
                  className={InputClass}
                  placeholder="#000000"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className={LabelClass}>Gradient Type</label>
              <select
                className={SelectClass}
                value={targetGrad.type}
                onChange={(e) => handleGradType(e.target.value as GradientType)}
              >
                <option value="linear">Linear</option>
                <option value="radial">Radial</option>
              </select>
            </div>
          )}
        </div>

        {mode === "gradient" && (
          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={LabelClass}>Stop 0 (Start)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={targetGrad.colorStops[0]?.color || "#000000"}
                    onChange={(e) => handleGradStop(0, e.target.value)}
                    className="w-8 h-8 p-0 border-0 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={targetGrad.colorStops[0]?.color || ""}
                    onChange={(e) => handleGradStop(0, e.target.value)}
                    className={InputClass}
                  />
                </div>
              </div>
              <div>
                <label className={LabelClass}>Stop 1 (End)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={targetGrad.colorStops[1]?.color || "#ffffff"}
                    onChange={(e) => handleGradStop(1, e.target.value)}
                    className="w-8 h-8 p-0 border-0 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={targetGrad.colorStops[1]?.color || ""}
                    onChange={(e) => handleGradStop(1, e.target.value)}
                    className={InputClass}
                  />
                </div>
              </div>
            </div>
            {targetGrad.type === "linear" && (
              <div className="pt-2">
                <div className="flex justify-between items-center mb-1">
                  <label className={LabelClass}>Angle Rotation</label>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {targetGrad.rotation}°
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={targetGrad.rotation}
                  onChange={(e) => handleGradRot(parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col space-y-2 pb-12">
      {/* --- UNIFIED COLORS --- */}
      <h2 className="text-xs tracking-widest text-slate-500 dark:text-slate-400 lexend-400">
        3. Customize
      </h2>

      <div className="grid grid-cols-1 gap-6">
        {renderUnifiedGradientControls("Foreground", [
          "dots",
          "cornerSquare",
          "cornerDot",
        ])}
        {renderUnifiedGradientControls("Background", ["bg"])}
      </div>

      {/* --- UNIFIED TOPOLOGY GRID --- */}
      <h2 className={SectionHeader}>Topology</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className={LabelClass}>Global Envelope</label>
          <select
            className={SelectClass}
            value={options.shape || "square"}
            onChange={(e) =>
              setOptionValue("shape", e.target.value as QRCodeOptions["shape"])
            }
          >
            <option value="square">Stark Square</option>
            <option value="circle">Circular Frame</option>
          </select>
        </div>
        <div>
          <label className={LabelClass}>Inner Padding</label>
          <input
            type="number"
            min="0"
            max="50"
            className={InputClass}
            value={options.margin || 0}
            onChange={(e) =>
              setOptions({ ...options, margin: parseInt(e.target.value) || 0 })
            }
          />
        </div>
        <div>
          <label className={LabelClass}>Error Correction</label>
          <select
            className={SelectClass}
            value={options.errorCorrectionLevel}
            onChange={(e) =>
              setOptionValue(
                "errorCorrectionLevel",
                e.target.value as QRCodeOptions["errorCorrectionLevel"],
              )
            }
          >
            <option value="L">L (7% Recovery)</option>
            <option value="M">M (15% Recovery)</option>
            <option value="Q">Q (25% Recovery)</option>
            <option value="H">H (30% Recovery)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <div>
          <label className={LabelClass}>Dot Style</label>
          <select
            className={SelectClass}
            value={options.dotStyle || "square"}
            onChange={(e) =>
              setOptionValue(
                "dotStyle",
                e.target.value as QRCodeOptions["dotStyle"],
              )
            }
          >
            <option value="square">Standard Blocks</option>
            <option value="dots">Circular Dots</option>
            <option value="rounded">Rounded Elements</option>
            <option value="extra-rounded">Extra Rounded</option>
            <option value="classy">Classy Edge</option>
            <option value="classy-rounded">Classy Rounded</option>
          </select>
        </div>
        <div>
          <label className={LabelClass}>Outer Eye</label>
          <select
            className={SelectClass}
            value={options.cornerSquareStyle || "square"}
            onChange={(e) =>
              setOptionValue(
                "cornerSquareStyle",
                e.target.value as QRCodeOptions["cornerSquareStyle"],
              )
            }
          >
            <option value="square">Sharp Square</option>
            <option value="extra-rounded">Smooth Rounded</option>
            <option value="dot">Target Dot</option>
          </select>
        </div>
        <div>
          <label className={LabelClass}>Inner Eye</label>
          <select
            className={SelectClass}
            value={options.cornerDotStyle || "square"}
            onChange={(e) =>
              setOptionValue(
                "cornerDotStyle",
                e.target.value as QRCodeOptions["cornerDotStyle"],
              )
            }
          >
            <option value="square">Block Square</option>
            <option value="dot">Circular Dot</option>
          </select>
        </div>
      </div>

      {/* --- LOGO MOUNTING --- */}
      <h2 className={SectionHeader}>Logo</h2>
      <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-900/30 rounded-xl border border-slate-100 dark:border-slate-800/50">
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={handleLogoUpload}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg hover:border-slate-400 hover:bg-slate-50 dark:hover:border-slate-500 dark:hover:bg-slate-800/50 transition-colors text-sm text-slate-600 dark:text-slate-400 font-medium lexend-300"
        >
          <MdImage size={18} />
          {options.logoImage ? "Swap Active Asset" : "Mount Center Image"}
        </button>

        {options.logoImage && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className={LabelClass}>Scale Coefficient</label>
                <span className="text-[10px] text-slate-400 font-mono">
                  {options.logoSize || 0.4}
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.5"
                step="0.05"
                value={options.logoSize || 0.4}
                onChange={(e) =>
                  setOptions({
                    ...options,
                    logoSize: parseFloat(e.target.value),
                  })
                }
                className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className={LabelClass}>Safety Border Margin</label>
                <span className="text-[10px] text-slate-400 font-mono">
                  {options.logoMargin || 0}px
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="20"
                step="1"
                value={options.logoMargin || 0}
                onChange={(e) =>
                  setOptions({
                    ...options,
                    logoMargin: parseInt(e.target.value),
                  })
                }
                className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>
            <div className="md:col-span-2 flex items-center justify-between p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50">
              <span className={LabelClass} style={{ marginBottom: 0 }}>
                Excavate Background Pattern Under Logo
              </span>
              <input
                type="checkbox"
                checked={options.hideBackgroundDots ?? true}
                onChange={(e) =>
                  setOptions({
                    ...options,
                    hideBackgroundDots: e.target.checked,
                  })
                }
                className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>

      <h2 className={SectionHeader}>Frame</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={LabelClass}>Frame Blueprint</label>
          <select
            className={SelectClass}
            value={options.frameStyle || "none"}
            onChange={(e) =>
              setOptionValue(
                "frameStyle",
                e.target.value as QRCodeOptions["frameStyle"],
              )
            }
          >
            <option value="none">Raw Output</option>
            <option value="bottom-text">Solid Lower Label Block</option>
            <option value="outline">Floating Perimeter Outline</option>
          </select>
        </div>

        {/* The Missing Frame Color Picker Restored */}
        {options.frameStyle !== "none" && (
          <div>
            <label className={LabelClass}>Envelope Base Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={options.frameColor || "#0f172a"}
                onChange={(e) =>
                  setOptions({ ...options, frameColor: e.target.value })
                }
                className="w-10 h-10 p-0 border-0 rounded bg-transparent cursor-pointer"
              />
              <input
                type="text"
                value={options.frameColor || "#0f172a"}
                onChange={(e) =>
                  setOptions({ ...options, frameColor: e.target.value })
                }
                className={InputClass}
                placeholder="#0F172A"
              />
            </div>
          </div>
        )}

        {options.frameStyle !== "none" && (
          <div className="md:col-span-2 mt-2">
            <label className={LabelClass}>Embedded Text String</label>
            <input
              type="text"
              className={InputClass}
              maxLength={20}
              placeholder="SCAN ME"
              value={options.frameText || ""}
              onChange={(e) =>
                setOptions({ ...options, frameText: e.target.value })
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useCallback } from "react";
import { formatUrl } from "../utils/formatUrl";

type QRCodeMode = "text" | "link";

interface QRCodeOptions {
  size: number;
  bgColor: string;
  fgColor: string;
}

export function useQRCode() {
  const [mode, setMode] = useState<QRCodeMode>("text");
  const [input, setInput] = useState("");
  const [options, setOptions] = useState<QRCodeOptions>({
    size: 256,
    bgColor: "#FFFFFF",
    fgColor: "#000000",
  });

  const handleInputChange = useCallback(
    (value: string) => {
      setInput(mode === "link" ? formatUrl(value) : value);
    },
    [mode]
  );

  const handleOptionChange = useCallback(
    (key: keyof QRCodeOptions, value: string | number) => {
      setOptions((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  return {
    mode,
    setMode,
    input,
    setInput: handleInputChange,
    options,
    setOptions: handleOptionChange,
  };
}

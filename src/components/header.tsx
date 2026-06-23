import { motion } from "framer-motion";
import { MdOutlineDarkMode, MdOutlineLightMode } from "react-icons/md";

interface HeaderProps {
  theme: "light" | "dark";
  toggleTheme: () => void;
  onToggleHistory: () => void;
}

export default function Header({ theme, toggleTheme }: HeaderProps) {
  return (
    <motion.header
      className="flex justify-between items-center mb-10  p-4 "
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/30">
          
        </div>
        <h1 className="text-2xl tracking-tight lexend-700">Quintile</h1>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="p-3 rounded-xl bg-white/50 dark:bg-slate-700/50 hover:bg-white dark:hover:bg-slate-600 transition-all"
        >
          {theme === "light" ? (
            <MdOutlineDarkMode size={22} />
          ) : (
            <MdOutlineLightMode size={22} />
          )}
        </button>
      </div>
    </motion.header>
  );
}

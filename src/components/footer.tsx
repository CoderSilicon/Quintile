export default function Footer() {
  return (
    <footer className="w-full border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B0F19] py-16 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Logo & Identity */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <span className="font-bold text-lg tracking-tighter text-slate-900 dark:text-white lexend-400">
                Quintile
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[200px] lexend-300">
              High-performance vector QR engineering. Minimal interface. Maximum
              utility.
            </p>
          </div>

          {/* Navigation */}
          <div className="lexend-300">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-900 dark:text-white mb-6">
              Product
            </h4>
            <ul className="space-y-4 text-xs font-medium text-slate-500 dark:text-slate-400">
              <li>
                <a
                  href="#"
                  className="hover:text-slate-900 dark:hover:text-white"
                >
                  Core Engine
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-slate-900 dark:hover:text-white"
                >
                  API Docs
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-slate-900 dark:hover:text-white"
                >
                  Github
                </a>
              </li>
            </ul>
          </div>

          <div className="lexend-300">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-900 dark:text-white mb-6">
              Legal
            </h4>
            <ul className="space-y-4 text-xs font-medium text-slate-500 dark:text-slate-400">
              <li>
                <a
                  href="#"
                  className="hover:text-slate-900 dark:hover:text-white"
                >
                  Privacy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-slate-900 dark:hover:text-white"
                >
                  Terms
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-slate-900 dark:hover:text-white"
                >
                  Security
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Minimal Bottom Line */}
        <div className="mt-16 pt-8 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-[10px] font-mono text-slate-400 dark:text-slate-600 lexend-400 tracking-widest">
          <div>© {new Date().getFullYear()} Quintile Systems.</div>
          <div>{"@codersilicon"}</div>
        </div>
      </div>
    </footer>
  );
}

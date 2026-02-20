import { motion } from "framer-motion";
import { Tv } from "lucide-react";
import { LogoAnimation } from "./LogoAnimation";
import { useTheme } from "../App";

interface NavbarProps {
  videoCount: number;
}

export function Navbar({ videoCount }: NavbarProps) {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-40"
    >
      <div className="mx-auto max-w-7xl px-3 sm:px-6 py-3 sm:py-4">
        <div
          className="flex items-center justify-between rounded-2xl px-4 sm:px-6 py-2.5 sm:py-3 backdrop-blur-2xl transition-colors duration-400"
          style={{
            background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.8)',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
            boxShadow: isDark ? 'none' : '0 2px 20px rgba(0,0,0,0.06)',
          }}
        >
          {/* Logo */}
          <LogoAnimation size="small" />

          {/* Right side */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme toggle */}
            <motion.button
              onClick={toggleTheme}
              className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-colors duration-300"
              style={{
                background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                color: isDark ? '#fbbf24' : '#6366f1',
              }}
              whileHover={{ scale: 1.1, rotate: 15 }}
              whileTap={{ scale: 0.9, rotate: -15 }}
              title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            >
              <motion.div
                key={theme}
                initial={{ scale: 0, rotate: -180, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                exit={{ scale: 0, rotate: 180, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
              >
                {isDark ? (
                  /* Sun icon for switching to light */
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="5" />
                    <line x1="12" y1="1" x2="12" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" />
                    <line x1="21" y1="12" x2="23" y2="12" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                  </svg>
                ) : (
                  /* Moon icon for switching to dark */
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                )}
              </motion.div>
            </motion.button>

            {/* Video count */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.5, duration: 0.6 }}
              className="flex items-center gap-1.5 text-xs sm:text-sm"
              style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}
            >
              <Tv className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="font-medium">{videoCount}</span>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}

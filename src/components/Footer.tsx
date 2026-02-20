import { motion } from "framer-motion";
import { Play, Heart, Code } from "lucide-react";
import { useTheme } from "../App";

export function Footer() {
  const { isDark } = useTheme();

  return (
    <footer className="relative py-10 sm:py-16 px-4 sm:px-6" style={{ borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'}` }}>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-px bg-gradient-to-r from-transparent via-red-600/30 to-transparent" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto text-center"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-red-600 to-orange-500 flex items-center justify-center shadow-lg shadow-red-500/20">
            <Play className="w-4 h-4 sm:w-5 sm:h-5 text-white fill-white ml-0.5" />
          </div>
          <span className="font-display font-bold text-lg sm:text-xl">
            <span className="gradient-text">ANA</span>
            <span style={{ color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)' }}>ty</span>
          </span>
        </div>

        {/* Made By ANABRATA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div
            className="inline-flex items-center gap-2 sm:gap-3 px-5 sm:px-6 py-2.5 sm:py-3 rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(225,29,72,0.1), rgba(249,115,22,0.1))',
              border: '1px solid rgba(225,29,72,0.2)',
            }}
          >
            <Code className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400" />
            <span className="text-sm sm:text-base font-semibold">
              <span style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>Made By </span>
              <motion.span
                className="gradient-text font-bold text-base sm:text-lg"
                animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                ANABRATA
              </motion.span>
            </span>
            <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500 fill-red-500" />
          </div>
        </motion.div>
      </motion.div>
    </footer>
  );
}

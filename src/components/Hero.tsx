import { motion } from "framer-motion";
import { Play, ChevronDown } from "lucide-react";
import { LogoAnimation } from "./LogoAnimation";
import { useTheme } from "../App";

export function Hero({ onScrollToVideos }: { onScrollToVideos: () => void }) {
  const { isDark } = useTheme();

  return (
    <section className="relative min-h-screen mobile-fullscreen flex items-center justify-center overflow-hidden pt-20">
      {/* Background gradient orbs */}
      <div className="absolute top-1/4 -left-32 w-64 sm:w-96 h-64 sm:h-96 rounded-full blur-[100px] sm:blur-[128px] animate-float"
        style={{ background: isDark ? 'rgba(225,29,72,0.15)' : 'rgba(225,29,72,0.08)' }} />
      <div className="absolute bottom-1/4 -right-32 w-64 sm:w-96 h-64 sm:h-96 rounded-full blur-[100px] sm:blur-[128px] animate-float"
        style={{ background: isDark ? 'rgba(249,115,22,0.15)' : 'rgba(249,115,22,0.08)', animationDelay: "3s" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] rounded-full blur-[120px] sm:blur-[200px]"
        style={{ background: isDark ? 'rgba(225,29,72,0.06)' : 'rgba(225,29,72,0.04)' }} />

      {/* Floating micro particles */}
      {Array.from({ length: 15 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full"
          style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, background: isDark ? 'rgba(239,68,68,0.4)' : 'rgba(239,68,68,0.3)' }}
          animate={{ y: [0, -25, 0], x: [0, Math.random() * 15 - 7, 0], opacity: [0.2, 0.7, 0.2] }}
          transition={{ duration: 3 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 2 }}
        />
      ))}

      <div className="relative z-10 text-center px-4 sm:px-6 max-w-5xl mx-auto">
        <div className="mb-4 sm:mb-6 flex justify-center">
          <LogoAnimation size="large" />
        </div>

        <motion.div
          className="mx-auto h-1 rounded-full bg-gradient-to-r from-red-600 via-orange-500 to-red-600 mt-1 sm:mt-2"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: "160px", opacity: 1 }}
          transition={{ delay: 1.3, duration: 0.8, ease: "easeOut" }}
        />

        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 2, type: "spring", stiffness: 200 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onScrollToVideos}
          className="group relative mt-8 sm:mt-10 inline-flex items-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 rounded-2xl bg-gradient-to-r from-red-600 to-orange-500 text-white font-semibold text-sm sm:text-lg shadow-2xl shadow-red-500/25 hover:shadow-red-500/40 transition-shadow duration-500 animate-pulse-glow"
        >
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-red-600 to-orange-500 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
          <span className="relative flex items-center gap-2 sm:gap-3">
            <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-white" />
            Start Watching
          </span>
        </motion.button>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3, duration: 1 }}
          className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 cursor-pointer"
          onClick={onScrollToVideos}
        >
          <motion.div animate={{ y: [0, 12, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
            <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)' }} />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

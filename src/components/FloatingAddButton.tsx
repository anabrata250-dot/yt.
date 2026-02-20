import { motion } from "framer-motion";
import { Plus } from "lucide-react";

interface FloatingAddButtonProps {
  onClick: () => void;
}

export function FloatingAddButton({ onClick }: FloatingAddButtonProps) {
  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        delay: 2.5,
        type: "spring",
        stiffness: 200,
        damping: 15,
      }}
      whileHover={{
        scale: 1.12,
        rotate: 90,
      }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-40 group"
    >
      {/* Outer pulse ring */}
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-r from-red-600 to-orange-500"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.4, 0, 0.4],
        }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Second ring */}
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-r from-red-600 to-orange-500"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0, 0.3],
        }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      />

      {/* Glow */}
      <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-red-600 to-orange-500 blur-xl opacity-40 group-hover:opacity-70 transition-opacity duration-300" />

      {/* Button */}
      <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-red-600 via-rose-500 to-orange-500 flex items-center justify-center shadow-2xl shadow-red-600/40 animate-fab-pulse overflow-hidden">
        {/* Scanline */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-transparent via-white/15 to-transparent"
          animate={{ y: ["-100%", "300%"] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          style={{ height: "30%" }}
        />

        <Plus className="w-6 h-6 sm:w-7 sm:h-7 text-white relative z-10" strokeWidth={2.5} />
      </div>

      {/* Label tooltip */}
      <motion.div
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 3, duration: 0.5 }}
        className="absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap px-3 py-1.5 rounded-lg bg-black/80 backdrop-blur-xl border border-white/10 text-xs sm:text-sm text-white font-medium shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
      >
        Add Video
      </motion.div>
    </motion.button>
  );
}

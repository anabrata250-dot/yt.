import { motion } from "framer-motion";
import { useTheme } from "../App";

interface LogoAnimationProps {
  size?: "small" | "large";
}

export function LogoAnimation({ size = "small" }: LogoAnimationProps) {
  const { isDark } = useTheme();
  const isLarge = size === "large";
  const textSize = isLarge ? "text-7xl sm:text-8xl md:text-9xl" : "text-2xl";
  const tySize = isLarge ? "text-6xl sm:text-7xl md:text-8xl" : "text-2xl";
  const iconSize = isLarge ? "w-16 h-16 sm:w-20 sm:h-20" : "w-11 h-11";
  const svgSize = isLarge ? 36 : 22;

  const tyColor = isDark ? "rgba(255,255,255,0.8)" : "rgba(30,30,30,0.85)";
  const hoverGlow = isDark ? "#ffffff" : "#e11d48";

  const letters = [
    { char: "A", color: "#e11d48", delay: 0 },
    { char: "N", color: "#f97316", delay: 0.2 },
    { char: "A", color: "#e11d48", delay: 0.4 },
  ];

  const fragmentAngles = [
    { x: -200, y: -150, rotate: -360 },
    { x: 250, y: 100, rotate: 540 },
    { x: -100, y: 200, rotate: -270 },
    { x: 180, y: -250, rotate: 450 },
    { x: -300, y: 50, rotate: -540 },
  ];

  const particles = Array.from({ length: 16 }, (_, i) => ({
    id: i,
    x: Math.cos((i * Math.PI * 2) / 16) * (isLarge ? 80 : 40),
    y: Math.sin((i * Math.PI * 2) / 16) * (isLarge ? 80 : 40),
  }));

  return (
    <div className={`flex items-center ${isLarge ? "gap-4 sm:gap-6" : "gap-2"}`}>
      {/* Animated Play Icon */}
      <motion.div
        className={`relative ${iconSize} flex items-center justify-center`}
        initial={{ scale: 0, rotate: -360 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 150, damping: 12, delay: 0.1 }}
      >
        {/* Glow */}
        <motion.div
          className={`absolute inset-0 rounded-2xl bg-gradient-to-br from-red-600 to-orange-500 ${isLarge ? "blur-2xl" : "blur-lg"}`}
          animate={{ opacity: [0.3, 0.7, 0.3], scale: [1, 1.3, 1] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        />

        {/* Icon background */}
        <motion.div
          className={`relative ${iconSize} rounded-2xl bg-gradient-to-br from-red-600 via-rose-500 to-orange-500 flex items-center justify-center shadow-lg shadow-red-500/40 overflow-hidden`}
          whileHover={{ scale: 1.1, rotate: 5 }}
        >
          <motion.svg
            width={svgSize} height={svgSize} viewBox="0 0 24 24" fill="white"
            initial={{ scale: 0, opacity: 0, rotate: -180 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ delay: 0.7, type: "spring", stiffness: 250 }}
          >
            <path d="M8 5v14l11-7z" />
          </motion.svg>

          {/* Scanline */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-b from-transparent via-white/15 to-transparent"
            animate={{ y: ["-100%", "300%"] }}
            transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 2 }}
            style={{ height: "25%" }}
          />
        </motion.div>

        {/* Assembly burst particles */}
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className={`absolute rounded-full ${isLarge ? "w-2 h-2" : "w-1 h-1"}`}
            style={{ background: p.id % 2 === 0 ? "#e11d48" : "#f97316" }}
            initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
            animate={{ opacity: [0, 1, 0], x: [0, p.x * 1.8], y: [0, p.y * 1.8], scale: [0, 1.5, 0] }}
            transition={{ duration: 1, delay: 0.6 + p.id * 0.05, ease: "easeOut" }}
          />
        ))}
      </motion.div>

      {/* ANA letters - each flies from chaotic positions */}
      <div className="flex items-baseline">
        {letters.map((letter, letterIdx) => (
          <div key={letterIdx} className="relative">
            {/* Ghost fragments behind */}
            {[0, 1, 2].map((fragIdx) => {
              const frag = fragmentAngles[(fragIdx + letterIdx * 2) % 5];
              return (
                <motion.span
                  key={fragIdx}
                  className={`absolute inset-0 font-display font-black ${textSize}`}
                  style={{ color: letter.color, opacity: 0.1, filter: "blur(6px)" }}
                  initial={{ x: frag.x * 0.5, y: frag.y * 0.5, rotate: frag.rotate * 0.3, scale: 0, opacity: 0 }}
                  animate={{ x: 0, y: 0, rotate: 0, scale: 1, opacity: 0.1 }}
                  transition={{ type: "spring", stiffness: 100, damping: 14, delay: letter.delay + fragIdx * 0.06 }}
                >
                  {letter.char}
                </motion.span>
              );
            })}

            {/* Main letter */}
            <motion.span
              className={`relative font-display font-black ${textSize} logo-letter`}
              style={{ color: letter.color }}
              initial={{
                opacity: 0,
                y: letterIdx === 0 ? -200 : letterIdx === 1 ? 200 : -200,
                x: letterIdx === 0 ? -150 : letterIdx === 1 ? 0 : 150,
                scale: 0,
                rotate: letterIdx === 0 ? -270 : letterIdx === 1 ? 360 : -270,
                filter: "blur(20px)",
              }}
              animate={{ opacity: 1, y: 0, x: 0, scale: 1, rotate: 0, filter: "blur(0px)" }}
              transition={{ type: "spring", stiffness: 80, damping: 12, delay: letter.delay + 0.2, duration: 1.8 }}
              whileHover={{
                scale: 1.2, y: -8,
                color: hoverGlow,
                textShadow: `0 0 40px ${letter.color}`,
                transition: { duration: 0.2 },
              }}
            >
              {letter.char}
            </motion.span>

            {/* Assembly spark */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ delay: letter.delay + 0.8, duration: 0.5 }}
            >
              <div
                className={`${isLarge ? "w-12 h-12" : "w-6 h-6"} rounded-full`}
                style={{ background: `radial-gradient(circle, ${letter.color}90, transparent)` }}
              />
            </motion.div>
          </div>
        ))}

        {/* "ty" — typewriter style */}
        {"ty".split("").map((char, i) => (
          <motion.span
            key={`ty-${i}`}
            className={`font-display font-bold ${tySize}`}
            style={{ color: tyColor }}
            initial={{ opacity: 0, y: 40, scale: 0, rotateY: 90 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotateY: 0 }}
            transition={{ delay: 1.0 + i * 0.15, type: "spring", stiffness: 180, damping: 12 }}
            whileHover={{ scale: 1.15, color: "#e11d48", transition: { duration: 0.15 } }}
          >
            {char}
          </motion.span>
        ))}
      </div>

      {/* Final flash */}
      <motion.div
        className="absolute left-0 top-0 w-full h-full pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.4, 0] }}
        transition={{ delay: 1.4, duration: 0.8 }}
      >
        <div className="w-full h-full bg-gradient-to-r from-red-500/20 via-orange-500/10 to-transparent rounded-3xl blur-2xl" />
      </motion.div>
    </div>
  );
}

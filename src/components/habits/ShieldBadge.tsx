"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck } from "lucide-react";

interface ShieldBadgeProps {
  count: number;
}

export function ShieldBadge({ count }: ShieldBadgeProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const tooltipWidth = 240;
    const padding = 12;

    // Calculate clamped center position for mobile safety
    const idealX = rect.left + rect.width / 2;
    const clampedX = Math.max(
      tooltipWidth / 2 + padding,
      Math.min(idealX, window.innerWidth - tooltipWidth / 2 - padding)
    );

    setCoords({
      x: clampedX,
      y: rect.bottom,
    });
    setIsHovered(true);
  };

  return (
    <>
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setIsHovered(false)}
        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-sky-500/20 bg-sky-500/10 hover:bg-sky-500/15 hover:border-sky-500/30 text-sky-400 font-mono text-xs font-bold shrink-0 select-none cursor-help transition-all duration-150 active:scale-[0.96]"
      >
        <ShieldCheck className="w-3.5 h-3.5" />
        <span>{count}</span>
      </div>

      {/* Floating Clamped HUD Tooltip */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -2, scale: 0.95 }}
            transition={{ duration: 0.12 }}
            style={{
              position: "fixed",
              left: `${coords.x}px`,
              top: `${coords.y + 8}px`,
              transform: "translateX(-50%)",
              zIndex: 99999,
              maxWidth: "calc(100vw - 24px)",
            }}
            className="pointer-events-none flex flex-col items-center whitespace-normal text-center"
          >
            <div className="w-2 h-2 rotate-45 border-l border-t border-white/20 bg-zinc-950 -mb-1" />
            <div className="w-56 sm:w-60 rounded-xl border border-white/20 bg-zinc-950/98 p-2.5 shadow-2xl backdrop-blur-2xl ring-1 ring-white/10 space-y-1">
              <span className="block font-mono text-xs font-bold text-sky-400">
                Streak Freeze Shields: {count}
              </span>
              <p className="font-mono text-[10px] text-zinc-400 leading-tight">
                Auto-safeguards active streaks if a cycle is missed.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
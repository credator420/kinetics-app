"use client";

import React, { useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { LogOut, LogIn, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function UserMenu() {
  const { data: session, status } = useSession();
  const [isHovered, setIsHovered] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const tooltipWidth = 140;
    const padding = 12;

    const rawX = rect.left + rect.width / 2;
    const clampedX = Math.max(
      tooltipWidth / 2 + padding,
      Math.min(rawX, window.innerWidth - tooltipWidth / 2 - padding)
    );

    setCoords({
      x: clampedX,
      y: rect.bottom,
    });
    setIsHovered(true);
  };

  if (status === "loading") {
    return (
      <div className="h-8 w-20 sm:h-9 sm:w-28 rounded-xl bg-zinc-900 border border-white/5 animate-pulse" />
    );
  }

  if (!session?.user) {
    return (
      <button
        type="button"
        onClick={() => signIn()}
        className="flex h-8 sm:h-9 items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/25 text-zinc-200 hover:text-white px-3 font-mono text-xs font-semibold transition-all cursor-pointer active:scale-[0.96] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400 shrink-0"
      >
        <LogIn className="w-3.5 h-3.5 text-emerald-400" />
        <span>Sign In</span>
      </button>
    );
  }

  const user = session.user;
  const userInitials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "OP";

  return (
    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
      {/* User Badge */}
      <div className="flex items-center gap-2 px-2.5 py-1 sm:py-1.5 rounded-xl border border-white/10 bg-zinc-900/60 backdrop-blur-xl max-w-[140px] sm:max-w-[190px] select-none">
        {user.image ? (
          <img
            src={user.image}
            alt={user.name || "User Avatar"}
            className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg object-cover border border-white/10 shrink-0"
          />
        ) : (
          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-sky-500/20 border border-sky-500/30 text-sky-400 font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
            {userInitials}
          </div>
        )}
        <span className="text-xs font-bold text-zinc-200 truncate font-mono">
          {user.name || "Operator"}
        </span>
      </div>

      {/* Sign Out Button */}
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/" })}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setIsHovered(false)}
        className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-400 text-zinc-400 transition-all cursor-pointer active:scale-[0.92] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-rose-400 shrink-0"
        aria-label="Sign out"
      >
        <LogOut className="w-3.5 h-3.5" />
      </button>

      {/* Responsive HUD Tooltip */}
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
            className="pointer-events-none flex flex-col items-center whitespace-nowrap"
          >
            <div className="w-2 h-2 rotate-45 border-l border-t border-white/20 bg-zinc-950 -mb-1" />
            <div className="rounded-xl border border-white/20 bg-zinc-950/98 px-3 py-1.5 shadow-2xl backdrop-blur-2xl ring-1 ring-white/10">
              <span className="font-mono text-xs font-bold text-rose-400">
                Sign Out
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
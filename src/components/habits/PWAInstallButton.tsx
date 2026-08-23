"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Monitor, Smartphone, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
      }
    } else {
      setShowInfoModal(true);
    }
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const tooltipWidth = 180;
    const padding = 12;

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
      <button
        type="button"
        onClick={handleInstallClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setIsHovered(false)}
        className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl border border-sky-500/30 bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 hover:border-sky-400/50 transition-all cursor-pointer focus:outline-none shrink-0 active:scale-[0.92]"
        aria-label="Install Kinetics App"
      >
        <Download className="w-4 h-4" />
      </button>

      {/* Floating HUD Tooltip */}
      <AnimatePresence>
        {isHovered && !showInfoModal && (
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
            <div className="rounded-xl border border-white/20 bg-zinc-950/98 px-3 py-1.5 shadow-2xl backdrop-blur-2xl ring-1 ring-white/10">
              <span className="font-mono text-xs font-bold text-sky-400">
                Install Kinetics App
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Manual Install Instructions Modal */}
      <Dialog open={showInfoModal} onOpenChange={setShowInfoModal}>
        <DialogContent className="border border-white/10 bg-zinc-950/95 backdrop-blur-2xl text-zinc-100 sm:max-w-[480px] rounded-2xl p-6 shadow-2xl">
          <DialogHeader className="pb-3 border-b border-white/[0.06]">
            <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
              <Download className="w-4 h-4 text-sky-400" />
              Install Kinetics Application
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2 font-mono text-xs text-zinc-300">
            <div className="p-3 rounded-xl border border-white/[0.08] bg-zinc-900/40 space-y-2">
              <div className="flex items-center gap-2 text-white font-bold">
                <Monitor className="w-4 h-4 text-sky-400" />
                <span>Desktop (Chrome / Edge / Brave / Arc)</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Click the install icon directly in the browser address bar (top right) or go to <span className="text-zinc-200">Settings → Install Kinetics</span>.
              </p>
            </div>

            <div className="p-3 rounded-xl border border-white/[0.08] bg-zinc-900/40 space-y-2">
              <div className="flex items-center gap-2 text-white font-bold">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>Mobile (iOS & Android)</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Tap <span className="text-zinc-200">Share</span> (iOS Safari) or <span className="text-zinc-200">More (⋮)</span> (Android Chrome) and select <span className="text-emerald-400 font-bold">&ldquo;Add to Home Screen&rdquo;</span>.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowInfoModal(false)}
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold transition-all text-xs cursor-pointer flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Understood</span>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
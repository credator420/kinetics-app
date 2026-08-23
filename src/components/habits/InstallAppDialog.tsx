"use client";

import React, { useState, useEffect } from "react";
import { DownloadCloud, Monitor, Smartphone } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface InstallAppDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function InstallAppDialog({
  open: externalOpen,
  onOpenChange: setExternalOpen,
}: InstallAppDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = setExternalOpen || setInternalOpen;

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") setDeferredPrompt(null);
      setOpen(false);
    } else {
      setOpen(true);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="border border-white/10 bg-zinc-950/95 backdrop-blur-2xl text-zinc-100 sm:max-w-[440px] rounded-2xl p-6 shadow-2xl">
        <DialogHeader className="space-y-1 pb-2 border-b border-white/[0.06]">
          <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
            <DownloadCloud className="w-4 h-4 text-emerald-400" />
            Install Kinetics Protocol App
          </DialogTitle>
          <p className="text-xs text-zinc-400 font-mono">
            Run Kinetics as a native standalone application.
          </p>
        </DialogHeader>

        <div className="space-y-3 py-3 text-xs text-zinc-300 font-mono">
          <div className="flex items-start gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.02]">
            <Monitor className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block mb-0.5">Desktop (Chrome / Edge / Brave)</span>
              Click the install icon in your browser URL address bar to pin Kinetics to your dock/taskbar.
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.02]">
            <Smartphone className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block mb-0.5">Mobile (iOS & Android)</span>
              Tap the **Share** button in Safari or Chrome menu and select **&ldquo;Add to Home Screen&rdquo;**.
            </div>
          </div>

          {deferredPrompt && (
            <button
              type="button"
              onClick={handleInstallClick}
              className="w-full mt-2 py-2.5 rounded-xl bg-emerald-500 text-zinc-950 font-bold text-xs hover:bg-emerald-400 active:scale-95 transition-all shadow-md cursor-pointer"
            >
              Trigger Direct Installation
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
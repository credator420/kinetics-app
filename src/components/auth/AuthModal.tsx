"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import {
  Terminal,
  ShieldCheck,
  Zap,
  ArrowRight,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultMode?: "login" | "signup";
}

export function AuthModal({
  open,
  onOpenChange,
  defaultMode = "signup",
}: AuthModalProps) {
  const [loading, setLoading] = useState(false);

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      await signIn("google", { callbackUrl: "/" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border border-white/10 bg-zinc-950/95 backdrop-blur-2xl text-zinc-100 sm:max-w-[420px] rounded-2xl p-6 shadow-2xl">
        <DialogHeader className="pb-3 border-b border-white/[0.06] text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-900 border border-white/15">
              <Terminal className="h-3.5 w-3.5 text-emerald-400" />
            </div>
            <span className="font-mono text-xs uppercase tracking-widest text-emerald-400 font-bold">
              Kinetics Access Gate
            </span>
          </div>
          <DialogTitle className="text-xl font-bold text-white tracking-tight">
            {defaultMode === "signup" ? "Initialize Operator Profile" : "Authenticate Session"}
          </DialogTitle>
          <p className="text-xs font-mono text-zinc-400 mt-1">
            Telemetry-driven protocol & habit matrix.
          </p>
        </DialogHeader>

        <div className="space-y-4 pt-2 font-mono">
          {/* Google OAuth Button */}
          <button
            type="button"
            disabled={loading}
            onClick={handleGoogleAuth}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-white/15 bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/25 text-white font-medium text-xs transition-all cursor-pointer shadow-lg disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>Continue with Google</span>
          </button>

          <div className="flex items-center gap-2 text-zinc-600 text-[10px]">
            <div className="h-px bg-white/10 flex-1" />
            <span>SESSION ISOLATED</span>
            <div className="h-px bg-white/10 flex-1" />
          </div>

          {/* Security Features */}
          <div className="p-3 rounded-xl border border-white/[0.06] bg-zinc-900/40 space-y-2 text-[11px] text-zinc-400">
            <div className="flex items-center gap-2 text-zinc-300">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span>Streak Freeze Safeguards Enabled</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-300">
              <Zap className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Offline-ready PWA client caching</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
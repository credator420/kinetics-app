"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Flame,
  ShieldCheck,
  Activity,
  ArrowRight,
  TrendingUp,
  Target,
  BarChart3,
  Layers,
  Sparkles,
  Zap,
} from "lucide-react";
import { AuthModal } from "./AuthModal";

export function AuthLockHero() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("signup");

  const openAuth = (mode: "login" | "signup") => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  return (
    <div className="space-y-16 py-4 sm:py-8 font-sans">
      <AuthModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
        defaultMode={authMode}
      />

      {/* Hero Header Section */}
      <div className="relative text-center space-y-5 max-w-2xl mx-auto px-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-mono text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Tactical Habit & Protocol Matrix</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1]">
          Execute daily protocols with{" "}
          <span className="bg-gradient-to-r from-emerald-400 via-sky-400 to-indigo-400 bg-clip-text text-transparent">
            precision telemetry.
          </span>
        </h1>

        <p className="text-sm sm:text-base font-mono text-zinc-400 max-w-xl mx-auto leading-relaxed">
          Track habit entropy, maintain unbroken momentum chains, analyze velocity curves, and earn streak freeze shields.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
          <button
            type="button"
            onClick={() => openAuth("signup")}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-mono font-bold text-xs sm:text-sm transition-all shadow-lg shadow-emerald-500/20 hover:scale-105 cursor-pointer"
          >
            <span>Initialize Protocol Free</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>

          <button
            type="button"
            onClick={() => openAuth("login")}
            className="flex items-center gap-2 px-5 py-3 rounded-xl border border-white/15 bg-white/[0.03] hover:bg-white/[0.08] text-zinc-300 hover:text-white font-mono font-medium text-xs sm:text-sm transition-all cursor-pointer"
          >
            <span>Sign In</span>
          </button>
        </div>
      </div>

      {/* Mock Live Matrix UI Preview */}
      <div className="relative rounded-2xl border border-white/[0.12] bg-zinc-950/80 p-4 sm:p-6 backdrop-blur-2xl shadow-2xl space-y-4 max-w-3xl mx-auto">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-xs text-zinc-400 uppercase tracking-widest font-bold">
              Telemetry Stream — Live Simulation
            </span>
          </div>
          <span className="font-mono text-[10px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded">
            94% EFFICIENCY
          </span>
        </div>

        {/* Interactive Mock Cards */}
        <div className="grid gap-2.5">
          <div className="flex items-center justify-between p-3 rounded-xl border border-emerald-500/20 bg-emerald-950/20 font-mono">
            <div className="flex items-center gap-3">
              <div className="h-6 w-6 rounded-lg bg-emerald-500 text-zinc-950 flex items-center justify-center font-bold text-xs">
                ✓
              </div>
              <div>
                <span className="text-sm font-bold text-zinc-400 line-through">
                  5km Morning Trek
                </span>
                <span className="block text-[10px] text-zinc-500">TRAINING • 24m 12s logged</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-amber-400 font-bold border border-amber-500/20 bg-amber-500/10 px-2 py-1 rounded-lg">
              <Flame className="w-3.5 h-3.5" />
              <span>14d</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl border border-white/10 bg-zinc-900/40 font-mono">
            <div className="flex items-center gap-3">
              <div className="h-6 w-6 rounded-lg border border-white/20 bg-white/[0.02]" />
              <div>
                <span className="text-sm font-bold text-zinc-200">
                  Read 25 Pages
                </span>
                <span className="block text-[10px] text-zinc-500">LEARNING • Daily target</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-amber-400 font-bold border border-amber-500/20 bg-amber-500/10 px-2 py-1 rounded-lg">
              <Flame className="w-3.5 h-3.5" />
              <span>7d</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Core Architecture Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
        <div className="p-5 rounded-2xl border border-white/[0.08] bg-zinc-950/60 backdrop-blur-xl space-y-2">
          <div className="h-9 w-9 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <Activity className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white font-mono">Entropy Alert Engine</h3>
          <p className="text-xs font-mono text-zinc-400 leading-relaxed">
            Real-time countdown alerts when habits with 3 streaks risk breaking before midnight.
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-white/[0.08] bg-zinc-950/60 backdrop-blur-xl space-y-2">
          <div className="h-9 w-9 rounded-xl border border-sky-500/30 bg-sky-500/10 text-sky-400 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white font-mono">105-Day History Matrix</h3>
          <p className="text-xs font-mono text-zinc-400 leading-relaxed">
            Visual GitHub-style execution heatmaps with custom HUD tooltips and per-protocol dossiers.
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-white/[0.08] bg-zinc-950/60 backdrop-blur-xl space-y-2">
          <div className="h-9 w-9 rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white font-mono">Freeze Shield Vault</h3>
          <p className="text-xs font-mono text-zinc-400 leading-relaxed">
            Complete tactical bounties to claim streak freeze shields and safeguard your records.
          </p>
        </div>
      </div>
    </div>
  );
}
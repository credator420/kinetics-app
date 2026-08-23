"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Award, Sparkles } from "lucide-react";
import { Achievement, UserRank } from "@/lib/achievements";

interface MilestoneAlertsProps {
  unlockedAchievement: Achievement | null;
  promotedRank: UserRank | null;
  onDismissAchievement: () => void;
  onDismissRank: () => void;
}

export function MilestoneAlerts({
  unlockedAchievement,
  promotedRank,
  onDismissAchievement,
  onDismissRank,
}: MilestoneAlertsProps) {
  return (
    <AnimatePresence mode="wait">
      {/* 1. Unlocked Achievement Banner */}
      {unlockedAchievement && (
        <div
          key={`achievement-modal-${unlockedAchievement.id}`}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-sm rounded-2xl border border-amber-500/30 bg-zinc-950/95 p-6 text-center shadow-2xl backdrop-blur-2xl ring-1 ring-amber-500/20"
          >
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-400 shadow-inner">
              <Trophy className="h-7 w-7 animate-bounce" />
            </div>

            <div className="space-y-1">
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-amber-400 flex items-center justify-center gap-1">
                <Sparkles className="w-3 h-3" /> Protocol Milestone Unlocked
              </span>
              <h3 className="text-lg font-bold text-white">
                {unlockedAchievement.title}
              </h3>
              <p className="text-xs font-mono text-zinc-400 pt-1">
                {unlockedAchievement.description}
              </p>
            </div>

            <button
              type="button"
              onClick={onDismissAchievement}
              className="mt-5 w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-mono font-bold text-xs transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              Acknowledge Record
            </button>
          </motion.div>
        </div>
      )}

      {/* 2. Promoted Rank Banner */}
      {promotedRank && (
        <div
          key={`rank-modal-${promotedRank.tier}`}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-sm rounded-2xl border border-emerald-500/30 bg-zinc-950/95 p-6 text-center shadow-2xl backdrop-blur-2xl ring-1 ring-emerald-500/20"
          >
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-inner">
              <Award className="h-7 w-7" />
            </div>

            <div className="space-y-1">
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-emerald-400 flex items-center justify-center gap-1">
                <Sparkles className="w-3 h-3" /> Promotion Confirmed
              </span>
              <h3 className="text-lg font-bold text-white">
                Rank: {promotedRank.name}
              </h3>
              <p className="text-xs font-mono text-zinc-400 pt-1">
                Tier {promotedRank.tier} Clearance Granted
              </p>
            </div>

            <button
              type="button"
              onClick={onDismissRank}
              className="mt-5 w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-mono font-bold text-xs transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              Continue Operations
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
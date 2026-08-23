"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Trophy, Award, Lock, Loader2, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getUserAchievements } from "@/actions/habits";

interface AchievementsDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AchievementsDialog({
  open: externalOpen,
  onOpenChange: setExternalOpen,
}: AchievementsDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [data, setData] = useState<{ achievements: any[]; rank: any } | null>(null);
  const [loading, setLoading] = useState(false);

  const isControlled = externalOpen !== undefined;
  const open = isControlled ? externalOpen : internalOpen;
  const setOpen = setExternalOpen || setInternalOpen;

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getUserAchievements();
      setData(res);
    } catch (err) {
      console.error("Failed to load achievements telemetry:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch data whenever the modal opens (handles both trigger click & mobile dropdown state)
  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open, loadData]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isControlled && (
        <DialogTrigger asChild>
          <button
            type="button"
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-mono text-zinc-400 hover:text-amber-400 hover:bg-white/[0.04] transition-all cursor-pointer rounded-lg"
            title="Protocol Milestones"
          >
            <Trophy className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Milestones</span>
          </button>
        </DialogTrigger>
      )}

      <DialogContent className="border border-white/10 bg-zinc-950/95 backdrop-blur-2xl text-zinc-100 sm:max-w-[500px] rounded-2xl p-6 shadow-2xl">
        <DialogHeader className="pb-3 border-b border-white/[0.06]">
          <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            Telemetry &amp; Milestones
          </DialogTitle>
          <p className="text-xs text-zinc-400 font-mono mt-0.5">
            Operational rank and unlocked protocol achievements.
          </p>
        </DialogHeader>

        {loading || !data ? (
          <div className="p-12 text-center text-xs font-mono text-zinc-500 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
            <span>Calculating rank metrics...</span>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            {/* Rank Banner */}
            <div className="p-4 rounded-xl border border-amber-500/25 bg-amber-500/[0.06] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400/90 font-bold block mb-0.5">
                  Current Rank
                </span>
                <span className="text-base font-extrabold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  {data.rank?.name || data.rank?.tier || "Novice Operative"}
                </span>
                {data.rank?.description && (
                  <span className="text-[11px] font-mono text-zinc-400 block mt-0.5">
                    {data.rank.description}
                  </span>
                )}
              </div>

              <div className="text-right shrink-0">
                <span className="font-mono text-xs px-2.5 py-1 rounded-lg border border-amber-500/30 bg-zinc-900 text-amber-300 font-bold">
                  {data.rank?.tier || "LEVEL 1"}
                </span>
              </div>
            </div>

            {/* Achievements Grid */}
            <div className="max-h-[280px] overflow-y-auto space-y-2 pr-1">
              {data.achievements?.map((item: any) => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    item.unlocked
                      ? "border-emerald-500/20 bg-emerald-500/[0.04]"
                      : "border-white/[0.04] bg-white/[0.01] opacity-50"
                  }`}
                >
                  <div className="flex items-center gap-3 truncate pr-2">
                    <div
                      className={`p-2 rounded-lg border ${
                        item.unlocked
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                          : "border-white/10 bg-zinc-900 text-zinc-600"
                      }`}
                    >
                      {item.unlocked ? <Award className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                    </div>
                    <div className="truncate">
                      <span className="text-xs font-bold text-zinc-200 block truncate">
                        {item.title}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-400 block truncate">
                        {item.description}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border shrink-0 ${
                      item.unlocked
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                        : "border-white/10 bg-white/[0.02] text-zinc-600"
                    }`}
                  >
                    {item.unlocked ? "Unlocked" : "Locked"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Users, Trophy, Flame, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getGlobalLeaderboard } from "@/actions/habits";

interface LeaderboardDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function LeaderboardDialog({
  open: externalOpen,
  onOpenChange: setExternalOpen,
}: LeaderboardDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isControlled = externalOpen !== undefined;
  const open = isControlled ? externalOpen : internalOpen;
  const setOpen = setExternalOpen || setInternalOpen;

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getGlobalLeaderboard();
      setLeaderboard(data.entries || []);
      setCurrentUserId(data.currentUserId);
    } catch (err) {
      console.error("Failed to load leaderboard telemetry:", err);
    } finally {
      setLoading(false);
    }
  }, []);

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
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-mono text-zinc-400 hover:text-sky-400 hover:bg-white/[0.04] transition-all cursor-pointer rounded-lg"
            title="Global Standings"
          >
            <Users className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Leaderboard</span>
          </button>
        </DialogTrigger>
      )}

      <DialogContent className="border border-white/10 bg-zinc-950/95 backdrop-blur-2xl text-zinc-100 sm:max-w-[480px] rounded-2xl p-6 shadow-2xl">
        <DialogHeader className="pb-3 border-b border-white/[0.06]">
          <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-sky-400" />
            Global Protocol Standings
          </DialogTitle>
          <p className="text-xs text-zinc-400 font-mono mt-0.5">
            Top operators ranked by total protocol execution score and consistency.
          </p>
        </DialogHeader>

        <div className="py-2 max-h-[340px] overflow-y-auto space-y-2 pr-1">
          {loading ? (
            <div className="p-12 text-center text-xs font-mono text-zinc-500 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
              <span>Fetching telemetry data...</span>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="p-10 text-center text-xs font-mono text-zinc-500">
              No standings recorded yet.
            </div>
          ) : (
            leaderboard.map((item, idx) => {
              const isCurrentUser = item.userId === currentUserId;
              return (
                <div
                  key={item.userId || idx}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    isCurrentUser
                      ? "border-sky-500/30 bg-sky-500/[0.06]"
                      : "border-white/[0.06] bg-white/[0.01]"
                  }`}
                >
                  <div className="flex items-center gap-3 truncate pr-2">
                    <div className="w-5 text-center font-mono text-xs font-bold text-zinc-500">
                      #{idx + 1}
                    </div>
                    <div className="truncate">
                      <span className="text-xs font-bold text-zinc-200 block truncate">
                        {item.name || "Anonymous Operator"} {isCurrentUser && "(You)"}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500">
                        Rank: {item.rank?.name || "Novice"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 font-mono text-xs">
                    <div className="flex items-center gap-1 text-amber-400" title="Longest Active Streak">
                      <Flame className="w-3.5 h-3.5" />
                      <span>{item.maxStreak || 0}d</span>
                    </div>
                    <div className="flex items-center gap-1 text-emerald-400" title="Total Completions">
                      <Trophy className="w-3.5 h-3.5" />
                      <span>{item.totalCompletions || 0}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
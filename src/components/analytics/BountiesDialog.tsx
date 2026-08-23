"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Target, ShieldCheck, Check, Loader2, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getUserBounties, claimBountyReward } from "@/actions/bounties";

interface BountiesDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onRewardClaimed?: () => void;
}

export function BountiesDialog({
  open: externalOpen,
  onOpenChange: setExternalOpen,
  onRewardClaimed,
}: BountiesDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [bounties, setBounties] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const isControlled = externalOpen !== undefined;
  const open = isControlled ? externalOpen : internalOpen;
  const setOpen = setExternalOpen || setInternalOpen;

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getUserBounties();
      setBounties(data || []);
    } catch (err) {
      console.error("Failed to load bounties:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open, loadData]);

  const handleClaim = async (bountyId: string) => {
    setClaimingId(bountyId);
    try {
      await claimBountyReward(bountyId);
      await loadData();
      onRewardClaimed?.();
    } finally {
      setClaimingId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isControlled && (
        <DialogTrigger asChild>
          <button
            type="button"
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-mono text-zinc-400 hover:text-emerald-400 hover:bg-white/[0.04] transition-all cursor-pointer rounded-lg"
            title="Operation Bounties"
          >
            <Target className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Bounties</span>
          </button>
        </DialogTrigger>
      )}

      <DialogContent className="border border-white/10 bg-zinc-950/95 backdrop-blur-2xl text-zinc-100 sm:max-w-[500px] rounded-2xl p-6 shadow-2xl">
        <DialogHeader className="pb-3 border-b border-white/[0.06]">
          <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-400" />
            Operational Bounties
          </DialogTitle>
          <p className="text-xs text-zinc-400 font-mono mt-0.5">
            Complete high-value tactical milestones to earn Streak Freeze Shields.
          </p>
        </DialogHeader>

        <div className="py-2 max-h-[340px] overflow-y-auto space-y-3 pr-1">
          {loading ? (
            <div className="p-12 text-center text-xs font-mono text-zinc-500 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
              <span>Scanning tactical objectives...</span>
            </div>
          ) : bounties.length === 0 ? (
            <div className="p-10 text-center text-xs font-mono text-zinc-500">
              No active operational bounties available.
            </div>
          ) : (
            bounties.map((bounty) => {
              const percentage = Math.round((bounty.progress / bounty.targetCount) * 100);

              return (
                <div
                  key={bounty.id}
                  className={`p-4 rounded-xl border transition-all ${
                    bounty.claimed
                      ? "border-white/[0.06] bg-white/[0.01] opacity-60"
                      : bounty.completed
                      ? "border-emerald-500/30 bg-emerald-500/[0.04] shadow-[0_0_15px_rgba(16,185,129,0.08)]"
                      : "border-white/[0.08] bg-zinc-900/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-zinc-100">{bounty.title}</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded border border-white/10 bg-white/[0.03] text-zinc-400">
                          {bounty.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                        {bounty.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 font-mono text-xs text-sky-400 font-bold shrink-0 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded-lg">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>+{bounty.rewardShields}</span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                        <span>Progress</span>
                        <span>
                          {bounty.progress} / {bounty.targetCount}
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-400 to-sky-400 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>

                    {bounty.claimed ? (
                      <span className="inline-flex items-center gap-1 font-mono text-[10px] text-emerald-400 font-bold px-2.5 py-1 rounded-lg border border-emerald-500/20 bg-emerald-500/10 shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                        Claimed
                      </span>
                    ) : bounty.completed ? (
                      <button
                        type="button"
                        onClick={() => handleClaim(bounty.id)}
                        disabled={claimingId === bounty.id}
                        className="inline-flex items-center gap-1 font-mono text-xs font-bold text-zinc-950 bg-emerald-400 hover:bg-emerald-300 px-3 py-1 rounded-lg transition-all active:scale-95 cursor-pointer shrink-0 disabled:opacity-50"
                      >
                        {claimingId === bounty.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Sparkles className="w-3.5 h-3.5" />
                        )}
                        Claim Shield
                      </button>
                    ) : (
                      <span className="font-mono text-[10px] text-zinc-500 uppercase shrink-0">
                        In Progress
                      </span>
                    )}
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
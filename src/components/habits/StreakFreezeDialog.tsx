"use client";

import React, { useState, useTransition } from "react";
import { ShieldAlert, ShieldCheck, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useStreakFreeze } from "@/actions/habits";

interface StreakFreezeDialogProps {
  habitId: string;
  habitTitle: string;
  targetDate: string;
  shieldsAvailable: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplied?: () => void;
}

export function StreakFreezeDialog({
  habitId,
  habitTitle,
  targetDate,
  shieldsAvailable,
  open,
  onOpenChange,
  onApplied,
}: StreakFreezeDialogProps) {
  const [isPending, startTransition] = useTransition();

  const handleApplyFreeze = () => {
    startTransition(async () => {
      await useStreakFreeze(habitId, targetDate);
      onOpenChange(false);
      onApplied?.();
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border border-sky-500/30 bg-zinc-950/95 backdrop-blur-2xl text-zinc-100 sm:max-w-[420px] rounded-2xl p-6 shadow-2xl">
        <DialogHeader className="space-y-2 pb-2">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <DialogTitle className="text-center text-base font-bold text-white">
            Apply Streak Freeze Shield
          </DialogTitle>
          <p className="text-center text-xs text-zinc-400 font-mono">
            Preserve your unbroken chain for <span className="text-zinc-200">{targetDate}</span> on &ldquo;{habitTitle}&rdquo;.
          </p>
        </DialogHeader>

        <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02] flex items-center justify-between font-mono text-xs my-2">
          <span className="text-zinc-400">Available Shields:</span>
          <span className="font-bold text-sky-400">{shieldsAvailable} Shield{shieldsAvailable === 1 ? "" : "s"}</span>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={shieldsAvailable <= 0 || isPending}
            onClick={handleApplyFreeze}
            className="inline-flex items-center gap-1.5 rounded-xl bg-sky-500 px-4 py-2 text-xs font-bold text-zinc-950 hover:bg-sky-400 active:scale-95 transition-all shadow-md disabled:opacity-40 cursor-pointer"
          >
            {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>Consume 1 Shield</span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
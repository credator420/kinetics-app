"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Archive, RotateCcw, Trash2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getArchivedHabits, toggleArchiveHabit, deleteHabit } from "@/actions/habits";

interface ArchivedHabitsDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onChanged?: () => void;
}

export function ArchivedHabitsDialog({
  open: externalOpen,
  onOpenChange: setExternalOpen,
  onChanged,
}: ArchivedHabitsDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [archivedHabits, setArchivedHabits] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const isControlled = externalOpen !== undefined;
  const open = isControlled ? externalOpen : internalOpen;
  const setOpen = setExternalOpen || setInternalOpen;

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getArchivedHabits();
      setArchivedHabits(res || []);
    } catch (err) {
      console.error("Failed to load archived habits:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch archives whenever the dialog is opened
  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open, loadData]);

  const handleRestore = async (id: string) => {
    await toggleArchiveHabit(id);
    await loadData();
    onChanged?.();
  };

  const handleDelete = async (id: string) => {
    await deleteHabit(id);
    await loadData();
    onChanged?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isControlled && (
        <DialogTrigger asChild>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-mono text-zinc-400 hover:text-zinc-200 hover:border-white/20 transition-all cursor-pointer"
          >
            <Archive className="w-3.5 h-3.5" />
            <span>Archives</span>
          </button>
        </DialogTrigger>
      )}

      <DialogContent className="border border-white/10 bg-zinc-950/95 backdrop-blur-2xl text-zinc-100 sm:max-w-[480px] rounded-2xl p-6 shadow-2xl">
        <DialogHeader className="pb-3 border-b border-white/[0.06]">
          <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
            <Archive className="w-4 h-4 text-amber-400" />
            Archived Protocols
          </DialogTitle>
          <p className="text-xs text-zinc-400 font-mono mt-0.5">
            Restore archived habits back to the pipeline or delete them permanently.
          </p>
        </DialogHeader>

        <div className="py-2 max-h-[340px] overflow-y-auto space-y-2 pr-1">
          {loading ? (
            <div className="p-12 text-center text-xs font-mono text-zinc-500 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
              <span>Loading archives...</span>
            </div>
          ) : archivedHabits.length === 0 ? (
            <div className="p-10 text-center text-xs font-mono text-zinc-500">
              No archived protocols found.
            </div>
          ) : (
            archivedHabits.map((habit) => (
              <div
                key={habit.id}
                className="flex items-center justify-between p-3 rounded-xl border border-white/[0.06] bg-white/[0.01]"
              >
                <div className="space-y-0.5 truncate pr-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-zinc-200 truncate">{habit.title}</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded border border-white/10 bg-white/[0.02] text-zinc-400">
                      {habit.category}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500 block">
                    {habit.logs?.length || 0} lifetime executions
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleRestore(habit.id)}
                    className="p-1.5 rounded-lg border border-white/10 hover:border-emerald-500/40 text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors cursor-pointer"
                    title="Restore habit"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(habit.id)}
                    className="p-1.5 rounded-lg border border-white/10 hover:border-rose-500/40 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title="Delete permanently"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
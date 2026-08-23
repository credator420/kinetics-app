"use client";

import React, { useState, useEffect } from "react";
import { Edit2, Trash2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { updateHabit, deleteHabit } from "@/actions/habits";
import { HabitItem } from "./HabitCard";
import { CategorySelector } from "./CategorySelector";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

interface EditHabitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habit: HabitItem;
  onHabitUpdated: () => void;
}

export function EditHabitDialog({
  open,
  onOpenChange,
  habit,
  onHabitUpdated,
}: EditHabitDialogProps) {
  const [title, setTitle] = useState(habit.title);
  const [category, setCategory] = useState(habit.category);
  const [targetDays, setTargetDays] = useState(habit.targetPerWeek || 7);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTrashHovered, setIsTrashHovered] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  useEffect(() => {
    setTitle(habit.title);
    setCategory(habit.category);
    setTargetDays(habit.targetPerWeek || 7);
    setError(null);
  }, [habit, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Protocol title is required.");
      return;
    }
    if (!category.trim()) {
      setError("Please select or define a category sector.");
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await updateHabit({
        id: habit.id,
        title: title.trim(),
        category: category.trim().toUpperCase(),
        targetDaysPerWeek: Number(targetDays),
      });
      onOpenChange(false);
      onHabitUpdated();
    } catch {
      setError("Failed to modify protocol. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleExecuteDelete = async () => {
    await deleteHabit(habit.id);
    onOpenChange(false);
    onHabitUpdated();
  };

  return (
    <>
      <ConfirmDialog
        open={showConfirmDelete}
        onOpenChange={setShowConfirmDelete}
        title="Terminate Protocol"
        description={`Are you sure you want to permanently delete "${habit.title}"? All historical streak records and log notes will be erased.`}
        confirmLabel="Delete Protocol"
        cancelLabel="Cancel"
        onConfirm={handleExecuteDelete}
      />

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="border border-white/10 bg-zinc-950/95 backdrop-blur-2xl text-zinc-100 sm:max-w-[460px] rounded-2xl p-6 shadow-2xl">
          <DialogHeader className="pb-3 border-b border-white/[0.06] flex flex-row items-center justify-between">
            <DialogTitle className="text-base font-bold text-white flex items-center gap-2 font-mono">
              <Edit2 className="w-4 h-4 text-sky-400" />
              Modify Protocol
            </DialogTitle>

            {/* Trash Delete Action */}
            <div className="relative mr-10">
              <button
                type="button"
                onClick={() => setShowConfirmDelete(true)}
                onMouseEnter={() => setIsTrashHovered(true)}
                onMouseLeave={() => setIsTrashHovered(false)}
                className="p-1.5 rounded-xl border border-transparent hover:border-rose-500/30 hover:bg-rose-500/10 text-zinc-500 hover:text-rose-400 transition-all cursor-pointer active:scale-90"
                aria-label="Delete Protocol"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              {/* Custom Delete Tooltip */}
              <AnimatePresence>
                {isTrashHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -2, scale: 0.95 }}
                    transition={{ duration: 0.1 }}
                    className="pointer-events-none absolute right-0 top-8 z-50 whitespace-nowrap"
                  >
                    <div className="rounded-lg border border-white/20 bg-zinc-950/98 px-2 py-1 font-mono text-[10px] font-bold text-rose-400 shadow-xl backdrop-blur-xl ring-1 ring-white/10">
                      Delete Protocol
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit} noValidate className="space-y-4 pt-2 font-mono text-xs">
            <div className="space-y-1.5">
              <label className="text-zinc-400 text-[11px] uppercase tracking-wider font-bold block">
                Protocol Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (error) setError(null);
                }}
                required
                className={`w-full bg-zinc-900/80 border rounded-xl px-3 py-2 text-zinc-100 placeholder:text-zinc-600 focus:outline-none text-xs transition-all ${
                  error
                    ? "border-rose-500/70 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                    : "border-white/10 focus:border-sky-400 focus:ring-1 focus:ring-sky-400"
                }`}
              />
              {error && (
                <div className="flex items-center gap-1.5 text-rose-400 text-[11px] pt-0.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* Symmetrical 2-Column Grid with Matched Line Heights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
              <CategorySelector value={category} onChange={setCategory} />

              <div className="space-y-1.5 font-mono text-xs">
                <div className="flex h-5 items-center">
                  <label className="text-zinc-400 text-[11px] uppercase tracking-wider font-bold block">
                    Weekly Target (Days)
                  </label>
                </div>
                <select
                  value={targetDays}
                  onChange={(e) => setTargetDays(Number(e.target.value))}
                  className="w-full h-9 bg-zinc-900/80 border border-white/10 rounded-xl px-3 text-zinc-100 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 text-xs transition-all cursor-pointer"
                >
                  {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                    <option key={d} value={d} className="bg-zinc-950 text-zinc-200">
                      {d} {d === 1 ? "day" : "days"} / week
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 mt-2 rounded-xl bg-sky-500 hover:bg-sky-400 active:scale-98 text-zinc-950 font-bold transition-all text-xs cursor-pointer shadow-md shadow-sky-500/20 disabled:opacity-50"
            >
              {submitting ? "Updating..." : "Save Modifications"}
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
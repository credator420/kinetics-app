"use client";

import React, { useState } from "react";
import { Plus, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createHabit } from "@/actions/habits";
import { CategorySelector, PRESET_CATEGORIES } from "./CategorySelector";

interface NewHabitDialogProps {
  onHabitCreated: () => void;
}

export function NewHabitDialog({ onHabitCreated }: NewHabitDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(PRESET_CATEGORIES[0]);
  const [targetDays, setTargetDays] = useState(7);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      await createHabit({
        title: title.trim(),
        category: category.trim().toUpperCase(),
        targetDaysPerWeek: Number(targetDays),
      });
      setTitle("");
      setCategory(PRESET_CATEGORIES[0]);
      setOpen(false);
      onHabitCreated();
    } catch {
      setError("Failed to initialize protocol. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => { setOpen(val); setError(null); }}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="flex h-8 sm:h-9 items-center justify-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-zinc-950 px-2.5 sm:px-3.5 font-mono text-xs font-bold transition-all shadow-md shadow-emerald-500/10 cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span className="hidden xs:inline sm:inline">Action</span>
        </button>
      </DialogTrigger>

      <DialogContent className="border border-white/10 bg-zinc-950/95 backdrop-blur-2xl text-zinc-100 sm:max-w-[460px] rounded-2xl p-6 shadow-2xl">
        <DialogHeader className="pb-3 border-b border-white/[0.06]">
          <DialogTitle className="text-base font-bold text-white flex items-center gap-2 font-mono">
            <Plus className="w-4 h-4 text-emerald-400" />
            Register Target Protocol
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate className="space-y-4 pt-2 font-mono text-xs">
          {/* Protocol Title Field */}
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
              placeholder="e.g. 5km Morning Run, Read 20 Pages"
              className={`w-full bg-zinc-900/80 border rounded-xl px-3 py-2 text-zinc-100 placeholder:text-zinc-600 focus:outline-none text-xs transition-all ${
                error
                  ? "border-rose-500/70 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                  : "border-white/10 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
              }`}
            />
            {error && (
              <div className="flex items-center gap-1.5 text-rose-400 text-[11px] pt-0.5">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Symmetrical 2-Column Grid with Synchronized Label Heights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
            <CategorySelector value={category} onChange={setCategory} />

            <div className="space-y-1.5 font-mono text-xs">
              <div className="flex h-5 items-center">
                <label className="text-zinc-400 text-[11px] uppercase tracking-wider font-bold block">
                  Weekly Target
                </label>
              </div>
              <select
                value={targetDays}
                onChange={(e) => setTargetDays(Number(e.target.value))}
                className="w-full h-9 bg-zinc-900/80 border border-white/10 rounded-xl px-3 text-zinc-100 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 text-xs transition-all cursor-pointer"
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
            className="w-full py-2.5 mt-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-98 text-zinc-950 font-bold transition-all text-xs cursor-pointer shadow-md shadow-emerald-500/20 disabled:opacity-50"
          >
            {submitting ? "Deploying..." : "Initialize Protocol"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
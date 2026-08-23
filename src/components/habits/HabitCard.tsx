"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Flame,
  MoreVertical,
  Edit2,
  Archive,
  AlertTriangle,
  GripVertical,
  FileText,
  CheckCheck,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditHabitDialog } from "./EditHabitDialog";
import { toggleArchiveHabit, saveHabitLogNote } from "@/actions/habits";
import { calculateEntropyStatus } from "@/lib/entropy";

export interface HabitItem {
  id: string;
  title: string;
  description?: string | null;
  category: string;
  streak: number;
  completed: boolean;
  note?: string;
  frequency?: string;
  weeklyCompletions?: number;
  targetPerWeek?: number;
}

interface HabitCardProps {
  habit: HabitItem;
  selectedDate?: string;
  onToggle: (id: string) => void;
  onSaveNoteOptimistic: (id: string, note: string) => void;
  onChanged: () => void;
  onOpenDossier: (id: string) => void;
}

export function HabitCard({
  habit,
  selectedDate,
  onToggle,
  onSaveNoteOptimistic,
  onChanged,
  onOpenDossier,
}: HabitCardProps) {
  const [showEdit, setShowEdit] = useState(false);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [noteText, setNoteText] = useState(habit.note || "");
  const [savingNote, setSavingNote] = useState(false);

  const targetDate = selectedDate || new Date().toISOString().split("T")[0];
  const entropy = calculateEntropyStatus(habit.streak, habit.completed, targetDate);

  const handleArchive = async () => {
    await toggleArchiveHabit(habit.id);
    onChanged();
  };

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNote = noteText.trim();
    setSavingNote(true);
    onSaveNoteOptimistic(habit.id, cleanNote);
    setShowNoteInput(false);

    try {
      await saveHabitLogNote(habit.id, targetDate, cleanNote);
    } catch {
      onSaveNoteOptimistic(habit.id, habit.note || "");
    } finally {
      setSavingNote(false);
    }
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        className={`group relative flex flex-col rounded-2xl border backdrop-blur-xl transition-colors duration-150 ${
          habit.completed
            ? "border-emerald-500/20 bg-emerald-950/10 shadow-sm"
            : entropy.isCritical
            ? "border-amber-500/60 bg-amber-950/20 shadow-[0_0_20px_rgba(245,158,11,0.12)] ring-1 ring-amber-500/30"
            : "border-white/[0.08] bg-zinc-950/60 hover:border-white/20 hover:bg-zinc-900/60 shadow-sm"
        }`}
      >
        {entropy.isCritical && (
          <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r bg-amber-500 animate-pulse" />
        )}

        <div className="flex items-center justify-between gap-2.5 p-3 sm:p-4">
          {/* Drag Handle */}
          <div className="cursor-grab active:cursor-grabbing text-zinc-600 hover:text-zinc-300 p-0.5 shrink-0 transition-colors focus-visible:outline-none focus-visible:text-white">
            <GripVertical className="w-4 h-4" />
          </div>

          {/* Tactile Toggle Checkbox */}
          <button
            type="button"
            onClick={() => onToggle(habit.id)}
            aria-label={`Toggle completion for ${habit.title}`}
            className={`flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-xl border transition-all duration-150 shrink-0 cursor-pointer select-none active:scale-[0.88] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 ${
              habit.completed
                ? "border-emerald-500 bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20 scale-100"
                : entropy.isCritical
                ? "border-amber-500/80 bg-amber-500/10 text-transparent hover:border-amber-400 hover:bg-amber-500/20 hover:scale-105"
                : "border-white/20 bg-white/[0.02] text-transparent hover:border-white/40 hover:bg-white/[0.06] hover:scale-105"
            }`}
          >
            <Check
              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3] transition-transform duration-150 ${
                habit.completed ? "scale-100 block" : "scale-50 hidden"
              }`}
            />
          </button>

          {/* Habit Content Area */}
          <div
            onClick={() => onOpenDossier(habit.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && onOpenDossier(habit.id)}
            className="min-w-0 flex-1 space-y-1 cursor-pointer select-none pr-1 rounded-lg focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400/50"
          >
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-sm sm:text-base font-bold tracking-tight transition-all duration-150 truncate ${
                  habit.completed ? "text-zinc-500 line-through" : "text-zinc-100"
                }`}
              >
                {habit.title}
              </span>

              {entropy.isCritical && (
                <span className="inline-flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded-full border border-amber-500/40 bg-amber-500/15 text-amber-300 animate-pulse font-semibold shrink-0">
                  <AlertTriangle className="w-3 h-3 text-amber-400" />
                  <span>CRITICAL: {entropy.timeLabel}</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
              <span className="text-[10px] px-1.5 py-0.2 rounded border border-white/10 bg-white/[0.02] text-zinc-400 shrink-0 font-medium">
                {habit.category}
              </span>
              {habit.note ? (
                <span className="text-sky-400/90 text-[11px] truncate flex items-center gap-1">
                  <FileText className="w-3 h-3 shrink-0" />
                  {habit.note}
                </span>
              ) : habit.description ? (
                <span className="truncate text-zinc-400 text-[11px] hidden sm:inline">
                  {habit.description}
                </span>
              ) : null}
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 pl-1">
            {habit.streak > 0 && (
              <div
                className={`flex items-center gap-1 font-mono text-xs font-bold px-2 py-1 rounded-lg border transition-all ${
                  entropy.isCritical
                    ? "border-amber-500/40 bg-amber-500/15 text-amber-300"
                    : "border-amber-500/20 bg-amber-500/[0.06] text-amber-400"
                }`}
              >
                <Flame className="w-3.5 h-3.5 fill-amber-500/20" />
                <span>{habit.streak}d</span>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowNoteInput(!showNoteInput)}
              title="Add / Edit Execution Note"
              className={`p-1.5 rounded-xl border transition-all duration-150 cursor-pointer active:scale-[0.92] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-400 ${
                habit.note
                  ? "border-sky-500/30 bg-sky-500/10 text-sky-400 hover:bg-sky-500/20"
                  : "border-transparent hover:border-white/10 hover:bg-white/[0.04] text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <FileText className="w-4 h-4" />
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="p-1.5 rounded-xl border border-transparent hover:border-white/10 hover:bg-white/[0.04] text-zinc-400 hover:text-zinc-200 transition-all duration-150 cursor-pointer active:scale-[0.92] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/30"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-36 rounded-xl border border-white/10 bg-zinc-950/95 backdrop-blur-2xl p-1 text-zinc-300 shadow-xl z-50 animate-in fade-in-50 zoom-in-95 duration-100"
              >
                <DropdownMenuItem
                  onClick={() => onOpenDossier(habit.id)}
                  className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-mono rounded-lg hover:bg-white/10 hover:text-white cursor-pointer active:scale-[0.98] transition-transform"
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Dossier</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setShowEdit(true)}
                  className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-mono rounded-lg hover:bg-white/10 hover:text-white cursor-pointer active:scale-[0.98] transition-transform"
                >
                  <Edit2 className="w-3.5 h-3.5 text-sky-400" />
                  <span>Edit Target</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleArchive}
                  className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-mono rounded-lg hover:bg-white/10 hover:text-white cursor-pointer active:scale-[0.98] transition-transform"
                >
                  <Archive className="w-3.5 h-3.5 text-amber-400" />
                  <span>Archive</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Optimistic Inline Execution Note Drawer */}
        <AnimatePresence>
          {showNoteInput && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.15 }}
              onSubmit={handleSaveNote}
              className="px-4 pb-3 flex items-center gap-2 border-t border-white/[0.04] pt-2.5 overflow-hidden"
            >
              <input
                type="text"
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Add memo (e.g. 5km run in 24m, Chapter 4)..."
                className="flex-1 bg-zinc-900/80 border border-white/10 rounded-xl px-3 py-1.5 text-xs font-mono text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition-all"
                autoFocus
              />
              <button
                type="submit"
                disabled={savingNote}
                className="px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 active:scale-[0.95] text-zinc-950 font-mono font-bold text-xs flex items-center gap-1 cursor-pointer transition-all shadow-md shadow-sky-500/20 disabled:opacity-50"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>

      <EditHabitDialog
        open={showEdit}
        onOpenChange={setShowEdit}
        habit={habit}
        onHabitUpdated={onChanged}
      />
    </>
  );
}
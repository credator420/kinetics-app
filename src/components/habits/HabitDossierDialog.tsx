"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Flame,
  CheckCircle2,
  Calendar,
  Loader2,
  Activity,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getHabitDossier } from "@/actions/habits";

interface HabitDossierDialogProps {
  habitId: string | null;
  onOpenChange: (open: boolean) => void;
}

export function HabitDossierDialog({ habitId, onOpenChange }: HabitDossierDialogProps) {
  const [dossier, setDossier] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [hoveredCell, setHoveredCell] = useState<{
    dateStr: string;
    formattedDate: string;
    completed: boolean;
    note?: string | null;
    x: number;
    y: number;
  } | null>(null);

  useEffect(() => {
    if (!habitId) {
      setDossier(null);
      setHoveredCell(null);
      return;
    }
    setLoading(true);
    getHabitDossier(habitId)
      .then((data) => setDossier(data))
      .finally(() => setLoading(false));
  }, [habitId]);

  const handleMouseEnter = (
    e: React.MouseEvent<HTMLDivElement>,
    day: { dateStr: string; completed: boolean; note?: string | null }
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const [y, m, d] = day.dateStr.split("-").map(Number);
    const dateObj = new Date(y, m - 1, d);
    const formattedDate = dateObj.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

    setHoveredCell({
      ...day,
      formattedDate,
      x: rect.left + rect.width / 2,
      y: rect.top,
    });
  };

  return (
    <>
      {/* Global Fixed Tooltip to avoid modal container clipping */}
      <AnimatePresence>
        {hoveredCell && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 2, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            style={{
              position: "fixed",
              left: `${hoveredCell.x}px`,
              top: `${hoveredCell.y - 8}px`,
              transform: "translate(-50%, -100%)",
              zIndex: 99999,
            }}
            className="pointer-events-none flex flex-col items-center min-w-[160px]"
          >
            <div className="rounded-xl border border-white/20 bg-zinc-950/98 px-3 py-2 shadow-2xl backdrop-blur-2xl text-center space-y-1 ring-1 ring-white/10 w-full">
              <div className="flex items-center justify-center gap-1.5 font-mono text-[10px] text-zinc-400">
                <Calendar className="w-3 h-3 text-sky-400" />
                <span>{hoveredCell.formattedDate}</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 font-mono text-xs font-bold">
                <Activity
                  className={`w-3.5 h-3.5 ${
                    hoveredCell.completed ? "text-emerald-400" : "text-zinc-500"
                  }`}
                />
                <span className={hoveredCell.completed ? "text-emerald-400" : "text-zinc-400"}>
                  {hoveredCell.completed ? "Executed" : "Missed"}
                </span>
              </div>
              {hoveredCell.note && (
                <div className="text-[10px] font-mono text-sky-300 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded mt-1 truncate">
                  &ldquo;{hoveredCell.note}&rdquo;
                </div>
              )}
            </div>
            <div className="w-2 h-2 rotate-45 border-r border-b border-white/20 bg-zinc-950 -mt-1" />
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog open={!!habitId} onOpenChange={onOpenChange}>
        <DialogContent className="border border-white/10 bg-zinc-950/95 backdrop-blur-2xl text-zinc-100 sm:max-w-[540px] rounded-2xl p-6 shadow-2xl">
          {loading || !dossier ? (
            <div className="py-16 text-center text-xs font-mono text-zinc-500 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
              <span>Decrypting protocol telemetry...</span>
            </div>
          ) : (
            <div className="space-y-6">
              <DialogHeader className="pb-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-semibold">
                    {dossier.category}
                  </span>
                </div>
                <DialogTitle className="text-lg font-bold text-white mt-1">
                  {dossier.title}
                </DialogTitle>
                {dossier.description && (
                  <p className="text-xs text-zinc-400 font-mono mt-0.5">{dossier.description}</p>
                )}
              </DialogHeader>

              {/* Performance Metric Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl border border-white/[0.08] bg-zinc-900/40 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-zinc-500 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-amber-400" /> All-Time Record
                  </span>
                  <p className="text-2xl font-bold font-mono text-white">{dossier.longestStreak}d</p>
                </div>

                <div className="p-3.5 rounded-xl border border-white/[0.08] bg-zinc-900/40 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-zinc-500 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Lifetime Executions
                  </span>
                  <p className="text-2xl font-bold font-mono text-white">{dossier.totalCompletions}</p>
                </div>
              </div>

              {/* Clean 30-Day Execution Grid */}
              <div className="p-4 rounded-xl border border-white/[0.08] bg-zinc-900/40 space-y-3">
                <div className="flex justify-between items-center text-xs font-mono text-zinc-300">
                  <span className="font-bold flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-sky-400" />
                    30-Day Execution Matrix
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono">Trailing Array</span>
                </div>

                <div className="grid grid-cols-10 gap-1.5 sm:gap-2 pt-1 bg-black/40 p-2.5 rounded-xl border border-white/[0.04]">
                  {dossier.days30.map((d: any) => (
                    <div
                      key={d.dateStr}
                      onMouseEnter={(e) => handleMouseEnter(e, d)}
                      onMouseLeave={() => setHoveredCell(null)}
                      className={`h-7 rounded-md border transition-all duration-150 cursor-pointer hover:scale-110 ${
                        d.completed
                          ? "bg-emerald-500 border-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                          : "bg-zinc-800/90 border-zinc-700/80 hover:border-zinc-500 hover:bg-zinc-700"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Field Notes & Memos Log */}
              <div className="space-y-2">
                <span className="text-xs font-mono uppercase text-zinc-400 font-bold flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-zinc-400" />
                  Logged Execution Memos
                </span>

                {dossier.recentNotes.length === 0 ? (
                  <p className="text-xs font-mono text-zinc-600 p-4 border border-dashed border-white/10 rounded-xl text-center">
                    No execution field notes logged for this protocol yet.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                    {dossier.recentNotes.map((log: any) => (
                      <div
                        key={log.id}
                        className="p-2.5 rounded-lg border border-white/[0.06] bg-zinc-900/30 flex items-start justify-between gap-3 text-xs font-mono"
                      >
                        <span className="text-zinc-300 flex-1">{log.note}</span>
                        <span className="text-[10px] text-zinc-500 shrink-0">{log.date}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
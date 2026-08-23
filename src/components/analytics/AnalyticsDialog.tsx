"use client";

import React, { useState, useMemo } from "react";
import {
  TrendingUp,
  Activity,
  Layers,
  CalendarRange,
  Zap,
  BarChart2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { HabitItem } from "@/components/habits/HabitCard";

interface AnalyticsDialogProps {
  habits: HabitItem[];
  heatmapData: Record<string, number>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AnalyticsDialog({
  habits,
  heatmapData,
  open,
  onOpenChange,
}: AnalyticsDialogProps) {
  const [rangeDays, setRangeDays] = useState<7 | 14 | 30>(14);

  // 1. Compute Trailing Trajectory
  const trendDays = useMemo(() => {
    const arr: { dateStr: string; label: string; count: number }[] = [];
    const now = new Date();

    for (let i = rangeDays - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const yr = d.getFullYear();
      const mo = String(d.getMonth() + 1).padStart(2, "0");
      const dt = String(d.getDate()).padStart(2, "0");
      const dateStr = `${yr}-${mo}-${dt}`;

      arr.push({
        dateStr,
        label: d.toLocaleDateString("en-US", {
          weekday: rangeDays === 30 ? undefined : "narrow",
          day: "numeric",
          month: rangeDays === 30 ? "numeric" : undefined,
        }),
        count: heatmapData[dateStr] || 0,
      });
    }
    return arr;
  }, [heatmapData, rangeDays]);

  const maxTrend = useMemo(
    () => Math.max(...trendDays.map((d) => d.count), 1),
    [trendDays]
  );
  const totalExecutionsInRange = useMemo(
    () => trendDays.reduce((acc, cur) => acc + cur.count, 0),
    [trendDays]
  );

  // 2. Sector / Category Distribution
  const categoryStats = useMemo(() => {
    const map: Record<string, { count: number; totalHabits: number }> = {};

    habits.forEach((h) => {
      const cat = (h.category || "GENERAL").toUpperCase();
      if (!map[cat]) {
        map[cat] = { count: 0, totalHabits: 0 };
      }
      map[cat].totalHabits += 1;
      map[cat].count += h.weeklyCompletions || 0;
    });

    const entries = Object.entries(map).map(([name, data]) => ({
      name,
      executions: data.count,
      habitCount: data.totalHabits,
    }));

    const maxCount = Math.max(...entries.map((e) => e.executions), 1);
    return { entries, maxCount };
  }, [habits]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border border-white/10 bg-zinc-950/95 backdrop-blur-2xl text-zinc-100 sm:max-w-[580px] rounded-2xl p-6 shadow-2xl">
        <DialogHeader className="pb-3 border-b border-white/[0.06]">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-sky-400" />
              Operational Velocity & Telemetry
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* Velocity Trend Section */}
          <div className="p-4 rounded-xl border border-white/[0.08] bg-zinc-900/40 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-xs font-mono font-bold text-zinc-200 block">
                  Execution Output
                </span>
                <span className="text-[10px] font-mono text-zinc-400">
                  {totalExecutionsInRange} completed actions in selected window
                </span>
              </div>

              {/* Time Range Selector */}
              <div className="flex items-center rounded-lg border border-white/10 bg-zinc-950/60 p-0.5 font-mono text-[10px]">
                {([7, 14] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRangeDays(r)}
                    className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                      rangeDays === r
                        ? "bg-sky-500 text-zinc-950 font-bold"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {r}D
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Bar Graph */}
            <div className="h-36 flex items-end justify-between gap-1 pt-3 px-1">
              {trendDays.map((item, idx) => {
                const heightPercent = Math.round((item.count / maxTrend) * 100);
                return (
                  <div
                    key={idx}
                    className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group cursor-pointer"
                    title={`${item.dateStr}: ${item.count} executions`}
                  >
                    <div className="w-full relative flex items-end justify-center h-24">
                      <div
                        style={{ height: `${Math.max(heightPercent, 5)}%` }}
                        className={`w-full max-w-[16px] rounded-t transition-all ${
                          item.count > 0
                            ? "bg-gradient-to-t from-sky-600 to-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.3)] group-hover:from-sky-500 group-hover:to-sky-300"
                            : "bg-zinc-800/80 group-hover:bg-zinc-700"
                        }`}
                      />
                    </div>
                    <span className="text-[9px] font-mono text-zinc-500 group-hover:text-zinc-200">
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sector Allocation Breakdown */}
          <div className="p-4 rounded-xl border border-white/[0.08] bg-zinc-900/40 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-bold text-zinc-200 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                Sector Allocation (Current Week)
              </span>
              <span className="text-[10px] text-zinc-500">Trailing 7 Days</span>
            </div>

            {categoryStats.entries.length === 0 ? (
              <p className="text-xs font-mono text-zinc-500 py-4 text-center">
                No active protocols registered.
              </p>
            ) : (
              <div className="space-y-3 pt-1">
                {categoryStats.entries.map((cat) => {
                  const percent = Math.round(
                    (cat.executions / categoryStats.maxCount) * 100
                  );
                  return (
                    <div key={cat.name} className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-zinc-300 flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                          {cat.name}
                          <span className="text-[10px] text-zinc-500">
                            ({cat.habitCount} {cat.habitCount === 1 ? "protocol" : "protocols"})
                          </span>
                        </span>
                        <span className="text-emerald-400 font-bold">
                          {cat.executions} runs
                        </span>
                      </div>
                      <div className="h-2 w-full bg-zinc-800/90 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${percent}%` }}
                          className="h-full bg-gradient-to-r from-emerald-500 to-sky-400 rounded-full transition-all duration-300"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
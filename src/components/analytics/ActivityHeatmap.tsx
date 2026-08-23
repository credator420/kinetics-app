"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

interface ActivityHeatmapProps {
  daysToShow?: number;
  activityData: Record<string, number>;
  selectedDate?: string;
  onSelectDate?: (dateStr: string) => void;
}

export function ActivityHeatmap({
  daysToShow = 105,
  activityData,
  selectedDate,
  onSelectDate,
}: ActivityHeatmapProps) {
  const [mounted, setMounted] = useState(false);
  const [hoveredCell, setHoveredCell] = useState<{
    dateStr: string;
    count: number;
    x: number;
    y: number;
  } | null>(null);

  const autoDismissTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);

    const handleDismissOnScroll = () => {
      setHoveredCell(null);
    };

    window.addEventListener("scroll", handleDismissOnScroll, { passive: true });
    window.addEventListener("touchmove", handleDismissOnScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleDismissOnScroll);
      window.removeEventListener("touchmove", handleDismissOnScroll);
      if (autoDismissTimerRef.current) clearTimeout(autoDismissTimerRef.current);
    };
  }, []);

  const days: { dateStr: string; count: number; dayOfWeek: number }[] = [];
  const now = new Date();

  for (let i = daysToShow - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(now.getDate() - i);
    const yr = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, "0");
    const dt = String(d.getDate()).padStart(2, "0");
    const dateStr = `${yr}-${mo}-${dt}`;
    const count = activityData[dateStr] || 0;

    days.push({
      dateStr,
      count,
      dayOfWeek: (d.getDay() + 6) % 7,
    });
  }

  const weeks: (typeof days)[] = [];
  let currentWeek: typeof days = [];

  if (days.length > 0) {
    const firstDay = days[0].dayOfWeek;
    for (let i = 0; i < firstDay; i++) {
      currentWeek.push({ dateStr: "", count: -1, dayOfWeek: i });
    }
  }

  days.forEach((day) => {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push({ dateStr: "", count: -1, dayOfWeek: currentWeek.length });
    }
    weeks.push(currentWeek);
  }

  const handleCellInteraction = (
    e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>,
    day: { dateStr: string; count: number }
  ) => {
    if (!day.dateStr || day.count < 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const tooltipWidth = 140;
    const padding = 12;

    const rawX = rect.left + rect.width / 2;
    const clampedX = Math.max(
      tooltipWidth / 2 + padding,
      Math.min(rawX, window.innerWidth - tooltipWidth / 2 - padding)
    );

    if (autoDismissTimerRef.current) clearTimeout(autoDismissTimerRef.current);

    setHoveredCell({
      dateStr: day.dateStr,
      count: day.count,
      x: clampedX,
      y: rect.top,
    });

    autoDismissTimerRef.current = setTimeout(() => {
      setHoveredCell(null);
    }, 2000);
  };

  const handleCellClick = (dateStr: string) => {
    if (dateStr && onSelectDate) {
      onSelectDate(dateStr);
    }
  };

  const getColorClass = (count: number) => {
    if (count <= 0) return "bg-zinc-800/80 border-white/10 hover:border-white/30 hover:bg-zinc-700/80";
    if (count === 1) return "bg-emerald-950/90 border-emerald-500/40 text-emerald-300";
    if (count === 2) return "bg-emerald-700/80 border-emerald-400/60 text-emerald-100";
    return "bg-emerald-400 border-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.5)]";
  };

  const totalExecutions = Object.values(activityData).reduce((a, b) => a + b, 0);
  const activeDays = Object.values(activityData).filter((c) => c > 0).length;

  return (
    <div className="space-y-3 font-mono text-xs select-none relative">
      {/* Header Telemetry */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-300">
            Execution Heatmap (Last 15 Weeks)
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-zinc-500 font-semibold">
          <span>
            <strong className="text-emerald-400">{totalExecutions}</strong> total executions
          </span>
          <span>•</span>
          <span>
            <strong className="text-emerald-400">{activeDays}</strong> active days
          </span>
        </div>
      </div>

      {/* Heatmap Matrix */}
      <div className="overflow-x-auto pb-2 pt-1 scrollbar-thin scrollbar-thumb-zinc-800">
        <div className="inline-flex gap-1.5 min-w-full justify-start sm:justify-center p-1">
          <div className="flex flex-col justify-between text-[9px] text-zinc-500 font-bold pr-1 py-0.5">
            <span>M</span>
            <span>W</span>
            <span>F</span>
            <span>S</span>
          </div>

          {weeks.map((week, wIdx) => (
            <div key={wIdx} className="flex flex-col gap-1.5">
              {week.map((day, dIdx) => {
                if (!day.dateStr) {
                  return <div key={dIdx} className="h-3 w-3 sm:h-3.5 sm:w-3.5 rounded-sm opacity-0" />;
                }
                const isSelected = selectedDate === day.dateStr;
                return (
                  <div
                    key={dIdx}
                    onClick={() => handleCellClick(day.dateStr)}
                    onMouseEnter={(e) => handleCellInteraction(e, day)}
                    onMouseLeave={() => {
                      if (autoDismissTimerRef.current) clearTimeout(autoDismissTimerRef.current);
                      setHoveredCell(null);
                    }}
                    onTouchStart={(e) => handleCellInteraction(e, day)}
                    className={`h-3 w-3 sm:h-3.5 sm:w-3.5 rounded-md border transition-all duration-150 cursor-pointer ${getColorClass(
                      day.count
                    )} ${
                      isSelected
                        ? "ring-2 ring-emerald-400 ring-offset-2 ring-offset-zinc-950 scale-125 z-20"
                        : "hover:scale-125 hover:z-10"
                    }`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-1 border-t border-white/[0.06]">
        <span>105-Day History Matrix</span>
        <div className="flex items-center gap-1.5">
          <span>Less</span>
          <div className="h-2.5 w-2.5 rounded-sm bg-zinc-800/80 border border-white/10" />
          <div className="h-2.5 w-2.5 rounded-sm bg-emerald-950 border border-emerald-500/40" />
          <div className="h-2.5 w-2.5 rounded-sm bg-emerald-700 border border-emerald-400/60" />
          <div className="h-2.5 w-2.5 rounded-sm bg-emerald-400 shadow-[0_0_6px_#34d399]" />
          <span>More</span>
        </div>
      </div>

      {/* Scaled Responsive Portal Tooltip */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {hoveredCell && (
              <motion.div
                initial={{ opacity: 0, y: 3, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 2, scale: 0.95 }}
                transition={{ duration: 0.08 }}
                style={{
                  position: "fixed",
                  left: `${hoveredCell.x}px`,
                  top: `${hoveredCell.y - 44}px`,
                  transform: "translateX(-50%)",
                  zIndex: 9999999,
                  pointerEvents: "none",
                }}
                className="flex flex-col items-center whitespace-nowrap"
              >
                <div className="rounded-lg border border-white/20 bg-zinc-950/98 px-2 py-1 sm:px-3 sm:py-1.5 shadow-2xl backdrop-blur-2xl text-center ring-1 ring-white/10 space-y-0.5">
                  <span className="block font-mono text-[10px] sm:text-xs font-bold text-emerald-400">
                    {hoveredCell.count} {hoveredCell.count === 1 ? "protocol" : "protocols"}
                  </span>
                  <span className="block font-mono text-[8px] sm:text-[9px] text-zinc-400">
                    {hoveredCell.dateStr}
                  </span>
                </div>
                <div className="w-1.5 h-1.5 rotate-45 border-r border-b border-white/20 bg-zinc-950 -mt-0.5" />
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}
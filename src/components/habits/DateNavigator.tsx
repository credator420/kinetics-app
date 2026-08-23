"use client";

import React from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";

interface DateNavigatorProps {
  selectedDate: string;
  onDateChange: (dateStr: string) => void;
}

export function DateNavigator({ selectedDate, onDateChange }: DateNavigatorProps) {
  const [year, month, day] = selectedDate.split("-").map(Number);
  const currentDate = new Date(year, month - 1, day);

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate()
  ).padStart(2, "0")}`;

  const isToday = selectedDate === todayStr;

  const handlePrev = () => {
    const prev = new Date(currentDate);
    prev.setDate(prev.getDate() - 1);
    const yr = prev.getFullYear();
    const mo = String(prev.getMonth() + 1).padStart(2, "0");
    const dt = String(prev.getDate()).padStart(2, "0");
    onDateChange(`${yr}-${mo}-${dt}`);
  };

  const handleNext = () => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + 1);
    const yr = next.getFullYear();
    const mo = String(next.getMonth() + 1).padStart(2, "0");
    const dt = String(next.getDate()).padStart(2, "0");
    onDateChange(`${yr}-${mo}-${dt}`);
  };

  const handleJumpToday = () => {
    onDateChange(todayStr);
  };

  const formattedDisplay = currentDate.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="flex items-center gap-1.5 bg-zinc-950/60 border border-white/[0.08] p-1 rounded-xl font-mono text-xs select-none">
      <button
        type="button"
        onClick={handlePrev}
        aria-label="Previous day"
        className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] active:scale-[0.88] transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        onClick={handleJumpToday}
        className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg transition-all active:scale-[0.95] cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400 ${
          isToday
            ? "text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20"
            : "text-zinc-300 hover:text-white hover:bg-white/[0.04]"
        }`}
      >
        <CalendarIcon className="w-3 h-3 text-emerald-400 shrink-0" />
        <span className="truncate">
          {isToday ? `Today (${formattedDisplay})` : formattedDisplay}
        </span>
      </button>

      <button
        type="button"
        onClick={handleNext}
        aria-label="Next day"
        className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] active:scale-[0.88] transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400"
      >
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
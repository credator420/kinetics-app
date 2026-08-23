"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

export const PRESET_CATEGORIES = [
  "TRAINING",
  "LEARNING",
  "CODING",
  "HEALTH",
  "NUTRITION",
  "DISCIPLINE",
  "READING",
  "MINDSET",
  "FINANCE",
];

interface CategorySelectorProps {
  value: string;
  onChange: (cat: string) => void;
}

export function CategorySelector({ value, onChange }: CategorySelectorProps) {
  const isCustomInitial = value && !PRESET_CATEGORIES.includes(value.toUpperCase());
  const [mode, setMode] = useState<"preset" | "custom">(isCustomInitial ? "custom" : "preset");
  const [customText, setCustomText] = useState(isCustomInitial ? value : "");

  const handleSelectPreset = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    if (selected === "__CUSTOM__") {
      setMode("custom");
      setCustomText("");
      onChange("");
    } else {
      setMode("preset");
      onChange(selected);
    }
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = e.target.value.toUpperCase();
    setCustomText(formatted);
    onChange(formatted);
  };

  return (
    <div className="space-y-1.5 font-mono text-xs">
      <div className="flex h-5 items-center justify-between">
        <label className="text-zinc-400 text-[11px] uppercase tracking-wider font-bold">
          Category Sector
        </label>
        <button
          type="button"
          onClick={() => {
            if (mode === "preset") {
              setMode("custom");
              setCustomText(value || "");
            } else {
              setMode("preset");
              onChange(PRESET_CATEGORIES[0]);
            }
          }}
          className="text-[10px] text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
        >
          {mode === "preset" ? "+ Create Custom" : "← Select Preset"}
        </button>
      </div>

      {mode === "preset" ? (
        <div className="relative">
          <select
            value={PRESET_CATEGORIES.includes(value?.toUpperCase()) ? value.toUpperCase() : PRESET_CATEGORIES[0]}
            onChange={handleSelectPreset}
            className="w-full h-9 appearance-none bg-zinc-900/80 border border-white/10 rounded-xl px-3 text-zinc-100 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 text-xs uppercase pr-8 cursor-pointer transition-all"
          >
            {PRESET_CATEGORIES.map((cat) => (
              <option key={cat} value={cat} className="bg-zinc-950 text-zinc-100">
                {cat}
              </option>
            ))}
            <option value="__CUSTOM__" className="bg-zinc-900 text-sky-400 font-bold">
              + Custom Category...
            </option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        </div>
      ) : (
        <input
          type="text"
          value={customText}
          onChange={handleCustomChange}
          placeholder="e.g. GYMNASTICS, AUDITING"
          autoFocus
          className="w-full h-9 bg-zinc-900/80 border border-sky-500/40 rounded-xl px-3 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 text-xs uppercase transition-all"
        />
      )}
    </div>
  );
}
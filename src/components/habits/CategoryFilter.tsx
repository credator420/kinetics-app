"use client";

import React from "react";
import { Filter } from "lucide-react";

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryFilterProps) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
      <div className="flex items-center gap-1.5 text-zinc-500 mr-1 shrink-0">
        <Filter className="w-3 h-3" />
        <span className="text-[10px] font-mono uppercase tracking-wider">Filter:</span>
      </div>

      <button
        type="button"
        onClick={() => onSelectCategory("ALL")}
        className={`px-3 py-1 rounded-xl text-xs font-mono transition-all cursor-pointer shrink-0 border ${
          selectedCategory === "ALL"
            ? "bg-white text-zinc-950 font-bold border-white shadow-sm"
            : "bg-white/[0.03] text-zinc-400 border-white/10 hover:border-white/20 hover:text-zinc-200"
        }`}
      >
        All
      </button>

      {categories.map((category) => (
        <button
          type="button"
          key={category}
          onClick={() => onSelectCategory(category)}
          className={`px-3 py-1 rounded-xl text-xs font-mono transition-all cursor-pointer shrink-0 border ${
            selectedCategory === category
              ? "bg-white text-zinc-950 font-bold border-white shadow-sm"
              : "bg-white/[0.03] text-zinc-400 border-white/10 hover:border-white/20 hover:text-zinc-200"
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
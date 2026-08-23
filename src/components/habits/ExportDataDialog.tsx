"use client";

import React, { useState, useTransition } from "react";
import { Download, FileJson, FileSpreadsheet, Loader2, Database } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { exportUserData } from "@/actions/habits";

interface ExportDataDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ExportDataDialog({
  open: externalOpen,
  onOpenChange: setExternalOpen,
}: ExportDataDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = setExternalOpen || setInternalOpen;

  const handleExportJSON = () => {
    startTransition(async () => {
      const data = await exportUserData();
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(data, null, 2)
      )}`;
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", jsonString);
      downloadAnchor.setAttribute(
        "download",
        `kinetics_backup_${new Date().toISOString().split("T")[0]}.json`
      );
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      setOpen(false);
    });
  };

  const handleExportCSV = () => {
    startTransition(async () => {
      const habits = await exportUserData();

      const rows = [
        ["Habit ID", "Title", "Category", "Target / Week", "Archived", "Log Date", "Completed"],
      ];

      habits.forEach((habit: any) => {
        if (!habit.logs || habit.logs.length === 0) {
          rows.push([
            habit.id,
            `"${habit.title.replace(/"/g, '""')}"`,
            `"${habit.category}"`,
            String(habit.targetDaysPerWeek || 7),
            String(habit.archived),
            "N/A",
            "N/A",
          ]);
        } else {
          habit.logs.forEach((log: any) => {
            rows.push([
              habit.id,
              `"${habit.title.replace(/"/g, '""')}"`,
              `"${habit.category}"`,
              String(habit.targetDaysPerWeek || 7),
              String(habit.archived),
              log.logDate,
              String(log.completed),
            ]);
          });
        }
      });

      const csvContent =
        "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute(
        "download",
        `kinetics_logs_${new Date().toISOString().split("T")[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      setOpen(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {externalOpen === undefined && (
        <DialogTrigger asChild>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-mono text-zinc-400 hover:text-zinc-200 hover:border-white/20 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        </DialogTrigger>
      )}

      <DialogContent className="border border-white/10 bg-zinc-950/95 backdrop-blur-2xl text-zinc-100 sm:max-w-[420px] rounded-2xl p-6 shadow-2xl">
        <DialogHeader className="pb-2 border-b border-white/[0.06]">
          <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-sky-400" />
            Export Protocol Telemetry
          </DialogTitle>
          <p className="text-xs text-zinc-400 font-mono">
            Download your active habits, archived targets, and complete execution logs.
          </p>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 py-4">
          <button
            type="button"
            disabled={isPending}
            onClick={handleExportJSON}
            className="flex flex-col items-center gap-2 p-4 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/20 transition-all cursor-pointer group"
          >
            <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 group-hover:scale-105 transition-transform">
              <FileJson className="w-5 h-5" />
            </div>
            <div className="text-center">
              <div className="text-xs font-bold text-zinc-100">JSON Format</div>
              <div className="text-[10px] font-mono text-zinc-500 mt-0.5">Full schema backup</div>
            </div>
          </button>

          <button
            type="button"
            disabled={isPending}
            onClick={handleExportCSV}
            className="flex flex-col items-center gap-2 p-4 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/20 transition-all cursor-pointer group"
          >
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 group-hover:scale-105 transition-transform">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div className="text-center">
              <div className="text-xs font-bold text-zinc-100">CSV Spreadsheet</div>
              <div className="text-[10px] font-mono text-zinc-500 mt-0.5">Flat logs table</div>
            </div>
          </button>
        </div>

        {isPending && (
          <div className="flex items-center justify-center gap-2 text-xs font-mono text-zinc-400 pb-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-400" />
            <span>Compiling dataset...</span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
"use client";

import React, { useState } from "react";
import {
  MoreHorizontal,
  Download,
  Archive,
  Trophy,
  Users,
  Target,
  BarChart3,
  Monitor,
  Smartphone,
  CheckCircle2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ExportDataDialog } from "./ExportDataDialog";
import { ArchivedHabitsDialog } from "./ArchivedHabitsDialog";
import { AchievementsDialog } from "@/components/analytics/AchievementsDialog";
import { LeaderboardDialog } from "@/components/analytics/LeaderboardDialog";
import { BountiesDialog } from "@/components/analytics/BountiesDialog";
import { AnalyticsDialog } from "@/components/analytics/AnalyticsDialog";
import { HabitItem } from "./HabitCard";
import { usePWAInstall } from "@/context/PWAContext";

interface NavMoreMenuProps {
  habits: HabitItem[];
  heatmapData: Record<string, number>;
  onDataChanged: () => void;
}

export function NavMoreMenu({ habits, heatmapData, onDataChanged }: NavMoreMenuProps) {
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showBounties, setShowBounties] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showMilestones, setShowMilestones] = useState(false);
  const [showArchives, setShowArchives] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);

  const { deferredPrompt, isStandalone, promptInstall } = usePWAInstall();

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await promptInstall();
    } else {
      setShowInstallModal(true);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-zinc-400 hover:text-white hover:border-white/20 transition-all cursor-pointer focus:outline-none shrink-0"
            aria-label="Operations Menu"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-56 rounded-xl border border-white/10 bg-zinc-950/95 backdrop-blur-2xl p-1.5 text-zinc-300 shadow-2xl z-50"
        >
          {/* Telemetry & Analytics */}
          <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-bold">
            Telemetry
          </div>
          <DropdownMenuItem
            onSelect={() => setShowAnalytics(true)}
            className="flex items-center gap-2.5 px-2.5 py-2 text-xs font-mono rounded-lg hover:bg-white/10 hover:text-white cursor-pointer"
          >
            <BarChart3 className="w-4 h-4 text-sky-400" />
            <span>Velocity Analytics</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onSelect={() => setShowBounties(true)}
            className="flex items-center gap-2.5 px-2.5 py-2 text-xs font-mono rounded-lg hover:bg-white/10 hover:text-white cursor-pointer"
          >
            <Target className="w-4 h-4 text-emerald-400" />
            <span>Tactical Bounties</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onSelect={() => setShowLeaderboard(true)}
            className="flex items-center gap-2.5 px-2.5 py-2 text-xs font-mono rounded-lg hover:bg-white/10 hover:text-white cursor-pointer"
          >
            <Users className="w-4 h-4 text-indigo-400" />
            <span>Global Standings</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onSelect={() => setShowMilestones(true)}
            className="flex items-center gap-2.5 px-2.5 py-2 text-xs font-mono rounded-lg hover:bg-white/10 hover:text-white cursor-pointer"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Milestones & Rank</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="bg-white/[0.08] my-1" />

          {/* Database & Management */}
          <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-bold">
            Management
          </div>

          {/* Only display Install if not already running in installed standalone app */}
          {!isStandalone && (
            <DropdownMenuItem
              onSelect={handleInstallClick}
              className="flex items-center gap-2.5 px-2.5 py-2 text-xs font-mono rounded-lg hover:bg-white/10 hover:text-white cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Install App</span>
            </DropdownMenuItem>
          )}

          <DropdownMenuItem
            onSelect={() => setShowArchives(true)}
            className="flex items-center gap-2.5 px-2.5 py-2 text-xs font-mono rounded-lg hover:bg-white/10 hover:text-white cursor-pointer"
          >
            <Archive className="w-4 h-4 text-zinc-400" />
            <span>Archived Habits</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onSelect={() => setShowExport(true)}
            className="flex items-center gap-2.5 px-2.5 py-2 text-xs font-mono rounded-lg hover:bg-white/10 hover:text-white cursor-pointer"
          >
            <Download className="w-4 h-4 text-zinc-400" />
            <span>Export Pipeline Data</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Manual Install Instructions Modal */}
      <Dialog open={showInstallModal} onOpenChange={setShowInstallModal}>
        <DialogContent className="border border-white/10 bg-zinc-950/95 backdrop-blur-2xl text-zinc-100 sm:max-w-[480px] rounded-2xl p-6 shadow-2xl">
          <DialogHeader className="pb-3 border-b border-white/[0.06]">
            <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
              <Download className="w-4 h-4 text-sky-400" />
              Install Kinetics Application
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2 font-mono text-xs text-zinc-300">
            <div className="p-3 rounded-xl border border-white/[0.08] bg-zinc-900/40 space-y-2">
              <div className="flex items-center gap-2 text-white font-bold">
                <Monitor className="w-4 h-4 text-sky-400" />
                <span>Desktop (Chrome / Edge / Brave / Arc)</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Click the install icon directly in the browser address bar (top right) or go to <span className="text-zinc-200">Settings → Install Kinetics</span>.
              </p>
            </div>

            <div className="p-3 rounded-xl border border-white/[0.08] bg-zinc-900/40 space-y-2">
              <div className="flex items-center gap-2 text-white font-bold">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>Mobile (iOS & Android)</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Tap <span className="text-zinc-200">Share</span> (iOS Safari) or <span className="text-zinc-200">More (⋮)</span> (Android Chrome) and select <span className="text-emerald-400 font-bold">&ldquo;Add to Home Screen&rdquo;</span>.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowInstallModal(false)}
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold transition-all text-xs cursor-pointer flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Understood</span>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modals */}
      <AnalyticsDialog
        habits={habits}
        heatmapData={heatmapData}
        open={showAnalytics}
        onOpenChange={setShowAnalytics}
      />
      <BountiesDialog
        open={showBounties}
        onOpenChange={setShowBounties}
        onRewardClaimed={onDataChanged}
      />
      <LeaderboardDialog
        open={showLeaderboard}
        onOpenChange={setShowLeaderboard}
      />
      <AchievementsDialog
        open={showMilestones}
        onOpenChange={setShowMilestones}
      />
      <ArchivedHabitsDialog
        open={showArchives}
        onOpenChange={setShowArchives}
        onChanged={onDataChanged}
      />
      <ExportDataDialog
        open={showExport}
        onOpenChange={setShowExport}
      />
    </>
  );
}
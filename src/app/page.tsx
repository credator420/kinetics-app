"use client";

import React, { useState, useEffect, useOptimistic, useMemo, startTransition, useRef } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { Flame, ShieldCheck, Activity, Terminal } from "lucide-react";
import { HabitCard, HabitItem } from "@/components/habits/HabitCard";
import { NewHabitDialog } from "@/components/habits/NewHabitDialog";
import { NavMoreMenu } from "@/components/habits/NavMoreMenu";
import { HabitDossierDialog } from "@/components/habits/HabitDossierDialog";
import { MilestoneAlerts } from "@/components/analytics/MilestoneAlerts";
import { DateNavigator } from "@/components/habits/DateNavigator";
import { CategoryFilter } from "@/components/habits/CategoryFilter";
import { ActivityHeatmap } from "@/components/analytics/ActivityHeatmap";
import { UserMenu } from "@/components/auth/UserMenu";
import { AuthLockHero } from "@/components/auth/AuthLockHero";
import { ShieldBadge } from "@/components/habits/ShieldBadge";
import {
  getHabitsWithStatus,
  toggleHabitStatus,
  getHeatmapData,
  getUserAchievements,
  getUserShields,
  reorderHabits,
} from "@/actions/habits";
import { getCurrentUser } from "@/actions/auth";
import { Achievement, UserRank } from "@/lib/achievements";

type OptimisticAction =
  | { type: "TOGGLE"; id: string; date: string }
  | { type: "NOTE"; id: string; note: string };

export default function DashboardPage() {
  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);
  
  // Pipeline habits for selectedDate
  const [habits, setHabits] = useState<HabitItem[]>([]);
  // Today's habits (keeps top stat cards fixed to current day's real-time velocity)
  const [todayHabits, setTodayHabits] = useState<HabitItem[]>([]);

  const [heatmapData, setHeatmapData] = useState<Record<string, number>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [shieldCount, setShieldCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedDossierId, setSelectedDossierId] = useState<string | null>(null);

  const [unlockedAchievementAlert, setUnlockedAchievementAlert] = useState<Achievement | null>(null);
  const [promotedRankAlert, setPromotedRankAlert] = useState<UserRank | null>(null);

  const unlockedIdsRef = useRef<Set<string>>(new Set());
  const rankTierRef = useRef<string | null>(null);
  const isInitializedRef = useRef<boolean>(false);

  // Optimistic UI state
  const [optimisticHabits, setOptimisticAction] = useOptimistic(
    habits,
    (state, action: OptimisticAction) => {
      if (action.type === "TOGGLE") {
        return state.map((h) => {
          if (h.id === action.id) {
            const nextCompleted = !h.completed;
            const curWeekly = h.weeklyCompletions || 0;
            return {
              ...h,
              completed: nextCompleted,
              weeklyCompletions: nextCompleted ? curWeekly + 1 : Math.max(0, curWeekly - 1),
              streak: nextCompleted ? h.streak + 1 : Math.max(0, h.streak - 1),
            };
          }
          return h;
        });
      }
      if (action.type === "NOTE") {
        return state.map((h) =>
          h.id === action.id ? { ...h, note: action.note } : h
        );
      }
      return state;
    }
  );

  const evaluateMilestones = async () => {
    try {
      const telemetry = await getUserAchievements();
      const currentUnlocked = telemetry.achievements.filter((a) => a.unlocked);

      if (!isInitializedRef.current) {
        currentUnlocked.forEach((a) => unlockedIdsRef.current.add(a.id));
        rankTierRef.current = telemetry.rank.tier;
        isInitializedRef.current = true;
        return;
      }

      for (const item of currentUnlocked) {
        if (!unlockedIdsRef.current.has(item.id)) {
          unlockedIdsRef.current.add(item.id);
          setUnlockedAchievementAlert(item);
          break;
        }
      }

      if (rankTierRef.current && rankTierRef.current !== telemetry.rank.tier) {
        setPromotedRankAlert(telemetry.rank);
      }
      rankTierRef.current = telemetry.rank.tier;
    } catch (err) {
      console.error("Milestone evaluate error:", err);
    }
  };

  const fetchHabits = async (dateStr = selectedDate) => {
    try {
      const user = await getCurrentUser();
      const authed = !!user;
      setIsAuthenticated(authed);

      if (authed) {
        const [pipelineData, todayData, heatmapCounts, shields] = await Promise.all([
          getHabitsWithStatus(dateStr),
          dateStr === todayStr ? getHabitsWithStatus(todayStr) : getHabitsWithStatus(todayStr),
          getHeatmapData(105),
          getUserShields(),
        ]);
        setHabits(pipelineData);
        setTodayHabits(todayData);
        setHeatmapData(heatmapCounts);
        setShieldCount(shields);
      } else {
        setHabits([]);
        setTodayHabits([]);
        setHeatmapData({});
        setShieldCount(0);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHabits(selectedDate);
    evaluateMilestones();
  }, [selectedDate]);

  const handleToggle = (id: string) => {
    const targetHabit = habits.find((h) => h.id === id);
    const willBeCompleted = targetHabit ? !targetHabit.completed : true;

    // Mutate pipeline state
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id === id) {
          const nextCompleted = !h.completed;
          const curWeekly = h.weeklyCompletions || 0;
          return {
            ...h,
            completed: nextCompleted,
            weeklyCompletions: nextCompleted ? curWeekly + 1 : Math.max(0, curWeekly - 1),
            streak: nextCompleted ? h.streak + 1 : Math.max(0, h.streak - 1),
          };
        }
        return h;
      })
    );

    // If toggling on today's date, also update today's top stats immediately
    if (selectedDate === todayStr) {
      setTodayHabits((prev) =>
        prev.map((h) => {
          if (h.id === id) {
            const nextCompleted = !h.completed;
            const curWeekly = h.weeklyCompletions || 0;
            return {
              ...h,
              completed: nextCompleted,
              weeklyCompletions: nextCompleted ? curWeekly + 1 : Math.max(0, curWeekly - 1),
              streak: nextCompleted ? h.streak + 1 : Math.max(0, h.streak - 1),
            };
          }
          return h;
        })
      );
    }

    // Mutate heatmap count
    setHeatmapData((prev) => ({
      ...prev,
      [selectedDate]: Math.max(0, (prev[selectedDate] || 0) + (willBeCompleted ? 1 : -1)),
    }));

    startTransition(async () => {
      setOptimisticAction({ type: "TOGGLE", id, date: selectedDate });
      try {
        await toggleHabitStatus(id, selectedDate);
        evaluateMilestones();
      } catch {
        fetchHabits(selectedDate);
      }
    });
  };

  const handleSaveNoteOptimistic = (id: string, note: string) => {
    setHabits((prev) =>
      prev.map((h) => (h.id === id ? { ...h, note } : h))
    );
    startTransition(() => {
      setOptimisticAction({ type: "NOTE", id, note });
    });
  };

  const handleReorder = async (reorderedFiltered: HabitItem[]) => {
    if (selectedCategory === "ALL") {
      setHabits(reorderedFiltered);
      await reorderHabits(reorderedFiltered.map((h) => h.id));
      return;
    }

    const nonFiltered = habits.filter((h) => h.category !== selectedCategory);
    const updatedGlobal = [...reorderedFiltered, ...nonFiltered];
    setHabits(updatedGlobal);
    await reorderHabits(updatedGlobal.map((h) => h.id));
  };

  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    habits.forEach((h) => {
      if (h.category) set.add(h.category);
    });
    return Array.from(set);
  }, [habits]);

  const filteredHabits = useMemo(() => {
    if (selectedCategory === "ALL") return optimisticHabits;
    return optimisticHabits.filter((h) => h.category === selectedCategory);
  }, [optimisticHabits, selectedCategory]);

  // Top Stats always calculated against Today's execution
  const filteredTodayHabits = useMemo(() => {
    if (selectedCategory === "ALL") return todayHabits;
    return todayHabits.filter((h) => h.category === selectedCategory);
  }, [todayHabits, selectedCategory]);

  const todayCompletedCount = filteredTodayHabits.filter((h) => h.completed).length;
  const todayTotalCount = filteredTodayHabits.length;
  const todayPercentage = todayTotalCount > 0 ? Math.round((todayCompletedCount / todayTotalCount) * 100) : 0;

  const topStreak =
    filteredTodayHabits.length > 0
      ? Math.max(...filteredTodayHabits.map((h) => h.streak))
      : 0;

  const topHabitTitle =
    filteredTodayHabits.find((h) => h.streak === topStreak)?.title || "None yet";

  return (
    <div className="relative min-h-screen bg-[#09090b] text-zinc-100 antialiased selection:bg-zinc-800 selection:text-white pb-32 overflow-x-hidden">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[90vw] max-w-[850px] h-[350px] sm:h-[420px] bg-gradient-to-tr from-sky-500/10 via-emerald-500/10 to-indigo-500/10 blur-[130px]" />
      </div>

      <MilestoneAlerts
        unlockedAchievement={unlockedAchievementAlert}
        promotedRank={promotedRankAlert}
        onDismissAchievement={() => setUnlockedAchievementAlert(null)}
        onDismissRank={() => setPromotedRankAlert(null)}
      />

      <HabitDossierDialog
        habitId={selectedDossierId}
        onOpenChange={(open) => !open && setSelectedDossierId(null)}
      />

      <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-zinc-950/80 backdrop-blur-xl transition-all">
        <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-900 border border-white/15 shadow-inner">
              <Terminal className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-sm font-bold tracking-tight text-white">Kinetics</span>
              <span className="font-mono text-[9px] px-1.5 py-0.2 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-semibold hidden min-[360px]:inline">
                v1.0
              </span>
            </div>
          </div>

          {/* Action Center */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <UserMenu />

            {isAuthenticated && (
              <>
                <ShieldBadge count={shieldCount} />

                <NavMoreMenu
                  habits={habits}
                  heatmapData={heatmapData}
                  onDataChanged={() => fetchHabits(selectedDate)}
                />

                <NewHabitDialog onHabitCreated={() => fetchHabits(selectedDate)} />
              </>
            )}
          </div>
        </div>
      </header>

      <main className="relative max-w-4xl mx-auto px-3.5 sm:px-6 lg:px-8 pt-5 sm:pt-10 space-y-6 sm:space-y-8">
        {!isAuthenticated && !loading ? (
          <AuthLockHero />
        ) : (
          <>
            {/* Top Stat Cards — Fixed to Today's Telemetry */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4"
            >
              <div className="rounded-2xl border border-white/[0.08] bg-zinc-950/60 p-4 sm:p-5 backdrop-blur-xl flex flex-col justify-between shadow-sm hover:border-white/15 transition-colors">
                <div>
                  <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
                    <span className="font-mono uppercase tracking-wider text-[11px] font-semibold text-zinc-400 truncate">
                      {selectedCategory === "ALL" ? "Target Protocol" : `${selectedCategory} Target`}
                    </span>
                    <span className="font-mono text-sm font-bold text-emerald-400">{todayPercentage}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800/90">
                    <div
                      style={{ width: `${todayPercentage}%` }}
                      className="h-full bg-gradient-to-r from-emerald-400 to-sky-400 rounded-full transition-all duration-200 ease-out"
                    />
                  </div>
                </div>
                <p className="text-xs text-zinc-400 mt-3 font-mono">
                  <span className="font-bold text-zinc-100">{todayCompletedCount}</span> of {todayTotalCount} completed
                </p>
              </div>

              <div className="rounded-2xl border border-white/[0.08] bg-zinc-950/60 p-4 sm:p-5 backdrop-blur-xl flex items-center justify-between shadow-sm hover:border-white/15 transition-colors">
                <div className="truncate pr-2">
                  <span className="font-mono uppercase tracking-wider text-[11px] font-semibold text-zinc-400 block mb-0.5">
                    Top Momentum
                  </span>
                  <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-mono">
                    {topStreak}d
                  </span>
                  <p className="text-xs text-zinc-400 mt-0.5 font-medium truncate">
                    {topHabitTitle}
                  </p>
                </div>
                <div className="p-2.5 sm:p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
                  <Flame className="w-5 h-5 sm:w-6 sm:h-6 fill-amber-500/20" />
                </div>
              </div>

              <div className="rounded-2xl border border-white/[0.08] bg-zinc-950/60 p-4 sm:p-5 backdrop-blur-xl flex items-center justify-between shadow-sm hover:border-white/15 transition-colors">
                <div>
                  <span className="font-mono uppercase tracking-wider text-[11px] font-semibold text-zinc-400 block mb-0.5">
                    Security Engine
                  </span>
                  <span className="text-lg sm:text-xl font-bold tracking-tight text-white">OAuth 2.0</span>
                  <p className="text-xs text-zinc-400 mt-0.5 font-mono">Session Isolated</p>
                </div>
                <div className="p-2.5 sm:p-3.5 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 shrink-0">
                  <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
              </div>
            </motion.div>

            {/* Heatmap with Selected Date Sync */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.05, ease: "easeOut" }}
              className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-zinc-950/60 p-3.5 sm:p-5 backdrop-blur-xl shadow-sm hover:border-white/15 transition-colors"
            >
              <ActivityHeatmap
                daysToShow={105}
                activityData={heatmapData}
                selectedDate={selectedDate}
                onSelectDate={(d) => setSelectedDate(d)}
              />
            </motion.div>

            {/* Protocol Pipeline Section (Driven by selectedDate) */}
            <section className="space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-0.5">
                <div className="flex flex-wrap items-center justify-between sm:justify-start gap-2 sm:gap-3">
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Activity className="w-4 h-4 text-zinc-400" />
                    <h2 className="text-xs font-mono uppercase tracking-widest font-semibold text-zinc-400">
                      Protocol Pipeline
                    </h2>
                  </div>

                  <DateNavigator
                    selectedDate={selectedDate}
                    onDateChange={(d) => setSelectedDate(d)}
                  />
                </div>

                {availableCategories.length > 0 && (
                  <div className="overflow-x-auto pb-1 sm:pb-0">
                    <CategoryFilter
                      categories={availableCategories}
                      selectedCategory={selectedCategory}
                      onSelectCategory={setSelectedCategory}
                    />
                  </div>
                )}
              </div>

              {loading ? (
                <div className="p-12 text-center text-xs font-mono text-zinc-500 animate-pulse">
                  Fetching active protocols...
                </div>
              ) : filteredHabits.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center">
                  <p className="text-sm text-zinc-400">
                    {selectedCategory === "ALL"
                      ? "No active habits in your protocol yet."
                      : `No actions under category "${selectedCategory}".`}
                  </p>
                  <p className="text-xs text-zinc-600 mt-1">Click &ldquo;+ Action&rdquo; above to register a target.</p>
                </div>
              ) : (
                <Reorder.Group
                  axis="y"
                  values={filteredHabits}
                  onReorder={handleReorder}
                  className="grid gap-2.5 list-none p-0 m-0"
                >
                  {filteredHabits.map((habit) => (
                    <Reorder.Item
                      key={habit.id}
                      value={habit}
                      className="cursor-default list-none"
                    >
                      <HabitCard
                        habit={habit}
                        selectedDate={selectedDate}
                        onToggle={handleToggle}
                        onSaveNoteOptimistic={handleSaveNoteOptimistic}
                        onChanged={() => fetchHabits(selectedDate)}
                        onOpenDossier={(id) => setSelectedDossierId(id)}
                      />
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
"use server";

import { db } from "@/lib/db";
import { getCurrentUser } from "./auth";
import { revalidatePath } from "next/cache";
import { calculateRank, EVALUATE_ACHIEVEMENTS } from "@/lib/achievements";

function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getWeekDateRange(targetDate: string): string[] {
  const [year, month, day] = targetDate.split("-").map(Number);
  const current = new Date(year, month - 1, day);
  const dayOfWeek = current.getDay();
  const diffToMonday = (dayOfWeek + 6) % 7;

  const monday = new Date(current);
  monday.setDate(current.getDate() - diffToMonday);

  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dt = String(d.getDate()).padStart(2, "0");
    dates.push(`${y}-${m}-${dt}`);
  }
  return dates;
}

// 1. Fetch habits with status and weekly progress
export async function getHabitsWithStatus(targetDate?: string) {
  const user = await getCurrentUser();
  if (!user?.id) return [];

  const dateToEvaluate = targetDate || getTodayDateString();
  const weekDates = getWeekDateRange(dateToEvaluate);
  const weekSet = new Set(weekDates);

  const habits = await db.habit.findMany({
    where: {
      userId: user.id,
      isArchived: false,
    },
    orderBy: [
      { orderIndex: "asc" },
      { createdAt: "desc" },
    ],
    include: {
      logs: true,
    },
  });

  return habits.map((habit) => {
    const currentLog = habit.logs.find((log) => log.date === dateToEvaluate);
    const isCompletedOnDate = !!currentLog?.completed;
    const currentNote = currentLog?.note || "";

    const completedDates = new Set(
      habit.logs.filter((l) => l.completed).map((l) => l.date)
    );

    const weeklyCompletions = habit.logs.filter(
      (log) => log.completed && weekSet.has(log.date)
    ).length;

    let streak = 0;
    const [yearNum, monthNum, dayNum] = dateToEvaluate.split("-").map(Number);
    const checkDate = new Date(yearNum, monthNum - 1, dayNum);

    // If not completed today, count the active streak up to yesterday
    if (!isCompletedOnDate) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
      const yearStr = checkDate.getFullYear();
      const monthStr = String(checkDate.getMonth() + 1).padStart(2, "0");
      const dayStr = String(checkDate.getDate()).padStart(2, "0");
      const formatted = `${yearStr}-${monthStr}-${dayStr}`;

      if (completedDates.has(formatted)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return {
      id: habit.id,
      title: habit.title,
      description: habit.description,
      category: habit.category,
      streak,
      completed: isCompletedOnDate,
      note: currentNote,
      weeklyCompletions,
      targetPerWeek: habit.targetDaysPerWeek,
    };
  });
}

// 2. Toggle habit log status
export async function toggleHabitStatus(habitId: string, date?: string) {
  const user = await getCurrentUser();
  if (!user?.id) throw new Error("Unauthorized");

  const targetDate = date || getTodayDateString();

  const existingLog = await db.habitLog.findFirst({
    where: {
      habitId,
      date: targetDate,
    },
  });

  if (existingLog) {
    await db.habitLog.update({
      where: { id: existingLog.id },
      data: { completed: !existingLog.completed },
    });
  } else {
    await db.habitLog.create({
      data: {
        habitId,
        date: targetDate,
        completed: true,
      },
    });
  }

  revalidatePath("/");
  return { success: true };
}

// 3. Save or update note on a specific habit date
export async function saveHabitLogNote(habitId: string, date: string, note: string) {
  const user = await getCurrentUser();
  if (!user?.id) throw new Error("Unauthorized");

  const existingLog = await db.habitLog.findFirst({
    where: {
      habitId,
      date,
    },
  });

  if (existingLog) {
    await db.habitLog.update({
      where: { id: existingLog.id },
      data: { note },
    });
  } else {
    await db.habitLog.create({
      data: {
        habitId,
        date,
        completed: false,
        note,
      },
    });
  }

  revalidatePath("/");
  return { success: true };
}

// 4. Fetch detailed dossier telemetry for a single habit
export async function getHabitDossier(habitId: string) {
  const user = await getCurrentUser();
  if (!user?.id) throw new Error("Unauthorized");

  const habit = await db.habit.findFirst({
    where: { id: habitId, userId: user.id },
    include: {
      logs: {
        orderBy: { date: "desc" },
      },
    },
  });

  if (!habit) return null;

  const logs = habit.logs;
  const completedLogs = logs.filter((l) => l.completed);
  const completedDateSet = new Set(completedLogs.map((l) => l.date));

  const days30: { dateStr: string; completed: boolean; note?: string | null }[] = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(now.getDate() - i);
    const yr = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, "0");
    const dt = String(d.getDate()).padStart(2, "0");
    const dateStr = `${yr}-${mo}-${dt}`;
    const matchedLog = logs.find((l) => l.date === dateStr && l.completed);
    days30.push({
      dateStr,
      completed: !!matchedLog,
      note: matchedLog?.note,
    });
  }

  const sortedDates = Array.from(completedDateSet).sort();
  let longestStreak = 0;
  let currentRun = 0;
  let prevDate: Date | null = null;

  for (const ds of sortedDates) {
    const [y, m, d] = ds.split("-").map(Number);
    const curr = new Date(y, m - 1, d);

    if (prevDate) {
      const diffDays = Math.round((curr.getTime() - prevDate.getTime()) / (1000 * 3600 * 24));
      if (diffDays === 1) {
        currentRun++;
      } else if (diffDays > 1) {
        currentRun = 1;
      }
    } else {
      currentRun = 1;
    }
    if (currentRun > longestStreak) longestStreak = currentRun;
    prevDate = curr;
  }

  return {
    id: habit.id,
    title: habit.title,
    description: habit.description,
    category: habit.category,
    createdAt: habit.createdAt.toISOString(),
    totalCompletions: completedLogs.length,
    longestStreak,
    days30,
    recentNotes: logs.filter((l) => l.note && l.note.trim().length > 0).slice(0, 8),
  };
}

// 5. Reorder Habits
export async function reorderHabits(orderedIds: string[]) {
  const user = await getCurrentUser();
  if (!user?.id) throw new Error("Unauthorized");

  const updates = orderedIds.map((id, index) =>
    db.habit.update({
      where: { id },
      data: { orderIndex: index },
    })
  );

  await db.$transaction(updates);
  revalidatePath("/");
  return { success: true };
}

// 6. Create Habit
export async function createHabit(data: {
  title: string;
  category: string;
  colorHex?: string;
  targetDaysPerWeek?: number;
}) {
  const user = await getCurrentUser();
  if (!user?.id) throw new Error("Unauthorized");

  const habit = await db.habit.create({
    data: {
      userId: user.id,
      title: data.title,
      category: data.category || "TRAINING",
      colorHex: data.colorHex || "#10b981",
      targetDaysPerWeek: data.targetDaysPerWeek ?? 7,
    },
  });

  revalidatePath("/");
  return habit;
}

// 7. Update Habit
export async function updateHabit(data: {
  id: string;
  title: string;
  category: string;
  colorHex?: string;
  targetDaysPerWeek?: number;
}) {
  const user = await getCurrentUser();
  if (!user?.id) throw new Error("Unauthorized");

  const habit = await db.habit.update({
    where: { id: data.id },
    data: {
      title: data.title,
      category: data.category,
      colorHex: data.colorHex || "#10b981",
      targetDaysPerWeek: data.targetDaysPerWeek ?? 7,
    },
  });

  revalidatePath("/");
  return habit;
}

// 8. Toggle Archive Habit
export async function toggleArchiveHabit(habitId: string) {
  const user = await getCurrentUser();
  if (!user?.id) throw new Error("Unauthorized");

  const current = await db.habit.findUnique({
    where: { id: habitId },
  });

  if (!current) throw new Error("Habit not found");

  const updated = await db.habit.update({
    where: { id: habitId },
    data: { isArchived: !current.isArchived },
  });

  revalidatePath("/");
  return updated;
}

// 9. Delete Habit
export async function deleteHabit(habitId: string) {
  const user = await getCurrentUser();
  if (!user?.id) throw new Error("Unauthorized");

  await db.habit.delete({
    where: { id: habitId },
  });

  revalidatePath("/");
  return { success: true };
}

// 10. Get Archived Habits
export async function getArchivedHabits() {
  const user = await getCurrentUser();
  if (!user?.id) return [];

  return db.habit.findMany({
    where: {
      userId: user.id,
      isArchived: true,
    },
    include: { logs: true },
    orderBy: { updatedAt: "desc" },
  });
}

// 11. Heatmap Activity Data
export async function getHeatmapData(daysToShow = 105) {
  const user = await getCurrentUser();
  if (!user?.id) return {};

  const logs = await db.habitLog.findMany({
    where: {
      habit: { userId: user.id },
      completed: true,
    },
    select: { date: true },
  });

  const counts: Record<string, number> = {};
  logs.forEach((log) => {
    counts[log.date] = (counts[log.date] || 0) + 1;
  });

  return counts;
}

// 12. User Shields
export async function getUserShields() {
  const user = await getCurrentUser();
  if (!user?.id) return 0;

  const record = await db.user.findUnique({
    where: { id: user.id },
    select: { shields: true },
  });

  return record?.shields || 0;
}

// 13. Consume a Streak Shield
export async function useStreakFreeze(habitId: string, date: string) {
  const user = await getCurrentUser();
  if (!user?.id) throw new Error("Unauthorized");

  const userData = await db.user.findUnique({
    where: { id: user.id },
    select: { shields: true },
  });

  if (!userData || userData.shields <= 0) {
    throw new Error("No streak shields available in inventory.");
  }

  await db.$transaction([
    db.user.update({
      where: { id: user.id },
      data: { shields: { decrement: 1 } },
    }),
    db.habitLog.upsert({
      where: {
        habitId_date: {
          habitId,
          date,
        },
      },
      update: { completed: true },
      create: {
        habitId,
        date,
        completed: true,
      },
    }),
  ]);

  revalidatePath("/");
  return { success: true };
}

// 14. Export Data
export async function exportUserData() {
  const user = await getCurrentUser();
  if (!user?.id) throw new Error("Unauthorized");

  const habits = await db.habit.findMany({
    where: { userId: user.id },
    include: {
      logs: {
        orderBy: { date: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return habits.map((habit) => ({
    id: habit.id,
    title: habit.title,
    description: habit.description || "",
    category: habit.category,
    isArchived: habit.isArchived,
    createdAt: habit.createdAt.toISOString(),
    logs: habit.logs.map((log) => ({
      date: log.date,
      completed: log.completed,
      note: log.note || "",
      createdAt: log.createdAt.toISOString(),
    })),
  }));
}

// 15. User Telemetry & Achievements
export async function getUserAchievements() {
  const user = await getCurrentUser();
  if (!user?.id) {
    return {
      achievements: [],
      rank: calculateRank(0, 0),
    };
  }

  const logs = await db.habitLog.findMany({
    where: { habit: { userId: user.id }, completed: true },
  });

  const habits = await db.habit.findMany({
    where: { userId: user.id, isArchived: false },
    include: { logs: true },
  });

  const datesSet = new Set(logs.map((l) => l.date));
  let maxStreak = 0;

  for (const h of habits) {
    let streak = 0;
    const completedDates = new Set(
      h.logs.filter((l) => l.completed).map((l) => l.date)
    );

    const today = getTodayDateString();
    const [yearNum, monthNum, dayNum] = today.split("-").map(Number);
    const check = new Date(yearNum, monthNum - 1, dayNum);

    while (true) {
      const yr = check.getFullYear();
      const mo = String(check.getMonth() + 1).padStart(2, "0");
      const dt = String(check.getDate()).padStart(2, "0");
      const dateStr = `${yr}-${mo}-${dt}`;

      if (completedDates.has(dateStr)) {
        streak++;
        check.setDate(check.getDate() - 1);
      } else {
        break;
      }
    }
    if (streak > maxStreak) maxStreak = streak;
  }

  const totalCompletions = logs.length;
  const activeDays = datesSet.size;
  const rank = calculateRank(totalCompletions, maxStreak);

  const evaluatedAchievements = EVALUATE_ACHIEVEMENTS({
    totalCompletions,
    maxStreak,
    activeDays,
  });

  return {
    achievements: evaluatedAchievements,
    rank,
  };
}

// 16. Global Leaderboard
export async function getGlobalLeaderboard() {
  const user = await getCurrentUser();

  const users = await db.user.findMany({
    include: {
      habits: {
        include: {
          logs: {
            where: { completed: true },
          },
        },
      },
    },
  });

  const entries = users.map((u) => {
    let totalCompletions = 0;
    let maxStreak = 0;

    for (const h of u.habits) {
      totalCompletions += h.logs.length;
      const completedDates = new Set(h.logs.map((l) => l.date));

      const today = getTodayDateString();
      const [yearNum, monthNum, dayNum] = today.split("-").map(Number);
      const check = new Date(yearNum, monthNum - 1, dayNum);
      let streak = 0;

      while (true) {
        const yr = check.getFullYear();
        const mo = String(check.getMonth() + 1).padStart(2, "0");
        const dt = String(check.getDate()).padStart(2, "0");
        const dateStr = `${yr}-${mo}-${dt}`;

        if (completedDates.has(dateStr)) {
          streak++;
          check.setDate(check.getDate() - 1);
        } else {
          break;
        }
      }
      if (streak > maxStreak) maxStreak = streak;
    }

    const rank = calculateRank(totalCompletions, maxStreak);
    const score = totalCompletions * 10 + maxStreak * 25;

    return {
      userId: u.id,
      name: u.name || "Anonymous Operator",
      image: u.image,
      totalCompletions,
      maxStreak,
      score,
      rank,
    };
  });

  entries.sort((a, b) => b.score - a.score);

  return {
    currentUserId: user?.id || null,
    entries,
  };
}
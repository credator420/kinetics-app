"use server";

import { db } from "@/lib/db";
import { getCurrentUser } from "./auth";
import { revalidatePath } from "next/cache";

const DEFAULT_BOUNTIES = [
  {
    code: "IRON_STREAK",
    title: "Iron Discipline",
    description: "Build an active streak of at least 5 consecutive days on any protocol.",
    category: "CONSISTENCY",
    targetCount: 5,
    rewardShields: 1,
  },
  {
    code: "VELOCITY_BURST",
    title: "Velocity Protocol",
    description: "Complete 15 total habit executions across all operational pipelines.",
    category: "OUTPUT",
    targetCount: 15,
    rewardShields: 1,
  },
  {
    code: "CENTURION_CORPS",
    title: "Centurion Milestone",
    description: "Execute 50 lifetime protocol actions.",
    category: "MASTERY",
    targetCount: 50,
    rewardShields: 2,
  },
];

export async function getUserBounties() {
  const user = await getCurrentUser();
  if (!user?.id) return [];

  // Seed default bounties if table is empty
  for (const b of DEFAULT_BOUNTIES) {
    await db.bounty.upsert({
      where: { code: b.code },
      update: {},
      create: b,
    });
  }

  const allBounties = await db.bounty.findMany();
  const userLogs = await db.habitLog.findMany({
    where: { habit: { userId: user.id }, completed: true },
    include: { habit: true },
  });

  const habits = await db.habit.findMany({
    where: { userId: user.id, isArchived: false },
    include: { logs: true },
  });

  // Calculate current maximum streak
  let maxStreak = 0;
  for (const h of habits) {
    let streak = 0;
    const sorted = h.logs
      .filter((l) => l.completed)
      .map((l) => l.date)
      .sort()
      .reverse();

    const today = new Date().toISOString().split("T")[0];
    let check = new Date(today);

    while (true) {
      const dStr = check.toISOString().split("T")[0];
      if (sorted.includes(dStr)) {
        streak++;
        check.setDate(check.getDate() - 1);
      } else {
        break;
      }
    }
    if (streak > maxStreak) maxStreak = streak;
  }

  const totalLogs = userLogs.length;
  const result = [];

  for (const bounty of allBounties) {
    let progress = 0;
    if (bounty.code === "IRON_STREAK") {
      progress = Math.min(bounty.targetCount, maxStreak);
    } else if (bounty.code === "VELOCITY_BURST" || bounty.code === "CENTURION_CORPS") {
      progress = Math.min(bounty.targetCount, totalLogs);
    }

    const isCompleted = progress >= bounty.targetCount;

    const userBounty = await db.userBounty.upsert({
      where: {
        userId_bountyId: {
          userId: user.id,
          bountyId: bounty.id,
        },
      },
      update: {
        progress,
        completed: isCompleted,
      },
      create: {
        userId: user.id,
        bountyId: bounty.id,
        progress,
        completed: isCompleted,
      },
    });

    result.push({
      ...bounty,
      progress,
      completed: isCompleted,
      claimed: userBounty.claimed,
    });
  }

  return result;
}

export async function claimBountyReward(bountyId: string) {
  const user = await getCurrentUser();
  if (!user?.id) throw new Error("Unauthorized");

  const record = await db.userBounty.findUnique({
    where: {
      userId_bountyId: {
        userId: user.id,
        bountyId,
      },
    },
    include: { bounty: true },
  });

  if (!record || !record.completed || record.claimed) {
    throw new Error("Bounty reward cannot be claimed.");
  }

  await db.$transaction([
    db.userBounty.update({
      where: { id: record.id },
      data: {
        claimed: true,
        claimedAt: new Date(),
      },
    }),
    db.user.update({
      where: { id: user.id },
      data: {
        shields: {
          increment: record.bounty.rewardShields,
        },
      },
    }),
  ]);

  revalidatePath("/");
  return { success: true, reward: record.bounty.rewardShields };
}
export interface UserRank {
  name: string;
  tier: string;
  minScore: number;
  description: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
}

export const RANKS: UserRank[] = [
  {
    name: "Novice Operative",
    tier: "TIER I",
    minScore: 0,
    description: "Initial protocol authorization.",
  },
  {
    name: "Field Specialist",
    tier: "TIER II",
    minScore: 25,
    description: "Consistent execution habits established.",
  },
  {
    name: "Tactical Vanguard",
    tier: "TIER III",
    minScore: 75,
    description: "Unbroken discipline across operational pipelines.",
  },
  {
    name: "Apex Operator",
    tier: "TIER IV",
    minScore: 150,
    description: "Master-tier protocol adherence and velocity.",
  },
  {
    name: "Architect of Kinetics",
    tier: "TIER V",
    minScore: 300,
    description: "Legendary status. Total operational synchronization.",
  },
];

export function calculateRank(totalCompletions: number, maxStreak: number): UserRank {
  const score = totalCompletions * 2 + maxStreak * 5;

  let currentRank = RANKS[0];
  for (const rank of RANKS) {
    if (score >= rank.minScore) {
      currentRank = rank;
    }
  }

  return currentRank;
}

interface TelemetryMetrics {
  totalCompletions: number;
  maxStreak: number;
  activeDays: number;
}

export function EVALUATE_ACHIEVEMENTS(metrics: TelemetryMetrics): Achievement[] {
  return [
    {
      id: "FIRST_EXECUTION",
      title: "System Initialization",
      description: "Log your first completed protocol action.",
      unlocked: metrics.totalCompletions >= 1,
    },
    {
      id: "STREAK_3",
      title: "Momentum Threshold",
      description: "Maintain a 3-day execution streak on any protocol.",
      unlocked: metrics.maxStreak >= 3,
    },
    {
      id: "STREAK_7",
      title: "Weekly Synchronization",
      description: "Hit a 7-day unbroken streak.",
      unlocked: metrics.maxStreak >= 7,
    },
    {
      id: "COMPLETIONS_25",
      title: "Operational Velocity",
      description: "Log 25 lifetime completed actions across all protocols.",
      unlocked: metrics.totalCompletions >= 25,
    },
    {
      id: "COMPLETIONS_100",
      title: "Centurion Discipline",
      description: "Log 100 cumulative completed protocol actions.",
      unlocked: metrics.totalCompletions >= 100,
    },
  ];
}
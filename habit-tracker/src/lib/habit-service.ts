import { prisma } from "@/lib/prisma";

const DAY_IN_MS = 86_400_000;
const DEFAULT_HISTORY_DAYS = 14;
const DEFAULT_USER_ID = "default-user";

export type HabitHistoryPoint = {
  date: string;
  completed: boolean;
};

export type HabitAnalytics = {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  targetCount: number;
  archived: boolean;
  createdAt: Date;
  updatedAt: Date;
  currentStreak: number;
  longestStreak: number;
  completionRate7d: number;
  completionsToday: number;
  history: HabitHistoryPoint[];
};

export type DashboardSummary = {
  totalHabits: number;
  activeStreaks: number;
  completionRate7d: number;
  completionsToday: number;
};

export type DashboardHistoryPoint = {
  date: string;
  completions: number;
};

export type DashboardData = {
  summary: DashboardSummary;
  habits: HabitAnalytics[];
  history: DashboardHistoryPoint[];
};

type CreateHabitInput = {
  name: string;
  description?: string | null;
  color?: string | null;
  icon?: string | null;
  targetCount?: number;
};

const toUTCDate = (input: Date | string) => {
  const date = typeof input === "string" ? new Date(input) : new Date(input);
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
};

const toISODate = (date: Date) => date.toISOString().slice(0, 10);

const ensureDefaultUser = async () => {
  const user = await prisma.user.upsert({
    where: { id: DEFAULT_USER_ID },
    update: {},
    create: { id: DEFAULT_USER_ID, name: "You" },
  });

  return user.id;
};

const computeHabitAnalytics = (params: {
  entries: { entryDate: Date }[];
  targetCount: number;
}): {
  currentStreak: number;
  longestStreak: number;
  completionRate7d: number;
  completionsToday: number;
  history: HabitHistoryPoint[];
} => {
  const today = toUTCDate(new Date());
  const todayISO = toISODate(today);
  const entriesSet = new Set(
    params.entries.map(({ entryDate }) => toISODate(toUTCDate(entryDate))),
  );

  let currentStreak = 0;
  let cursor = todayISO;

  while (entriesSet.has(cursor)) {
    currentStreak += 1;
    const nextDate = new Date(toUTCDate(cursor));
    nextDate.setUTCDate(nextDate.getUTCDate() - 1);
    cursor = toISODate(nextDate);
  }

  let longestStreak = 0;
  let streakCursor = 0;
  let previousDate: Date | null = null;
  const sortedDates = Array.from(entriesSet)
    .map((iso) => toUTCDate(iso))
    .sort((a, b) => a.getTime() - b.getTime());

  for (const date of sortedDates) {
    if (previousDate) {
      const diff = (date.getTime() - previousDate.getTime()) / DAY_IN_MS;
      if (diff === 1) {
        streakCursor += 1;
      } else {
        streakCursor = 1;
      }
    } else {
      streakCursor = 1;
    }
    longestStreak = Math.max(longestStreak, streakCursor);
    previousDate = date;
  }

  const history: HabitHistoryPoint[] = [];
  for (let i = DEFAULT_HISTORY_DAYS - 1; i >= 0; i -= 1) {
    const day = new Date(today);
    day.setUTCDate(day.getUTCDate() - i);
    const iso = toISODate(day);
    history.push({
      date: iso,
      completed: entriesSet.has(iso),
    });
  }

  const last7Days = history.slice(-7);
  const completions7d = last7Days.filter((point) => point.completed).length;
  const completionRate7d =
    last7Days.length > 0 ? completions7d / last7Days.length : 0;

  return {
    currentStreak,
    longestStreak,
    completionRate7d,
    completionsToday: entriesSet.has(todayISO) ? 1 : 0,
    history,
  };
};

export const getDashboardData = async (): Promise<DashboardData> => {
  const today = toUTCDate(new Date());
  const historyWindowStart = new Date(today);
  historyWindowStart.setUTCDate(historyWindowStart.getUTCDate() - DEFAULT_HISTORY_DAYS * 2);

  const habits = await prisma.habit.findMany({
    where: {
      archived: false,
    },
    include: {
      entries: {
        where: {
          entryDate: {
            gte: historyWindowStart,
          },
        },
        orderBy: {
          entryDate: "asc",
        },
        select: {
          entryDate: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  const habitAnalytics = habits.map((habit) => {
    const analytics = computeHabitAnalytics({
      entries: habit.entries,
      targetCount: habit.targetCount,
    });

    return {
      id: habit.id,
      name: habit.name,
      description: habit.description,
      color: habit.color,
      icon: habit.icon,
      targetCount: habit.targetCount,
      archived: habit.archived,
      createdAt: habit.createdAt,
      updatedAt: habit.updatedAt,
      ...analytics,
    };
  });

  const historyMap = new Map<string, number>();
  for (let i = DEFAULT_HISTORY_DAYS - 1; i >= 0; i -= 1) {
    const day = new Date(today);
    day.setUTCDate(day.getUTCDate() - i);
    historyMap.set(toISODate(day), 0);
  }

  for (const habit of habitAnalytics) {
    habit.history.forEach((point) => {
      if (point.completed) {
        historyMap.set(point.date, (historyMap.get(point.date) ?? 0) + 1);
      }
    });
  }

  const history: DashboardHistoryPoint[] = Array.from(historyMap.entries()).map(
    ([date, completions]) => ({
      date,
      completions,
    }),
  );

  const totalHabits = habitAnalytics.length;
  const completionsToday = habitAnalytics.reduce(
    (total, habit) => total + habit.completionsToday,
    0,
  );
  const totalCompletions7d = habitAnalytics.reduce(
    (total, habit) =>
      total + habit.history.slice(-7).filter((point) => point.completed).length,
    0,
  );
  const totalPossibleCompletions = totalHabits * 7 || 1;

  const summary: DashboardSummary = {
    totalHabits,
    activeStreaks: habitAnalytics.filter((habit) => habit.currentStreak > 0).length,
    completionRate7d: totalCompletions7d / totalPossibleCompletions,
    completionsToday,
  };

  return {
    summary,
    habits: habitAnalytics,
    history,
  };
};

export const createHabit = async (input: CreateHabitInput) => {
  if (!input.name || !input.name.trim()) {
    throw new Error("Habit name is required.");
  }

  const userId = await ensureDefaultUser();

  await prisma.habit.create({
    data: {
      name: input.name.trim(),
      description: input.description?.trim() ?? null,
      color: input.color ?? null,
      icon: input.icon ?? null,
      targetCount: input.targetCount ?? 1,
      userId,
    },
  });

  return getDashboardData();
};

export const toggleHabitEntry = async (habitId: string, dateISO?: string) => {
  const habit = await prisma.habit.findUnique({
    where: { id: habitId },
    select: { id: true },
  });

  if (!habit) {
    throw new Error("Habit not found.");
  }

  const entryDate = toUTCDate(dateISO ?? new Date());
  const existing = await prisma.habitEntry.findUnique({
    where: {
      habitId_entryDate: {
        habitId,
        entryDate,
      },
    },
  });

  if (existing) {
    await prisma.habitEntry.delete({
      where: { id: existing.id },
    });
  } else {
    await prisma.habitEntry.create({
      data: {
        habitId,
        entryDate,
      },
    });
  }

  return getDashboardData();
};

export const archiveHabit = async (habitId: string, archived = true) => {
  await prisma.habit.update({
    where: { id: habitId },
    data: { archived },
  });

  return getDashboardData();
};

export type SerializedDashboardData = {
  summary: DashboardSummary;
  habits: Array<
    Omit<HabitAnalytics, "createdAt" | "updatedAt"> & {
      createdAt: string;
      updatedAt: string;
    }
  >;
  history: DashboardHistoryPoint[];
};

export const serializeDashboard = (data: DashboardData): SerializedDashboardData => ({
  summary: data.summary,
  habits: data.habits.map((habit) => ({
    ...habit,
    createdAt: habit.createdAt.toISOString(),
    updatedAt: habit.updatedAt.toISOString(),
  })),
  history: data.history,
});

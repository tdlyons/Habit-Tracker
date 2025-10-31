import { randomUUID } from "node:crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const daysAgo = (offset) => {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() - offset);
  return date;
};

async function seed() {
  const userId = process.env.SEED_USER_ID ?? randomUUID();
  const userName = process.env.SEED_USER_NAME ?? "Demo User";

  const user = await prisma.user.upsert({
    where: { id: userId },
    update: { name: userName },
    create: {
      id: userId,
      name: userName,
    },
  });

  const sampleHabits = [
    {
      name: "Morning run",
      description: "Get outside for at least 20 minutes before work.",
      color: "#22c55e",
      icon: "🏃",
      entries: [0, 1, 3, 4].map((offset) => ({ entryDate: daysAgo(offset) })),
    },
    {
      name: "Journal session",
      description: "Write three bullet points reflecting on the day.",
      color: "#2563eb",
      icon: "📓",
      entries: [0, 2, 5].map((offset) => ({ entryDate: daysAgo(offset) })),
    },
    {
      name: "Focus block",
      description: "Block out one hour for deep work.",
      color: "#f97316",
      icon: "⏱️",
      entries: [1, 2, 3, 6].map((offset) => ({ entryDate: daysAgo(offset) })),
    },
  ];

  for (const habit of sampleHabits) {
    const existing = await prisma.habit.findFirst({
      where: {
        userId: user.id,
        name: habit.name,
      },
      select: { id: true },
    });

    if (existing) {
      continue;
    }

    await prisma.habit.create({
      data: {
        name: habit.name,
        description: habit.description,
        color: habit.color,
        icon: habit.icon,
        userId: user.id,
        entries: {
          create: habit.entries,
        },
      },
    });
  }

  console.log(`Seed completed for user ${user.id}`);
}

seed()
  .catch((error) => {
    console.error("Failed to seed database", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

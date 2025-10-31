-- Helper script to bootstrap a PostgreSQL database without running Prisma migrations.
-- Prefer using `npm run db:migrate` in most scenarios.

CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Habit" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "color" TEXT,
  "icon" TEXT,
  "targetCount" INTEGER NOT NULL DEFAULT 1,
  "archived" BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "HabitEntry" (
  "id" TEXT PRIMARY KEY,
  "habitId" TEXT NOT NULL REFERENCES "Habit"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "entryDate" TIMESTAMP(3) NOT NULL,
  "value" INTEGER NOT NULL DEFAULT 1,
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "Habit_userId_archived_idx" ON "Habit" ("userId", "archived");
CREATE UNIQUE INDEX IF NOT EXISTS "HabitEntry_habitId_entryDate_key" ON "HabitEntry" ("habitId", "entryDate");
CREATE INDEX IF NOT EXISTS "HabitEntry_entryDate_idx" ON "HabitEntry" ("entryDate");

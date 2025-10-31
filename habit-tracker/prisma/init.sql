PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Habit" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "color" TEXT,
  "icon" TEXT,
  "targetCount" INTEGER NOT NULL DEFAULT 1,
  "archived" INTEGER NOT NULL DEFAULT 0,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "userId" TEXT,
  CONSTRAINT "Habit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "HabitEntry" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "habitId" TEXT NOT NULL,
  "entryDate" DATETIME NOT NULL,
  "value" INTEGER NOT NULL DEFAULT 1,
  "note" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "HabitEntry_habitId_fkey" FOREIGN KEY ("habitId") REFERENCES "Habit" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "Habit_userId_archived_idx" ON "Habit" ("userId", "archived");
CREATE UNIQUE INDEX IF NOT EXISTS "HabitEntry_habitId_entryDate_key" ON "HabitEntry" ("habitId", "entryDate");
CREATE INDEX IF NOT EXISTS "HabitEntry_entryDate_idx" ON "HabitEntry" ("entryDate");

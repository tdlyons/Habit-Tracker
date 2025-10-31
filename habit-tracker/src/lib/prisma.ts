import path from "node:path";
import { PrismaClient } from "@/generated/prisma";

const normalizeDatabaseUrl = () => {
  const url = process.env.DATABASE_URL;
  if (!url || !url.startsWith("file:")) {
    return;
  }

  const filePath = url.replace("file:", "");
  if (filePath.startsWith("/")) {
    return;
  }

  const absolutePath = path.resolve(process.cwd(), filePath);
  process.env.DATABASE_URL = `file:${absolutePath}`;
};

normalizeDatabaseUrl();

declare global {
  var prisma: PrismaClient | undefined;
}

const createClient = () =>
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

export const prisma = global.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

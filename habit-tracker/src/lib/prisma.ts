import { PrismaClient } from "@/generated/prisma";

declare global {
  var prisma: PrismaClient | undefined;
}

const createClient = () =>
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

export const getPrismaClient = () => {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set. Provide a PostgreSQL connection string.");
  }

  if (!global.prisma) {
    global.prisma = createClient();
  }

  return global.prisma;
};

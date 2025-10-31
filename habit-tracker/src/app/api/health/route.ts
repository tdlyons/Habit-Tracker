import { NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const prisma = getPrismaClient();
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Health check failed", error);
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}

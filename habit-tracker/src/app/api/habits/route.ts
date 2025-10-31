import { NextResponse } from "next/server";
import { createHabit, serializeDashboard } from "@/lib/habit-service";
import { getCurrentUserId } from "@/lib/user-session";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const userId = await getCurrentUserId();
    const dashboard = await createHabit(userId, {
      name: payload.name,
      description: payload.description,
      color: payload.color,
      icon: payload.icon,
      targetCount: payload.targetCount,
    });

    return NextResponse.json(serializeDashboard(dashboard), { status: 201 });
  } catch (error) {
    console.error("Failed to create habit", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create habit." },
      { status: 400 },
    );
  }
}

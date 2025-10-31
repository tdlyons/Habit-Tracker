import { NextResponse } from "next/server";
import { serializeDashboard, toggleHabitEntry } from "@/lib/habit-service";
import { getCurrentUserId } from "@/lib/user-session";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ habitId: string }> },
) {
  try {
    const { habitId } = await params;
    const payload = await request.json().catch(() => ({}));
    const userId = await getCurrentUserId();
    const dashboard = await toggleHabitEntry(userId, habitId, payload?.date);

    return NextResponse.json(serializeDashboard(dashboard));
  } catch (error) {
    console.error("Failed to toggle habit entry", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update habit." },
      { status: 400 },
    );
  }
}

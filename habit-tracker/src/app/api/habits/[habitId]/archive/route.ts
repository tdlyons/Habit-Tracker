import { NextResponse } from "next/server";
import { archiveHabit, serializeDashboard } from "@/lib/habit-service";
import { getCurrentUserId } from "@/lib/user-session";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ habitId: string }> },
) {
  try {
    const { habitId } = await params;
    const payload = await request.json().catch(() => ({}));
    const userId = await getCurrentUserId();
    const dashboard = await archiveHabit(userId, habitId, Boolean(payload?.archived));

    return NextResponse.json(serializeDashboard(dashboard));
  } catch (error) {
    console.error("Failed to archive habit", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to archive habit." },
      { status: 400 },
    );
  }
}

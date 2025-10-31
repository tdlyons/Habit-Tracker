import { NextResponse } from "next/server";
import { archiveHabit, serializeDashboard } from "@/lib/habit-service";

export async function POST(
  request: Request,
  { params }: { params: { habitId: string } },
) {
  try {
    const { habitId } = params;
    const payload = await request.json().catch(() => ({}));
    const dashboard = await archiveHabit(habitId, Boolean(payload?.archived));

    return NextResponse.json(serializeDashboard(dashboard));
  } catch (error) {
    console.error("Failed to archive habit", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to archive habit." },
      { status: 400 },
    );
  }
}

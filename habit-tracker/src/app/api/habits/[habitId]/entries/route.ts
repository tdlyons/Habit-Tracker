import { NextResponse } from "next/server";
import { serializeDashboard, toggleHabitEntry } from "@/lib/habit-service";

export async function POST(
  request: Request,
  { params }: { params: { habitId: string } },
) {
  try {
    const { habitId } = params;
    const payload = await request.json().catch(() => ({}));
    const dashboard = await toggleHabitEntry(habitId, payload?.date);

    return NextResponse.json(serializeDashboard(dashboard));
  } catch (error) {
    console.error("Failed to toggle habit entry", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update habit." },
      { status: 400 },
    );
  }
}

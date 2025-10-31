import { NextResponse } from "next/server";
import { getDashboardData, serializeDashboard } from "@/lib/habit-service";
import { getCurrentUserId } from "@/lib/user-session";

export async function GET() {
  try {
    const userId = await getCurrentUserId();
    const dashboard = await getDashboardData(userId);
    return NextResponse.json(serializeDashboard(dashboard));
  } catch (error) {
    console.error("Failed to retrieve dashboard data", error);
    return NextResponse.json(
      { error: "Unable to load dashboard data." },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";
import { getDashboardData, serializeDashboard } from "@/lib/habit-service";

export async function GET() {
  try {
    const dashboard = await getDashboardData();
    return NextResponse.json(serializeDashboard(dashboard));
  } catch (error) {
    console.error("Failed to retrieve dashboard data", error);
    return NextResponse.json(
      { error: "Unable to load dashboard data." },
      { status: 500 },
    );
  }
}

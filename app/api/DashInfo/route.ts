import { NextResponse } from "next/server";
// Update this import path to where your function actually lives:
import  fetchDashInfo  from "@/app/lib/fetchDash";

export async function GET() {
  try {
    const response = await fetchDashInfo();
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("DashInfo GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
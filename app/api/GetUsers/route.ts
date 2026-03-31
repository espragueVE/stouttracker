import { NextResponse } from "next/server";
// Update this import path to where your function actually lives:
import fetchUsersInfo from "@/app/lib/fetchUsers";

export async function GET() {
  try {
    const response = await fetchUsersInfo();
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("DashInfo GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
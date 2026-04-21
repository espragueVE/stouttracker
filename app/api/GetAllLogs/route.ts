import { NextResponse } from "next/server";
import fetchAllLogs from "@/app/lib/fetchAllLogs";

export async function GET() {
  try {
    const logs = await fetchAllLogs();
    return NextResponse.json(logs, { status: 200 });
  } catch (error) {
    console.error("GetAllLogs GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch all logs" },
      { status: 500 },
    );
  }
}
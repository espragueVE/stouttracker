import { NextResponse } from "next/server";
import fetchUserDonationTotals from "@/app/lib/fetchUserDonationTotals";

export async function GET() {
  try {
    const totals = await fetchUserDonationTotals();

    return NextResponse.json(totals, { status: 200 });
  } catch (error) {
    console.error("GetUsers GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
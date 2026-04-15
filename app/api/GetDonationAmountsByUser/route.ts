import { NextResponse } from "next/server";
import { Amounts } from "@/app/types/index";
import fetchUserDonationTotals from "@/app/lib/fetchUserDonationTotals";

export async function GET() {
  try {
    const totals = await fetchUserDonationTotals();
    
    // Transform database results to Amounts interface
    const Amounts: Amounts[] = totals.map((total: any) => ({
      id: total.id,
     amount: total.totaldonated || 0, // Default value
    }));

    return NextResponse.json(Amounts, { status: 200 });
  } catch (error) {
    console.error("GetUsers GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
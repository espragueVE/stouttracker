import { NextResponse } from "next/server";
import { LogPayload } from "@/app/types";
import postMonetaryDonation from "@/app/lib/postMonetaryDonation";
import postInKindDonation from "@/app/lib/postInKindDonation";
import postObligations from "@/app/lib/postObligations";
import postLoans from "@/app/lib/postLoans";
import postExpenditures from "@/app/lib/postExpenditures";

export async function POST(request: Request) {
  try {
    const payload: LogPayload = await request.json();

    //write this with a variable mapping for the formType -> post function
    const typeMapping: {
      [key: string]: (payload: LogPayload) => Promise<any>;
    } = {
      "MonetaryContributions": postMonetaryDonation,
      "InKindContributions": postInKindDonation,
      "Expenditures": postExpenditures,
      "Loans": postLoans,
      "Obligations": postObligations,
    };

    if (typeMapping[payload.formType]) {
      const response = await typeMapping[payload.formType](payload);
      return NextResponse.json(response, { status: 200 });
    } else {
      return NextResponse.json(
        { error: `Unknown form type: ${payload.formType}` },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("PostEntry error:", error);
    return NextResponse.json(
      { error: "Failed to process entry" },
      { status: 500 },
    );
  }
}

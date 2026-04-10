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

    if (payload.formType === "MonetaryContributions") {
      const response = await postMonetaryDonation(payload);
      return NextResponse.json(response, { status: 200 });
    } else if (payload.formType === "InKindContributions") {
      const response = await postInKindDonation(payload);
      return NextResponse.json(response, { status: 200 });
    } else if (payload.formType === "Expenditures") {
      const response = await postExpenditures(payload);
      return NextResponse.json(response, { status: 200 });
    } else if (payload.formType === "Loans") {
      const response = await postLoans(payload);
      return NextResponse.json(response, { status: 200 });
    } else if (payload.formType === "Obligations") {
      const response = await postObligations(payload);
      return NextResponse.json(response, { status: 200 });
    }

    return NextResponse.json(
      { error: `Unknown form type: ${payload.formType}` },
      { status: 400 },
    );
  } catch (error) {
    console.error("PostEntry error:", error);
    return NextResponse.json(
      { error: "Failed to process entry" },
      { status: 500 },
    );
  }
}

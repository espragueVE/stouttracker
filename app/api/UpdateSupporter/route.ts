import { NextResponse } from "next/server";
import updateSupporters from "@/app/lib/updateSupporters";

type UpdateSupporterPayload = {
  id?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  businessOrg?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  occupation?: string;
  employer?: string;
  age?: number;
};

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as UpdateSupporterPayload;

    if (!payload.id) {
      return NextResponse.json(
        { error: "Supporter id is required" },
        { status: 400 },
      );
    }

    await updateSupporters({
      id: payload.id,
      firstName: payload.firstName,
      middleName: payload.middleName,
      lastName: payload.lastName,
      businessOrg: payload.businessOrg,
      address: payload.address,
      city: payload.city,
      state: payload.state,
      zip: payload.zip,
      occupation: payload.occupation,
      employer: payload.employer,
      age: payload.age,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("UpdateSupporter POST error:", error);
    return NextResponse.json(
      { error: "Failed to update supporter" },
      { status: 500 },
    );
  }
}
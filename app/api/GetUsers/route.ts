import { NextResponse } from "next/server";
import { Donor } from "@/app/types/index";
import fetchUsersInfo from "@/app/lib/fetchSupporters";
import fetchUsersDonationTotals from "@/app/lib/fetchSupporterDonationTotals";
import { Amounts } from "@/app/types/index";


export async function GET() {
  try {
    const users = await fetchUsersInfo();
    const userDonations: Amounts[] = await fetchUsersDonationTotals();
    console.log("amounts by user:", userDonations);
    
    // Transform database results to Donor interface
    const donors: Donor[] = users.map((user: any) => ({
      id: user.id,
      firstName: user.F_Name,
      lastName: user.L_Name,
      middleName: user.M_Name || undefined,
      businessOrg: user.Business_Org || undefined,
      email: undefined, // Not in database
      amount:
        userDonations.find((donation) => donation.id === Number(user.id))?.amount || 0,
      date: user.created_at || new Date().toISOString(),
      phone: undefined, // Not in database
      address: user.Address,
      city: user.City,
      state: user.State || undefined,
      zip: user.Zip,
      age: user.Age || undefined,
      occupation: user.Occupation || undefined,
      employer: user.Employer || undefined,
      notes: undefined,
      isVolunteer: false,
      requestedSign: false,
      hasSign: false,
    }));

    return NextResponse.json(donors, { status: 200 });
  } catch (error) {
    console.error("GetUsers GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
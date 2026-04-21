import supabase from "@/app/utils/supabase";

export default async function fetchDashInfo() {
  type MonetaryDonationRow = {
    amount: number | string | null;
    date: string | null;
  };

  type EntryRow = {
    SupporterID: string | number | null;
    DetailsID: string | number | null;
  };

  type UserRow = {
    Age: number | null;
  };

  try {
    const [
      monetaryDonationsResult,
      entriesResult,
      usersResult,
    ] = await Promise.all([
      supabase.from("MonetaryDonation").select("amount, date"),
      supabase.from("Entry").select("SupporterID, DetailsID").like("DetailsID", "001-%"),
      supabase.from("User").select("Age"),
    ]);

    if (monetaryDonationsResult.error) {
      throw monetaryDonationsResult.error;
    }

    if (entriesResult.error) {
      throw entriesResult.error;
    }

    if (usersResult.error) {
      throw usersResult.error;
    }

    const monetaryDonations =
      (monetaryDonationsResult.data as MonetaryDonationRow[] | null) ?? [];
    const users = (usersResult.data as UserRow[] | null) ?? [];

    const donationAmounts = monetaryDonations.map((row) => Number(row.amount) || 0);
    const totalAmount = donationAmounts.reduce((sum, amount) => sum + amount, 0);
    const avgAmount = donationAmounts.length > 0 ? totalAmount / donationAmounts.length : 0;

    const distinctDonors =users.length;

    const totalsByDate = monetaryDonations.reduce<Map<string, number>>((accumulator, row) => {
      if (!row.date) {
        return accumulator;
      }

      const currentTotal = accumulator.get(row.date) ?? 0;
      accumulator.set(row.date, currentTotal + (Number(row.amount) || 0));
      return accumulator;
    }, new Map());

    const topByDate = Array.from(totalsByDate.entries())
      .map(([date, total]) => ({ date, total }))
      .sort((left, right) => right.total - left.total)
      .slice(0, 5);

    const ages = users.reduce(
      (accumulator, row) => {
        const age = row.Age;

        if (age === null) {
          return accumulator;
        }

        if (age < 30) {
          accumulator.under30 += 1;
        } else if (age < 51) {
          accumulator.between30and50 += 1;
        } else if (age < 65) {
          accumulator.between51and64 += 1;
        } else {
          accumulator.over65 += 1;
        }

        return accumulator;
      },
      {
        under30: 0,
        between30and50: 0,
        between51and64: 0,
        over65: 0,
      },
    );

    return {
      totalAmount,
      distinctDonors,
      avgAmount,
      topByDate,
      ages,
    };
  } catch (err: any) {
    console.error("fetchDashInfo DB error:", {
      message: err.message,
      code: err.code,
      details: err.details,
      hint: err.hint,
    });
    throw err;
  }
}

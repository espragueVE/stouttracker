import { Amounts } from "../types";
import supabase from "@/app/utils/supabase";

export default async function fetchSupporterDonationTotals() {
  type EntryRow = {
    SupporterID: string | number | null;
    DetailsID: string | number | null;
  };

  type MonetaryDonationRow = {
    id: string | number;
    amount: number | string | null;
  };

  const [entriesResult, donationsResult] = await Promise.all([
    supabase.from("Entry").select("SupporterID, DetailsID").like("DetailsID", "001-%"),
    supabase.from("MonetaryDonation").select("id, amount"),
  ]);

  if (entriesResult.error) {
    throw entriesResult.error;
  }

  if (donationsResult.error) {
    throw donationsResult.error;
  }

  const entries = (entriesResult.data as EntryRow[] | null) ?? [];
  const donations = (donationsResult.data as MonetaryDonationRow[] | null) ?? [];

  const donationAmountsById = new Map<string, number>(
    donations.map((donation) => [String(donation.id), Number(donation.amount) || 0]),
  );

  const totalsBySupporterId = entries.reduce<Map<string, number>>((accumulator, entry) => {
    if (entry.SupporterID === null || entry.DetailsID === null) {
      return accumulator;
    }

    const donationId = String(entry.DetailsID);

    if (!donationId.startsWith("001-")) {
      return accumulator;
    }

    const amount = donationAmountsById.get(donationId) ?? 0;
    const supporterId = String(entry.SupporterID);
    accumulator.set(supporterId, (accumulator.get(supporterId) ?? 0) + amount);
    return accumulator;
  }, new Map());

  return Array.from(totalsBySupporterId.entries()).map(([id, amount]) => ({
    id: Number(id),
    amount,
  })) satisfies Amounts[];
}

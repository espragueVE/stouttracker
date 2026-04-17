import { Amounts } from "../types";
import supabase from "@/app/utils/supabase";

export default async function fetchUsersDonationTotals() {
  type EntryRow = {
    SupporterID: string | number | null;
    LogEntryDetailsID: string | number | null;
  };

  type LogEntryDetailsRow = {
    Id: string | number;
    MonetaryDonationID: string | number | null;
  };

  type MonetaryDonationRow = {
    id: string | number;
    amount: number | string | null;
  };

  const [entriesResult, logEntryDetailsResult, donationsResult] = await Promise.all([
    supabase.from("Entry").select("SupporterID, LogEntryDetailsID"),
    supabase.from("LogEntryDetails").select("Id, MonetaryDonationID"),
    supabase.from("MonetaryDonation").select("id, amount"),
  ]);

  if (entriesResult.error) {
    throw entriesResult.error;
  }

  if (logEntryDetailsResult.error) {
    throw logEntryDetailsResult.error;
  }

  if (donationsResult.error) {
    throw donationsResult.error;
  }

  const entries = (entriesResult.data as EntryRow[] | null) ?? [];
  const logEntryDetails =
    (logEntryDetailsResult.data as LogEntryDetailsRow[] | null) ?? [];
  const donations = (donationsResult.data as MonetaryDonationRow[] | null) ?? [];

  const donationAmountsById = new Map<string, number>(
    donations.map((donation) => [String(donation.id), Number(donation.amount) || 0]),
  );

  const donationIdByLogEntryId = new Map<string, string>(
    logEntryDetails
      .filter(
        (detail): detail is LogEntryDetailsRow & { MonetaryDonationID: string | number } =>
          detail.MonetaryDonationID !== null,
      )
      .map((detail) => [String(detail.Id), String(detail.MonetaryDonationID)]),
  );

  const totalsBySupporterId = entries.reduce<Map<string, number>>((accumulator, entry) => {
    if (entry.SupporterID === null || entry.LogEntryDetailsID === null) {
      return accumulator;
    }

    const donationId = donationIdByLogEntryId.get(String(entry.LogEntryDetailsID));

    if (!donationId) {
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

import { LogPayload } from "../types";
import supabase from "@/app/utils/supabase";

export default async function postMonetaryDonation(payload: LogPayload) {
  let userId = payload.user?.id;

  if (!userId || userId === "") {
    const createUserResult = await supabase
      .from("User")
      .insert({
        Business_Org: payload.user?.businessOrg || "",
        F_Name: payload.user?.firstName || "",
        M_Name: payload.user?.middleName || "",
        L_Name: payload.user?.lastName || "",
        Address: payload.user?.address || "",
        City: payload.user?.city || "",
        State: payload.user?.state || "",
        Zip: payload.user?.zip || "",
        Occupation: payload.user?.occupation || "",
        Employer: payload.user?.employer || "",
      })
      .select("id")
      .single();

    if (createUserResult.error) {
      throw createUserResult.error;
    }

    userId = String(createUserResult.data?.id ?? "");
  }

  if (!userId) {
    throw new Error("Failed to resolve or create user");
  }

  const supporterId = Number(userId);
  const amountDonated = Number(payload.answers.AmountDonated) || 0;

  const [entriesResult, logEntryDetailsResult, donationsResult] = await Promise.all([
    supabase
      .from("Entry")
      .select("LogEntryDetailsID")
      .eq("SupporterID", supporterId),
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

  const relatedLogEntryIds = new Set(
    ((entriesResult.data as Array<{ LogEntryDetailsID: string | number | null }> | null) ?? [])
      .map((entry) => entry.LogEntryDetailsID)
      .filter((entryId): entryId is string | number => entryId !== null)
      .map(String),
  );

  const monetaryDonationIds = new Set(
    ((logEntryDetailsResult.data as Array<{ Id: string | number; MonetaryDonationID: string | number | null }> | null) ?? [])
      .filter(
        (detail): detail is { Id: string | number; MonetaryDonationID: string | number } =>
          detail.MonetaryDonationID !== null && relatedLogEntryIds.has(String(detail.Id)),
      )
      .map((detail) => String(detail.MonetaryDonationID)),
  );

  const totalValue =
    ((donationsResult.data as Array<{ id: string | number; amount: number | string | null }> | null) ?? [])
      .filter((item) => monetaryDonationIds.has(String(item.id)))
      .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  const createMonetaryLog = await supabase
    .from("MonetaryDonation")
    .insert({
      received_for: payload.answers.ReceivedFor,
      amount: amountDonated,
      date: payload.answers.DateReceived,
      aggregate: totalValue + amountDonated,
    })
    .select("id")
    .single();

  if (createMonetaryLog.error) {
    throw createMonetaryLog.error;
  }

  const monetaryID = createMonetaryLog.data?.id;

  const createEntryDetails = await supabase
    .from("LogEntryDetails")
    .insert({
      created_at: new Date().toISOString(),
      MonetaryDonationID: monetaryID,
    })
    .select("Id")
    .single();

  if (createEntryDetails.error) {
    throw createEntryDetails.error;
  }

  const logEntryDetailsId = createEntryDetails.data?.Id;

  const createEntry = await supabase
    .from("Entry")
    .insert({
      created_at: new Date().toISOString(),
      LogEntryDetailsID: logEntryDetailsId,
      SupporterID: Number.isNaN(supporterId) ? null : supporterId,
    })
    .select("EntryId")
    .single();

  if (createEntry.error) {
    throw createEntry.error;
  }

  const entryId = createEntry.data?.EntryId;

  return { success: true, entryId };
}

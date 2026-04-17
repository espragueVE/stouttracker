import { LogPayload } from "../types";
import supabase from "@/app/utils/supabase";

export default async function postInKindDonation(payload: LogPayload) {
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

  const currentSupporterId = Number(userId);
  const inKindValue = Number(payload.answers.Value) || 0;

  const [entryResult, logEntryDetailsResult, inKindContributionsResult] = await Promise.all([
    supabase
      .from("Entry")
      .select("LogEntryDetailsID")
      .eq("SupporterID", currentSupporterId),
    supabase.from("LogEntryDetails").select("Id, InKindDonationID"),
    supabase.from("InKindDonation").select("id, Value"),
  ]);

  const relatedLogEntryIds = new Set(
    ((entryResult.data as Array<{ LogEntryDetailsID: string | number | null }> | null) ?? [])
      .map((entry) => entry.LogEntryDetailsID)
      .filter((entryId): entryId is string | number => entryId !== null)
      .map(String),
  );

  const inKindDonationIds = new Set(
    ((logEntryDetailsResult.data as Array<{ Id: string | number; InKindDonationID: string | number | null }> | null) ?? [])
      .filter(
        (detail): detail is { Id: string | number; InKindDonationID: string | number } =>
          detail.InKindDonationID !== null && relatedLogEntryIds.has(String(detail.Id)),
      )
      .map((detail) => String(detail.InKindDonationID)),
  );

  const totalValue =
    ((inKindContributionsResult.data as Array<{ id: string | number; Value: number | string | null }> | null) ?? [])
      .filter((item) => inKindDonationIds.has(String(item.id)))
      .reduce((sum, item) => sum + (Number(item.Value) || 0), 0);

  const createInKindLog = await supabase
    .from("InKindDonation")
    .insert({
      received_for: payload.answers.ReceivedFor,
      value: inKindValue,
      description: payload.answers.Description || "",
      date: payload.answers.DateReceived,
      aggregate: totalValue + inKindValue,
    })
    .select("id")
    .single();

  if (createInKindLog.error) {
    throw createInKindLog.error;
  }

  const inKindID = createInKindLog.data?.id;

  const createEntryDetails = await supabase
    .from("LogEntryDetails")
    .insert({
      created_at: new Date().toISOString(),
      InKindDonationID: inKindID,
    })
    .select("Id")
    .single();

  if (createEntryDetails.error) {
    throw createEntryDetails.error;
  }

  const LogEntryDetailsId = createEntryDetails.data?.Id;

  const createEntry = await supabase
    .from("Entry")
    .insert({
      created_at: new Date().toISOString(),
      LogEntryDetailsID: LogEntryDetailsId,
      SupporterID: Number.isNaN(currentSupporterId) ? null : currentSupporterId,
    })
    .select("EntryId")
    .single();

  if (createEntry.error) {
    throw createEntry.error;
  }

  const entryId = createEntry.data?.EntryId;

  return { success: true, entryId };
}

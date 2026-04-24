import { LogPayload } from "../types";
import supabase from "@/app/utils/supabase";

export default async function postInKindDonation(payload: LogPayload) {
  let userId = payload.user?.id;

  if (!userId || userId === "") {
    const createUserResult = await supabase
      .from("Supporter")
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

  const [entryResult, inKindContributionsResult] = await Promise.all([
    supabase
      .from("Entry")
      .select("DetailsID")
      .eq("SupporterID", currentSupporterId),
    supabase.from("InKindDonation").select("id, value"),
  ]);

  if (entryResult.error) {
    throw entryResult.error;
  }

  if (inKindContributionsResult.error) {
    throw inKindContributionsResult.error;
  }

  const relatedLogEntryIds = new Set(
    ((entryResult.data as Array<{ DetailsID: string | number | null }> | null) ?? [])
      .map((entry) => entry.DetailsID)
      .filter(
        (entryId): entryId is string | number =>
          entryId !== null && String(entryId).startsWith("002-"),
      )
      .map(String),
  );

  const totalValue =
    ((inKindContributionsResult.data as Array<{ id: string | number; value: number | string | null }> | null) ?? [])
      .filter((item) => relatedLogEntryIds.has(String(item.id)))
      .reduce((sum, item) => sum + (Number(item.value) || 0), 0);

  const inKindID = `002-${Date.now()}`;

  const createEntry = await supabase
    .from("Entry")
    .insert({
      created_at: new Date().toISOString(),
      DetailsID: inKindID,
      SupporterID: Number.isNaN(currentSupporterId) ? null : currentSupporterId,
    })
    .select("id")
    .single();

  if (createEntry.error) {
    throw createEntry.error;
  }

  const createInKindLog = await supabase
    .from("InKindDonation")
    .insert({
      id: inKindID,
      received_for: payload.answers.ReceivedFor,
      value: inKindValue,
      description: payload.answers.Description || "",
      date: payload.answers.DateReceived,
      aggregate: totalValue + inKindValue,
      election_cycle: payload.answers.ElectionCycle,
    })
    .select("id")
    .single();

  if (createInKindLog.error) {
    throw createInKindLog.error;
  }

  const entryId = createEntry.data?.id;

  return { success: true, entryId };
}

import { LogPayload } from "../types";
import supabase from "@/app/utils/supabase";

export default async function postMonetaryDonation(payload: LogPayload) {
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
        Age: payload.user?.age || null,
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

  const [entriesResult, donationsResult] = await Promise.all([
    supabase
      .from("Entry")
      .select("DetailsID")
      .eq("SupporterID", supporterId),
    supabase.from("MonetaryDonation").select("id, amount"),
  ]);

  if (entriesResult.error) {
    throw entriesResult.error;
  }

  if (donationsResult.error) {
    throw donationsResult.error;
  }

  const relatedLogEntryIds = new Set(
    ((entriesResult.data as Array<{ DetailsID: string | number | null }> | null) ?? [])
      .map((entry) => entry.DetailsID)
      .filter(
        (id): id is string | number =>
          id !== null && String(id).startsWith("001-"),
      )
      .map(String),
  );

  const totalValue =
    ((donationsResult.data as Array<{ id: string | number; amount: number | string | null }> | null) ?? [])
      .filter((item) => relatedLogEntryIds.has(String(item.id)))
      .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  const monetaryID = `001-${Date.now()}`;

  const createEntry = await supabase
    .from("Entry")
    .insert({
      created_at: new Date().toISOString(),
      DetailsID: monetaryID,
      SupporterID: Number.isNaN(supporterId) ? null : supporterId,
    })
    .select("id")
    .single();

  if (createEntry.error) {
    throw createEntry.error;
  }

  const createMonetaryLog = await supabase
    .from("MonetaryDonation")
    .insert({
      id: monetaryID,
      received_for: payload.answers.ReceivedFor,
      amount: amountDonated,
      date: payload.answers.DateReceived,
      aggregate: totalValue + amountDonated,
      prefers_anonymous: payload.answers.Anonymous === "true",
      election_cycle: payload.answers.ElectionCycle,
    })
    .select("id")
    .single();

  if (createMonetaryLog.error) {
    throw createMonetaryLog.error;
  }

  const entryId = createEntry.data?.id;

  return { success: true, entryId };
}

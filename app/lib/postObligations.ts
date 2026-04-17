import { LogPayload } from "../types";
import supabase from "@/app/utils/supabase";

export default async function postObligations(payload: LogPayload) {
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

  const createObligationLog = await supabase
    .from("Obligations")
    .insert({
      description: payload.answers.Description,
      outstanding_start: Number(payload.answers.OutstandingBalanceStart) || 0,
      debt_incurred: Number(payload.answers.DebtIncurred) || 0,
      payments: Number(payload.answers.DebtPayments) || 0,
      outstanding_end: Number(payload.answers.OutstandingBalanceEnd) || 0,
    })
    .select("id")
    .single();

  if (createObligationLog.error) {
    throw createObligationLog.error;
  }

  const obligationID = createObligationLog.data?.id;

  const createEntryDetails = await supabase
    .from("LogEntryDetails")
    .insert({
      created_at: new Date().toISOString(),
      ObligationID: obligationID,
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

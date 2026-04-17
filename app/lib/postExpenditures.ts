import { LogPayload } from "../types";
import supabase from "@/app/utils/supabase";

export default async function postExpenditures(payload: LogPayload) {
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

  const expenditureAmount = Number(payload.answers.Amount) || 0;
  const currentSupporterId = Number(userId);

  const createExpenditureLog = await supabase
    .from("Expenditures")
    .insert({
      amount: expenditureAmount,
      purpose: payload.answers.Purpose,
      date: payload.answers.Date,
    })
    .select("id")
    .single();

  if (createExpenditureLog.error) {
    throw createExpenditureLog.error;
  }

  const expenditureID = createExpenditureLog.data?.id;

  const createEntryDetails = await supabase
    .from("LogEntryDetails")
    .insert({
      created_at: new Date().toISOString(),
      ExpenditureID: expenditureID,
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

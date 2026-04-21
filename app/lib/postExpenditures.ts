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
  const expenditureID = `004-${Date.now()}`;

  const createEntry = await supabase
    .from("Entry")
    .insert({
      created_at: new Date().toISOString(),
      DetailsID: expenditureID,
      SupporterID: Number.isNaN(currentSupporterId) ? null : currentSupporterId,
    })
    .select("id")
    .single();

  if (createEntry.error) {
    throw createEntry.error;
  }

  const createExpenditureLog = await supabase
    .from("Expenditures")
    .insert({
      id: expenditureID,
      amount: expenditureAmount,
      purpose: payload.answers.Purpose,
      date: payload.answers.Date,
    })
    .select("id")
    .single();

  if (createExpenditureLog.error) {
    throw createExpenditureLog.error;
  }

  const entryId = createEntry.data?.id;

  return { success: true, entryId };
}

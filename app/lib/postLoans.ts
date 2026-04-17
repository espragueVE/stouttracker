import { LogPayload } from "../types";
import supabase from "@/app/utils/supabase";

export default async function postLoans(payload: LogPayload) {
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

  const createLoanLog = await supabase
    .from("Loans")
    .insert({
      outstanding_start: Number(payload.answers.OutstandingBalanceStart) || 0,
      recieved: Number(payload.answers.LoansReceived) || 0,
      payment: Number(payload.answers.LoanPayments) || 0,
      outstanding_end: Number(payload.answers.OutstandingBalanceEnd) || 0,
      received_for: payload.answers.ReceivedFor,
      date: payload.answers.Date,
      endorser_id1: payload.answers.EndorserId1 || null,
      amount_outstanding1: payload.answers.AmountOutstanding1
        ? Number(payload.answers.AmountOutstanding1)
        : null,
      endorser_id2: payload.answers.EndorserId2 || null,
      amount_outstanding2: payload.answers.AmountOutstanding2
        ? Number(payload.answers.AmountOutstanding2)
        : null,
      endorser_id3: payload.answers.EndorserId3 || null,
      amount_outstanding3: payload.answers.AmountOutstanding3
        ? Number(payload.answers.AmountOutstanding3)
        : null,
    })
    .select("id")
    .single();

  if (createLoanLog.error) {
    throw createLoanLog.error;
  }

  const loanID = createLoanLog.data?.id;

  const createEntryDetails = await supabase
    .from("LogEntryDetails")
    .insert({
      created_at: new Date().toISOString(),
      LoanID: loanID,
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

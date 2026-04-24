import { LogPayload } from "../types";
import supabase from "@/app/utils/supabase";

export default async function postLoans(payload: LogPayload) {
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
  const loanID = `003-${Date.now()}`;

  const createEntry = await supabase
    .from("Entry")
    .insert({
      created_at: new Date().toISOString(),
      DetailsID: loanID,
      SupporterID: Number.isNaN(currentSupporterId) ? null : currentSupporterId,
    })
    .select("id")
    .single();

  if (createEntry.error) {
    throw createEntry.error;
  }

  const createLoanLog = await supabase
    .from("Loans")
    .insert({
      id: loanID,
      outstanding_start: Number(payload.answers.OutstandingBalanceStart) || 0,
      recieved: Number(payload.answers.LoansReceived) || 0,
      payment: Number(payload.answers.LoanPayments) || 0,
      outstanding_end: Number(payload.answers.OutstandingBalanceEnd) || 0,
      received_for: payload.answers.ReceivedFor,
      date: payload.answers.Date,
      endorser_Fname1: payload.answers.EndorserFName1 || null,
      endorser_Mname1: payload.answers.EndorserMName1 || null,
      endorser_Lname1: payload.answers.EndorserLName1 || null,
      endorser_Address1: payload.answers.EndorserAddress1 || null,
      endorser_City1: payload.answers.EndorserCity1 || null,
      endorser_State1: payload.answers.EndorserState1 || null,
      endorser_Zip1: payload.answers.EndorserZip1 || null,
      amount_outstanding1: payload.answers.AmountOutstanding1
        ? Number(payload.answers.AmountOutstanding1)
        : null,
      endorser_Fname2: payload.answers.EndorserFName2 || null,
      endorser_Mname2: payload.answers.EndorserMName2 || null,
      endorser_Lname2: payload.answers.EndorserLName2 || null,
      endorser_Address2: payload.answers.EndorserAddress2 || null,
      endorser_City2: payload.answers.EndorserCity2 || null,
      endorser_State2: payload.answers.EndorserState2 || null,
      endorser_Zip2: payload.answers.EndorserZip2 || null,
      amount_outstanding2: payload.answers.AmountOutstanding2
        ? Number(payload.answers.AmountOutstanding2)
        : null,
      endorser_Fname3: payload.answers.EndorserFName3 || null,
      endorser_Mname3: payload.answers.EndorserMName3 || null,
      endorser_Lname3: payload.answers.EndorserLName3 || null,
      endorser_Address3: payload.answers.EndorserAddress3 || null,
      endorser_City3: payload.answers.EndorserCity3 || null,
      endorser_State3: payload.answers.EndorserState3 || null,
      endorser_Zip3: payload.answers.EndorserZip3 || null,

      amount_outstanding3: payload.answers.AmountOutstanding3
        ? Number(payload.answers.AmountOutstanding3)
        : null,
        election_cycle: payload.answers.ElectionCycle,
    })
    .select("id")
    .single();

  if (createLoanLog.error) {
    throw createLoanLog.error;
  }

  const entryId = createEntry.data?.id;

  return { success: true, entryId };
}

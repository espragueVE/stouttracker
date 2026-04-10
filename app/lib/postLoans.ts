import { LogPayload } from "../types";
import sql from "./db";

export default async function postLoans(payload: LogPayload) {
  //check user info if existing or not prob just send as part of the payload
  //if no user id create new user
  //then inert log info ---- get id from this and use as foreign key in entrydetails table
  //insert into logentrydetails with logid
  //then create Entry
  let userId = payload.user?.id;

  if (!userId || userId === "") {
    const createUserResult = await sql`
        insert into public."User" ("Business_Org", "F_Name", "M_Name", "L_Name", "Address", "City", "State", "Zip", "Occupation", "Employer")
        values (${payload.user?.businessOrg || ""}, ${payload.user?.firstName || ""}, ${payload.user?.middleName || ""}, ${payload.user?.lastName || ""}, ${payload.user?.address || ""}, ${payload.user?.city || ""}, ${payload.user?.state || ""}, ${payload.user?.zip || ""}, ${payload.user?.occupation || ""}, ${payload.user?.employer || ""})
        returning id
        `;
    userId = createUserResult[0]?.id.toString();
  }

  const createLoanLog = await sql`
        insert into public."Loans"
        ("outstanding_start", "recieved", "payment", "outstanding_end", "received_for", "date", "endorser_id1", "amount_outstanding1", "endorser_id2", "amount_outstanding2", "endorser_id3", "amount_outstanding3" )
        Values (${payload.answers.OutstandingBalanceStart}, ${payload.answers.LoansReceived}, ${payload.answers.LoanPayments}, ${payload.answers.OutstandingBalanceEnd}, ${payload.answers.ReceivedFor}, ${payload.answers.Date}, ${payload.answers.EndorserId1 || null}, ${payload.answers.AmountOutstanding1 || null}, ${payload.answers.EndorserId2 || null}, ${payload.answers.AmountOutstanding2 || null}, ${payload.answers.EndorserId3 || null}, ${payload.answers.AmountOutstanding3 || null} )
        RETURNING id
        `;
  const loanID = createLoanLog[0]?.id;

  const createEntryDetails = await sql`
        insert into public."LogEntryDetails" ("created_at", "LoanID")
        values (now(), ${loanID})
        returning id
    `;
  const loanEntryDetailsId = createEntryDetails[0]?.id;

  const createEntry = await sql`
        insert into public."Entry" ("created_at", "LoanID", "SupporterID")
        values (now(), ${loanEntryDetailsId}, ${userId || null})
        returning id
    `;
  const entryId = createEntry[0]?.id;

  return { success: true, entryId };
}

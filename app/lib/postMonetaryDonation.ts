import { LogPayload } from "../types";
import sql from "./db";

export default async function postMonetaryDonation(payload: LogPayload) {
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

  if (!userId) {
    throw new Error("Failed to resolve or create user");
  }

  const getAggregateResult = await sql`
        select sum("amount") as total_value
        from public."MonetaryDonation"
        join public."LogEntryDetails" on public."MonetaryDonation".id = public."LogEntryDetails"."MonetaryDonationID"
        join public."Entry" on public."LogEntryDetails"."Id" = public."Entry"."LogEntryDetailsID"
        where public."Entry"."SupporterID" = ${userId}
    `;
  const totalValue: number = getAggregateResult[0]?.total_value || 0;
  const intAmountDonated = parseInt(payload.answers.AmountDonated, 10) || 0;

  const createMonetaryLog = await sql`
        insert into public."MonetaryDonation"
         ("received_for", "amount", "date", "aggregate")
        Values ( ${payload.answers.ReceivedFor}, ${intAmountDonated}, ${payload.answers.DateReceived}, ${totalValue + intAmountDonated} )
        RETURNING id
        `;
  const monetaryID = createMonetaryLog[0]?.id;

  const createEntryDetails = await sql`
        insert into public."LogEntryDetails" ("created_at", "MonetaryDonationID")
        values (now(), ${monetaryID})
        returning "Id"
    `;
  const logEntryDetailsId = createEntryDetails[0]?.Id;

  const createEntry = await sql`
        insert into public."Entry" ("created_at", "LogEntryDetailsID", "SupporterID")
        values (now(), ${logEntryDetailsId}, ${userId || null})
        returning "EntryId"
    `;
  const entryId = createEntry[0]?.EntryId;

  return { success: true, entryId };
}

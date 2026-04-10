import { LogPayload } from "../types";
import sql from "./db";

export default async function postInKindDonation(payload: LogPayload) {
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
        select sum("value") as total_value
        from public."InKindContributions"
        join public."LogEntryDetails" on public."InKindContributions".id = public."LogEntryDetails"."InKindDonationID"
        join public."Entry" on public."LogEntryDetails".id = public."Entry"."LogEntryDetailsID"
        where public."Entry"."SupporterID" = ${userId}
    `;
  const totalValue = getAggregateResult[0]?.total_value || 0;

  const createInKindLog = await sql`
        insert into public."InKindContributions"
         ("recieved_for", "value", "description", "date", "aggregate") --figurout aggregate)
        Values ( ${payload.answers.ReceivedFor}, ${parseInt(payload.answers.Value, 10) || 0}, ${payload.answers.Description || ""}, ${payload.answers.DateReceived}, ${totalValue + (parseInt(payload.answers.Value, 10) || 0)} )
        RETURNING id
        `;
  const inKindID = createInKindLog[0]?.id;

  const createEntryDetails = await sql`
        insert into public."LogEntryDetails" ("created_at", "InKindDonationID")
        values (now(), ${inKindID})
        returning id
    `;
  const inKindEntryDetailsId = createEntryDetails[0]?.id;

  const createEntry = await sql`
        insert into public."Entry" ("created_at", "InKindDonationID", "SupporterID")
        values (now(), ${inKindEntryDetailsId}, ${userId || null})
        returning id
    `;
  const entryId = createEntry[0]?.id;

  return { success: true, entryId };
}

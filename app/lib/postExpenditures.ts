import { LogPayload } from "../types";
import sql from "./db";

export default async function postExpenditures(payload: LogPayload) {
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

  const createExpenditureLog = await sql`
   insert into public."Expenditures"
        ("amount", "purpose", "date")
        values (${payload.answers.Amount}, ${payload.answers.Purpose}, ${payload.answers.Date} )
        RETURNING id
        `;
  const expenditureID = createExpenditureLog[0]?.id;

  const createEntryDetails = await sql`
        insert into public."LogEntryDetails" ("created_at", "ExpenditureID")
        values (now(), ${expenditureID})
        returning id
    `;
  const expenditureEntryDetailsId = createEntryDetails[0]?.id;

  const createEntry = await sql`
        insert into public."Entry" ("created_at", "ExpenditureID", "SupporterID")
        values (now(), ${expenditureEntryDetailsId}, ${userId || null})
        returning id
    `;
  const entryId = createEntry[0]?.id;

  return { success: true, entryId };
}

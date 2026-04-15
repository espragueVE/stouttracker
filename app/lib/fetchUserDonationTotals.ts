import { Amounts } from "../types";
import sql from "./db";

export default async function fetchUsersDonationTotals() {


  const result = await sql<Amounts[]>`
        select u."id", sum(md."amount") as totaldonated
        from public."User" as u
        join public."Entry" as e on u."id" = e."SupporterID"
        join public."LogEntryDetails" as led on e."LogEntryDetailsID" = led."Id"
        join public."MonetaryDonation" as md on led."MonetaryDonationID" = md."id"
        group by u."id";`;
  return result;
}

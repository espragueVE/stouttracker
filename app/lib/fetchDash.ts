import type { Pool, RowDataPacket } from "mysql2/promise";
import sql from "./db";

export default async function fetchDashInfo() {
 
  type TopByDateRow = RowDataPacket & { EntryDate: string; total: number };

  try {
    const totalRows = await sql`
      SELECT SUM("amount") AS totalAmount FROM public."MonetaryDonation"
    `;

    const donorCount = await sql`
      SELECT COUNT(DISTINCT "SupporterID") AS Donors FROM public."Entry"
    `;

    const avgAmount = await sql`
      SELECT AVG("amount") AS avgAmount FROM public."MonetaryDonation"
    `;

    const topByDateRows = await sql<TopByDateRow[]>`
      SELECT "date", SUM("amount") AS total FROM public."MonetaryDonation" GROUP BY "date" ORDER BY total DESC LIMIT 5
    `;

    const [ageUnder30] = await sql`
      SELECT COUNT(*) AS count FROM public."User" WHERE "Age" < 30
    `;
    const [age30to50] = await sql`
      SELECT COUNT(*) AS count FROM public."User" WHERE "Age" >= 30 AND "Age" < 51
    `;
    const [age51to64] = await sql`
      SELECT COUNT(*) AS count FROM public."User" WHERE "Age" >= 51 AND "Age" < 65
    `;
    const [age65plus] = await sql`
      SELECT COUNT(*) AS count FROM public."User" WHERE "Age" >= 65
    `;

    return {
      totalAmount: totalRows ?? 0,
      distinctDonors: donorCount,
      avgAmount: avgAmount ?? 0,
      topByDate: topByDateRows,
      ages: {
        under30: ageUnder30 ?? 0,
        between30and50: age30to50 ?? 0,
        between51and64: age51to64 ?? 0,
        over65: age65plus ?? 0,
      },
    };
  } catch (err: any) {
    // Helpful debug logging (do not log secrets in production)
    console.error("fetchDashInfo DB error:", {
      message: err.message,
      code: err.code,
      errno: err.errno,
      host: process.env.DB_SERVER,
      port: process.env.DB_PORT,
    });
    throw err;
  }
}

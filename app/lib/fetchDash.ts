import type { Pool, RowDataPacket } from "mysql2/promise";
import sql from "./db";

export default async function fetchDashInfo() {
  type TotalRow = RowDataPacket & { totalAmount: number | null };
  type AvgRow = RowDataPacket & { avgAmount: number | null };
  type DonorRow = RowDataPacket & { DonorId: string | number };
  type TopByDateRow = RowDataPacket & { EntryDate: string; total: number };
  type CountRow = RowDataPacket & { count: number };

  try {
    const totalRows = await sql<TotalRow[]>`
      SELECT SUM("Amount") AS totalAmount FROM public."LogEntryDetails"
       WHERE "Entry_Type" = 'f1'
    `;

    const donorRows = await sql<DonorRow[]>`
      SELECT DISTINCT "SupporterID" FROM public."Entry"
    `;

    const avgRows = await sql<AvgRow[]>`
      SELECT AVG("Amount") AS avgAmount FROM public."LogEntryDetails" WHERE "Entry_Type" = 'f1'
    `;

    const topByDateRows = await sql<TopByDateRow[]>`
      SELECT "Entry_Date", SUM("Amount") AS total FROM public."LogEntryDetails" GROUP BY "Entry_Date" ORDER BY total DESC LIMIT 5
    `;

    const [ageUnder30] = await sql<CountRow[]>`
      SELECT COUNT(*) AS count FROM public."User" WHERE "Age" < 30
    `;
    const [age30to49] = await sql<CountRow[]>`
      SELECT COUNT(*) AS count FROM public."User" WHERE "Age" >= 30 AND "Age" < 50
    `;
    const [age50to64] = await sql<CountRow[]>`
      SELECT COUNT(*) AS count FROM public."User" WHERE "Age" >= 50 AND "Age" < 65
    `;
    const [age65plus] = await sql<CountRow[]>`
      SELECT COUNT(*) AS count FROM public."User" WHERE "Age" >= 65
    `;

    return {
      totalAmount: totalRows[0]?.totalAmount ?? 0,
      distinctDonors: donorRows.map((r: DonorRow) => r.DonorId),
      avgAmount: avgRows[0]?.avgAmount ?? 0,
      topByDate: topByDateRows,
      ages: {
        under30: ageUnder30[0]?.count ?? 0,
        between30and49: age30to49[0]?.count ?? 0,
        between50and64: age50to64[0]?.count ?? 0,
        over65: age65plus[0]?.count ?? 0,
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

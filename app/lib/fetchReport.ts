
import supabase from "@/app/utils/supabase";

type ReportEntrySource = {
  key: string;
  table: string;
  detailsPrefix: string;
  dateField?: "date";
};

type ReportFetchRow = {
  [key: string]: unknown;
  id?: string | number | null;
  date?: string | null;
  description?: string;
  outstanding_start?: number;
  debt_incurred?: number;
  payments?: number;
  outstanding_end?: number;
  recieved_for?: string;
  entry_amount?: number | string | null;
  aggregate?: number | string | null;
  received?: number | string | null;
  endorser_id1?: string;
  endorser_id2?: string;
  endorser_id3?: string;
  amount_outstanding1?: number | string | null;
  amount_outstanding2?: number | string | null;
  amount_outstanding3?: number | string | null;
  value?: number | string | null;
  purpose?: string;
  prefers_anonymous?: boolean | null;
 
};

type TotalAmountByUserRow = {
  [key: string]: unknown;
};

type SupporterRow = {
  id: string | number;
  Business_Org?: string | null;
  F_Name?: string | null;
  M_Name?: string | null;
  L_Name?: string | null;
  Address?: string | null;
  City?: string | null;
  State?: string | null;
  Zip?: string | null;
  Occupation?: string | null;
  Employer?: string | null;
};

function normalizeDate(value: string) {
  const normalized = value.replace(/\D/g, "").slice(0, 8);

  if (!/^\d{8}$/.test(normalized)) {
    throw new Error("Dates must be in YYYY-MM-DD or YYYYMMDD format");
  }

  return normalized;
}

function isDateInRange(
  value: string | null | undefined,
  startDate: string,
  endDate: string,
) {
  if (!value) {
    return false;
  }

  const normalized = value.replace(/\D/g, "").slice(0, 8);

  if (!/^\d{8}$/.test(normalized)) {
    return false;
  }

  return normalized >= startDate && normalized <= endDate;
}

const REPORT_ENTRY_SOURCES: ReportEntrySource[] = [
  {
    key: "monetaryDonations",
    table: "MonetaryDonation",
    detailsPrefix: "001-",
    dateField: "date",
  },
  {
    key: "inKindDonations",
    table: "InKindDonation",
    detailsPrefix: "002-",
    dateField: "date",
  },
  {
    key: "expenditures",
    table: "Expenditures",
    detailsPrefix: "004-",
    dateField: "date",
  },
  {
    key: "loans",
    table: "Loans",
    detailsPrefix: "003-",
    dateField: "date",
  },
  {
    key: "obligations",
    table: "Obligations",
    detailsPrefix: "005-",
  },
];

function asNumber(value: unknown) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  return 0;
}

function getSupporterIdFromTotalsRow(row: TotalAmountByUserRow) {
  const candidate = row.SupporterID ;
  return candidate === null || candidate === undefined ? "" : String(candidate);
}

function getTotalFromTotalsRow(row: TotalAmountByUserRow) {
  const candidate =
    row.sum;

  return asNumber(candidate);
}

export default async function FetchReport(startDate: string, endDate: string) {
  const normalizedStartDate = normalizeDate(startDate);
  const normalizedEndDate = normalizeDate(endDate);

  if (normalizedStartDate > normalizedEndDate) {
    throw new Error("start date must be less than or equal to end date");
  }

  const supportersResult = await supabase
    .from("Supporter")
    .select(
      "id, Business_Org, F_Name, M_Name, L_Name, Address, City, State, Zip, Occupation, Employer",
    );

  if (supportersResult.error) {
    throw supportersResult.error;
  }

  const supporterRows = (Array.isArray(supportersResult.data)
    ? supportersResult.data
    : []) as SupporterRow[];
  const supportersById = new Map(
    supporterRows.map((row) => [String(row.id), row]),
  );

  const [monetaryTotalsResult, totalAmountByUserResult] = await Promise.all([
    supabase.from("MonetaryDonation").select("amount"),
    supabase.from("totalamountbyuser").select("*"),
  ]);

  if (monetaryTotalsResult.error) {
    throw monetaryTotalsResult.error;
  }

  if (totalAmountByUserResult.error) {
    throw totalAmountByUserResult.error;
  }

  const monetaryDonationTotal = ((Array.isArray(monetaryTotalsResult.data)
    ? monetaryTotalsResult.data
    : []) as Array<{ amount?: number | string | null }>).reduce(
    (sum, row) => sum + asNumber(row.amount),
    0,
  );

  const totalAmountByUserRows = (Array.isArray(totalAmountByUserResult.data)
    ? totalAmountByUserResult.data
    : []) as TotalAmountByUserRow[];
  const totalByUser = new Map<string, number>();

  totalAmountByUserRows.forEach((row) => {
    const supporterId = getSupporterIdFromTotalsRow(row);
    if (!supporterId) {
      return;
    }

    const total = getTotalFromTotalsRow(row);
    totalByUser.set(supporterId, total);
  });

  const results = await Promise.all(
    REPORT_ENTRY_SOURCES.map(async (source) => {
      const [entriesResult, detailsResult] = await Promise.all([
        supabase
          .from("Entry")
          .select("id, created_at, DetailsID, SupporterID")
          .like("DetailsID", `${source.detailsPrefix}%`),
        supabase.from(source.table).select("*"),
      ]);

      if (entriesResult.error) {
        throw entriesResult.error;
      }

      if (detailsResult.error) {
        throw detailsResult.error;
      }

      const entryRows = ((Array.isArray(entriesResult.data)
        ? entriesResult.data
        : []) as Array<{
        id: string | number;
        created_at?: string | null;
        DetailsID: string | number | null;
        SupporterID: string | number | null;
      }>).filter(
        (row) => row.DetailsID !== null,
      );

      const entriesByDetailsId = new Map(
        entryRows.map((row) => {
          const supporter = row.SupporterID
            ? supportersById.get(String(row.SupporterID)) ?? null
            : null;

          return [
            String(row.DetailsID),
            {
              ...row,
              user: supporter,
            },
          ] as const;
        }),
      );

      const rawRows = Array.isArray(detailsResult.data)
        ? (detailsResult.data as unknown[])
        : [];
      const rows = rawRows.filter(
        (row): row is ReportFetchRow => typeof row === "object" && row !== null,
      );
      const dateField = source.dateField;
      const filteredRows = !dateField
        ? rows
        : rows.filter((row) => {
            const fieldValue = row[dateField];

            return isDateInRange(
              typeof fieldValue === "string" ? fieldValue : null,
              normalizedStartDate,
              normalizedEndDate,
            );
          });

      const reportRows = filteredRows
        .filter((row) => row.id !== null && row.id !== undefined)
        .map((row) => {
          const entry = entriesByDetailsId.get(String(row.id)) ?? null;

          if (source.key === "monetaryDonations") {
            const supporterId =
              entry?.SupporterID === null || entry?.SupporterID === undefined
                ? ""
                : String(entry.SupporterID);
                console.log("supporterId", supporterId);
            const userTotal = supporterId ? totalByUser.get(supporterId) ?? 0 : 0;
            console.log("userTotal", userTotal);
            const originalPrefersAnonymous = row.prefers_anonymous === true;
            const shouldForceNotAnonymous =
              monetaryDonationTotal > 2000 || userTotal > 100;
              console.log("monetaryDonationTotal", monetaryDonationTotal);
              console.log(shouldForceNotAnonymous);
            return {
              ...row,
              prefers_anonymous: shouldForceNotAnonymous
                ? false
                : originalPrefersAnonymous,
              entry,
            };
          }
    

          return {
            ...row,
            entry,
          };
        });

      return [source.key, reportRows] as const;
    }),
  );

  return Object.fromEntries([
    ["startDate", normalizedStartDate],
    ["endDate", normalizedEndDate],
    ...results,
  ]);
}
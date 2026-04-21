import supabase from "@/app/utils/supabase";

type LogEntrySource = {
	key: string;
	table: string;
	detailsPrefix: string;
};

type SupporterRow = {
	id: string | number;
	F_Name?: string | null;
	L_Name?: string | null;
};

type EntryRow = {
	id: string | number;
	created_at?: string | null;
	DetailsID: string | number | null;
	SupporterID: string | number | null;
};

type LogFetchRow = {
	[key: string]: unknown;
	id?: string | number | null;
};

const LOG_ENTRY_SOURCES: LogEntrySource[] = [
	{
		key: "monetaryDonations",
		table: "MonetaryDonation",
		detailsPrefix: "001-",
	},
	{
		key: "inKindDonations",
		table: "InKindDonation",
		detailsPrefix: "002-",
	},
	{
		key: "expenditures",
		table: "Expenditures",
		detailsPrefix: "004-",
	},
	{
		key: "loans",
		table: "Loans",
		detailsPrefix: "003-",
	},
	{
		key: "obligations",
		table: "Obligations",
		detailsPrefix: "005-",
	},
];

export default async function fetchAllLogs() {
	const supportersResult = await supabase.from("Supporter").select("id, F_Name, L_Name");

	if (supportersResult.error) {
		throw supportersResult.error;
	}

	const supporterRows = (Array.isArray(supportersResult.data)
		? supportersResult.data
		: []) as SupporterRow[];
	const supportersById = new Map(
		supporterRows.map((row) => [String(row.id), row]),
	);

	const results = await Promise.all(
		LOG_ENTRY_SOURCES.map(async (source) => {
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
				: []) as EntryRow[]).filter((row) => row.DetailsID !== null);

			const entriesByDetailsId = new Map(
				entryRows.map((row) => {
					const supporter = row.SupporterID
						? supportersById.get(String(row.SupporterID)) ?? null
						: null;

					return [
						String(row.DetailsID),
						{
							...row,
							user: supporter
								? {
									F_Name: supporter.F_Name ?? null,
									L_Name: supporter.L_Name ?? null,
								}
								: null,
						},
					] as const;
				}),
			);

			const rawRows = Array.isArray(detailsResult.data)
				? (detailsResult.data as unknown[])
				: [];
			const rows = rawRows.filter(
				(row): row is LogFetchRow => typeof row === "object" && row !== null,
			);

			const reportRows = rows
				.filter((row) => row.id !== null && row.id !== undefined)
				.map((row) => {
					const entry = entriesByDetailsId.get(String(row.id)) ?? null;

					return {
						...row,
						entry,
					};
				});

			return [source.key, reportRows] as const;
		}),
	);

	return Object.fromEntries(results);
}

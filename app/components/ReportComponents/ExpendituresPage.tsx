import React from "react";

export interface ExpenditureUserInfo {
	businessOrg?: string | null;
	firstName?: string | null;
	middleName?: string | null;
	lastName?: string | null;
	address?: string | null;
	city?: string | null;
	state?: string | null;
	zip?: string | null;
}

export interface ExpenditureRecord {
	id?: string | number;
	user?: ExpenditureUserInfo | null;
	amount?: number | string | null;
	date?: string | null;
	purpose?: string | null;
}

interface ExpendituresPageProps {
	candidateOrCommitteeName?: string;
	reportStartDate?: string;
	reportEndDate?: string;
	priorPageTotal?: number;
	expenditures: ExpenditureRecord[];
	pageNumber?: number;
	totalPages?: number;
	isLastPage?: boolean;
}

interface ExpendituresPagesProps {
	candidateOrCommitteeName?: string;
	reportStartDate?: string;
	reportEndDate?: string;
	expenditures: ExpenditureRecord[];
	initialPriorPageTotal?: number;
}

const ITEMS_PER_PAGE = 5;

const styles = {
	sheet: {
		width: "816px",
		minHeight: "1056px",
		margin: "0 auto",
		background: "#ffffff",
		color: "#111111",
		fontFamily: "Arial, Helvetica, sans-serif",
		fontSize: "12.4px",
		lineHeight: 1.12,
		boxSizing: "border-box" as const,
		padding: "30px 44px 16px 44px",
		display: "flex",
		flexDirection: "column" as const,
	},
	bodyWrap: {
		flex: 1,
	},
	title: {
		textAlign: "center" as const,
		fontSize: "19.5px",
		fontWeight: 800,
		letterSpacing: "0px",
		margin: "0 0 4px 0",
		textTransform: "uppercase" as const,
		fontFamily: "Arial, Helvetica, sans-serif",
	},
	sectionRule: {
		borderBottom: "4px solid #111111",
		margin: "1px 0 5px 0",
	},
	row: {
		display: "flex",
		alignItems: "baseline",
		gap: "4px",
		marginBottom: "5px",
		whiteSpace: "nowrap" as const,
		fontSize: "12.4px",
	},
	label: {
		fontSize: "14px",
		marginTop: "4px",
	},
	line: {
		borderBottom: "1px solid #161616",
		minHeight: "13px",
		padding: "0 2px",
		background: "#e6e9f3",
		overflow: "hidden",
		textOverflow: "ellipsis",
	},
	entryBlock: {
		borderBottom: "1px solid #111111",
		padding: "4px 0 4px 0",
		marginBottom: "5px",
	},
	footerWrap: {
		marginTop: "8px",
	},
	footerText: {
		fontSize: "11.9px",
		margin: 0,
		maxWidth: "94%",
		lineHeight: 1.14,
	},
	footerBar: {
		paddingTop: "62px",
		display: "flex",
		justifyContent: "space-between",
		fontSize: "11.6px",
		marginTop: "auto",
		alignItems: "flex-end",
	},
};

function asText(value: unknown) {
	if (value === null || value === undefined) return "";
	return String(value).trim();
}

function formatDate(value: string | null | undefined) {
	if (!value) return "";
	const parts = value.split(/[-/]/g).filter(Boolean);
	if (parts.length >= 3) {
		const [y, m, d] = parts;
		if (y.length === 4) {
			return `${m.padStart(2, "0")}/${d.padStart(2, "0")}/${y}`;
		}
	}

	const compact = value.replace(/\D/g, "");
	if (compact.length === 8) {
		return `${compact.slice(4, 6)}/${compact.slice(6, 8)}/${compact.slice(0, 4)}`;
	}

	return value;
}

function formatMoney(value: number | string | null | undefined) {
	if (value === null || value === undefined || value === "") return "";
	const parsed = typeof value === "number" ? value : Number(value);
	if (Number.isNaN(parsed)) return String(value);
	return parsed.toFixed(2);
}

function fillToFive(items: ExpenditureRecord[]) {
	const padded = [...items];
	while (padded.length < ITEMS_PER_PAGE) {
		padded.push({});
	}
	return padded;
}

function LineField({
	value,
	width,
}: {
	value?: string | number | null;
	width: string;
}) {
	return (
		<span
			style={{
				...styles.line,
				width,
				display: "inline-block",
			}}
		>
			{asText(value)}
		</span>
	);
}

function ExpenditureBlock({ expenditure }: { expenditure: ExpenditureRecord }) {
	const user = expenditure.user || {};

	return (
		<div style={styles.entryBlock}>
			<div style={{ ...styles.row, justifyContent: "space-between", marginBottom: "2px" }}>
				<div style={styles.row}>
					<span style={styles.label}>Business or Organization Name:</span>
					<LineField value={user.businessOrg} width="369px" />
				</div>
				<div style={{ display: "flex", alignItems: "baseline", gap: "4px", minWidth: "26px" }}>
					<span style={{ fontWeight: 700 }}>OR</span>
				</div>
			</div>

			<div style={styles.row}>
				<span style={styles.label}>First Name:</span>
				<LineField value={user.firstName} width="143px" />
				<span style={styles.label}>Middle Name:</span>
				<LineField value={user.middleName} width="118px" />
				<span style={styles.label}>Last Name:</span>
				<LineField value={user.lastName} width="118px" />
			</div>

			<div style={styles.row}>
				<span style={styles.label}>Address:</span>
				<LineField value={user.address} width="206px" />
				<span style={styles.label}>City:</span>
				<LineField value={user.city} width="144px" />
				<span style={styles.label}>State:</span>
				<LineField value={user.state} width="25px" />
				<span style={styles.label}>Zip Code:</span>
				<LineField value={user.zip} width="92px" />
			</div>

			<div style={styles.row}>
				<span style={styles.label}>Purpose of Expenditure:</span>
				<LineField value={expenditure.purpose} width="478px" />
			</div>

			<div style={styles.row}>
				<span style={styles.label}>Amount of Expenditure: $</span>
				<LineField value={formatMoney(expenditure.amount)} width="113px" />
				<span style={styles.label}>Date of Expenditure: $</span>
				<LineField value={formatDate(expenditure.date)} width="128px" />
			</div>
		</div>
	);
}

export function paginateExpenditures(
	expenditures: ExpenditureRecord[],
	itemsPerPage = ITEMS_PER_PAGE,
) {
	const pages: ExpenditureRecord[][] = [];

	for (let index = 0; index < expenditures.length; index += itemsPerPage) {
		pages.push(expenditures.slice(index, index + itemsPerPage));
	}

	return pages.length > 0 ? pages : [[]];
}

export const ExpendituresPage: React.FC<ExpendituresPageProps> = ({
	candidateOrCommitteeName = "",
	reportStartDate = "",
	reportEndDate = "",
	priorPageTotal,
	expenditures,
	pageNumber = 1,
	totalPages = 1,
	isLastPage = false,
}) => {
	const pageItems = fillToFive(expenditures.slice(0, ITEMS_PER_PAGE));
	const pageTotal = expenditures.reduce((sum, item) => {
		const value = typeof item.amount === "number" ? item.amount : Number(item.amount);
		return Number.isNaN(value) ? sum : sum + value;
	}, 0);
	const cumulativeTotal = (priorPageTotal ?? 0) + pageTotal;
	const footerTotal = isLastPage ? formatMoney(cumulativeTotal) : "";
	const precedingDisplay = priorPageTotal ? formatMoney(priorPageTotal) : "";

	return (
		<div style={styles.sheet}>
			<div style={styles.bodyWrap}>
				<h1 style={styles.title}>ITEMIZED STATEMENT OF EXPENDITURES - CANDIDATE</h1>

				<div style={styles.sectionRule} />

				<div style={{ ...styles.row, marginBottom: "1px" }}>
					<span style={styles.label}>1. Candidate or Committee Name:</span>
					<LineField value="Darrin Stout for Sheriff" width="479px" />
				</div>

				<div style={{ ...styles.row, marginBottom: "1px" }}>
					<span style={styles.label}>2. Reporting Period:</span>
					<span style={styles.label}>Start Date:</span>
					<LineField value={formatDate(reportStartDate)} width="141px" />
					<span style={styles.label}>End Date:</span>
					<LineField value={formatDate(reportEndDate)} width="141px" />
				</div>

				<div style={{ ...styles.row, marginBottom: "3px" }}>
					<span style={styles.label}>
						3. Total campaign expenditures from preceding page (enter $0 if first page) $
					</span>
					<LineField value={precedingDisplay} width="189px" />
				</div>

				<div style={{ marginTop: "13px", marginBottom: "1px", fontWeight: 500, fontSize: "15px" }}>
					COMPLETE THE APPROPRIATE ITEMS FOR EACH EXPENDITURE.
					<span style={{ fontWeight: 700, fontSize: "12px", marginLeft: "6px" }}>
						All expenditures must be itemized.
					</span>
					<span style={{ fontWeight: 400, fontSize: "12px", marginLeft: "4px" }}>
						If the expenditure is an in-kind contribution to a candidate, please remember to include the purpose of the expenditure (e.g., postage, printing, etc.) along with the candidate's name in the purpose of the expenditure section.
					</span>
				</div>

				<div style={styles.sectionRule} />

				{pageItems.map((item, index) => (
					<ExpenditureBlock
						key={item.id ? String(item.id) : `blank-${index}`}
						expenditure={item}
					/>
				))}

				<div style={{ ...styles.footerWrap, paddingTop: "5px" }}>
					<div style={styles.row}>
						<span style={{ ...styles.label, fontWeight: 700, marginTop: "10px" }}>
							Total Expenditures: $
						</span>
						<LineField value={footerTotal} width="278px" />
					</div>
					<p style={styles.footerText}>
						(Carry forward to the next page if additional pages of this form are used. If this is the last page of expenditures, this amount must be shown in the summary on first page.)
					</p>
				</div>
			</div>

			<div style={styles.footerBar}>
				<span>SS-1129 (Rev. 1/2023)</span>
				<span>Page ___ of ___</span>
			</div>
		</div>
	);
};

export const ExpendituresPages: React.FC<ExpendituresPagesProps> = ({
	candidateOrCommitteeName = "",
	reportStartDate = "",
	reportEndDate = "",
	expenditures,
	initialPriorPageTotal = 0,
}) => {
	const pages = paginateExpenditures(expenditures, ITEMS_PER_PAGE);
	let carryForward = initialPriorPageTotal;

	return (
		<>
			{pages.map((pageItems, index) => {
				const page = (
					<ExpendituresPage
						key={`expenditures-page-${index + 1}`}
						candidateOrCommitteeName={candidateOrCommitteeName}
						reportStartDate={reportStartDate}
						reportEndDate={reportEndDate}
						priorPageTotal={carryForward}
						expenditures={pageItems}
						pageNumber={index + 1}
						totalPages={pages.length}
					/>
				);

				const pageSubtotal = pageItems.reduce((sum, item) => {
					const value = typeof item.amount === "number" ? item.amount : Number(item.amount);
					return Number.isNaN(value) ? sum : sum + value;
				}, 0);

				carryForward += pageSubtotal;
				return page;
			})}
		</>
	);
};

export default ExpendituresPage;

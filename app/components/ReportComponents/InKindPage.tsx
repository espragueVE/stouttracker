import React from "react";

type ElectionType = "Primary" | "General" | "Runoff";

export interface InKindUserInfo {
	businessOrg?: string | null;
	firstName?: string | null;
	middleName?: string | null;
	lastName?: string | null;
	address?: string | null;
	city?: string | null;
	state?: string | null;
	zip?: string | null;
	occupation?: string | null;
	employer?: string | null;
}

export interface InKindContributionRecord {
	id?: string | number;
	user?: InKindUserInfo | null;
	value?: number | string | null;
	date?: string | null;
	aggregateThisElection?: number | string | null;
	receivedFor?: string | null;
	election_cycle?: ElectionType | string | null;
	description?: string | null;
}

interface InKindPageProps {
	candidateOrCommitteeName?: string;
	reportStartDate?: string;
	reportEndDate?: string;
	priorPageTotal?: number;
	inKindDonations: InKindContributionRecord[];
	pageNumber?: number;
	totalPages?: number;
	isLastPage?: boolean;
}

interface InKindPagesProps {
	candidateOrCommitteeName?: string;
	reportStartDate?: string;
	reportEndDate?: string;
	inKindDonations: InKindContributionRecord[];
	initialPriorPageTotal?: number;
}

const ITEMS_PER_PAGE = 4;

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
	contributionBlock: {
		borderBottom: "1px solid #111111",
		padding: "4px 0 4px 0",
		marginBottom: "5px",
	},
	checkbox: {
		display: "inline-block",
		width: "11px",
		height: "11px",
		border: "1px solid #111111",
		marginRight: "4px",
		verticalAlign: "middle" as const,
		textAlign: "center" as const,
		lineHeight: "10px",
		fontSize: "9px",
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

function normalizeElectionCycle(contribution: InKindContributionRecord) {
	const values = [contribution.election_cycle, contribution.receivedFor]
		.map((value) => asText(value).toLowerCase())
		.filter(Boolean);

	const hasCycle = (keywords: string[], codes: string[]) =>
		values.some((value) => {
			const compact = value.replace(/[^a-z]/g, "");
			return keywords.some((keyword) => value.includes(keyword)) || codes.includes(compact);
		});

	return {
		primary: hasCycle(["primary"], ["p", "pri", "primary"]),
		general: hasCycle(["general"], ["g", "gen", "general"]),
		runoff: hasCycle(["runoff", "run-off"], ["r", "run", "runoff"]),
	};
}

function fillToFour(items: InKindContributionRecord[]) {
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

function Check({ checked }: { checked: boolean }) {
	return <span style={styles.checkbox}>{checked ? "X" : ""}</span>;
}

function CheckboxOption({
	checked,
	label,
}: {
	checked: boolean;
	label: string;
}) {
	return (
		<span
			style={{
				display: "inline-flex",
				alignItems: "center",
				lineHeight: 1,
			}}
		>
			<Check checked={checked} />
			<span>{label}</span>
		</span>
	);
}

function InKindBlock({
	contribution,
}: {
	contribution: InKindContributionRecord;
}) {
	const user = contribution.user || {};
	const election = normalizeElectionCycle(contribution);

	return (
		<div style={styles.contributionBlock}>
			<div style={{ ...styles.row, justifyContent: "space-between", marginBottom: "2px" }}>
				<div style={styles.row}>
					<span style={styles.label}>Business or Organization Name:</span>
					<LineField value={user.businessOrg} width="360px" />
				</div>
				<div style={{ display: "flex", alignItems: "baseline", gap: "4px", minWidth: "26px" }}>
					<span style={{ fontWeight: 700 }}>OR</span>
				</div>
			</div>

			<div style={styles.row}>
				<span style={styles.label}>First Name:</span>
				<LineField value={user.firstName} width="164px" />
				<span style={styles.label}>Middle Name:</span>
				<LineField value={user.middleName} width="119px" />
				<span style={styles.label}>Last Name:</span>
				<LineField value={user.lastName} width="142px" />
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
				<span style={styles.label}>Occupation:</span>
				<LineField value={user.occupation} width="212px" />
				<span style={styles.label}>Employer:</span>
				<LineField value={user.employer} width="312px" />
			</div>

			<div style={{ ...styles.row, gap: "9px", marginTop: "0px", marginBottom: "2px" }}>
				<span style={styles.label}>In-Kind Contribution Received For:</span>
				<CheckboxOption checked={election.primary} label="Primary Election" />
				<CheckboxOption checked={election.general} label="General Election" />
				<CheckboxOption
					checked={election.runoff}
					label="Runoff (Local Elections Only)"
				/>
			</div>

			<div style={styles.row}>
				<span style={styles.label}>In-Kind Contribution Value: $</span>
				<LineField value={formatMoney(contribution.value)} width="82px" />
				<span style={styles.label}>In-Kind Contribution Date:</span>
				<LineField value={formatDate(contribution.date)} width="106px" />
				<span style={styles.label}>Aggregate This Election: $</span>
				<LineField
					value={formatMoney(contribution.aggregateThisElection)}
					width="95px"
				/>
			</div>

			<div style={{ ...styles.row, marginBottom: "2px" }}>
				<span style={styles.label}>Description of In-Kind Contribution:</span>
				<LineField value={contribution.description} width="416px" />
			</div>
		</div>
	);
}

export function paginateInKindDonations(
	inKindDonations: InKindContributionRecord[],
	itemsPerPage = ITEMS_PER_PAGE,
) {
	const pages: InKindContributionRecord[][] = [];

	for (let index = 0; index < inKindDonations.length; index += itemsPerPage) {
		pages.push(inKindDonations.slice(index, index + itemsPerPage));
	}

	return pages.length > 0 ? pages : [[]];
}

export const InKindPage: React.FC<InKindPageProps> = ({
	candidateOrCommitteeName = "",
	reportStartDate = "",
	reportEndDate = "",
	priorPageTotal,
	inKindDonations,
	pageNumber = 1,
	totalPages = 1,
	isLastPage = false,
}) => {
	const pageItems = fillToFour(inKindDonations.slice(0, ITEMS_PER_PAGE));
	const pageTotal = inKindDonations.reduce((sum, item) => {
		const value = typeof item.value === "number" ? item.value : Number(item.value);
		return Number.isNaN(value) ? sum : sum + value;
	}, 0);
	const cumulativeTotal = (priorPageTotal ?? 0) + pageTotal;
	const footerTotal = isLastPage ? formatMoney(cumulativeTotal) : "";
	const precedingDisplay = priorPageTotal ? formatMoney(priorPageTotal) : "";

	return (
		<div style={styles.sheet}>
			<div style={styles.bodyWrap}>
				<h1 style={styles.title}>ITEMIZED STATEMENT OF IN-KIND CONTRIBUTIONS - CANDIDATE</h1>

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
						3. Total in-kind contributions from preceding page (enter $0 if first page) $
					</span>
					<LineField value={precedingDisplay} width="189px" />
				</div>

				<div style={{ marginTop: "13px", marginBottom: "1px", fontWeight: 500, fontSize: "15px" }}>
					COMPLETE THE APPROPRIATE ITEMS FOR EACH IN-KIND CONTRIBUTION.
					<span style={{ fontWeight: 400, fontSize: "12px", marginLeft: "6px" }}>
						In-kind contributions totaling more than one hundred dollars ($100) from any contributor during the period must be reported.
					</span>
				</div>

				<div style={styles.sectionRule} />

				{pageItems.map((item, index) => (
					<InKindBlock
						key={item.id ? String(item.id) : `blank-${index}`}
						contribution={item}
					/>
				))}

				<div style={{ ...styles.footerWrap, paddingTop: "5px" }}>
					<div style={styles.row}>
						<span style={{ ...styles.label, fontWeight: 700, marginTop: "10px" }}>
							Total In-Kind Contributions: $
						</span>
						<LineField value={footerTotal} width="278px" />
					</div>
					<p style={styles.footerText}>
						(Carry forward to the next page if additional pages of this form are used. If this is the last page of in-kind contributions, this amount must be shown in the summary on first page.)
					</p>
				</div>
			</div>

			<div style={styles.footerBar}>
				<span>SS-1128 (Rev. 1/2023)</span>
				<span>Page ___ of ___</span>
			</div>
		</div>
	);
};

export const InKindPages: React.FC<InKindPagesProps> = ({
	candidateOrCommitteeName = "",
	reportStartDate = "",
	reportEndDate = "",
	inKindDonations,
	initialPriorPageTotal = 0,
}) => {
	const pages = paginateInKindDonations(inKindDonations, ITEMS_PER_PAGE);
	let carryForward = initialPriorPageTotal;

	return (
		<>
			{pages.map((pageItems, index) => {
				const page = (
					<InKindPage
						key={`in-kind-page-${index + 1}`}
						candidateOrCommitteeName={candidateOrCommitteeName}
						reportStartDate={reportStartDate}
						reportEndDate={reportEndDate}
						priorPageTotal={carryForward}
						inKindDonations={pageItems}
						pageNumber={index + 1}
						totalPages={pages.length}
					/>
				);

				const pageSubtotal = pageItems.reduce((sum, item) => {
					const value = typeof item.value === "number" ? item.value : Number(item.value);
					return Number.isNaN(value) ? sum : sum + value;
				}, 0);

				carryForward += pageSubtotal;
				return page;
			})}
		</>
	);
};

export default InKindPage;

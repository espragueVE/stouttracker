import React from "react";

export interface ObligationUserInfo {
	businessOrg?: string | null;
	firstName?: string | null;
	middleName?: string | null;
	lastName?: string | null;
	address?: string | null;
	city?: string | null;
	state?: string | null;
	zip?: string | null;
}

export interface ObligationRecord {
	id?: string | number;
	user?: ObligationUserInfo | null;
	description?: string | null;
	outstandingBeginning?: number | string | null;
	debtIncurred?: number | string | null;
	paymentsThisPeriod?: number | string | null;
	outstandingEnd?: number | string | null;
}

interface ObligationTotals {
	beginning?: number | string | null;
	incurred?: number | string | null;
	payments?: number | string | null;
	end?: number | string | null;
}

interface ObligationsPageProps {
	candidateOrCommitteeName?: string;
	reportStartDate?: string;
	reportEndDate?: string;
	obligations: ObligationRecord[];
	pageNumber?: number;
	totalPages?: number;
	totals?: ObligationTotals;
	showTotals?: boolean;
}

interface ObligationsPagesProps {
	candidateOrCommitteeName?: string;
	reportStartDate?: string;
	reportEndDate?: string;
	obligations: ObligationRecord[];
}

const ITEMS_PER_PAGE = 3;

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
		marginTop: "8px",
	},
	line: {
		borderBottom: "1px solid #161616",
		minHeight: "13px",
		padding: "0 2px",
		background: "#e6e9f3",
		overflow: "hidden",
		textOverflow: "ellipsis",
	},
	blockWrap: {
		borderBottom: "1px solid #111111",
		padding: "4px 0 4px 0",
		marginBottom: "5px",
		display: "grid",
		gridTemplateColumns: "1fr 300px",
		gap: "10px",
	},
	leftStack: {
		minWidth: 0,
	},
	rightGrid: {
		border: "1px solid #111111",
		display: "grid",
		gridTemplateRows: "1fr 57px 24px",
	},
	totalGrid: {
		border: "1px solid #111111",
		display: "grid",
		gridTemplateRows: "59px 24px",
	},
	rightTop: {
		display: "grid",
		gridTemplateColumns: "88px 1fr",
		minHeight: "108px",
	},
	cellBorderLeft: {
		borderLeft: "1px solid #111111",
	},
	cellBorderTop: {
		borderTop: "1px solid #111111",
	},
	cellPad: {
		padding: "4px 5px",
		fontSize: "12px",
	},
	blueFill: {
		background: "#eef2fb",
	},
	metricsRow: {
		display: "grid",
		gridTemplateColumns: "repeat(4, 1fr)",
	},
	metricsValues: {
		display: "grid",
		gridTemplateColumns: "repeat(4, 1fr)",
	},
	metricCell: {
		padding: "2px 5px",
		fontSize: "12px",
		borderLeft: "1px solid #111111",
	},
	metricCellFirst: {
		padding: "2px 5px",
		fontSize: "12px",
	},
	footerText: {
		fontSize: "11.2px",
		margin: 0,
		lineHeight: 1.18,
	},
	footerBar: {
		paddingTop: "18px",
		display: "flex",
		justifyContent: "space-between",
		fontSize: "11.6px",
		marginTop: "auto",
		alignItems: "flex-end",
	},
	totalsRow: {
		display: "grid",
		gridTemplateColumns: "1fr 300px",
		gap: "10px",
		alignItems: "start",
	},
};

type NumericObligationTotals = {
	beginning: number;
	incurred: number;
	payments: number;
	end: number;
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

function LineField({ value, width }: { value?: string | number | null; width: string }) {
	return (
		<span style={{ ...styles.line, width, display: "inline-block" }}>
			{asText(value)}
		</span>
	);
}

function calculateTotals(obligations: ObligationRecord[]): ObligationTotals {
	return obligations.reduce<NumericObligationTotals>(
		(sum, item) => ({
			beginning: sum.beginning + (Number(item.outstandingBeginning) || 0),
			incurred: sum.incurred + (Number(item.debtIncurred) || 0),
			payments: sum.payments + (Number(item.paymentsThisPeriod) || 0),
			end: sum.end + (Number(item.outstandingEnd) || 0),
		}),
		{ beginning: 0, incurred: 0, payments: 0, end: 0 },
	);
}

function fillItems(items: ObligationRecord[]) {
	const padded = [...items];
	while (padded.length < ITEMS_PER_PAGE) {
		padded.push({});
	}
	return padded;
}

function ObligationGrid({
	obligation,
	totalsMode = false,
	totals,
}: {
	obligation?: ObligationRecord;
	totalsMode?: boolean;
	totals?: ObligationTotals;
}) {
	return (
		<div style={styles.rightGrid}>
			<div style={styles.rightTop}>
				<div style={styles.cellPad}>
					{totalsMode ? "" : "Description of Obligation:"}
				</div>
				<div style={{ ...styles.cellPad, ...styles.cellBorderLeft, ...styles.blueFill }}>
					{totalsMode ? "" : asText(obligation?.description)}
				</div>
			</div>
			<div style={{ ...styles.metricsRow, ...styles.cellBorderTop }}>
				<div style={styles.metricCellFirst}>Outstanding Balance (Period Beginning)</div>
				<div style={styles.metricCell}>Debt Incurred This Period</div>
				<div style={styles.metricCell}>Payments This Period</div>
				<div style={styles.metricCell}>Outstanding Balance (Period End)</div>
			</div>
			<div style={{ ...styles.metricsValues, ...styles.cellBorderTop }}>
				<div style={styles.metricCellFirst}>$ <span style={{ marginLeft: "8px" }}>{totalsMode ? formatMoney(totals?.beginning) : formatMoney(obligation?.outstandingBeginning)}</span></div>
				<div style={styles.metricCell}>$ <span style={{ marginLeft: "8px" }}>{totalsMode ? formatMoney(totals?.incurred) : formatMoney(obligation?.debtIncurred)}</span></div>
				<div style={styles.metricCell}>$ <span style={{ marginLeft: "8px" }}>{totalsMode ? formatMoney(totals?.payments) : formatMoney(obligation?.paymentsThisPeriod)}</span></div>
				<div style={styles.metricCell}>$ <span style={{ marginLeft: "8px" }}>{totalsMode ? formatMoney(totals?.end) : formatMoney(obligation?.outstandingEnd)}</span></div>
			</div>
		</div>
	);
}

function TotalGrid({
	obligation,
	totalsMode = false,
	totals,
}: {
	obligation?: ObligationRecord;
	totalsMode?: boolean;
	totals?: ObligationTotals;
}) {
	return (
		<div style={styles.totalGrid}>
			<div style={{ ...styles.metricsRow, ...styles.cellBorderTop }}>
				<div style={styles.metricCellFirst}>Outstanding Balance (Period Beginning)</div>
				<div style={styles.metricCell}>Debt Incurred This Period</div>
				<div style={styles.metricCell}>Payments This Period</div>
				<div style={styles.metricCell}>Outstanding Balance (Period End)</div>
			</div>
			<div style={{ ...styles.metricsValues, ...styles.cellBorderTop }}>
				<div style={styles.metricCellFirst}>$ <span style={{ marginLeft: "8px" }}>{totalsMode ? formatMoney(totals?.beginning) : formatMoney(obligation?.outstandingBeginning)}</span></div>
				<div style={styles.metricCell}>$ <span style={{ marginLeft: "8px" }}>{totalsMode ? formatMoney(totals?.incurred) : formatMoney(obligation?.debtIncurred)}</span></div>
				<div style={styles.metricCell}>$ <span style={{ marginLeft: "8px" }}>{totalsMode ? formatMoney(totals?.payments) : formatMoney(obligation?.paymentsThisPeriod)}</span></div>
				<div style={styles.metricCell}>$ <span style={{ marginLeft: "8px" }}>{totalsMode ? formatMoney(totals?.end) : formatMoney(obligation?.outstandingEnd)}</span></div>
			</div>
		</div>
	);
}

function ObligationBlock({ obligation }: { obligation: ObligationRecord }) {
	const user = obligation.user || {};

	return (
		<div style={styles.blockWrap}>
			<div style={styles.leftStack}>
				<div style={styles.row}>
					<span style={styles.label}>Business Name:</span>
					<LineField value={user.businessOrg} width="222px" />
				</div>
				<div style={styles.row}>
					<span style={styles.label}>First Name:</span>
					<LineField value={user.firstName} width="102px" />
					<span style={styles.label}>Middle Name:</span>
					<LineField value={user.middleName} width="98px" />
				</div>
				<div style={styles.row}>
					<span style={styles.label}>Last Name:</span>
					<LineField value={user.lastName} width="242px" />
				</div>
				<div style={styles.row}>
					<span style={styles.label}>Address:</span>
					<LineField value={user.address} width="268px" />
				</div>
				<div style={styles.row}>
					<span style={styles.label}>City:</span>
					<LineField value={user.city} width="268px" />
				</div>
				<div style={styles.row}>
					<span style={styles.label}>State:</span>
					<LineField value={user.state} width="42px" />
					<span style={styles.label}>Zip Code:</span>
					<LineField value={user.zip} width="168px" />
				</div>
			</div>
			<ObligationGrid obligation={obligation} />
		</div>
	);
}

export const ObligationsPage: React.FC<ObligationsPageProps> = ({
	candidateOrCommitteeName = "",
	reportStartDate = "",
	reportEndDate = "",
	obligations,
	pageNumber = 1,
	totalPages = 1,
	totals,
	showTotals = false,
}) => {
	const pageItems = fillItems(obligations.slice(0, ITEMS_PER_PAGE));

	return (
		<div style={styles.sheet}>
			<div style={styles.bodyWrap}>
				<h1 style={styles.title}>ITEMIZED STATEMENT OF OBLIGATIONS - CANDIDATE</h1>
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
				<div style={{ ...styles.row, marginBottom: "6px" }}>
					<span style={styles.label}>3. Complete the appropriate items for each obligation owed to a person/vendor at the end of the reporting period.</span>
				</div>

				<div style={styles.sectionRule} />

				{pageItems.map((item, index) => (
					<ObligationBlock key={item.id ? String(item.id) : `obligation-${index}`} obligation={item} />
				))}

				<div style={{ ...styles.sectionRule, marginTop: "2px" }} />
				<div style={styles.totalsRow}>
					<div>
						<div style={{ ...styles.label, marginTop: 0, marginBottom: "8px" }}>TOTALS</div>
						<p style={styles.footerText}>
							(Carry forward to the next page if additional pages of this form are used. If this is the last page of obligations, the Total from "Outstanding Balance - (Period End)" column must also be shown in the summary on first page.)
						</p>
					</div>
					<TotalGrid totalsMode={true} totals={showTotals ? totals : undefined} />
				</div>
			</div>

			<div style={styles.footerBar}>
				<span>SS-1127 (Rev. 1/2023)</span>
				<span>Page ___ of ___</span>
			</div>
		</div>
	);
};

export const ObligationsPages: React.FC<ObligationsPagesProps> = ({
	candidateOrCommitteeName = "",
	reportStartDate = "",
	reportEndDate = "",
	obligations,
}) => {
	const pages: ObligationRecord[][] = [];
	for (let index = 0; index < obligations.length; index += ITEMS_PER_PAGE) {
		pages.push(obligations.slice(index, index + ITEMS_PER_PAGE));
	}
	const items = pages.length > 0 ? pages : [[]];
	const totals = calculateTotals(obligations);

	return (
		<>
			{items.map((pageItems, index) => (
				<ObligationsPage
					key={`obligations-page-${index + 1}`}
					candidateOrCommitteeName={candidateOrCommitteeName}
					reportStartDate={reportStartDate}
					reportEndDate={reportEndDate}
					obligations={pageItems}
					pageNumber={index + 1}
					totalPages={items.length}
					totals={totals}
					showTotals={index === items.length - 1}
				/>
			))}
		</>
	);
};

export default ObligationsPage;
import React from "react";

type ElectionType = "Primary" | "General" | "Runoff";

export interface LoanUserInfo {
	businessOrg?: string | null;
	firstName?: string | null;
	middleName?: string | null;
	lastName?: string | null;
	address?: string | null;
	city?: string | null;
	state?: string | null;
	zip?: string | null;
}

export interface LoanGuarantorRecord {
	name?: string | null;
	address?: string | null;
	city?: string | null;
	state?: string | null;
	zip?: string | null;
	amountGuaranteedOutstanding?: number | string | null;
}

export interface LoanRecord {
	id?: string | number;
	user?: LoanUserInfo | null;
	outstandingBeginning?: number | string | null;
	loansReceived?: number | string | null;
	loanPayments?: number | string | null;
	outstandingEnd?: number | string | null;
	receivedFor?: string | null;
	election_cycle?: ElectionType | string | null;
	date?: string | null;
	guarantors?: LoanGuarantorRecord[];
}

interface LoanTotals {
	beginning?: number | string | null;
	received?: number | string | null;
	payments?: number | string | null;
	end?: number | string | null;
}

type NumericLoanTotals = {
	beginning: number;
	received: number;
	payments: number;
	end: number;
};

interface LoansPageProps {
	candidateOrCommitteeName?: string;
	reportStartDate?: string;
	reportEndDate?: string;
	loan: LoanRecord;
	pageNumber?: number;
	totalPages?: number;
	totals?: LoanTotals;
	showTotals?: boolean;
}

interface LoansPagesProps {
	candidateOrCommitteeName?: string;
	reportStartDate?: string;
	reportEndDate?: string;
	loans: LoanRecord[];
}

const GUARANTORS_PER_PAGE = 4;

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
	thinRule: {
		borderBottom: "1px solid #111111",
		margin: "0 0 4px 0",
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
	smallLabel: {
		fontSize: "12px",
	},
	line: {
		borderBottom: "1px solid #161616",
		minHeight: "13px",
		padding: "0 2px",
		background: "#e6e9f3",
		overflow: "hidden",
		textOverflow: "ellipsis",
	},
	dotsLabel: {
		fontSize: "14px",
		marginTop: "4px",
		flex: "0 0 auto",
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
	guarantorBlock: {
		borderBottom: "1px solid #111111",
		padding: "4px 0 4px 0",
		marginBottom: "5px",
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

function normalizeElectionCycle(loan: LoanRecord) {
	const values = [loan.election_cycle, loan.receivedFor]
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

function LineField({ value, width }: { value?: string | number | null; width: string }) {
	return (
		<span style={{ ...styles.line, width, display: "inline-block" }}>
			{asText(value)}
		</span>
	);
}

function Check({ checked }: { checked: boolean }) {
	return <span style={styles.checkbox}>{checked ? "X" : ""}</span>;
}

function CheckboxOption({ checked, label }: { checked: boolean; label: string }) {
	return (
		<span style={{ display: "inline-flex", alignItems: "center", lineHeight: 1 }}>
			<Check checked={checked} />
			<span>{label}</span>
		</span>
	);
}

function padGuarantors(guarantors: LoanGuarantorRecord[] | undefined) {
	const items = Array.isArray(guarantors) ? [...guarantors] : [];
	while (items.length < GUARANTORS_PER_PAGE) {
		items.push({});
	}
	return items.slice(0, GUARANTORS_PER_PAGE);
}

function LoanSourceBlock({ loan }: { loan: LoanRecord }) {
	const user = loan.user || {};
	const election = normalizeElectionCycle(loan);

	return (
		<>
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
				<LineField value={user.firstName} width="138px" />
				<span style={styles.label}>Middle Name:</span>
				<LineField value={user.middleName} width="118px" />
				<span style={styles.label}>Last Name:</span>
				<LineField value={user.lastName} width="100px" />
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
				<span style={styles.dotsLabel}>Outstanding Loan Balance (Beginning)...................................... $</span>
				<LineField value={formatMoney(loan.outstandingBeginning)} width="105px" />
			</div>
			<div style={styles.row}>
				<span style={styles.dotsLabel}>Loans Received ...................................................................... $</span>
				<LineField value={formatMoney(loan.loansReceived)} width="105px" />
			</div>
			<div style={styles.row}>
				<span style={styles.dotsLabel}>Loan Payments ....................................................................... $</span>
				<LineField value={formatMoney(loan.loanPayments)} width="105px" />
			</div>
			<div style={styles.row}>
				<span style={styles.dotsLabel}>Outstanding Loan (End)......................................................... $</span>
				<LineField value={formatMoney(loan.outstandingEnd)} width="105px" />
			</div>

			<div style={{ ...styles.row, gap: "18px", marginBottom: "2px" }}>
				<span style={styles.label}>Loan Received For:</span>
				<CheckboxOption checked={election.primary} label="Primary Election" />
				<CheckboxOption checked={election.general} label="General Election" />
				<CheckboxOption checked={election.runoff} label="Runoff (Local Elections Only)" />
			</div>

			<div style={styles.row}>
				<span style={styles.label}>Date of Loan:</span>
				<LineField value={formatDate(loan.date)} width="178px" />
			</div>
		</>
	);
}

function GuarantorBlock({ guarantor }: { guarantor: LoanGuarantorRecord }) {
	return (
		<div style={styles.guarantorBlock}>
			<div style={{ ...styles.row, justifyContent: "space-between", marginBottom: "2px" }}>
				<div style={styles.row}>
					<span style={styles.label}>Business or Organization Name:</span>
					<LineField value={guarantor.name} width="369px" />
				</div>
				<div style={{ display: "flex", alignItems: "baseline", gap: "4px", minWidth: "26px" }}>
					<span style={{ fontWeight: 700 }}>OR</span>
				</div>
			</div>
			<div style={styles.row}>
				<span style={styles.label}>First Name:</span>
				<LineField value="" width="138px" />
				<span style={styles.label}>Middle Name:</span>
				<LineField value="" width="118px" />
				<span style={styles.label}>Last Name:</span>
				<LineField value="" width="100px" />
			</div>
			<div style={styles.row}>
				<span style={styles.label}>Address:</span>
				<LineField value={guarantor.address} width="206px" />
				<span style={styles.label}>City:</span>
				<LineField value={guarantor.city} width="144px" />
				<span style={styles.label}>State:</span>
				<LineField value={guarantor.state} width="25px" />
				<span style={styles.label}>Zip Code:</span>
				<LineField value={guarantor.zip} width="92px" />
			</div>
			<div style={styles.row}>
				<span style={styles.label}>Amount Guaranteed Outstanding: $</span>
				<LineField value={formatMoney(guarantor.amountGuaranteedOutstanding)} width="218px" />
			</div>
		</div>
	);
}

function calculateLoanTotals(loans: LoanRecord[]): LoanTotals {
	return loans.reduce<NumericLoanTotals>(
		(sum, loan) => ({
			beginning: sum.beginning + (Number(loan.outstandingBeginning) || 0),
			received: sum.received + (Number(loan.loansReceived) || 0),
			payments: sum.payments + (Number(loan.loanPayments) || 0),
			end: sum.end + (Number(loan.outstandingEnd) || 0),
		}),
		{ beginning: 0, received: 0, payments: 0, end: 0 },
	);
}

export const LoansPage: React.FC<LoansPageProps> = ({
	candidateOrCommitteeName = "",
	reportStartDate = "",
	reportEndDate = "",
	loan,
	pageNumber = 1,
	totalPages = 1,
	totals,
	showTotals = false,
}) => {
	const guarantors = padGuarantors(loan.guarantors);

	return (
		<div style={styles.sheet}>
			<div style={styles.bodyWrap}>
				<h1 style={styles.title}>ITEMIZED STATEMENT OF LOANS - CANDIDATE</h1>
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
					<span style={styles.label}>3. Complete the appropriate items for each loan totaling more than one hundred dollars ($100).</span>
				</div>

				<div style={{ ...styles.row, marginBottom: "4px", fontWeight: 700 }}>
					<span style={styles.smallLabel}>Complete the following for the source of each loan received and/or outstanding during the period.</span>
				</div>

				<LoanSourceBlock loan={loan} />

				<div style={{ ...styles.sectionRule, marginTop: "6px" }} />
				<div style={{ ...styles.row, marginBottom: "4px", fontWeight: 700 }}>
					<span style={styles.smallLabel}>List all endorsers or guarantors for above loan (If more space is needed, please attach additional pages.)</span>
				</div>

				{guarantors.map((guarantor, index) => (
					<GuarantorBlock key={`${asText(loan.id)}-guarantor-${index}`} guarantor={guarantor} />
				))}

				<div style={{ ...styles.thinRule, marginTop: "2px" }} />
				<p style={{ ...styles.footerText, fontWeight: 700 }}>
					Totals for all loans <span style={{ fontWeight: 400 }}>(Complete this page for each outstanding loan during the period. Complete this section only on last page of loans. Total loans received and loan payments should be shown on summary page. Outstanding loan balance should be shown on front page.)</span>
				</p>
				<div style={{ ...styles.row, marginTop: "8px" }}>
					<span style={styles.dotsLabel}>Balance (Beginning) .............................................................. $</span>
					<LineField value={showTotals ? formatMoney(totals?.beginning) : ""} width="105px" />
				</div>
				<div style={styles.row}>
					<span style={styles.dotsLabel}>Loans Received ...................................................................... $</span>
					<LineField value={showTotals ? formatMoney(totals?.received) : ""} width="105px" />
				</div>
				<div style={styles.row}>
					<span style={styles.dotsLabel}>Loan Payments ....................................................................... $</span>
					<LineField value={showTotals ? formatMoney(totals?.payments) : ""} width="105px" />
				</div>
				<div style={styles.row}>
					<span style={styles.dotsLabel}>Outstanding Loan (End)......................................................... $</span>
					<LineField value={showTotals ? formatMoney(totals?.end) : ""} width="105px" />
				</div>
			</div>

			<div style={styles.footerBar}>
				<span>SS-1132 (Rev. 1/2023)</span>
				<span>Page ___ of ___</span>
			</div>
		</div>
	);
};

export const LoansPages: React.FC<LoansPagesProps> = ({
	candidateOrCommitteeName = "",
	reportStartDate = "",
	reportEndDate = "",
	loans,
}) => {
	const items = loans.length > 0 ? loans : [{}];
	const totals = calculateLoanTotals(loans);

	return (
		<>
			{items.map((loan, index) => (
				<LoansPage
					key={`loan-page-${index + 1}`}
					candidateOrCommitteeName={candidateOrCommitteeName}
					reportStartDate={reportStartDate}
					reportEndDate={reportEndDate}
					loan={loan}
					pageNumber={index + 1}
					totalPages={items.length}
					totals={totals}
					showTotals={index === items.length - 1}
				/>
			))}
		</>
	);
};

export default LoansPage;
"use client";

import React, { useMemo } from "react";
import { Printer, X } from "lucide-react";
import {
	ContributionsPage,
	MonetaryContributionRecord,
} from "./ContributionsPage";
import { InKindContributionRecord, InKindPage } from "./InKindPage";
import { ExpenditureRecord, ExpendituresPage } from "./ExpendituresPage";
import { LoanRecord, LoansPage } from "./LoansPage";
import { ObligationRecord, ObligationsPage } from "./ObligationsPage";
import { SummaryPage } from "./SummaryPage";

type SupporterPayload = {
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

type MonetaryDonationPayload = {
	id?: string | number;
	amount?: number;
	date?: string | null;
	aggregate?: number | string | null;
	election_cycle?: string | null;
	received_for?: string | null;
	prefers_anonymous?: boolean | null;
	entry?: {
		user?: SupporterPayload | null;
	} | null;
};

type InKindDonationPayload = {
	id?: string | number;
	value?: number | string | null;
	date?: string | null;
	aggregate?: number | string | null;
	election_cycle?: string | null;
	received_for?: string | null;
	description?: string | null;
	entry?: {
		user?: SupporterPayload | null;
	} | null;
};

type ExpenditurePayload = {
	id?: string | number;
	amount?: number | string | null;
	date?: string | null;
	purpose?: string | null;
	entry?: {
		user?: SupporterPayload | null;
	} | null;
};

type LoanPayload = {
	id?: string | number;
	date?: string | null;
	outstanding_start?: number | string | null;
	recieved?: number | string | null;
	received?: number | string | null;
	payment?: number | string | null;
	payments?: number | string | null;
	outstanding_end?: number | string | null;
	election_cycle?: string | null;
	received_for?: string | null;
	recieved_for?: string | null;
	endorser_id1?: string | null;
	endorser_id2?: string | null;
	endorser_id3?: string | null;
	amount_outstanding1?: number | string | null;
	amount_outstanding2?: number | string | null;
	amount_outstanding3?: number | string | null;
	entry?: {
		user?: SupporterPayload | null;
	} | null;
};

type ObligationPayload = {
	id?: string | number;
	description?: string | null;
	outstanding_start?: number | string | null;
	debt_incurred?: number | string | null;
	payments?: number | string | null;
	outstanding_end?: number | string | null;
	entry?: {
		user?: SupporterPayload | null;
	} | null;
};

type ReportPayload = {
	startDate?: string;
	endDate?: string;
	monetaryDonations?: MonetaryDonationPayload[];
	inKindDonations?: InKindDonationPayload[];
	expenditures?: ExpenditurePayload[];
	loans?: LoanPayload[];
	obligations?: ObligationPayload[];
};

type SummaryTotals = {
	receiptsUnitemized: number;
	receiptsItemized: number;
	receiptsLoansReceived: number;
	receiptsInterestReceived: number;
	disbursementsExpenditures: number;
	disbursementsLoanPayments: number;
	disbursementsObligationPayments: number;
	inKindUnitemized: number;
	inKindItemized: number;
	obligationsOutstanding: number;
};

interface ReportPDFProps {
	isOpen: boolean;
	onClose: () => void;
	reportData: ReportPayload | null;
	candidateOrCommitteeName?: string;
}

function mapMonetaryDonationsToContributions(
	items: MonetaryDonationPayload[] | undefined,
): MonetaryContributionRecord[] {
	const rows = Array.isArray(items) ? items : [];

	return rows.map((row) => ({
		id: row.id,
		user:
			row.prefers_anonymous === true 
				? {
					businessOrg: "",
					firstName: "Anonymous",
					middleName: "",
					lastName: "",
					address: "",
					city: "",
					state: "",
					zip: "",
					occupation: "",
					employer: "",
				}
				: {
					businessOrg: row.entry?.user?.Business_Org || "",
					firstName: row.entry?.user?.F_Name || "",
					middleName: row.entry?.user?.M_Name || "",
					lastName: row.entry?.user?.L_Name || "",
					address: row.entry?.user?.Address || "",
					city: row.entry?.user?.City || "",
					state: row.entry?.user?.State || "",
					zip: row.entry?.user?.Zip || "",
					occupation: row.entry?.user?.Occupation || "",
					employer: row.entry?.user?.Employer || "",
				},
		amount: row.amount,
		date: row.date || "",
		aggregateThisElection: row.aggregate,
		election_cycle: row.election_cycle,
		receivedFor: row.received_for,
	}));
}
function mapInKindDonationsToContributions(
	items: InKindDonationPayload[] | undefined,
): InKindContributionRecord[] {
	const rows = Array.isArray(items) ? items : [];

	return rows.map((row) => ({
		id: row.id,
		user: {
			businessOrg: row.entry?.user?.Business_Org || "",
			firstName: row.entry?.user?.F_Name || "",
			middleName: row.entry?.user?.M_Name || "",
			lastName: row.entry?.user?.L_Name || "",
			address: row.entry?.user?.Address || "",
			city: row.entry?.user?.City || "",
			state: row.entry?.user?.State || "",
			zip: row.entry?.user?.Zip || "",
			occupation: row.entry?.user?.Occupation || "",
			employer: row.entry?.user?.Employer || "",
		},
		value: row.value,
		date: row.date || "",
		aggregateThisElection: row.aggregate,
		election_cycle: row.election_cycle,
		receivedFor: row.received_for,
		description: row.description || "",
	}));
}

function mapExpenditures(items: ExpenditurePayload[] | undefined): ExpenditureRecord[] {
	const rows = Array.isArray(items) ? items : [];

	return rows.map((row) => ({
		id: row.id,
		user: {
			businessOrg: row.entry?.user?.Business_Org || "",
			firstName: row.entry?.user?.F_Name || "",
			middleName: row.entry?.user?.M_Name || "",
			lastName: row.entry?.user?.L_Name || "",
			address: row.entry?.user?.Address || "",
			city: row.entry?.user?.City || "",
			state: row.entry?.user?.State || "",
			zip: row.entry?.user?.Zip || "",
		},
		amount: row.amount,
		date: row.date || "",
		purpose: row.purpose || "",
	}));
}

function mapLoans(items: LoanPayload[] | undefined): LoanRecord[] {
	const rows = Array.isArray(items) ? items : [];

	return rows.map((row) => ({
		id: row.id,
		user: {
			businessOrg: row.entry?.user?.Business_Org || "",
			firstName: row.entry?.user?.F_Name || "",
			middleName: row.entry?.user?.M_Name || "",
			lastName: row.entry?.user?.L_Name || "",
			address: row.entry?.user?.Address || "",
			city: row.entry?.user?.City || "",
			state: row.entry?.user?.State || "",
			zip: row.entry?.user?.Zip || "",
		},
		outstandingBeginning: row.outstanding_start,
		loansReceived: row.recieved ?? row.received,
		loanPayments: row.payment ?? row.payments,
		outstandingEnd: row.outstanding_end,
		election_cycle: row.election_cycle,
		receivedFor: row.received_for ?? row.recieved_for ?? "",
		date: row.date || "",
		guarantors: [
			{
				name: row.endorser_id1 || "",
				amountGuaranteedOutstanding: row.amount_outstanding1,
			},
			{
				name: row.endorser_id2 || "",
				amountGuaranteedOutstanding: row.amount_outstanding2,
			},
			{
				name: row.endorser_id3 || "",
				amountGuaranteedOutstanding: row.amount_outstanding3,
			},
		],
	}));
}

function mapObligations(items: ObligationPayload[] | undefined): ObligationRecord[] {
	const rows = Array.isArray(items) ? items : [];

	return rows.map((row) => ({
		id: row.id,
		user: {
			businessOrg: row.entry?.user?.Business_Org || "",
			firstName: row.entry?.user?.F_Name || "",
			middleName: row.entry?.user?.M_Name || "",
			lastName: row.entry?.user?.L_Name || "",
			address: row.entry?.user?.Address || "",
			city: row.entry?.user?.City || "",
			state: row.entry?.user?.State || "",
			zip: row.entry?.user?.Zip || "",
		},
		description: row.description || "",
		outstandingBeginning: row.outstanding_start,
		debtIncurred: row.debt_incurred,
		paymentsThisPeriod: row.payments,
		outstandingEnd: row.outstanding_end,
	}));
}

function toNumeric(value: number | string | null | undefined) {
	const parsed = typeof value === "number" ? value : Number(value);
	return Number.isNaN(parsed) ? 0 : parsed;
}

function sumBy<T>(items: T[], selector: (item: T) => number | string | null | undefined) {
	return items.reduce((sum, item) => sum + toNumeric(selector(item)), 0);
}

export const ReportPDF: React.FC<ReportPDFProps> = ({
	isOpen,
	onClose,
	reportData,
	candidateOrCommitteeName = "",
}) => {
	const contributions = useMemo(
		() => mapMonetaryDonationsToContributions(reportData?.monetaryDonations),
		[reportData],
	);
	const inKindContributions = useMemo(
		() => mapInKindDonationsToContributions(reportData?.inKindDonations),
		[reportData],
	);
	const expenditures = useMemo(
		() => mapExpenditures(reportData?.expenditures),
		[reportData],
	);
	const loans = useMemo(() => mapLoans(reportData?.loans), [reportData]);
	const obligations = useMemo(() => mapObligations(reportData?.obligations), [reportData]);

	const summaryTotals = useMemo<SummaryTotals>(() => {
		const receiptsUnitemized = contributions.reduce((sum, item) => {
			const amount = toNumeric(item.amount);
			return amount > 0 && amount <= 100 ? sum + amount : sum;
		}, 0);

		const receiptsItemized = contributions.reduce((sum, item) => {
			const amount = toNumeric(item.amount);
			return amount > 100 ? sum + amount : sum;
		}, 0);

		const inKindUnitemized = inKindContributions.reduce((sum, item) => {
			const amount = toNumeric(item.value);
			return amount > 0 && amount <= 100 ? sum + amount : sum;
		}, 0);

		const inKindItemized = inKindContributions.reduce((sum, item) => {
			const amount = toNumeric(item.value);
			return amount > 100 ? sum + amount : sum;
		}, 0);

		return {
			receiptsUnitemized,
			receiptsItemized,
			receiptsLoansReceived: sumBy(loans, (item) => item.loansReceived),
			receiptsInterestReceived: 0,
			disbursementsExpenditures: sumBy(expenditures, (item) => item.amount),
			disbursementsLoanPayments: sumBy(loans, (item) => item.loanPayments),
			disbursementsObligationPayments: sumBy(obligations, (item) => item.paymentsThisPeriod),
			inKindUnitemized,
			inKindItemized,
			obligationsOutstanding: sumBy(obligations, (item) => item.outstandingEnd),
		};
	}, [contributions, inKindContributions, expenditures, loans, obligations]);

	const handlePrint = () => {
		const container = document.getElementById("report-pages-content");
		if (!container) return;

		const iframe = document.createElement("iframe");
		iframe.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;border:none;";
		document.body.appendChild(iframe);

		const doc = iframe.contentDocument;
		if (!doc) return;

		doc.open();
		doc.write(`<!DOCTYPE html><html><head><style>
			body { margin: 0; padding: 0; }
			@page { size: Letter portrait; margin: 0; }
			.report-page-wrap {
				page-break-after: always;
				break-after: page;
				page-break-inside: avoid;
				break-inside: avoid-page;
				margin: 0;
				padding: 0;
			}
			.report-page-wrap:last-child {
				page-break-after: auto;
				break-after: auto;
			}
			.report-inner-pages {
				display: block;
				margin: 0;
				padding: 0;
			}
			.report-inner-pages > * {
				margin: 0 !important;
			}
		</style></head><body>${container.innerHTML}</body></html>`);
		doc.close();

		iframe.contentWindow?.focus();
		iframe.contentWindow?.print();
		setTimeout(() => document.body.removeChild(iframe), 1500);
	};

	if (!isOpen || !reportData) {
		return null;
	}

	return (
		<div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm">
			<div className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur">
				<div className="mx-auto flex w-full max-w-6xl items-center justify-between">
					<h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
						Report Preview
					</h2>

					<div className="flex items-center gap-2">
						<button
							type="button"
							onClick={handlePrint}
							className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white hover:bg-slate-800"
						>
							<Printer className="h-4 w-4" />
							Print
						</button>
						<button
							type="button"
							onClick={onClose}
							className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
						>
							<X className="h-4 w-4" />
							Close
						</button>
					</div>
				</div>
			</div>

			<div className="mx-auto max-h-[calc(100vh-64px)] overflow-auto px-4 py-6">
				<div id="report-pages-content" className="mx-auto flex w-full max-w-[900px] flex-col gap-4">
					<div className="report-page-wrap">
						<SummaryPage
							candidateOrCommitteeName={candidateOrCommitteeName}
							reportStartDate={reportData.startDate || ""}
							reportEndDate={reportData.endDate || ""}
							totals={summaryTotals}
						/>
					</div>
					<div className="space-y-4 report-inner-pages">
							{contributions.length > 0 &&
								(() => {
									const chunkSize = 4;
									const pages: MonetaryContributionRecord[][] = [];

									for (let i = 0; i < contributions.length; i += chunkSize) {
										pages.push(contributions.slice(i, i + chunkSize));
									}

									if (pages.length === 0) {
										pages.push([]);
									}

									let priorPageTotal = 0;

									return pages.map((pageItems, pageIndex) => {
										const page = (
											<div
												key={`monetary-report-page-${pageIndex + 1}`}
												className="report-page-wrap"
											>
												<ContributionsPage
													candidateOrCommitteeName={candidateOrCommitteeName}
													reportStartDate={reportData.startDate || ""}
													reportEndDate={reportData.endDate || ""}
													priorPageTotal={priorPageTotal}
													contributions={pageItems}
													pageNumber={pageIndex + 1}
													totalPages={pages.length}												isLastPage={pageIndex === pages.length - 1}												/>
											</div>
										);

										const pageSubtotal = pageItems.reduce((sum, row) => {
											const parsed =
												typeof row.amount === "number"
													? row.amount
													: Number(row.amount);
											return Number.isNaN(parsed) ? sum : sum + parsed;
										}, 0);

										priorPageTotal += pageSubtotal;
										return page;
									});
								})()}

							{inKindContributions.length > 0 &&
								(() => {
									const chunkSize = 4;
									const pages: InKindContributionRecord[][] = [];

									for (let i = 0; i < inKindContributions.length; i += chunkSize) {
										pages.push(inKindContributions.slice(i, i + chunkSize));
									}

									if (pages.length === 0) {
										pages.push([]);
									}

									let priorPageTotal = 0;

									return pages.map((pageItems, pageIndex) => {
										const page = (
											<div
												key={`inkind-report-page-${pageIndex + 1}`}
												className="report-page-wrap"
											>
												<InKindPage
													candidateOrCommitteeName={candidateOrCommitteeName}
													reportStartDate={reportData.startDate || ""}
													reportEndDate={reportData.endDate || ""}
													priorPageTotal={priorPageTotal}
													inKindDonations={pageItems}
													pageNumber={pageIndex + 1}
													totalPages={pages.length}												isLastPage={pageIndex === pages.length - 1}												/>
											</div>
										);

										const pageSubtotal = pageItems.reduce((sum, row) => {
											const parsed =
												typeof row.value === "number"
													? row.value
													: Number(row.value);
											return Number.isNaN(parsed) ? sum : sum + parsed;
										}, 0);

										priorPageTotal += pageSubtotal;
										return page;
									});
								})()}

							{expenditures.length > 0 &&
								(() => {
									const chunkSize = 5;
									const pages: ExpenditureRecord[][] = [];

									for (let i = 0; i < expenditures.length; i += chunkSize) {
										pages.push(expenditures.slice(i, i + chunkSize));
									}

									if (pages.length === 0) {
										pages.push([]);
									}

									let priorPageTotal = 0;

									return pages.map((pageItems, pageIndex) => {
										const page = (
											<div
												key={`expenditures-report-page-${pageIndex + 1}`}
												className="report-page-wrap"
											>
												<ExpendituresPage
													candidateOrCommitteeName={candidateOrCommitteeName}
													reportStartDate={reportData.startDate || ""}
													reportEndDate={reportData.endDate || ""}
													priorPageTotal={priorPageTotal}
													expenditures={pageItems}
													pageNumber={pageIndex + 1}
													totalPages={pages.length}												isLastPage={pageIndex === pages.length - 1}												/>
											</div>
										);

										const pageSubtotal = pageItems.reduce((sum, row) => {
											const parsed =
												typeof row.amount === "number"
													? row.amount
													: Number(row.amount);
											return Number.isNaN(parsed) ? sum : sum + parsed;
										}, 0);

										priorPageTotal += pageSubtotal;
										return page;
									});
								})()}

							{loans.length > 0 &&
								loans.map((loan, pageIndex) => (
									<div
										key={`loans-report-page-${pageIndex + 1}`}
										className="report-page-wrap"
									>
										<LoansPage
											candidateOrCommitteeName={candidateOrCommitteeName}
											reportStartDate={reportData.startDate || ""}
											reportEndDate={reportData.endDate || ""}
											loan={loan}
											pageNumber={pageIndex + 1}
											totalPages={loans.length}
											totals={loans.reduce(
												(sum, item) => ({
													beginning: (sum.beginning ?? 0) + (Number(item.outstandingBeginning) || 0),
													received: (sum.received ?? 0) + (Number(item.loansReceived) || 0),
													payments: (sum.payments ?? 0) + (Number(item.loanPayments) || 0),
													end: (sum.end ?? 0) + (Number(item.outstandingEnd) || 0),
												}),
												{ beginning: 0, received: 0, payments: 0, end: 0 },
											)}
											showTotals={pageIndex === loans.length - 1}
										/>
									</div>
								))}

							{obligations.length > 0 &&
								(() => {
								const chunkSize = 3;
								const pages: ObligationRecord[][] = [];

									for (let i = 0; i < obligations.length; i += chunkSize) {
										pages.push(obligations.slice(i, i + chunkSize));
									}

									if (pages.length === 0) {
										pages.push([]);
									}

									const totals = obligations.reduce(
										(sum, item) => ({
											beginning: (sum.beginning ?? 0) + (Number(item.outstandingBeginning) || 0),
											incurred: (sum.incurred ?? 0) + (Number(item.debtIncurred) || 0),
											payments: (sum.payments ?? 0) + (Number(item.paymentsThisPeriod) || 0),
											end: (sum.end ?? 0) + (Number(item.outstandingEnd) || 0),
										}),
										{ beginning: 0, incurred: 0, payments: 0, end: 0 },
									);

									return pages.map((pageItems, pageIndex) => (
										<div
											key={`obligations-report-page-${pageIndex + 1}`}
											className="report-page-wrap"
										>
											<ObligationsPage
												candidateOrCommitteeName={candidateOrCommitteeName}
												reportStartDate={reportData.startDate || ""}
												reportEndDate={reportData.endDate || ""}
												obligations={pageItems}
												pageNumber={pageIndex + 1}
												totalPages={pages.length}
												totals={totals}
												showTotals={pageIndex === pages.length - 1}
											/>
										</div>
									));
								})()}
						</div>
				</div>
			</div>
		</div>
	);
};

export default ReportPDF;

"use client";

import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
	Search,
	FileText,
	Loader2,
	AlertCircle,
	Pencil,
	Trash2,
	Save,
	X,
} from "lucide-react";

type EntryRecord = {
	id?: string | number;
	created_at?: string | null;
	DetailsID?: string | number | null;
	SupporterID?: string | number | null;
    user?: {
        F_Name?: string | null;
        L_Name?: string | null;
    } | null;
};

type LogRecord = {
	[key: string]: unknown;
	id?: string | number | null;
	date?: string | null;
	description?: string | null;
	purpose?: string | null;
	recieved_for?: string | null;
	entry?: EntryRecord | null;
};

type LogsResponse = Record<string, LogRecord[]>;

type FlattenedLog = {
	source: string;
	sourceLabel: string;
	rowId: string;
	detailId: string;
	supporterId: string;
	dateLabel: string;
	summary: string;
	amountLabel: string;
	amountValue: number | null;
	user?: {
        F_Name?: string | null;
        L_Name?: string | null;
    } | null;
};

const SOURCE_LABELS: Record<string, string> = {
	monetaryDonations: "Monetary Donation",
	inKindDonations: "In-Kind Donation",
	expenditures: "Expenditure",
	loans: "Loan",
	obligations: "Obligation",
};

function formatDate(value: string | null | undefined) {
	if (!value) {
		return "N/A";
	}

	const parsed = new Date(value);

	if (Number.isNaN(parsed.getTime())) {
		return value;
	}

	return parsed.toLocaleString();
}

function formatAmount(record: LogRecord) {
	const amountKeys = [
		"amount",
		"entry_amount",
		"aggregate",
		"received",
		"value",
		"outstanding_start",
		"debt_incurred",
		"payments",
		"outstanding_end",
		"amount_outstanding1",
		"amount_outstanding2",
		"amount_outstanding3",
	] as const;

	for (const key of amountKeys) {
		const candidate = record[key];

		if (candidate === null || candidate === undefined || candidate === "") {
			continue;
		}

		const numericValue = Number(candidate);

		if (!Number.isNaN(numericValue)) {
			return `$${numericValue.toLocaleString()}`;
		}
	}

	return "--";
}

function getAmountValue(record: LogRecord, source: string) {
	const amountFieldBySource: Record<string, string[]> = {
		monetaryDonations: ["amount"],
		inKindDonations: ["value"],
		loans: ["recieved", "received"],
		expenditures: ["amount"],
		obligations: ["debt_incurred"],
	};

	const candidateFields = amountFieldBySource[source] ?? [];

	for (const field of candidateFields) {
		const candidate = record[field];

		if (candidate === null || candidate === undefined || candidate === "") {
			continue;
		}

		const numericValue = Number(candidate);

		if (!Number.isNaN(numericValue)) {
			return numericValue;
		}
	}

	return null;
}

function getSummary(record: LogRecord) {
	const summaryFields = [record.description, record.purpose, record.recieved_for];

	for (const field of summaryFields) {
		if (typeof field === "string" && field.trim().length > 0) {
			return field;
		}
	}

	return "No description provided";
}

function formatUserName(
	user:
		| {
				F_Name?: string | null;
				L_Name?: string | null;
			}
		| null
		| undefined,
) {
	if (!user) {
		return "N/A";
	}

	const fullName = `${user.F_Name ?? ""} ${user.L_Name ?? ""}`.trim();

	return fullName || "N/A";
}

function flattenLogs(payload: LogsResponse) {
	return Object.entries(payload).flatMap(([source, records]) => {
		const sourceLabel = SOURCE_LABELS[source] ?? source;

		return records.map((record, index) => {
			const amountValue = getAmountValue(record, source);

			return {
				source,
				sourceLabel,
				rowId: `${source}-${String(record.id ?? index)}`,
				detailId: String(record.entry?.DetailsID ?? record.id ?? "--"),
				supporterId: String(record.entry?.SupporterID ?? "--"),
				user: record.entry?.user ?? null,
				dateLabel: formatDate(
					typeof record.date === "string" ? record.date : record.entry?.created_at,
				),
				summary: getSummary(record),
				amountLabel:
					amountValue === null
						? formatAmount(record)
						: `$${amountValue.toLocaleString()}`,
				amountValue,
			};
		});
	});
}

type AllLogsTableProps = {
	onEntriesChanged?: () => void | Promise<void>;
};

export const AllLogsTable: React.FC<AllLogsTableProps> = ({
	onEntriesChanged,
}) => {
	const [logs, setLogs] = useState<FlattenedLog[]>([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [isLoading, setIsLoading] = useState(true);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [editingRowId, setEditingRowId] = useState<string | null>(null);
	const [editAmount, setEditAmount] = useState("");
	const [busyRowId, setBusyRowId] = useState<string | null>(null);

	const loadLogs = async (showLoading = true) => {
		try {
			if (showLoading) {
				setIsLoading(true);
			}
			setErrorMessage(null);

			const response = await fetch("/api/GetAllLogs");
			const data = (await response.json()) as LogsResponse | { error?: string };

			if (!response.ok) {
				throw new Error(
					"error" in data && typeof data.error === "string"
						? data.error
						: "Failed to load logs",
				);
			}

			setLogs(flattenLogs(data as LogsResponse));
		} catch (error) {
			setErrorMessage(
				error instanceof Error ? error.message : "Failed to load logs",
			);
		} finally {
			if (showLoading) {
				setIsLoading(false);
			}
		}
	};

	useEffect(() => {
		let isMounted = true;

		const initializeLogs = async () => {
			await loadLogs(false);

			if (isMounted) {
				setIsLoading(false);
			}
		};

		initializeLogs();

		return () => {
			isMounted = false;
		};
	}, []);

	const handleStartEdit = (log: FlattenedLog) => {
		setEditingRowId(log.rowId);
		setEditAmount(log.amountValue === null ? "" : String(log.amountValue));
		setErrorMessage(null);
	};

	const handleCancelEdit = () => {
		setEditingRowId(null);
		setEditAmount("");
	};

	const handleSaveEdit = async (log: FlattenedLog) => {
		const nextAmount = Number(editAmount);

		if (!Number.isFinite(nextAmount)) {
			setErrorMessage("Amount must be a valid number.");
			return;
		}

		try {
			setBusyRowId(log.rowId);
			setErrorMessage(null);

			const response = await fetch("/api/ManageEntry", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ detailId: log.detailId, amount: nextAmount }),
			});
			const data = (await response.json()) as { error?: string };

			if (!response.ok) {
				throw new Error(data.error || "Failed to update entry");
			}

			await loadLogs(false);
			await onEntriesChanged?.();
			handleCancelEdit();
		} catch (error) {
			setErrorMessage(
				error instanceof Error ? error.message : "Failed to update entry",
			);
		} finally {
			setBusyRowId(null);
		}
	};

	const handleDelete = async (log: FlattenedLog) => {
		const confirmation = await Swal.fire({
			title: "Delete this entry?",
			text: "This action cannot be undone.",
			icon: "warning",
			showCancelButton: true,
			confirmButtonText: "Yes, delete it",
			cancelButtonText: "Cancel",
			confirmButtonColor: "#b91c1c",
			cancelButtonColor: "#475569",
		});

		if (!confirmation.isConfirmed) {
			return;
		}

		try {
			setBusyRowId(log.rowId);
			setErrorMessage(null);

			const response = await fetch(
				`/api/ManageEntry?detailId=${encodeURIComponent(log.detailId)}`,
				{ method: "DELETE" },
			);
			const data = (await response.json()) as { error?: string };

			if (!response.ok) {
				throw new Error(data.error || "Failed to delete entry");
			}

			await loadLogs(false);
			await onEntriesChanged?.();

			if (editingRowId === log.rowId) {
				handleCancelEdit();
			}

			await Swal.fire({
				title: "Deleted",
				text: "The entry was removed successfully.",
				icon: "success",
				confirmButtonColor: "#15803d",
			});
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Failed to delete entry";

			setErrorMessage(
				message,
			);
			await Swal.fire({
				title: "Delete failed",
				text: message,
				icon: "error",
				confirmButtonColor: "#b91c1c",
			});
		} finally {
			setBusyRowId(null);
		}
	};

	const filteredLogs = logs.filter((log) => {
		const normalizedSearch = searchTerm.trim().toLowerCase();

		if (!normalizedSearch) {
			return true;
		}

		return [
			log.sourceLabel,
			log.summary,
			log.detailId,
			log.supporterId,
			formatUserName(log.user),
			log.dateLabel,
		].some((value) => value.toLowerCase().includes(normalizedSearch));
	});

	return (
		<div className="bg-white shadow-sm rounded-xl border border-slate-200 overflow-hidden">
			<div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col lg:flex-row justify-between items-center gap-4">
				<div>
					<h3 className="text-lg font-semibold text-slate-800">All Campaign Logs</h3>
					<p className="text-sm text-slate-500">
						{logs.length} total records across all finance forms
					</p>
				</div>

				<div className="relative w-full lg:w-80">
					<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
						<Search className="h-4 w-4 text-slate-400" />
					</div>
					<input
						type="text"
						value={searchTerm}
						onChange={(event) => setSearchTerm(event.target.value)}
						placeholder="Search type, summary, detail ID..."
						className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg leading-5 bg-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sheriff-500 focus:border-sheriff-500 sm:text-sm shadow-sm"
					/>
				</div>
			</div>

			{isLoading ? (
				<div className="flex items-center justify-center gap-3 px-6 py-16 text-slate-500">
					<Loader2 className="h-5 w-5 animate-spin" />
					<span>Loading logs...</span>
				</div>
			) : errorMessage ? (
				<div className="flex items-center justify-center gap-3 px-6 py-16 text-red-600 bg-red-50">
					<AlertCircle className="h-5 w-5" />
					<span>{errorMessage}</span>
				</div>
			) : (
				<div className="overflow-x-auto">
					<table className="min-w-full divide-y divide-slate-200">
						<thead className="bg-slate-50">
							<tr>
								<th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
									Type
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
									Summary
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
									Date
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
									Amount
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
									Detail ID
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
									Donor Name
								</th>
								<th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
									Actions
								</th>
							</tr>
						</thead>
						<tbody className="bg-white divide-y divide-slate-200">
							{filteredLogs.length === 0 ? (
								<tr>
									<td colSpan={7} className="px-6 py-12 text-center text-slate-500">
										No logs match your search.
									</td>
								</tr>
							) : (
								filteredLogs.map((log) => (
									<tr key={log.rowId} className="hover:bg-slate-50 transition-colors align-top">
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
												<FileText className="h-3.5 w-3.5" />
												{log.sourceLabel}
											</div>
										</td>
										<td className="px-6 py-4 min-w-[280px]">
											<p className="text-sm font-medium text-slate-900">{log.summary}</p>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
											{log.dateLabel.slice(0,9)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-emerald-600">
											{editingRowId === log.rowId ? (
												<input
													type="number"
													step="0.01"
													value={editAmount}
													onChange={(event) => setEditAmount(event.target.value)}
													className="w-32 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-sheriff-500 focus:border-sheriff-500"
													disabled={busyRowId === log.rowId}
												/>
											) : (
												log.amountLabel
											)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
											{log.detailId}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
											{formatUserName(log.user)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
											<div className="flex items-center justify-end gap-2">
												{editingRowId === log.rowId ? (
													<>
														<button
															onClick={() => handleSaveEdit(log)}
															className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-3 py-2 text-emerald-700 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
															disabled={busyRowId === log.rowId}
														>
															<Save className="h-4 w-4" />
															Save
														</button>
														<button
															onClick={handleCancelEdit}
															className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-2 text-slate-700 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
															disabled={busyRowId === log.rowId}
														>
															<X className="h-4 w-4" />
															Cancel
														</button>
													</>
												) : (
													<>
														<button
															onClick={() => handleStartEdit(log)}
															className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-2 text-slate-700 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
															disabled={busyRowId === log.rowId}
														>
															<Pencil className="h-4 w-4" />
															Edit
														</button>
														<button
															onClick={() => handleDelete(log)}
															className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-3 py-2 text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
															disabled={busyRowId === log.rowId}
														>
															{busyRowId === log.rowId ? (
																<Loader2 className="h-4 w-4 animate-spin" />
															) : (
																<Trash2 className="h-4 w-4" />
															)}
															Delete
														</button>
													</>
												)}
											</div>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
};

import { NextResponse } from "next/server";
import FetchReport from "@/app/lib/fetchReport";

type ReportRequestPayload = {
	startDate?: string;
	endDate?: string;
};

export async function POST(request: Request) {
	try {
		const payload = (await request.json()) as ReportRequestPayload;
		const { startDate, endDate } = payload;

		if (!startDate || !endDate) {
			return NextResponse.json(
				{ error: "Missing required payload fields: startDate and endDate" },
				{ status: 400 },
			);
		}

		const report = await FetchReport(startDate, endDate);
		return NextResponse.json(report, { status: 200 });
	} catch (error) {
		const message =
			error instanceof Error ? error.message : "Failed to fetch report";

		if (
			message.includes("Dates must be") ||
			message.includes("start date must be")
		) {
			return NextResponse.json({ error: message }, { status: 400 });
		}

		console.error("GetReport POST error:", error);
		return NextResponse.json(
			{ error: "Failed to fetch report" },
			{ status: 500 },
		);
	}
}

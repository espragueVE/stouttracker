import { NextResponse } from "next/server";
import supabase from "@/app/utils/supabase";

type EntryConfig = {
  table: string;
  amountField: string;
};

type UpdateEntryPayload = {
  detailId?: string;
  amount?: number;
};

const ENTRY_CONFIG_BY_PREFIX: Record<string, EntryConfig> = {
  "001-": { table: "MonetaryDonation", amountField: "amount" },
  "002-": { table: "InKindDonation", amountField: "value" },
  "003-": { table: "Loans", amountField: "recieved" },
  "004-": { table: "Expenditures", amountField: "amount" },
  "005-": { table: "Obligations", amountField: "debt_incurred" },
};

function getEntryConfig(detailId: string) {
  const matchingPrefix = Object.keys(ENTRY_CONFIG_BY_PREFIX).find((prefix) =>
    detailId.startsWith(prefix),
  );

  if (!matchingPrefix) {
    throw new Error(`Unsupported detail id: ${detailId}`);
  }

  return ENTRY_CONFIG_BY_PREFIX[matchingPrefix];
}

export async function PATCH(request: Request) {
  try {
    const payload = (await request.json()) as UpdateEntryPayload;
    const detailId = payload.detailId?.trim();
    const amount = Number(payload.amount);

    if (!detailId) {
      return NextResponse.json({ error: "detailId is required" }, { status: 400 });
    }

    if (!Number.isFinite(amount)) {
      return NextResponse.json({ error: "amount must be a valid number" }, { status: 400 });
    }

    const { table, amountField } = getEntryConfig(detailId);
    const updateResult = await supabase
      .from(table)
      .update({ [amountField]: amount })
      .eq("id", detailId)
      .select("id")
      .single();

    if (updateResult.error) {
      throw updateResult.error;
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update entry";

    if (message.includes("Unsupported detail id")) {
      return NextResponse.json({ error: message }, { status: 400 });
    }

    console.error("ManageEntry PATCH error:", error);
    return NextResponse.json({ error: "Failed to update entry" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const detailId = searchParams.get("detailId")?.trim();

    if (!detailId) {
      return NextResponse.json({ error: "detailId is required" }, { status: 400 });
    }

    const { table } = getEntryConfig(detailId);
    const detailDeleteResult = await supabase
      .from(table)
      .delete()
      .eq("id", detailId);

    if (detailDeleteResult.error) {
      throw detailDeleteResult.error;
    }

    const entryDeleteResult = await supabase
      .from("Entry")
      .delete()
      .eq("DetailsID", detailId);

    if (entryDeleteResult.error) {
      throw entryDeleteResult.error;
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete entry";

    if (message.includes("Unsupported detail id")) {
      return NextResponse.json({ error: message }, { status: 400 });
    }

    console.error("ManageEntry DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete entry" }, { status: 500 });
  }
}
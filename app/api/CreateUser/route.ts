import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import supabase from "@/app/utils/supabase";

type CreateUserPayload = {
	email?: string;
	password?: string;
};

function hashPassword(password: string) {
	return createHash("sha256").update(password).digest("hex");
}

export async function POST(request: Request) {
	try {
		const payload = (await request.json()) as CreateUserPayload;
		const email = payload.email?.trim().toLowerCase();
		const password = payload.password ?? "";

		if (!email || !password) {
			return NextResponse.json(
				{ error: "Email and password are required" },
				{ status: 400 },
			);
		}

		const existingUserResult = await supabase
			.from("User")
			.select("id")
			.eq("email", email)
			.maybeSingle();

		if (existingUserResult.error) {
			throw existingUserResult.error;
		}

		if (existingUserResult.data) {
			return NextResponse.json(
				{ error: "A user with that email already exists" },
				{ status: 409 },
			);
		}

		const createUserResult = await supabase
			.from("User")
			.insert({
				email,
				password: hashPassword(password),
			})
			.select("id, email")
			.single();

		if (createUserResult.error) {
			throw createUserResult.error;
		}

		return NextResponse.json(
			{
				success: true,
				user: createUserResult.data,
			},
			{ status: 201 },
		);
	} catch (error) {
		console.error("CreateUser POST error:", error);
		return NextResponse.json(
			{ error: "Failed to create user" },
			{ status: 500 },
		);
	}
}

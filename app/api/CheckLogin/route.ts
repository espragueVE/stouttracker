import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import postLogin from "@/app/lib/postLogin";

type CheckLoginPayload = {
  email?: string;
  password?: string;
};

function hashPassword(password: string) {
  return createHash("sha256").update(password).digest("hex");
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as CheckLoginPayload;
    const email = payload.email?.trim().toLowerCase();
    const password = hashPassword(payload.password ?? "");


    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    const loginResult = await postLogin(email, password);

    if (!loginResult) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }


    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("CheckLogin POST error:", error);
    return NextResponse.json(
      { error: "Failed to process login" },
      { status: 500 },
    );
  }
}
import supabase from "@/app/utils/supabase";

type LoginUserRecord = {
	id?: string | number | null;
	email?: string | null;
	password?: string | null;
};

type LoginResult = {
	id: string;
	email: string;
};

export default async function postLogin(email: string, password: string) {
	const normalizedEmail = email.trim().toLowerCase();

	const result = await supabase
		.from("User")
		.select("id, email, password")
		.eq("email", normalizedEmail)
		.eq("password", password)
		.maybeSingle();

	if (result.error) {
		throw result.error;
	}

	if (!result.data) {
		return null;
	}

	const row = result.data as LoginUserRecord;

	return {
		id: String(row.id ?? ""),
		email: row.email ?? normalizedEmail,
	} satisfies LoginResult;
}

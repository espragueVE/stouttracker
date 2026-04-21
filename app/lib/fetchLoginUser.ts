import supabase from "@/app/utils/supabase";

type LoginUserRecord = {
  id?: string | number | null;
  email?: string | null;
  password?: string | null;
  password_hash?: string | null;
};

type LoginUser = {
  id: string;
  email: string;
  passwordHash: string | null;
  password: string | null;
};

export default async function fetchLoginUser(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();

  const passwordHashResult = await supabase
    .from("User")
    .select("id, email, password, password_hash")
    .eq("email", normalizedEmail)
    .eq("password_hash", password)
    .maybeSingle();

  if (passwordHashResult.error) {
    throw passwordHashResult.error;
  }

  if (passwordHashResult.data) {
    const row = passwordHashResult.data as LoginUserRecord;

    return {
      id: String(row.id ?? ""),
      email: row.email ?? normalizedEmail,
      passwordHash: row.password_hash ?? null,
      password: row.password ?? null,
    } satisfies LoginUser;
  }

  const passwordResult = await supabase
    .from("User")
    .select("id, email, password, password_hash")
    .eq("email", normalizedEmail)
    .eq("password", password)
    .maybeSingle();

  if (passwordResult.error) {
    throw passwordResult.error;
  }

  if (!passwordResult.data) {
    return null;
  }

  const row = passwordResult.data as LoginUserRecord;

  return {
    id: String(row.id ?? ""),
    email: row.email ?? normalizedEmail,
    passwordHash: row.password_hash ?? null,
    password: row.password ?? null,
  } satisfies LoginUser;
}
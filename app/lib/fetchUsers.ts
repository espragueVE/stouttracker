import supabase from "@/app/utils/supabase";

export default async function fetchUsersInfo() {
  type UsersRow = {
    id: string;
    created_at: string | null;
    Business_Org: string | null;
    F_Name: string;
    M_Name: string | null;
    L_Name: string;
    Address: string;
    City: string;
    State: string | null;
    Zip: string;
    Occupation: string | null;
    Employer: string | null;
    Age: number | null;
  };

  const { data, error } = await supabase.from('User').select().order('L_Name', { ascending: true });

  if (error) {
    throw error;
  }

  return (data as UsersRow[] | null) ?? [];
}

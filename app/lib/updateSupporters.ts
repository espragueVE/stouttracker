import supabase from "@/app/utils/supabase";

type UpdateSupporterInput = {
  id: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  businessOrg?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  occupation?: string;
  employer?: string;
  age?: number;
};

export default async function updateSupporters(supporter: UpdateSupporterInput) {
  const updates: Record<string, unknown> = {};

  if (supporter.firstName !== undefined) updates.F_Name = supporter.firstName;
  if (supporter.middleName !== undefined) updates.M_Name = supporter.middleName || null;
  if (supporter.lastName !== undefined) updates.L_Name = supporter.lastName;
  if (supporter.businessOrg !== undefined) updates.Business_Org = supporter.businessOrg || null;
  if (supporter.address !== undefined) updates.Address = supporter.address;
  if (supporter.city !== undefined) updates.City = supporter.city;
  if (supporter.state !== undefined) updates.State = supporter.state || null;
  if (supporter.zip !== undefined) updates.Zip = supporter.zip;
  if (supporter.occupation !== undefined) updates.Occupation = supporter.occupation || null;
  if (supporter.employer !== undefined) updates.Employer = supporter.employer || null;
  if (supporter.age !== undefined) updates.Age = supporter.age ?? null;

  // Some UI-only fields (volunteer/sign toggles) do not map to current DB columns.
  if (Object.keys(updates).length === 0) {
    return { id: supporter.id };
  }

  const result = await supabase
    .from("Supporter")
    .update(updates)
    .eq("id", supporter.id)
    .select("id")
    .single();

  if (result.error) {
    throw result.error;
  }

  return result.data;
}
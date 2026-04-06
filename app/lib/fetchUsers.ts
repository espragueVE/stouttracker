import sql from "./db";

export default async function fetchUsersInfo() {
  type UsersRow = {
    id: string;
    created_at: Date;
    Business_Org: string;
    F_Name: string;
    M_Name: string;
    L_Name: string;
    Address: string;
    City: string;
    State: string;
    Zip: string;
    Occupation: string;
    Employer: string;
    Age: number;
  };

  const result = await sql<UsersRow[]>`
        select * from public.Users        
        `;
  return result;
}

import { DatabasePool } from "./Databasepool";

export default async function fetchDashInfo() {
    const pool = await DatabasePool.getInstance();
    const result = await pool.request().query(`
        Select Sum(Amount) from LogEntryDetails
         where FormId = 'f1'
        
        Select distinct DonorId from Entry

        Select Avg(Amount) from LogEntry
         where FormId = 'f1'
        
        Select Top 5 Sum(Amount), Distinct(EntryDate) from LogEntryDetails
        Group by EntryDate

        select Count(Age) from Users
        Where Age <30

        
        select Count(Age) from Users
        Where Age >30 and Age <50

        select Count(Age) from Users
        Where Age >50 and Age < 65

        select Count(Age) from Users
        Where Age > 65


        `);

}
import { DatabasePool } from "./DataBasepool";

export default async function fetchUsersInfo() {
    const pool = await DatabasePool.getInstance();
    const result = await pool.request().query(`
        select * from Users        
        `);

}
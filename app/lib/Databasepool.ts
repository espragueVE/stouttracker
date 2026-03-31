import sql from 'mssql';
import { dbConfig } from './dbconfig';


export class DatabasePool {
  private static instance: sql.ConnectionPool;

  private constructor() {
    // private to ensure Singleton
  }

  public static async getInstance(): Promise<sql.ConnectionPool> {
    if (!DatabasePool.instance) {
      DatabasePool.instance = await new sql.ConnectionPool(dbConfig).connect();
    }
    return DatabasePool.instance;
  }
}
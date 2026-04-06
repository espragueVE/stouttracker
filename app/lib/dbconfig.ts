export const dbconfig = {
  host: process.env.DB_SERVER,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,

  // optional numeric port (e.g. 3306 for MySQL)
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
};

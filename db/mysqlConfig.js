import mysql from "mysql2/promise";
import dotenv from 'dotenv';

dotenv.config()


const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// host: process.env.DB_HOST,
// user: process.env.DB_USER,
// password: process.env.DB_PASSWORD,
// database: process.env.DB_DATABASE,

// host: "147.50.231.19",
// user: "devsriwa_app_share-2",
// password: "*Nattawut1234",
// database: "devsriwa_app_share-2",

export default pool;

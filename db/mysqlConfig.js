import mysql from "mysql2/promise";
import dotenv from 'dotenv';

dotenv.config()


// const pool = mysql.createPool({
//   host: 'db-mysql-nyc3-29411-do-user-15536941-0.c.db.ondigitalocean.com',
//   user: 'doadmin',
//   password: 'AVNS_JRT_Pbi75Cylk9vK3h7',
//   port: 25060,
//   database: 'devsriwa_app_share',

// });

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  database: process.env.DB_DATABASE
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

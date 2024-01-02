import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: "147.50.231.19",
  user: "devsriwa_app_share-2",
  password: "*Nattawut1234",
  database: "devsriwa_app_share-2",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// host: process.env.DB_HOST,
// user: process.env.DB_USER,
// password: process.env.DB_PASSWORD,
// 1 database: process.env.DB_DATABASE,

export default pool;

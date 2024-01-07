import mysql from "mysql2/promise";
import dotenv from 'dotenv';

dotenv.config()


// const pool = mysql.createPool({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_DATABASE,
//   port: process.env.DB_PORT,
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0,
// });

const pool = mysql.createPool({
  host: 'db-mysql-nyc3-29411-do-user-15536941-0.c.db.ondigitalocean.com',
  user: 'doadmin',
  password: 'AVNS_JRT_Pbi75Cylk9vK3h7',
  port: 25060,
  database: 'devsriwa_app_share',
  // ssl: {
  //   ca: fs.readFileSync('path/to/ca.pem'), // Adjust the path to your CA file
  //   key: fs.readFileSync('path/to/client-key.pem'), // Adjust the path to your client key file
  //   cert: fs.readFileSync('path/to/client-cert.pem') // Adjust the path to your client cert file
  // }
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

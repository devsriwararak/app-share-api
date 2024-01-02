import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import mysql from "mysql2/promise";
import bcrypt from "bcrypt";

// routers
import usersRoutes from "./Routes/users.js";
import registerRoutes from "./Routes/register.js";
import loginRoutes from "./Routes/login.js";
import homeShareRouter from "./Routes/homeShare.js";
import WongShareRouter from "./Routes/WongShare.js";
import TypeWongRouter from "./Routes/typeWong.js";
import adminRouter from "./Routes/admin.js";
import homeAccountRouter from "./Routes/HomeAccount.js";
import memberRouter from "./Routes/Member.js";

const app = express();
const port = process.env.PORT || 3000;

// const pool = mysql.createPool({
//   host: "147.50.231.19",
//   user: "devsriwa_app_share-2",
//   password: "*Nattawut1234",
//   database: "devsriwa_app_share-2",
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0,
// });

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

app.use(cors());

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://app-share-api.vercel.app", 
      "https://app-share-2.netlify.app"
    ],
    methods: ["POST", "GET" , "DELETE", "PUT"],

    credentials: true,
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World! ss");
});

app.get("/users", async (req, res) => {
  try {
    const sql = " SELECT * FROM users";
    const [result] = await pool.query(sql);
    res.status(200).json(result);
  } catch (error) {
    console.log(error);
  }
});

app.get("/register", async (req, res) => {
  const plainTextPassword = "1234";
  const saltRounds = 10;
  const newPassword = await bcrypt.hash(plainTextPassword, saltRounds);
  console.log(newPassword);
  res.json(newPassword);
});

app.get("/login", async (req, res) => {
  const password = await bcrypt.compare(
    "1234",
    "$2b$10$2mtWU63K.mYG9QP3jugdlO.BFD5rP3FU4EyfnFcpgQYz.v2qQ7sPy"
  );
  res.json(password);
});

// Router
app.use("/users", usersRoutes);
app.use("/register", registerRoutes);
app.use("/login", loginRoutes);
app.use("/home_share", homeShareRouter);
app.use("/wong_share", WongShareRouter);
app.use("/type_wong", TypeWongRouter);
app.use("/admin", adminRouter);
app.use("/home_account", homeAccountRouter);
app.use("/member", memberRouter);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

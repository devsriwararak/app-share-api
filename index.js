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
import playRouter from "./Routes/Play.js";

const app = express();
const port = process.env.PORT || 3000;


app.use(cors());

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://app-share-api.vercel.app", 
      "https://app-share-2.netlify.app",
      "https://app-share.devsriwararak.com"
    ],
    methods: ["POST", "GET" , "DELETE", "PUT"],

    credentials: true,
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World! v-2");

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
app.use('/play', playRouter )

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

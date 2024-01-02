import { getNumberCode } from "../Components/getNumberCode.js";
import pool from "../db/mysqlConfig.js";
import bcrypt from "bcrypt";

export const postRegister = async (req, res) => {
  const { username, password, fname, lname, tell, address } = req.body;
  try {
    const passwordHasg = await bcrypt.hash(password, 10);

    // ADD H0001 + 1
    const sqlCheckLastID =
      "SELECT code FROM `users` WHERE role = ? ORDER BY id DESC LIMIT 1";
    const [resultCheckLastId] = await pool.query(sqlCheckLastID, 2);
    const originalString = resultCheckLastId[0].code;
    let numberOfIncrements = 1;

    const newData = getNumberCode(originalString, numberOfIncrements, "U");
    const newCodeNumber = newData.toString();

    // check user ซ้ำ

    const checkUsername = "SELECT * FROM users WHERE username = ?";
    const resultCheck = await pool.query(checkUsername, [username]);
    // console.log(resultCheck[0]);
    if (resultCheck[0].length) {
      res.status(400).json({ message: "มีผู้ใช้งานนี้แล้ว กรุณาสมัครใหม่" });
    } else {
      // สมัครได้
      const sql =
        "INSERT INTO users (username, password, fname, lname, tell, address, role, code) VALUES (?,?,?,?,?,?,?,?)";
      const result = await pool.query(sql, [
        username || "",
        passwordHasg || "",
        fname || "",
        lname || "",
        tell || "",
        address || "",
        2 || "",
        newCodeNumber || ""
      ]);
      // console.log(result[0]);
      res.status(200).json({ message: "บันทึกสำเร็จ" });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "ทำรายการไม่สำเร็จ !" });
  }
};

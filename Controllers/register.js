import { getNumberCode } from "../Components/getNumberCode.js";
import pool from "../db/mysqlConfig.js";
import bcrypt from "bcrypt";

export const postRegister = async (req, res) => {
  const { username, password, tell } = req.body;
  try {
    // console.log(req.body);
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

    const checkUsername = "SELECT * FROM users WHERE tell = ?";
    const resultCheck = await pool.query(checkUsername, [tell]);
    // console.log(resultCheck[0]);
    if (resultCheck[0].length) {
      res.status(400).json({ message: "มีผู้ใช้งานนี้แล้ว กรุณาสมัครใหม่" });
    } else {
      // สมัครได้
      const sqlDrumpData =
        "SELECT fname, lname, tell, address from home_share_users WHERE tell = ?";
      const [resultDrumpData] = await pool.query(sqlDrumpData, [tell]);
      // console.log(resultDrumpData[0]);

      if (resultDrumpData[0]) {
        const sql =
          "INSERT INTO users (username ,password, tell, role, code, fname, lname, address) VALUES (?,?,?,?,?,?,?,?)";
        const result = await pool.query(sql, [
          username,
          passwordHasg || "",
          tell || "",
          2 || "",
          newCodeNumber || "",
          resultDrumpData[0].fname,
          resultDrumpData[0].lname,
          resultDrumpData[0].address
        ]);
        // console.log(result[0]);
        res.status(200).json({ message: "บันทึกสำเร็จ" });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "ทำรายการไม่สำเร็จ !" });
  }
};

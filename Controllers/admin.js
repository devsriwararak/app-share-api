import { checkPassword } from "../Components/checkPassword.js";
import pool from "../db/mysqlConfig.js";
import bcrypt from "bcrypt";

export const getAllAdmin = async (req, res) => {
  try {
    const { search } = req.query;
    let sql = "";
    if (search) {
      sql = `SELECT id, code, tell, fname, lname, username, password FROM users WHERE role = 1 AND fname LIKE '%${search}%' LIMIT 0,9  `;
    } else {
      sql =
        "SELECT id, code, tell, fname, lname, username, password FROM users WHERE role = 1 LIMIT 0,9";
    }
    const [result] = await pool.query(sql);
    res.status(200).json(result);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "เกิดข้อผิดพลาด" });
  }
};

export const putAdmin = async (req, res) => {
  try {
    //    console.log(req.body);
    const { id, username, password, fname, lname, tell } = req.body;
    const sqlCheck = "SELECT username FROM users WHERE username = ?";
    const [resultCheck] = await pool.query(sqlCheck, [username]);

    const passwordHasg = await bcrypt.hash(password, 10);

    // check password
    const newPassword = await checkPassword(id, password);

    if (resultCheck.length > 0) {


      const sqlCheckMyId = `SELECT username FROM users WHERE username = ? AND id = ?`;
      const [resultCheckId] = await pool.query(sqlCheckMyId, [username, id]);
      if (resultCheckId.length > 0) {
        const sql =
          "UPDATE users SET password = ?, fname = ?, lname = ?, tell = ? WHERE id = ?";
        const data = [newPassword, fname, lname, tell, id];
        const [result] = await pool.query(sql, data);
        res.status(200).json({ message: "ทำรายการสำเร็จ" });
      } else {
        res.status(400).json({ message: "ในระบบมีผู้ใช้งานนี้แล้ว" });
      }
    } else {
      const sql =
        "UPDATE users SET username = ?, password = ?, fname = ?, lname = ?, tell = ? WHERE id = ?";
      const data = [username, newPassword, fname, lname, tell, id];

      const [result] = await pool.query(sql, data);
      if (result) {
        res.status(200).json({ message: "ทำรายการสำเร็จ" });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "เกิดข้อผิดพลาด" });
  }
};

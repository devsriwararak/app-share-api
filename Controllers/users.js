import { checkPassword } from "../Components/checkPassword.js";
import pool from "../db/mysqlConfig.js";
import bcrypt from "bcrypt";

export const getUsers = async (req, res) => {
  try {
    const { search } = req.query;

    if (search) {
      const sql = `SELECT * FROM users WHERE role = ? AND (code LIKE '%${search}%' OR fname LIKE '%${search}%') `;
      const [result] = await pool.query(sql, 2);
      res.status(200).json(result);
    } else {
      const sql = "SELECT * FROM users WHERE role = ?";
      const [result] = await pool.query(sql, 2);
      res.status(200).json(result);
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "ทำรายการไม่สำเร็จ" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const sql = "DELETE FROM users WHERE id = ?";
    await pool.query(sql, id);
    res.status(200).json({ message: "ทำรายการสำเร็จ" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "ทำรายการไม่สำเร็จ" });
  }
};

export const putuser = async (req, res) => {
  try {
    const { id, username, password, fname, lname, address, tell } = req.body;


    const newPassword = await checkPassword(username, password)



    // Check user ซ้ำ
    const sqlCheck = "SELECT * FROM users WHERE username = ?";
    const [resultCheck] = await pool.query(sqlCheck, username);

    if (resultCheck.length > 0) {
      const sql =
      "UPDATE users SET  password = ?, fname = ?, lname = ?, address = ?, tell = ? WHERE id = ?";
    await pool.query(sql, [
      newPassword,
      fname,
      lname,
      address,
      tell,
      id,
    ]);
    res.status(200).json({message: 'ทำรายการสำเร็จ'})
    } else {
      const sql =
        "UPDATE users SET username = ?, password = ?, fname = ?, lname = ?, address = ?, tell = ? WHERE id = ?";
      await pool.query(sql, [
        username,
        newPassword,
        fname,
        lname,
        address,
        tell,
        id,
      ]);
      res.status(200).json({message: 'ทำรายการสำเร็จ'})
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "ทำรายการไม่สำเร็จ" });
  }
};

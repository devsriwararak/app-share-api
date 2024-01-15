import { checkPassword } from "../Components/checkPassword.js";
import { getNumberCode } from "../Components/getNumberCode.js";
import pool from "../db/mysqlConfig.js";
import bcrypt from "bcrypt";

export const getByHomeShare = async (req, res) => {
  try {
    const { home_share_id } = req.params;

    if (home_share_id) {
      const sql =
        "SELECT id, home_share_id, code, fname, lname, tell, address, username, password FROM users WHERE role = ? AND home_share_id = ?";
      const [result] = await pool.query(sql, [4, home_share_id]);
      res.status(200).json(result);
    } else {
      res.status(200).json([]);
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "ทำรายการไม่สำเร็จ" });
  }
};

export const postNewMember = async (req, res) => {
  try {
    const {
      home_share_id,
      username,
      password,
      fname,
      lname,
      tell,
      line,
      address,
    } = req.body;

    const passwordHasg = await bcrypt.hash(password, 10);

    // gen รหัส
    const sqlCheckLastID =
      "SELECT code FROM `users` WHERE role = ? ORDER BY id DESC LIMIT 1 ";
    const [resultCheckLastId] = await pool.query(sqlCheckLastID, 4);
    const originalString = resultCheckLastId[0].code;

    let numberOfIncrements = 1;
    const newData = getNumberCode(originalString, numberOfIncrements, "HM");
    const newCodeNumber = newData.toString();

    // Check User ซ้ำ
    const sqlCheck = "SELECT username FROM users WHERE username = ?";
    const [resultCheck] = await pool.query(sqlCheck, [username]);

    if (resultCheck.length > 0) {
      res
        .status(400)
        .json({ message: "มีข้อมุลนี้ในระบบแล้ว กรุณาลองใหม่อีกครั้ง" });
    } else {
      const sql =
        "INSERT INTO users (home_share_id, username, password, fname, lname, tell, address, role, code) VALUES (?,?,?,?,?,?,?,?,?)";
      const [result] = await pool.query(sql, [
        home_share_id,
        username,
        passwordHasg,
        fname,
        lname,
        tell,
        address,
        4,
        newCodeNumber,
      ]);
      res.status(200).json({ message: "ทำรายการสำเร็จ" });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "ทำรายการไม่สำเร็จ" });
  }
};

export const deleteMember = async (req, res) => {
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

export const putMember = async (req, res) => {
  try {
    const {
      id,

      username,
      password,
      fname,
      lname,
      tell,
      line,
      address,
    } = req.body;

    const newPassword = await checkPassword(username, password);

    // check member ซ้ำ
    const sqlCheck = "SELECT username FROM users WHERE username = ?";
    const [resultCheck] = await pool.query(sqlCheck, username);

    if (resultCheck.length > 0) {
      const sql = `UPDATE users SET 
      password = ?,
      fname = ?,
      lname = ?,
      tell = ?,
      address = ? WHERE id = ?  `;
      await pool.query(sql, [newPassword, fname, lname, tell, address, id]);
      res.status(200).json({ message: "ทำรายการสำเร็จ" });
    } else {
      const sql = `UPDATE users SET 
        username = ? ,
      password = ?,
      fname = ?,
      lname = ?,
      tell = ?,
      address = ? WHERE id = ?  `;
      await pool.query(sql, [
        newPassword,
        password,
        fname,
        lname,
        tell,
        address,
        id,
      ]);
      res.status(200).json({ message: "ทำรายการสำเร็จ" });
    }
  } catch (error) {
    console.log(error);
  }
};

// for Homes

export const getMemberByHome = async (req, res) => {
  try {
    const { home_share_id } = req.params;
    const { search } = req.query;

    if (search) {
      const sql = `SELECT id, code, username, password, fname, lname, tell, address, role, home_share_id FROM users WHERE role = ? AND home_share_id = ?  AND fname LIKE '%${search}%'  `;
      const [result] = await pool.query(sql, [4, home_share_id]);
      res.status(200).json(result);
    } else {
      const sql = `SELECT id, code, username, password, fname, lname, tell, address, role, home_share_id FROM users WHERE role = ? AND home_share_id = ? LIMIT 0,10 `;
      const [result] = await pool.query(sql, [4, home_share_id]);
      res.status(200).json(result);
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "ทำรายการไม่สำเร็จ" });
  }
};

export const postMemberByHome = async (req, res) => {
  try {
    console.log(req.body);
    const { username, password, fname, lname, address, tell, home_share_id } =
      req.body;
    const passwordHasg = await bcrypt.hash(password, 10);

    // gen รหัส
    const sqlCheckLastID =
      "SELECT code FROM `users` WHERE role = ? ORDER BY id DESC LIMIT 1 ";
    const [resultCheckLastId] = await pool.query(sqlCheckLastID, 4);
    const originalString = resultCheckLastId[0].code;

    let numberOfIncrements = 1;
    const newData = getNumberCode(originalString, numberOfIncrements, "HM");
    const newCodeNumber = newData.toString();

    // Check
    const sqlCheck = `SELECT * FROM users WHERE role = ? AND home_share_id = ? AND username = ?  `;
    const [resultCheck] = await pool.query(sqlCheck, [
      4,
      home_share_id,
      username,
    ]);

    if (resultCheck.length > 0) {
      res.status(400).json({ message: "มีข้อมูลนี้แล้ว กรุณาลองใหม่อีกครั้ง" });
    } else {
      const sql = `INSERT INTO users (username, password, fname, lname, address, tell, home_share_id, code, role) VALUES (?,?,?,?,?,?,?,?,?)`;
      await pool.query(sql, [
        username,
        password,
        fname,
        lname,
        address,
        tell,
        home_share_id,
        newCodeNumber,
        4,
      ]);
    }
    res.status(200).json({ message: "ทำรายการสำเร็จ" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "ทำรายการไม่สำเร็จ" });
  }
};

export const putMemberByHome = async (req, res) => {
  try {
    const { id, username, password, fname, lname, address, tell } = req.body;

    const passwordHasg = await bcrypt.hash(password, 10);
    // check password
    const sqlCheckPassword = `SELECT * FROM users WHERE username = ? AND password = ?`;
    const [resultCheckPassword] = await pool.query(sqlCheckPassword, [
      username,
      password,
    ]);
    const newPassword =
      resultCheckPassword.length > 0 ? password : passwordHasg;

    // Check
    const sqlCheck = `SELECT * FROM users WHERE  username = ?  `;
    const [resultCheck] = await pool.query(sqlCheck, username);

    if (resultCheck.length > 0) {
      const sql =
        "UPDATE users SET   password = ? , fname = ? , lname = ? , address = ? , tell = ?   WHERE id = ?";
      const result = await pool.query(sql, [
        newPassword,
        fname || "",
        lname || "",
        address || "",
        tell || "",
        id,
      ]);
      res.status(200).json({ message: "ทำรายการสำเร็จ" });
    } else {
      const sql =
        "UPDATE users SET  username = ?, password = ? , fname = ? , lname = ? , address = ? , tell = ?   WHERE id = ?";
      const result = await pool.query(sql, [
        username || "",
        newPassword || "",
        fname || "",
        lname || "",
        address || "",
        tell || "",
        id,
      ]);
      res.status(200).json({ message: "ทำรายการสำเร็จ" });
    }
  } catch (error) {
    console.log(error);
    req.status(400).json({ message: "ทำรายการไม่สำเร็จ" });
  }
};

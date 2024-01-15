import { getNumberCode } from "../Components/getNumberCode.js";
import pool from "../db/mysqlConfig.js";
import bcrypt from "bcrypt";

export const getAllHomeAccount = async (req, res) => {
  try {
    const { search } = req.query;

    if (search) {
      const sql = `SELECT id, home_share_id, tell, username, password, fname, lname, code, address FROM users WHERE role = ? AND  fname LIKE '%${search}%' LIMIT 0,9  `;
      const [result] = await pool.query(sql, 3);
      res.status(200).json(result);
    } else {
      const sql = `SELECT users.* , home_share.name as home_share_names
      FROM users 
      JOIN home_share ON home_share_id = home_share.id
      WHERE role = 3 LIMIT 0,9 `;

      const [result] = await pool.query(sql);
      // console.log(result);
      res.status(200).json(result);
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "เกิดข้อผิดพลาด" });
  }
};

export const postHomeAccount = async (req, res) => {
  try {
    const { home_share_id, username, password, fname, lname, address, tell } =
      req.body;
    const passwordHasg = await bcrypt.hash(password, 10);

    // console.log(req.body);

    // gen รหัส
    // ADD H0001 + 1
    const sqlCheckLastID =
      "SELECT code FROM `users` WHERE role = ? ORDER BY id DESC LIMIT 1 ";
    const [resultCheckLastId] = await pool.query(sqlCheckLastID, 3);
    const originalString = resultCheckLastId[0].code;

    let numberOfIncrements = 1;
    const newData = getNumberCode(originalString, numberOfIncrements, "HA");
    const newCodeNumber = newData.toString();

    // check ใน 1 บ้าน จะมี เจ้าของได้แค่ 1 คน
    const sqlCheckUser = `SELECT home_share_id, username FROM users WHERE home_share_id = ?  `;
    const [resultCheck] = await pool.query(sqlCheckUser, home_share_id);
    // console.log(resultCheck);

    const findCheckUsername = resultCheck.find(
      (obj) => obj.username === username
    );
    if (findCheckUsername) {
      res
        .status(400)
        .json({ message: "มีผู้ใช้งานนี้แล้วกรุณาเพิ่มใหม่อีกครั้ง" });
    } else {
      const sqlUpdateHomeShareStatus =
        "UPDATE home_share SET status_own = ? WHERE id = ?";
      await pool.query(sqlUpdateHomeShareStatus, [1, home_share_id]);
      const sql =
        "INSERT INTO users (home_share_id, username, password, fname, lname, address, tell, role, code) VALUES (?,?,?,?,?,?,?,?,?) ";
      await pool.query(sql, [
        home_share_id,
        username,
        passwordHasg,
        fname,
        lname,
        address,
        tell,
        3,
        newCodeNumber,
      ]);
      res.status(200).json({ message: "ทำรายการสำเร็จ" });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "เกิดข้อผิดพลาด" });
  }
};

export const updateHomeAccount = async (req, res) => {
  try {
    const { id, username, password, fname, lname, address, tell } = req.body;

    const passwordHasg = await bcrypt.hash(password, 10);
    // check password
    const sqlCheckPassword = `SELECT username, password FROM users WHERE username = ? AND password = ?`;
    const [resultCheckPassword] = await pool.query(sqlCheckPassword, [username, password]);
    const newPassword = resultCheckPassword.length > 0 ? password : passwordHasg;

    const newData = { username, password:newPassword, fname, lname, address, tell };
    const newData2 = { password : newPassword, fname, lname, address, tell };


    //check sql
    const sqlCheckUser = "SELECT username FROM users WHERE username = ?";
    const [resultCheckUser] = await pool.query(sqlCheckUser, username);

    if (resultCheckUser.length > 0) {
      const sql = "UPDATE users SET ? WHERE id = ?";
      await pool.query(sql, [newData2, id]);
      res.status(200).json({ message: "ทำรายการสำเร็จ" });
    } else {
      const sql = "UPDATE users SET ? WHERE id = ?";
      await pool.query(sql, [newData, id]);
      res.status(200).json({ message: "ทำรายการสำเร็จ" });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "เกิดข้อผิดพลาด" });
  }
};

export const deleteHomeAccount = async (req, res) => {
  try {
    const id = req.params.id;
    const home_share_id = req.params.home_share_id;
    
    // Delete Users
    const sqlUser = "DELETE FROM users WHERE id = ? "
    await pool.query(sqlUser, id)

    // Update Status Home_share
    const sqlUpdate = "UPDATE home_share SET status_own = ? WHERE id = ? "
    await pool.query(sqlUpdate , [0 , home_share_id])

    res.status(200).json({ message: "ทำรายการสำเร็จ" });


  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "เกิดข้อผิดพลาด" });
  }
};

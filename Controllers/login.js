import pool from "../db/mysqlConfig.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export const postLogin = async (req, res) => {
  const secret = "mysecret";

  const { username, password } = req.body;
  try {
    // const sql = "SELECT * FROM `users` WHERE username = ?";

    const sql = `SELECT users.* , home_share.name AS home_share_name 
             FROM users 
            LEFT JOIN home_share ON users.home_share_id = home_share.id
             WHERE users.username = ?`;

    const [result] = await pool.query(sql, username);
    const userData = result[0];
    // console.log(result);

    const match = await bcrypt.compare(
      password.trim(),
      userData?.password.trim()
    );

    if (!match) {
      res.status(400).json({
        message: "login fail username password ไม่ถูกต้อง",
      });
      return false;
    } else {
      // สร้าง Token
      const token = jwt.sign(
        {
          username,
          id : userData.id,
          role: userData.role,
          name: `${userData.fname} ${userData.lname}`,
          home_share_name: userData.home_share_name || "",
          home_share_id: userData.home_share_id || "",
        },
        secret,
        {
          expiresIn: "1d",
        }
      );

      res.status(200).json({
        message: "เข้าสู่ระบบสำเร็จ",
        token,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "เกิดข้อผิดพลาด",
    });
  }
};

import pool from "../db/mysqlConfig.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export const postLogin = async (req, res) => {
  const secret = "mysecret";

  const { tell, password } = req.body;
  try {
    const sql = `SELECT users.* , home_share.name AS home_share_name 
             FROM users 
            LEFT JOIN home_share ON users.home_share_id = home_share.id
             WHERE users.username = ?`;

    const [result] = await pool.query(sql, tell);
    const userData = result[0];

    if (userData) {
      await loginAdmin(userData, password, secret, res);
    } else {
      await loginUser(tell, password, secret, res);
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "เกิดข้อผิดพลาด",
    });
  }
};

const loginAdmin = async (userData, password, secret, res) => {
  // console.log(userData);
  const match = await bcrypt.compare(
    password.trim(),
    userData?.password.trim()
  );

  if (!match) {
    res.status(400).json({
      message: "เบอร์โทร หรือ รหัสผ่าน ไม่ถูกต้อง",
    });
    return false;
  } else {
    // สร้าง Token
    const token = jwt.sign(
      {
        username : userData.username,
        id: userData.id,
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
};

const loginUser = async (tell, password, secret, res) => {
  const sql = `SELECT users.* , home_share.name AS home_share_name 
  FROM users 
 LEFT JOIN home_share ON users.home_share_id = home_share.id
  WHERE users.tell = ?`;

  const [result] = await pool.query(sql, tell);
  const userData = result[0];

  const match = await bcrypt.compare(
    password.trim(),
    userData?.password.trim()
  );

  if (!match) {
    res.status(400).json({
      message: "เบอร์โทร หรือ รหัสผ่าน ไม่ถูกต้อง",
    });
    return false;
  } else {
    // สร้าง Token
    const token = jwt.sign(
      {
        tell : userData.tell,
        id: userData.id,
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
};

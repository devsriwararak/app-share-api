import bcrypt from "bcrypt";
import pool from "../db/mysqlConfig.js";


export const CheckPasswordUser = async (id, password) => {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const sqlCheckPassword = `SELECT * FROM users WHERE id = ? AND password = ?`;
    const [resultCheckPassword] = await pool.query(sqlCheckPassword, [
      id,
      password,
    ]);

    if (resultCheckPassword.length > 0) {
      return password;
    } else {
      return hashedPassword;
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
};

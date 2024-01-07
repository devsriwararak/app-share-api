import bcrypt from "bcrypt";
import pool from "../db/mysqlConfig.js";


export const CheckPasswordUser = async (tell, password) => {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const sqlCheckPassword = `SELECT * FROM users WHERE tell = ? AND password = ?`;
    const [resultCheckPassword] = await pool.query(sqlCheckPassword, [
      tell,
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

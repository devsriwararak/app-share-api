import bcrypt from "bcrypt";
import pool from "../db/mysqlConfig.js";

// export const checkPassword = async (username, password) => {
//   try {
//     // const passwordHasg = await bcrypt.hash(password, 10);
//     // check password
//     let newPassword = "";
//     const sqlCheckPassword = `SELECT * FROM users WHERE username = ? AND password = ?`;
//     const [resultCheckPassword] = await pool.query(sqlCheckPassword, [
//       username,
//       password,
//     ]);

//     if (resultCheckPassword.length > 0) {
//       return (newPassword = password);
//     } else {
//       const passwordHasg = await bcrypt.hash(password, 10);

//       return (newPassword = passwordHasg);
//     }
//   } catch (error) {
//     console.log(error);
//     throw error;
//   }
// };

// const passwordHasg = await bcrypt.hash(password, 10);
// // check password
// const sqlCheckPassword = `SELECT * FROM users WHERE username = ? AND password = ?`;
// const [resultCheckPassword] = await pool.query(sqlCheckPassword, [username , password]);
// const newPassword = resultCheckPassword.length > 0 ? password : passwordHasg;

export const checkPassword = async (id, password) => {
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

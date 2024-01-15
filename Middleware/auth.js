
import pool from "../db/mysqlConfig.js";
import jwt from "jsonwebtoken";


export const authenticationToken = async (req, res, next) => {
    const secret = "mysecret";

    try {
      const authHeader = req.headers.authorization;
      let authToken = "";
      if (authHeader) {
        authToken = authHeader.split(" ")[1];
      }
  
      const user = jwt.verify(authToken, secret);
  
      const SELECT_USER_BY_USERNAME = "SELECT username FROM `users` WHERE username = ?";
      const [checkResults] = await pool.query(SELECT_USER_BY_USERNAME, user.username);
      if (!checkResults[0]) {
        throw { message: "user not found" };
      }
      next();
    } catch (error) {
      console.log(error);
      res.status(401).json({
        message: "Unauthorized",
        error: error.message, // You can customize the error message sent to the client
      });
    }
  };

  
export const authenticationTokenUser = async (req, res, next) => {
  const secret = "mysecret";

  try {
    const authHeader = req.headers.authorization;
    let authToken = "";
    if (authHeader) {
      authToken = authHeader.split(" ")[1];
    }

    const user = jwt.verify(authToken, secret);

    const SELECT_USER_BY_USERNAME = "SELECT tell FROM `users` WHERE tell = ?";
    const [checkResults] = await pool.query(SELECT_USER_BY_USERNAME, user.tell);
    if (!checkResults[0]) {
      throw { message: "user not found" };
    }
    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({
      message: "Unauthorized",
      error: error.message, // You can customize the error message sent to the client
    });
  }
};
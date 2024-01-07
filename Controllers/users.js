import { CheckPasswordUser } from "../Components/CheckPasswordUser.js";
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
    const { id, password, fname, lname, address, tell } = req.body;


    const newPassword = await CheckPasswordUser(tell, password)



    // Check user ซ้ำ
    const sqlCheck = "SELECT * FROM users WHERE tell = ?";
    const [resultCheck] = await pool.query(sqlCheck, tell);

    if (resultCheck.length > 0) {
      const sql =
      "UPDATE users SET  password = ?, fname = ?, lname = ?, address = ? WHERE id = ?";
    await pool.query(sql, [
      newPassword,
      fname,
      lname,
      address,
      id,
    ]);
    res.status(200).json({message: 'ทำรายการสำเร็จ'})
    } else {
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
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "ทำรายการไม่สำเร็จ" });
  }
};

// my wong share

export const userAddToWongShare = async(req,res)=>{
  try {
   const { home_id, user_id, wong_id, status } = req.body

   const sqlCheck = `SELECT * FROM user_to_wong_share WHERE user_id = ? AND home_share_id = ? AND wong_share_id = ?`
   const [resultCheck] = await pool.query(sqlCheck, [user_id, home_id, wong_id])

   if(resultCheck.length >0){
    res.status(400).json({message: 'คุณได้เข้าวงค์นี้ ไปแล้ว'})

   }else {
    const sql = "INSERT INTO user_to_wong_share (user_id, home_share_id, wong_share_id, status) VALUES (?,?,?,?) "
    await pool.query(sql, [user_id, home_id, wong_id, status])
    res.status(200).json({message:'ทำรายการสำเร็จ'})
   }

  } catch (error) {
    console.log(error);
    res.status(400).json({message: 'ทำรายการไม่สำเร็จ'})
  }
}

export const getUserForMyWongShare = async(req,res)=>{
  try {
    const {user_id} = req.params
    const {search} = req.query

    if(search){
      const sql = `SELECT user_to_wong_share.*, home_share.name AS home_share_name , wong_share.name AS wong_share_name 
      FROM user_to_wong_share 
      JOIN home_share ON user_to_wong_share.home_share_id = home_share.id
      JOIN wong_share ON user_to_wong_share.wong_share_id = wong_share.id
      WHERE user_to_wong_share.user_id = ? AND  wong_share.name LIKE '%${search}%' `
      const [result] = await pool.query(sql, user_id)
      res.status(200).json(result)
    }else {
      const sql = `SELECT user_to_wong_share. *, home_share.name AS home_share_name , wong_share.name AS wong_share_name 
      FROM user_to_wong_share 
      JOIN home_share ON user_to_wong_share.home_share_id = home_share.id
      JOIN wong_share ON user_to_wong_share.wong_share_id = wong_share.id
      WHERE user_to_wong_share.user_id = ?`
      const [result] = await pool.query(sql, user_id)
      res.status(200).json(result)
    }


   
  } catch (error) {
    console.log(error);
  }
}

// My Home Share

export const getUserMyHomeShare = async(req,res)=>{
  try {
    const {user_id} = req.params
    const {search} = req.query

    console.log(search);

    if(search){
      const sql = `SELECT user_to_wong_share.* , home_share.name AS home_share_name 
      FROM user_to_wong_share 
      JOIN home_share ON user_to_wong_share.home_share_id = home_share.id
      WHERE  user_to_wong_share.user_id = ? AND home_share.name LIKE '%${search}%'  GROUP BY home_share.name `
      const [result] = await pool.query(sql, user_id)
      res.status(200).json(result)
    }else {
      const sql = `SELECT user_to_wong_share.* , home_share.name AS home_share_name 
      FROM user_to_wong_share 
      JOIN home_share ON user_to_wong_share.home_share_id = home_share.id
      WHERE  user_to_wong_share.user_id = ? GROUP BY home_share.name `
      const [result] = await pool.query(sql, user_id)
      res.status(200).json(result)
    }


  } catch (error) {
    console.log(error);
    res.status(200).json({message:'ทำรายการไม่สำเร็จ'})
  }
}

export const getUserMyWongShareByIDHome = async(req,res)=>{
  try {
    const {user_id , home_share_id} = req.params

    if(user_id && home_share_id ) {
      const sql = `SELECT user_to_wong_share.* ,  wong_share.* , home_share.name AS home_share_name , type_wong.name AS type_wong_name
      FROM user_to_wong_share 
      JOIN wong_share ON user_to_wong_share.wong_share_id = wong_share.id
      JOIN home_share ON user_to_wong_share.home_share_id = home_share.id
      JOIN type_wong ON wong_share.type_wong_id = type_wong.id
      WHERE user_to_wong_share.user_id = ? AND user_to_wong_share.home_share_id = ? `
      const [result] = await pool.query(sql, [user_id, home_share_id])

      
      res.status(200).json(result)
    }


  } catch (error) {
    console.log(error);
    res.status(200).json({message: 'ทำรายการไม่สำเร็จ'})
  }
}
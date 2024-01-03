import { getNumberCode } from "../Components/getNumberCode.js";
import pool from "../db/mysqlConfig.js";

export const getHomeShare = async (req, res) => {
  try {
    const { search, status_own } = req.query;
    let data = null;
    let sql = null;

    if (search) {
      sql = `SELECT * FROM home_share WHERE name LIKE '%${search}%' OR code LIKE '%${search}%' ORDER BY code DESC `;
    } else if (status_own) {
      sql = "SELECT * FROM home_share WHERE status_own = 0  ORDER BY code DESC";
    } else {
      sql = "SELECT * FROM home_share ORDER BY code DESC";
    }

    const result = await pool.query(sql);
    data = result[0];

    res.status(200).json(data);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "เกิดข้อผิดพลาด" });
  }
};

export const getHomeShareById = async (req, res) => {
  try {
    const { id } = req.params;
    if (id) {
      const sql = `SELECT * FROM home_share WHERE id = ?`;
      const [result] = await pool.query(sql, id);
      res.status(200).json(result[0]);
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "ทำรายการไม่สำเร็จ" });
  }
};

export const postHomeShare = async (req, res) => {
  try {
    const { name, bank, account_number, account_name, line } = req.body;
    // เช็คค่าซ้ำ
    const checkSql = "SELECT * FROM `home_share` WHERE name = ?";
    const resultCheck = await pool.query(checkSql, name);

    // ADD H0001 + 1
    const sqlCheckLastID =
      "SELECT code FROM `home_share` ORDER BY id DESC LIMIT 1";
    const [resultCheckLastId] = await pool.query(sqlCheckLastID);
    const originalString = resultCheckLastId[0].code;
    console.log(originalString);
    let numberOfIncrements = 1;

    const newData = getNumberCode(originalString, numberOfIncrements, "H");
    const code = newData.toString();

    // ADD TO DB
    if (resultCheck[0].length) {
      res.status(400).json({ message: "ข้อมูลซ้ำ กรุณาลองใหม่อีกครั้ง" });
    } else {
      const sql =
        "INSERT INTO `home_share` SET code = ?, name = ?, bank = ?, account_number = ?, account_name = ?, line = ?";
      const result = await pool.query(sql, [
        code,
        name,
        bank,
        account_number,
        account_name,
        line,
      ]);
      res.status(200).json({ message: "บันทึกสำเร็จ" });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "เกิดข้อผิดพลาด" });
  }
};

export const deleteHomeShare = async (req, res) => {
  try {
    const id = req.params.id;
    const sql = "DELETE FROM home_share WHERE id = ?";
    pool.query(sql, id);
    res.status(200).json({ message: "ทำรายการสำเร็จ" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "เกิดข้อผิดพลาด" });
  }
};

export const putHomeShare = async (req, res) => {
  try {
    const { id, name, bank, account_number, account_name, line } = req.body;

    const checkSql = "SELECT * FROM `home_share` WHERE name = ?";
    const resultCheck = await pool.query(checkSql, name);

    if (resultCheck[0].length) {
      // Check
      const checkMyName = resultCheck[0].find((obj) => obj.name === name);

      if (checkMyName) {
        const sql =
          "UPDATE `home_share` SET  bank = ?, account_number = ?, account_name = ?, line = ? WHERE id =  ?";
        await pool.query(sql, [bank, account_number, account_name, line, id]);
        res.status(200).json({ message: "ทำรายการสำเร็จ" });
      } else {
        res.status(400).json({ message: "ข้อมูลซ้ำ กรุณาเำพิ่มใหม่" });
      }
    } else {
      const sql =
        "UPDATE `home_share` SET name = ?, bank = ?, account_number = ?, account_name = ?, line = ? WHERE id =  ?";
      await pool.query(sql, [
        name,
        bank,
        account_number,
        account_name,
        line,
        id,
      ]);
      res.status(200).json({ message: "ทำรายการสำเร็จ" });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "เกิดข้อผิดพลาด" });
  }
};

// Users
export const getUsersInMYHomeShare = async (req, res) => {
  try {
    const { home_share_id } = req.params;
    const {search} = req.query
    

    if(search){

      if (home_share_id) {
        const sql = `SELECT user_to_wong_share.*, users.fname AS user_fname , users.lname AS user_lname , users.code AS user_code , users.tell AS user_tell , users.address AS user_address , wong_share.name AS wong_share_name 
        FROM user_to_wong_share 
        JOIN users ON user_to_wong_share.user_id = users.id
        JOIN wong_share ON user_to_wong_share.wong_share_id = wong_share.id
        WHERE user_to_wong_share.home_share_id = ? AND users.fname LIKE '%${search}%' GROUP BY  users.fname `;
        const [result] = await pool.query(sql, home_share_id);
        res.status(200).json(result);
      }

    }else {

      if (home_share_id) {
        const sql = `SELECT user_to_wong_share.*, users.fname AS user_fname , users.lname AS user_lname , users.code AS user_code , users.tell AS user_tell , users.address AS user_address , wong_share.name AS wong_share_name 
        FROM user_to_wong_share 
        JOIN users ON user_to_wong_share.user_id = users.id
        JOIN wong_share ON user_to_wong_share.wong_share_id = wong_share.id
        WHERE user_to_wong_share.home_share_id = ? GROUP BY  users.fname`;
        const [result] = await pool.query(sql, home_share_id);
        res.status(200).json(result);
      }

    }


  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "ทำรายการไม่สำเร็จ" });
  }
};

export const updateStatusUserInMyHome = async (req, res) => {
  try {
    const { id, status } = req.body;

    if (id && status) {
      if (status == 2) {
        // ลบ
        const sql = `DELETE FROM user_to_wong_share  WHERE id = ? `;
        await pool.query(sql, id);
        res.status(200).json({ message: "ทำรายการสำเร็จ" });
      } else {
        // เพิ่ม
        const sql = `UPDATE user_to_wong_share SET status = ? WHERE id = ? `;
        await pool.query(sql, [status, id]);
        res.status(200).json({ message: "ทำรายการสำเร็จ" });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "ทำรายการไม่สำเร็จ" });
  }
};

export const postUserToMyHome = async (req, res) => {
  try {
    const { user_id, home_share_id, wong_share_id, status } = req.body;

    if (user_id && home_share_id && wong_share_id) {
      const sqlCheck = `SELECT * FROM user_to_wong_share WHERE user_id = ? AND home_share_id = ? AND  wong_share_id = ?`;
      const [resultCheck] = await pool.query(sqlCheck, [
        user_id,
        home_share_id,
        wong_share_id,
      ]);

      if (resultCheck.length > 0) {
        res.status(400).json({ message: "ทำรายการไม่สำเร็จ" });
      } else {
        const sql = `INSERT INTO user_to_wong_share (user_id , home_share_id, wong_share_id, status) VALUES (?,?,?,?)`;
        const [result] = await pool.query(sql, [
          user_id,
          home_share_id,
          wong_share_id,
          status,
        ]);
        res.status(200).json({ message: "ทำรายการสำเร็จ" });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "ทำรายการไม่สำเร็จ" });
  }
};

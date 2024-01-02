import { getNumberCode } from "../Components/getNumberCode.js";
import pool from "../db/mysqlConfig.js";

export const getHomeShare = async (req, res) => {
  try {
    const { search , status_own} = req.query;
    let data = null;
    let sql = null;

    if (search) {
      sql = `SELECT * FROM home_share WHERE name LIKE '%${search}%' OR code LIKE '%${search}%' ORDER BY code DESC `;
    } else if(status_own){
      sql = "SELECT * FROM home_share WHERE status_own = 0  ORDER BY code DESC";
    }
    else {
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

import moment from "moment-timezone";
import pool from "../db/mysqlConfig.js";

export const getAllPlayList = async (req, res) => {
  try {
    const { home_share_id, wong_share_id } = req.query;
    if (home_share_id && wong_share_id) {
      // เช็ค play ว่ามีวงค์นี้อยู่จริงไหม ถึงจะเอา id play ไป เปิดกับ play list ได้
      const sqlCheck = `SELECT id FROM play WHERE home_share_id = ? AND wong_share_id = ?  `;
      const [resultCheck] = await pool.query(sqlCheck, [
        home_share_id,
        wong_share_id,
      ]);

      if (resultCheck.length > 0) {
        const id = resultCheck[0].id;
        const sql = `SELECT id, play_id, start_date FROM play_list WHERE play_id = ?`;
        const [result] = await pool.query(sql, [id]);

        // แปลงข้อมูล
        const newDataFormat = result.map((item) => {
          return {
            id: item.id,
            play_id: item.play_id,
            start_date: item.start_date
              ? moment(item.start_date).tz("Asia/Bangkok").format("DD/MM/YYYY")
              : null,
          };
        });
        res.status(200).json(newDataFormat);
      } else {
        res.status(400).json({ message: "เกิดข้อผิดพลาด " });
      }
    }
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "เกิดข้อผิดพลาด !" });
  }
};

export const postNewplay = async (req, res) => {
  try {
    const { wong_share_id, home_share_id, count } = req.body;
    console.log(req.body);

    // เช็คว่า บ้านแชร์ 001 นี้ ต้องไม่มีวงที่ส่งมา เปิดอยู่
    const sqlCheck = `SELECT wong_share_id FROM play WHERE home_share_id = ? AND wong_share_id = ?`;
    const [resultCheck] = await pool.query(sqlCheck, [
      home_share_id,
      wong_share_id,
    ]);

    if (resultCheck.length > 0) {
      res.status(400).json({ message: "วงค์แชร์นี้เปิดเล่นอยู่แล่ว" });
    } else {
      const sql = `INSERT INTO play (home_share_id, wong_share_id ) VALUES (?, ?)`;
      const [result] = await pool.query(sql, [home_share_id, wong_share_id]);
      res.status(200).json({ message: "ทำรายการสำเร็จ" });
      // ID ล่าสุด
      const lastInsertedId = result.insertId;

      //   loop INSERT ตามจำนวน count
      for (let i = 0; i < count; i++) {
        const dataToInsert = {
          play_id: lastInsertedId,
        };
        // Values สำหรับ SQL query
        const values = Object.values(dataToInsert);
        const sqlList = `INSERT INTO play_list ( play_id  ) VALUES ( ?) `;
        await pool.query(sqlList, values);
      }
    }
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "เกิดข้อผิดพลาด" });
  }
};

export const postNewDay = async (req, res) => {
  try {
    const { play_id, count } = req.body;

    if (play_id && count) {
      for (let i = 0; i < count; i++) {
        const sql = `INSERT INTO play_list (play_id) VALUES (?)`;
        await pool.query(sql, [play_id]);
      }
      res.status(200).json({ message: "เพิ่มข้อมูลสำเร็จ" });
    } else {
      res.status(400).json({ message: "เกิดข้อผิดพลาด" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "เกิดข้อผิดพลาด !" });
  }
};

export const putUpdatePlayList = async (req, res) => {
  try {
    const receivedData = req.body;

    receivedData.map(async (data) => {
      const { play_list_id, date } = data;

      const sql = `UPDATE play_list SET start_date = ? WHERE id = ?`;
      await pool.query(sql, [date, play_list_id]);
    });
    res.status(200).json({ message: "ทำรายการสำเร็จ !!" });
  } catch (error) {
    console.error(error);
  }
};

// Users
export const postNewUserFormyPlayList = async (req, res) => {
  try {
    const { play_list_id, home_share_user_id } = req.body;

    if (play_list_id && home_share_user_id) {
      const sql = `INSERT INTO play_list_users (play_list_id, home_share_user_id) VALUES (?, ?)`;
      await pool.query(sql, [play_list_id, home_share_user_id]);
      res.status(200).json({ message: "บันทึกสำเร็จ" });
    }
  } catch (error) {
    console.error(error);
  }
};

export const getUserForMyPlayList = async (req, res) => {
  try {
    const { play_list_id } = req.query;
    console.log(play_list_id);

    if (play_list_id) {
      const sql = `SELECT play_list_users.id AS id , home_share_users.fname AS user_fname
      FROM play_list_users
      JOIN home_share_users ON play_list_users.home_share_user_id = home_share_users.id
      WHERE play_list_users.play_list_id = ?`;

      const [result] = await pool.query(sql, [play_list_id]);
      res.status(200).json(result);
    }
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "เกิดข้อผิดพลาด" });
  }
};

export const deleteUserForMyPlayList = async (req, res) => {
  try {
    const { id } = req.params;

    if (id) {
      const sql = `DELETE FROM play_list_users WHERE id = ?`;
      await pool.query(sql, [id]);
      res.status(200).json({message:'ลบสำเร็จ'});
    }
  } catch (error) {
    console.log(error);
  }
};

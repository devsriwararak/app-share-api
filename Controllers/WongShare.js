import { getNumberCode } from "../Components/getNumberCode.js";
import pool from "../db/mysqlConfig.js";

export const getAllWongShare = async (req, res) => {
  try {
    const { search } = req.query;
    console.log(search);
    let sql = null;
    if (search) {
      sql = `SELECT wong_share.*, type_wong.name AS type_wong_name 
      FROM wong_share 
      INNER JOIN type_wong ON wong_share.type_wong_id = type_wong.id 
      WHERE  wong_share.name LIKE '%${search}%' ORDER BY wong_share.code DESC LIMIT 0,10   `;
    } else {
      sql = `SELECT wong_share.*, type_wong.name AS type_wong_name , home_share.name AS home_share_name
      FROM wong_share 
      INNER JOIN type_wong ON wong_share.type_wong_id = type_wong.id 
      INNER JOIN home_share ON wong_share.home_share_id = home_share.id ORDER BY wong_share.code DESC LIMIT 0,10    `;
    }
    const [result] = await pool.query(sql);
    res.status(200).json(result);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "server error" });
  }
};

export const postWongShare = async (req, res) => {
  try {
    const {
      home_share_id,
      type_wong_id,
      name,
      interest,
      installment,
      price,
      pay_for_wong,
      count,
      note,
    } = req.body;

    // ADD H0001 + 1
    const sqlCheckLastID =
      "SELECT code FROM `wong_share` ORDER BY id DESC LIMIT 1";
    const [resultCheckLastId] = await pool.query(sqlCheckLastID);
    const originalString = resultCheckLastId[0].code;
    let numberOfIncrements = 1;

    const newData = getNumberCode(originalString, numberOfIncrements, "W");
    const newCodeNumber = newData.toString();

    // check ในบ้านแชร์ ห้ามมีวงแชร์ ซ้ำ
    const sqlCheck =
      "SELECT name, home_share_id FROM wong_share WHERE home_share_id = ?  ";
    const [resultCheck] = await pool.query(sqlCheck, home_share_id);

    const nameExistsInRows = resultCheck.map((row) => row.name === name);

    if (nameExistsInRows.includes(true)) {
      res.status(400).json({
        message: "ชื่อวงแชร์นี้ มีข้อมูลในบ้านนี้แล้ว กรุณาเพิ่มใหม่",
      });
    } else {
      const sql =
        "INSERT INTO wong_share (code, home_share_id, type_wong_id, name, interest, installment, price, pay_for_wong, count, note) VALUES (?,?,?,?,?,?,?,?,?,?) ";
      const result = pool.query(sql, [
        newCodeNumber || "",
        home_share_id || "",
        type_wong_id || "",
        name || "",
        interest || "",
        installment || "",
        price || "",
        pay_for_wong || "",
        count || "",
        note || "",
      ]);
      res.status(200).json({ message: "ทำรายการสำเร็จ" });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "เกิดข้อผิดพลาด" });
  }
};

export const deleteWongShare = async (req, res) => {
  try {
    const id = req.params.id;
    if (id) {
      const sql = "DELETE FROM wong_share WHERE id = ? ";
      pool.query(sql, id);
      res.status(200).json({ message: "ทำรายการสำเร็จ" });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "เกิดข้อผิดพลาด" });
  }
};

export const putWongShare = async (req, res) => {
  const {
    id,
    home_share_id,
    type_wong_id,
    name,
    interest,
    installment,
    price,
    pay_for_wong,
    count,
    note,
  } = req.body;

  try {
    // check ในบ้านแชร์ ห้ามมีวงแชร์ ซ้ำ
    const sqlCheck =
      "SELECT name , home_share_id  FROM wong_share WHERE home_share_id = ?  ";
    const [resultCheck] = await pool.query(sqlCheck, home_share_id);

    const test_2 = resultCheck.find((obj) => obj.name === name);

    if (test_2) {
      const sqlCheckMyId = `SELECT name FROM wong_share WHERE name = ? AND id = ?`;
      const [resultCheckMyId] = await pool.query(sqlCheckMyId, [name, id]);

      if (resultCheckMyId.length > 0) {
        const sql =
          "UPDATE wong_share SET home_share_id = ? , type_wong_id = ? ,  interest = ? , installment = ? , price = ? , pay_for_wong = ? , count = ? , note = ?  WHERE id = ?";
        const result = pool.query(sql, [
          home_share_id || "",
          type_wong_id || "",
          interest || 0,
          installment || 0,
          price || 0,
          pay_for_wong || 0,
          count || 0,
          note || "",
          id,
        ]);
        res.status(200).json({ message: "ทำรายการสำเร็จ" });
      } else {
        res.status(400).json({ message: "มีชื่อวงแชร์ ในบ้านแชร์นี้แล้ว" });
      }
    } else {
      const sql =
        "UPDATE wong_share SET home_share_id = ? , type_wong_id = ? , name = ?, interest = ? , installment = ? , price = ? , pay_for_wong = ? , count = ? , note = ?  WHERE id = ?";
      const result = pool.query(sql, [
        home_share_id || "",
        type_wong_id || "",
        name || "",
        interest || 0,
        installment || 0,
        price || 0,
        pay_for_wong || 0,
        count || 0,
        note || "",
        id,
      ]);
      res.status(200).json({ message: "ทำรายการสำเร็จ" });
    }
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "เกิดข้อผิดพลาด" });
  }
};

// for Home Share
export const getWongShareById = async (req, res) => {
  try {
    const { home_share_id } = req.params;
    const { search } = req.query;

    if (search) {
      const sql = `SELECT wong_share.* , type_wong.name AS type_wong_name
      FROM wong_share 
      JOIN type_wong ON wong_share.type_wong_id = type_wong.id
      WHERE wong_share.home_share_id = ? AND wong_share.name LIKE '%${search}%' LIMIT 0, 9 `;
      const [result] = await pool.query(sql, home_share_id);
      res.status(200).json(result);
    } else {
      const sql = `SELECT wong_share.* , type_wong.name AS type_wong_name
    FROM wong_share 
    JOIN type_wong ON wong_share.type_wong_id = type_wong.id
    WHERE wong_share.home_share_id = ? LIMIT 0, 9`;
      const [result] = await pool.query(sql, home_share_id);
      res.status(200).json(result);
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "เกิดข้อผิดพลาด" });
  }
};

export const postWongShareById = async (req, res) => {
  try {
    const {
      home_share_id,
      name,
      type_wong_id,
      installment,
      price,
      count,
      pay_for_wong,
      interest,
      note,
    } = req.body;

    // ADD H0001 + 1
    const sqlCheckLastID =
      "SELECT code FROM `wong_share` ORDER BY id DESC LIMIT 1";
    const [resultCheckLastId] = await pool.query(sqlCheckLastID);
    const originalString = resultCheckLastId[0].code;
    let numberOfIncrements = 1;

    const newData = getNumberCode(originalString, numberOfIncrements, "W");
    const newCodeNumber = newData.toString();

    // Check
    const sqlCheck = `SELECT home_share_id, name FROM wong_share WHERE home_share_id = ? AND name = ?  `;
    const [resultCheck] = await pool.query(sqlCheck, [home_share_id, name]);

    if (resultCheck.length > 0) {
      res.status(400).json({ message: "มีชื่อวงแชร์ ในบ้านแชร์นี้แล้ว !!" });
    } else {
      const sql = `INSERT INTO wong_share (home_share_id,name,type_wong_id,installment,price,count,pay_for_wong,interest,note, code) VALUES (?,?,?,?,?,?,?,?,?,?) `;
      await pool.query(sql, [
        home_share_id,
        name,
        type_wong_id,
        installment || 0,
        price || 0,
        count || 0,
        pay_for_wong || 0,
        interest || 0,
        note || "",
        newCodeNumber,
      ]);
      res.status(200).json({ message: "ทำรายการสำเร็จ " });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "เกิดข้อผิดพลาด" });
  }
};

export const putWongShareById = async (req, res) => {
  try {
    const {
      home_share_id,
      name,
      // type_wong_id,
      // installment,
      // price,
      // count,
      pay_for_wong,
      // interest,
      note,
      id,
      online,
      takecare,
    } = req.body;

    // Check
    const sqlCheck = `SELECT home_share_id, name FROM wong_share WHERE home_share_id = ? AND name = ?  `;
    const [resultCheck] = await pool.query(sqlCheck, [home_share_id, name]);

    if (resultCheck.length > 0) {
      // const sql =
      //   "UPDATE wong_share SET  type_wong_id = ?, interest = ? , installment = ? , price = ? , pay_for_wong = ? , count = ? , note = ?, online = ?, takecare = ?  WHERE id = ?";
      // const result = pool.query(sql, [
      //   type_wong_id || "",
      //   interest || 0,
      //   installment || 0,
      //   price || 0,
      //   pay_for_wong || 0,
      //   count || 0,
      //   note || "",
      //   online || 0,
      //   takecare || 0,
      //   id,
      // ]);
      // res.status(200).json({ message: "ทำรายการสำเร็จ 1" });

      const sqlCheckMyId = `SELECT name FROM wong_share WHERE name = ? AND id = ?`;
      const [resultCheckMyId] = await pool.query(sqlCheckMyId, [name, id]);

      if (resultCheckMyId.length > 0) {
        const sql =
          "UPDATE wong_share SET  pay_for_wong = ? , note = ?, online = ?, takecare = ?  WHERE id = ?";
        const result = pool.query(sql, [
          // type_wong_id || "",
          // interest || 0,
          // installment || 0,
          // price || 0,
          pay_for_wong || 0,
          // count || 0,
          note || "",
          online || 0,
          takecare || 0,
          id,
        ]);
        res.status(200).json({ message: "ทำรายการสำเร็จ 1" });
      } else {
        res
          .status(400)
          .json({ message: "มีผู้ใช้งานนี้แล้ว กรุณาลองใหม่อีกครั้ง" });
      }
    } else {
      const sql =
        "UPDATE wong_share SET name = ? ,  pay_for_wong = ? ,  note = ?, online = ?, takecare = ?  WHERE id = ?";
      const result = pool.query(sql, [
        name || "",
        pay_for_wong || 0,
        note || "",
        online || 0,
        takecare || 0,
        id,
      ]);
      res.status(200).json({ message: "ทำรายการสำเร็จ 2" });
    }
  } catch (error) {
    console.log(error);
    req.status(400).json({ message: "ทำรายการไม่สำเร็จ" });
  }
};

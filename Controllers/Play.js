import moment_2 from "moment-timezone";
import pool from "../db/mysqlConfig.js";
import moment from "moment";
import { query } from "express";

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

        const sql = `SELECT play_list.id, play_list.play_id, play_list.start_date, play_list.play_date, play_list.interest, play_list.received, play_list.free_money, play_list.shipping, play_list.cancel, play_list.deducation_name, deducation_price, play_list.play_status 
        FROM play_list 
        WHERE play_list.play_id = ?`;

        const [result] = await pool.query(sql, [id]);

        // แปลงข้อมูล
        const newDataFormat = await Promise.all(
          result.map(async (item, index) => {
            const sql_2 = ` SELECT  home_share_users.fname AS fname
          FROM play_list_users 
          JOIN home_share_users ON play_list_users.home_share_user_id = home_share_users.id
          WHERE play_list_id = ?`;
            const [result_2] = await pool.query(sql_2, [item.id]);

            const thaiFormattedDate_start = item.start_date
              ? // `${moment(item.start_date).locale("th").format("Do MMM")} ${
                //     moment(item.start_date).get("year") + 543
                //   }`
                `${moment(item.start_date).format("DD MM")} ${
                  moment(item.start_date).get("year") + 543
                }`
              : null;
            const thaiFormattedDate_play = item.play_date
              ? `${moment(item.play_date).format("DD MM")} ${
                  moment(item.play_date).get("year") + 543
                }`
              : null;

            return {
              id: item.id,
              play_id: item.play_id,
              start_date_th: thaiFormattedDate_start,
              play_date_th: thaiFormattedDate_play,
              start_date: moment(item.start_date).format("YYYY-MM-DD"),
              play_date: moment(item.play_date).format("YYYY-MM-DD"),
              interest: item.interest,
              received: item.received,
              free_money: item.free_money,
              cancel: item.cancel,
              fname: result_2,
              deducation_name: item.deducation_name,
              deducation_price: item.deducation_price,
              play_status: item.play_status,
              shipping : item.shipping
            };
          })
        );

        if (newDataFormat.length) {
          res.status(200).json(newDataFormat);
        }
      } else {
        res.status(400).json({ message: "เกิดข้อผิดพลาด " });
      }
    }
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "เกิดข้อผิดพลาด !" });
  }
};

// node.js มี for loop 2 อันต่อกัน อยากได้ ถ้า for loop 1 insert database เสร็จ ให้ res.status 200
// export const postNewplay = async (req, res) => {
//   try {
//     const { wong_share_id, home_share_id, count } = req.body;

//     // เช็คว่า บ้านแชร์ 001 นี้ ต้องไม่มีวงที่ส่งมา เปิดอยู่
//     const sqlCheck = `SELECT wong_share_id FROM play WHERE home_share_id = ? AND wong_share_id = ?`;
//     const [resultCheck] = await pool.query(sqlCheck, [
//       home_share_id,
//       wong_share_id,
//     ]);

//     if (resultCheck.length > 0) {
//       res.status(400).json({ message: "วงค์แชร์นี้เปิดเล่นอยู่แล่ว" });
//     } else {
//       const sql = `INSERT INTO play (home_share_id, wong_share_id ) VALUES (?, ?)`;
//       const [result] = await pool.query(sql, [home_share_id, wong_share_id]);

//       // ID ล่าสุด
//       const lastInsertedId = result.insertId;

//       const currentDate = moment(); // ใช้ moment สร้างวันที่ปัจจุบัน
//       const formattedCurrentDate = currentDate.format("YYYY-MM-DD"); // จัดรูปแบบวันที่

//       //   loop INSERT ตามจำนวน count
//       for (let i = 0; i < count; i++) {
//         // เพิ่ม วันที่ ตาม count
//         const dateToAdd = currentDate.clone().add(i, "days"); // เพิ่มวัน
//         const formattedDate = dateToAdd.format("YYYY-MM-DD");

//         const data = {
//           play_id: lastInsertedId,
//           start_date: formattedDate,
//         };

//         // Table play_list
//         const sqlList = `INSERT INTO play_list ( play_id, start_date  ) VALUES (?, ?) `;
//         const [resultList] = await pool.query(sqlList, [
//           data.play_id,
//           data.start_date,
//         ]);
//         // ID ล่าสุด
//         const play_list_id = resultList.insertId;

//         for (let x = 0; x < count; x++) {
//           // // Table play_list_money
//           const sqlListMoney = `INSERT INTO play_list_money ( play_list_id, play_id  ) VALUES (?,?) `;
//           await pool.query(sqlListMoney, [play_list_id, data.play_id]);
//         }
//       }
//       res.status(200).json({ message: "ทำรายการสำเร็จ" });
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(400).json({ message: "เกิดข้อผิดพลาด" });
//   }
// };

// จาก code นี้ ที่ถูกต้อง อยากให้ status 200 ทำงาน หลังจาก insert play_list เสร็จ
export const postNewplay = async (req, res) => {
  try {
    const { wong_share_id, home_share_id, count } = req.body;

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      const sqlCheck = `SELECT wong_share_id FROM play WHERE home_share_id = ? AND wong_share_id = ?`;
      const [resultCheck] = await connection.query(sqlCheck, [
        home_share_id,
        wong_share_id,
      ]);

      if (resultCheck.length > 0) {
        res.status(400).json({ message: "วงค์แชร์นี้เปิดเล่นอยู่แล้ว" });
        return;
      }

      const sqlInsertPlay = `INSERT INTO play (home_share_id, wong_share_id) VALUES (?, ?)`;
      const [resultInsertPlay] = await connection.query(sqlInsertPlay, [
        home_share_id,
        wong_share_id,
      ]);

      const lastInsertedId = resultInsertPlay.insertId;

      const currentDate = moment();
      const formattedCurrentDate = currentDate.format("YYYY-MM-DD");

      const sqlInsertPlayList = `INSERT INTO play_list (play_id, start_date) VALUES `;
      const playListValues = [];
      for (let i = 0; i < count; i++) {
        const dateToAdd = currentDate.clone().add(i, "days");
        const formattedDate = dateToAdd.format("YYYY-MM-DD");
        playListValues.push(`(${lastInsertedId}, '${formattedDate}')`);
      }
      const sqlFinalInsertPlayList =
        sqlInsertPlayList + playListValues.join(", ");
      await connection.query(sqlFinalInsertPlayList);

      const sqlSelectPlayListIds = `SELECT id FROM play_list WHERE play_id = ?`;
      const [playListIds] = await connection.query(sqlSelectPlayListIds, [
        lastInsertedId,
      ]);

      // Insert into play_list_money for each play_list
      for (const playListIdRow of playListIds) {
        const playListId = playListIdRow.id;
        const sqlInsertPlayListMoney = `INSERT INTO play_list_money (play_list_id, play_id) VALUES (?, ?)`;
        for (let i = 0; i < count; i++) {
          await connection.query(sqlInsertPlayListMoney, [
            playListId,
            lastInsertedId,
          ]);
        }
      }

      await connection.commit();
      res.status(200).json({ message: "ทำรายการสำเร็จ" });

    } catch (error) {
      await connection.rollback();
      console.error(error);
      res.status(400).json({ message: "เกิดข้อผิดพลาด" });
    } finally {
      connection.release();

    }
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "เกิดข้อผิดพลาด" });
  }
};

export const putNewDay = async (req, res) => {
  try {
    const { play_id, day, count } = req.body;

    if (play_id && count && day) {
      const currentDate = moment(); // ใช้ moment สร้างวันที่ปัจจุบัน
      const formattedCurrentDate = currentDate.format("YYYY-MM-DD"); // จัดรูปแบบวันที่

      for (let i = 0; i < count; i++) {
        const sqlLastDay = `SELECT start_date, id FROM play_list WHERE play_id = ?`;
        const [resultLastDay] = await pool.query(sqlLastDay, [play_id]);

        const isDay = moment(resultLastDay[i].start_date)
          .locale("th")
          .format("YYYY-MM-DD");
        const id = resultLastDay[i].id;

        const dateToAdd = moment(isDay).add(day, "days");
        const formattedDate = dateToAdd.format("YYYY-MM-DD");

        const sqlList = `UPDATE play_list SET start_date = ? WHERE id = ?  `;
        await pool.query(sqlList, [formattedDate, id]);
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
    const {
      play_id,
      play_list_id,
      play_date,
      free_money,
      deducation_name,
      deducation_price,
      deducation_number,
      installment,
      price,
      index,
      count,
    } = req.body;

    // console.log(req.body);

    if (play_list_id) {
      const selectQuery = `SELECT interest, play_status, play_date, received  FROM play_list WHERE id = ? LIMIT 1`;
      const [result] = await pool.query(selectQuery, [play_list_id]);
      const play_list_data = result[0];
      const play_date_formath = moment(play_list_data.play_date).format(
        "YYYY-MM-DD"
      );
      // console.log(play_list_data);

      if (play_list_data.play_status >= 1) {
        throw new Error("รายการนี้ชำระเงินไปแล้ว");
      } else {
        let data_installment = 0;
        let data_price = 0;

        if (index === 0) {
          data_installment = 0;
          data_price = price;
        } else if (index === 1) {
          data_installment = installment;
          data_price = price;
        } else {
          data_installment = installment;
          // data_price = price + (data_installment * index) ;
          data_price = price + data_installment * index - installment;
        }

        const sql = `UPDATE play_list SET  play_date = ?,  free_money = ?, deducation_name = ?, deducation_price = ?, interest = ? , received = ?  WHERE id = ?    `;
        await pool.query(sql, [
          play_date || "",
          free_money || 0,
          deducation_name || "",
          deducation_number === 1
            ? data_price
            : deducation_number === 2
            ? 0
            : deducation_price || 0,
          data_installment,
          data_price,
          play_list_id,
        ]);

        if (deducation_name && deducation_price) {
          // เพิ่มข้อมูล แนวตั้งลงมา ทุกรอบๆ เช่น ทุก index ที่ 0 ของ count 5 ไปเรื่อยๆ *************************************
          const sqlplayListMoney = `SELECT id, sum, play_list_id, play_id FROM play_list_money WHERE play_id = ?  `;
          const [resultPlayListMoney] = await pool.query(sqlplayListMoney, [
            play_id,
          ]);

          const dividedArrays = [];
          for (let i = 0; i < resultPlayListMoney.length; i += 5) {
            const slicedArray = resultPlayListMoney.slice(i, i + 5);
            dividedArrays.push(slicedArray);
          }

          for (let i = 0; i < dividedArrays.length; i++) {
            const arrayToUpdate = dividedArrays[i];

            // ตรวจสอบว่า array มีข้อมูลและข้อมูลใน index ที่ต้องการมีค่า
            if (arrayToUpdate.length >= count && arrayToUpdate[index]) {
              let sum = 0;
              if (i === 0) {
                sum = 0;
              } else {
                sum = installment;
              }
              // UPDATE PLAY_LIST STATUS
              const sqlUpdatePlayListStatus = `UPDATE play_list SET play_status = ? WHERE id = ? `;
              await pool.query(sqlUpdatePlayListStatus, [1, play_list_id]);

              // UPDATE PLAY_LIST_MONEY
              const sqlUpdateMoney = `UPDATE play_list_money SET sum = ?, date = ? WHERE id = ? `;
              await pool.query(sqlUpdateMoney, [
                sum,
                play_date,
                arrayToUpdate[index].id,
              ]);
            }
          }

          // เพิ่ม sum ที่เหลือของตัวเอง *************************************

          const sqlCheckMoney = `SELECT sum, id FROM play_list_money WHERE play_list_id = ?`;
          const [resultCheckMoney] = await pool.query(sqlCheckMoney, [
            play_list_id,
          ]);

          let found100 = false;

          // วนลูปผ่านอาร์เรย์ผลลัพธ์
          for (let i = 0; i < resultCheckMoney.length; i++) {
            let sum = 0;

            const sqlCheckMoney_2 = `SELECT sum, id FROM play_list_money WHERE id = ?`;
            const [resultCheckMoney_2] = await pool.query(sqlCheckMoney_2, [
              resultCheckMoney[i].id,
            ]);

            let test1 = 100;
            let test2 = test1 + test1;
            let sum_test = 0;

            for (let j = 0; j < resultCheckMoney_2.length; j++) {
              // ถ้า sum เท่ากับ playMoney
              console.log(resultCheckMoney_2[j].sum);

              // ลองเขียนเอง

              if (resultCheckMoney_2[j].sum === test1) {
                console.log(11111);
              } else {
                console.log(2222);
                // const sqlUpdateMoney = `UPDATE play_list_money SET sum = ? WHERE id = ? `;
                // await pool.query(sqlUpdateMoney, [
                //   test2,
                //   resultCheckMoney_2[j].id,
                // ]);
              }
            }
          }

          // console.log(resultCheckMoney);
        }

        // res.status(200).json({ message: "ทำรายการสำเร็จ" });
      }
    }
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: "ทำรายการไม่สำเร็จ" });
  }
};

export const putUpdatePlayList_2 = async (req, res) => {
  try {
    const {
      play_id,
      play_list_id,
      play_date,
      free_money,
      deducation_name,
      deducation_price,
      deducation_number,
      installment,
      price,
      index,
      count,
      type_wong_id,
      interest,
      shipping
    } = req.body;

    console.log(req.body);

    // TYPE_1 ##
    if (type_wong_id === 1) {
      if (play_list_id && play_date != "Invalid date") {
        // UPDATE PLAY LIST  *********************************************
        const sqlCheckPlayList = `SELECT id, interest, received, play_id  FROM play_list WHERE play_id = ? `;
        const [resultCheckPlayList] = await pool.query(sqlCheckPlayList, [
          play_id,
        ]);
        // console.log(resultCheckPlayList);
        let add_interest = 0;
        let add_received = 0;
        // ยอดเงินที่ต้องจ่ายต่อ หลังเล่นชนะไปแล้ว
        let sum_money = Number(deducation_price) + installment;

        for (let i = 0; i < resultCheckPlayList.length; i++) {
          if (i === 0) {
            add_interest = 0;
            add_received = price;
          } else if (i === 1) {
            add_interest = Number(deducation_price);
            add_received = Number(deducation_price);
          } else {
            add_interest = installment;
            add_received = installment + resultCheckPlayList[i - 1].received;
          }

          if (resultCheckPlayList[i].id === play_list_id) {
            const sqlUpdatePlayList = `UPDATE play_list SET interest = ? , received = ?, play_date = ?, deducation_name = ?, deducation_price = ? WHERE id = ?  `;
            const [resultUpdatePlayList] = await pool.query(sqlUpdatePlayList, [
              add_interest,
              add_received,
              play_date,
              deducation_name,
              deducation_price,
              play_list_id,
            ]);

            // UPDATE play_list_money แนวตั้ง ใน loop for ************************************************
            if (resultUpdatePlayList) {
              const sqlProcessListMoney = `SELECT id, sum FROM play_list_money WHERE play_id = ?`;
              const [resultProcessListMoney] = await pool.query(
                sqlProcessListMoney,
                [resultCheckPlayList[i].play_id]
              );

              // แบ่งข้อมูลเป็นชุดละ 5 count และอัปเดตค่าเฉพาะ index ที่ 0 ของแต่ละชุด
              for (let j = 0; j < resultProcessListMoney.length; j += count) {
                if (j < count) {
                  continue;
                }

                const group = resultProcessListMoney.slice(j, j + count);

                // ตรวจสอบว่าอยู่ที่ชุดที่ต้องการอัปเดตหรือไม่
                if (j + index < resultProcessListMoney.length) {
                  const idToUpdate = group[index].id; // เลือก index ที่ 2 ของแต่ละชุด

                  // เช็ค sum ของ id ก่อนหน้า ว่ามีค่ามากกว่า sum ที่จะทำการอัปเดตหรือไม่
                  const prevSum = resultProcessListMoney.find(
                    (item) => item.id == idToUpdate
                  ).sum;

                  if (prevSum <= installment) {
                    const sqlUpdateProcessListMoney = `UPDATE play_list_money SET sum = ? WHERE id = ?`;
                    await pool.query(sqlUpdateProcessListMoney, [
                      installment,
                      idToUpdate,
                    ]);
                  }
                }
              }

              // UPDATE play_list_money แนวนอน ใน loop for *****************************************************
              // index = 1
              const sqlProcessListMoneyByPlayListId = `SELECT id, sum FROM play_list_money WHERE play_list_id = ?`;
              const [resultProcessListMoneyByPlayListId] = await pool.query(
                sqlProcessListMoneyByPlayListId,
                [play_list_id]
              );

              if (resultProcessListMoneyByPlayListId) {
                const sqlUpdateProcessListMoney = `UPDATE play_list_money SET sum = ? WHERE id = ?`;

                if (index !== 0) {
                  for (
                    let i = index + 1;
                    i < resultProcessListMoneyByPlayListId.length;
                    i++
                  ) {
                    const idToUpdate = resultProcessListMoneyByPlayListId[i].id;
                    const [resultIdToUpdate] = await pool.query(
                      sqlUpdateProcessListMoney,
                      [sum_money, idToUpdate]
                    );
                  }
                }

                res.status(200).json({ message: "ทำรายการสำเร็จ" });
              }
            } else {
              throw new Error("อัพเดท PL ไม่สำเร็จ");
            }
          }
        }
      }
    }
    // TYPE_2 ##
    else if (type_wong_id === 2) {
      if (play_list_id && play_date != "Invalid date") {
        // UPDATE PLAY LIST  *********************************************
        const sqlCheckPlayList = `SELECT id,interest, received, play_id  FROM play_list WHERE play_id = ? `;
        const [resultCheckPlayList] = await pool.query(sqlCheckPlayList, [
          play_id,
        ]);
        // console.log(resultCheckPlayList);
        let add_received = 0;
        // ยอดเงินที่ต้องจ่ายต่อ หลังเล่นชนะไปแล้ว
        let sum_money = Number(installment) + interest;

        for (let i = 0; i < resultCheckPlayList.length; i++) {
          if (i === 0) {
            add_received = price;
          } else if (i === 1) {
            add_received = price;
          } else {
            add_received = resultCheckPlayList[i - 1].received + interest;
          }

          if (resultCheckPlayList[i].id === play_list_id) {
            const sqlUpdatePlayList = `UPDATE play_list SET  received = ?, play_date = ?, deducation_name = ?, deducation_price = ? WHERE id = ?  `;
            const [resultUpdatePlayList] = await pool.query(sqlUpdatePlayList, [
              add_received,
              play_date,
              deducation_name,
              deducation_price,
              play_list_id,
            ]);

            // UPDATE play_list_money แนวตั้ง ใน loop for ************************************************
            if (resultUpdatePlayList) {
              const sqlProcessListMoney = `SELECT id, sum FROM play_list_money WHERE play_id = ?`;
              const [resultProcessListMoney] = await pool.query(
                sqlProcessListMoney,
                [resultCheckPlayList[i].play_id]
              );

              // แบ่งข้อมูลเป็นชุดละ 5 count และอัปเดตค่าเฉพาะ index ที่ 0 ของแต่ละชุด
              for (let j = 0; j < resultProcessListMoney.length; j += count) {
                if (j < count) {
                  continue;
                }

                const group = resultProcessListMoney.slice(j, j + count);

                // ตรวจสอบว่าอยู่ที่ชุดที่ต้องการอัปเดตหรือไม่
                if (j + index < resultProcessListMoney.length) {
                  const idToUpdate = group[index].id; // เลือก index ที่ 2 ของแต่ละชุด

                  // เช็ค sum ของ id ก่อนหน้า ว่ามีค่ามากกว่า sum ที่จะทำการอัปเดตหรือไม่
                  const prevSum = resultProcessListMoney.find(
                    (item) => item.id == idToUpdate
                  ).sum;

                  if (prevSum <= installment) {
                    const sqlUpdateProcessListMoney = `UPDATE play_list_money SET sum = ? WHERE id = ?`;
                    await pool.query(sqlUpdateProcessListMoney, [
                      installment,
                      idToUpdate,
                    ]);
                  }
                }
              }

              // UPDATE play_list_money แนวนอน ใน loop for *****************************************************
              // index = 1
              const sqlProcessListMoneyByPlayListId = `SELECT id, sum FROM play_list_money WHERE play_list_id = ?`;
              const [resultProcessListMoneyByPlayListId] = await pool.query(
                sqlProcessListMoneyByPlayListId,
                [play_list_id]
              );

              if (resultProcessListMoneyByPlayListId) {
                const sqlUpdateProcessListMoney = `UPDATE play_list_money SET sum = ? WHERE id = ?`;

                if (index !== 0) {
                  for (
                    let i = index + 1;
                    i < resultProcessListMoneyByPlayListId.length;
                    i++
                  ) {
                    const idToUpdate = resultProcessListMoneyByPlayListId[i].id;
                    const [resultIdToUpdate] = await pool.query(
                      sqlUpdateProcessListMoney,
                      [sum_money, idToUpdate]
                    );
                  }
                }

                res.status(200).json({ message: "ทำรายการสำเร็จ" });
              }
            } else {
              throw new Error("อัพเดท PL ไม่สำเร็จ");
            }
          }
        }
      } else {
        throw new Error("ไม่พบข้อมูล play_list_id และ วันที่เปีย ");
      }
    }
    // TYPE_3 ##
    else if (type_wong_id === 3) {
      if (play_list_id && play_date != "Invalid date") {
        // UPDATE PLAY LIST  *********************************************
        const sqlCheckPlayList = `SELECT id,interest, received, play_id  FROM play_list WHERE play_id = ? `;
        const [resultCheckPlayList] = await pool.query(sqlCheckPlayList, [
          play_id,
        ]);
        // console.log(resultCheckPlayList);
        let add_received = 0;
        let add_shipping = 0
        // ยอดเงินที่ต้องจ่ายต่อ หลังเล่นชนะไปแล้ว
        let sum_money = Number(installment) + interest;

        for (let i = 0; i < resultCheckPlayList.length; i++) {
          if (i === 0) {
            add_received = price;
          }  else {
            add_received = price;
            add_shipping = shipping || 0
          }

  
          if (resultCheckPlayList[i].id === play_list_id) {

            const sqlUpdatePlayList = `UPDATE play_list SET  received = ?, shipping = ? , play_date = ?, deducation_name = ?, deducation_price = ? WHERE id = ?  `;
            const [resultUpdatePlayList] = await pool.query(sqlUpdatePlayList, [
              add_received,
              add_shipping,
              play_date,
              deducation_name,
              deducation_price,
              play_list_id,
            ]);

            // UPDATE play_list_money แนวตั้ง ใน loop for ************************************************
            if (resultUpdatePlayList) {
              const sqlProcessListMoney = `SELECT id, sum FROM play_list_money WHERE play_id = ?`;
              const [resultProcessListMoney] = await pool.query(
                sqlProcessListMoney,
                [resultCheckPlayList[i].play_id]
              );

              const sqlProcessListMoneyByPlayListId = `SELECT id, sum FROM play_list_money WHERE play_list_id = ?`;
              const [resultProcessListMoneyByPlayListId] = await pool.query(
                sqlProcessListMoneyByPlayListId,
                [play_list_id]
              );

              if (resultProcessListMoneyByPlayListId) {
                const sqlUpdateProcessListMoney = `UPDATE play_list_money SET sum = ? WHERE id = ?`;

                if (index !== 0) {
                  for (
                    let i = 0;
                    i < resultProcessListMoneyByPlayListId.length;
                    i++
                  ) {
                    const idToUpdate = resultProcessListMoneyByPlayListId[i].id;
                    const [resultIdToUpdate] = await pool.query(
                      sqlUpdateProcessListMoney,
                      [deducation_price, idToUpdate]
                    );
                  }
                }

                res.status(200).json({ message: "ทำรายการสำเร็จ" });
              }
            } else {
              throw new Error("อัพเดท PL ไม่สำเร็จ");
            }
          }
        }
      } else {
        throw new Error("ไม่พบข้อมูล play_list_id และ วันที่เปีย ");
      }
    } else {
      throw new Error("ไม่พบประเภทวงแชร์");
    }
  } catch (error) {
    console.log(error);
    res.status(500).json(error.message);
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
      res.status(200).json({ message: "ลบสำเร็จ  " });
    }
  } catch (error) {
    console.log(error);
  }
};

// deducation

// Money
export const getAllPlayListMoney = async (req, res) => {
  try {
    const { wong_share_id } = req.query;

    if (wong_share_id) {
      // ค้นหา ID จาก Table Play
      const sqlPlay = `SELECT id FROM play WHERE wong_share_id = ? LIMIT 1`;
      const [resultPlay] = await pool.query(sqlPlay, [wong_share_id]);
      const play_id = resultPlay[0]?.id;

      const query = `
      SELECT play_list.id AS id, play_list.user_id AS name, play_list.interest AS interest
      FROM play_list
      WHERE play_list.play_id = ?
    `;

      const [resultPlayList] = await pool.query(query, [play_id]);

      // console.log(resultPlayList);

      const formattedData = [];
      let currentId = null;
      let currentObject = null;

      // SELECT home_share_users
      const sqlname = `SELECT home_share_users.fname AS fname
              FROM play_list_users
              INNER JOIN home_share_users ON play_list_users.home_share_user_id = home_share_users.id
              WHERE play_list_users.play_list_id = ? GROUP BY home_share_users.fname`;

      // SELECT play_list_money
      const sqlPlayListMoney = `
              SELECT id, sum, price, play_list_id, date
              FROM play_list_money
              WHERE play_list_id = ? ORDER BY id 
              `;

      for (const row of resultPlayList) {
        try {
          const [resultName] = await pool.query(sqlname, [row.id]);
          const [resultPlayListMoney] = await pool.query(sqlPlayListMoney, [
            row.id,
          ]);

          if (row.id !== currentId) {
            // เมื่อพบ id ใหม่, สร้าง object ใหม่
            currentObject = {
              id: row.id,
              name: row.name,
              interest: row.interest,
              fname: resultName,
            };
            formattedData.push(currentObject);
            currentId = row.id;
          }

          // เพิ่มข้อมูล money เข้าไปใน object
          currentObject.money = currentObject.money || [];

          const test = resultPlayListMoney.map((item, index) => {
            currentObject.money.push({
              money_id: item.id,
              sum: item.sum,
              price: item.price,
              play_list_id: item.play_list_id,
              date: item.date ? moment(item.date).format("DD-MM-YYYY") : "",
            });
          });
        } catch (error) {
          console.error("Error fetching data:", error);
          res.status(400).json({ message: "เกิดข้อผิดพลาด" });
        }
      }

      if (formattedData.length > 0) {
        res.status(200).json(formattedData);
      }
    } else {
      res.status(400);
    }
  } catch (error) {
    console.error(error);
    res.status(400);
  }
};

export const putAddMoney = async (req, res) => {
  try {
    const { id } = req.params;
    const { sum, status } = req.body;
    let date = null;

    let price = sum;
    if (id && sum) {
      if (status === 0) {
        price = 0;
      } else {
        price = sum;
        date = moment().format("YYYY-MM-DD");
      }
      const sql = `UPDATE  play_list_money SET price = ?, date = ? WHERE id = ?`;
      await pool.query(sql, [price, date, id]);
      res.status(200).json({ message: "ทำรายการสำเร็จ !" });
    }
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "เกิดข้อผิดพลาด" });
  }
};

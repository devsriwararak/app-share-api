import pool from "../db/mysqlConfig.js";

export const getAllTypeWong = async(req,res)=>{
    try {
        const sql = "SELECT * FROM type_wong"
        const [result] = await pool.query(sql)
        res.status(200).json(result)
    } catch (error) {
        console.log(error);
        res.status(400).json({message: 'ประเภทผิดพลาด'})

    }
}
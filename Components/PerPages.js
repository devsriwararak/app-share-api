import pool from "../db/mysqlConfig.js";

const perPages =  async(countQuery)=>{

    const perPage = 3;
    const [resultQuery] = await pool.query(countQuery)
    const totalCount = resultQuery[0].totalCount;
    const totalPages = Math.ceil(totalCount / perPage);
    return totalPages
    

}

export default  perPages
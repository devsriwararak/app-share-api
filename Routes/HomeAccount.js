import express from 'express';
import { authenticationToken } from '../Middleware/auth.js';
import { deleteHomeAccount, getAllHomeAccount, postHomeAccount, updateHomeAccount } from '../Controllers/HomeAccount.js';
const router = express.Router();

router.get('/' ,authenticationToken , getAllHomeAccount)
router.post('/', authenticationToken , postHomeAccount)
router.put('/', authenticationToken , updateHomeAccount)
router.delete('/:id/:home_share_id', authenticationToken, deleteHomeAccount)



export default router
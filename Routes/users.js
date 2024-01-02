import express from 'express';
import { deleteUser, getUserForMyWongShare, getUserMyHomeShare, getUsers, putuser, userAddToWongShare } from '../Controllers/users.js';
import { authenticationToken } from '../Middleware/auth.js';
const router = express.Router();

router.get('/', authenticationToken ,getUsers);
router.delete('/:id' , authenticationToken , deleteUser)
router.put('/', authenticationToken , putuser)

// My wong share
router.post('/wong_share', authenticationToken, userAddToWongShare )
router.get('/wong_share/:user_id', authenticationToken , getUserForMyWongShare)

// My Home Share
router.get('/home_share/:user_id', authenticationToken, getUserMyHomeShare)



export default router;
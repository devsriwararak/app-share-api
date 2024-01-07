import express from 'express';
import { deleteUser, getUserForMyWongShare, getUserMyHomeShare, getUserMyWongShareByIDHome, getUsers, putuser, userAddToWongShare } from '../Controllers/users.js';
import { authenticationToken, authenticationTokenUser } from '../Middleware/auth.js';
const router = express.Router();

router.get('/', authenticationToken ,getUsers);
router.delete('/:id' , authenticationToken , deleteUser)
router.put('/', authenticationToken , putuser)

// My wong share
router.post('/wong_share', authenticationToken, userAddToWongShare )
router.get('/wong_share/:user_id', authenticationToken , getUserForMyWongShare)

// My Home Share
router.get('/home_share/:tell', authenticationTokenUser, getUserMyHomeShare)
router.get('/wong_share/:user_id/:home_share_id', authenticationTokenUser , getUserMyWongShareByIDHome)



export default router;
import express from 'express';
import { deleteUserForMyPlayList, getAllPlayList, getUserForMyPlayList, postNewDay, postNewUserFormyPlayList, postNewplay, putUpdatePlayList } from '../Controllers/Play.js';
import { authenticationToken } from '../Middleware/auth.js';
const router = express.Router();

router.post('/', authenticationToken , postNewplay)
router.get('/list', authenticationToken ,  getAllPlayList)
router.post('/list/new_day', authenticationToken,  postNewDay)
router.put('/list', authenticationToken , putUpdatePlayList )

// My Users
router.post('/list/user', authenticationToken, postNewUserFormyPlayList)
router.get('/list/user', authenticationToken, getUserForMyPlayList)
router.delete('/list/user/:id', authenticationToken , deleteUserForMyPlayList)

export default router
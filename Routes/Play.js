import express from 'express';
import { 
     deleteUserForMyPlayList, getAllPlayList, getAllPlayListMoney, getUserForMyPlayList, postNewUserFormyPlayList, postNewplay, putAddMoney, putNewDay, putUpdatePlayList, putUpdatePlayList_2 } from '../Controllers/Play.js';
import { authenticationToken } from '../Middleware/auth.js';
const router = express.Router();

router.post('/', authenticationToken , postNewplay)
router.get('/list', authenticationToken ,  getAllPlayList)
router.put('/list/new_day', authenticationToken, putNewDay)
router.put('/list', authenticationToken , putUpdatePlayList_2 )

// My Users
router.post('/list/user', authenticationToken, postNewUserFormyPlayList)
router.get('/list/user', authenticationToken, getUserForMyPlayList)
router.delete('/list/user/:id', authenticationToken , deleteUserForMyPlayList)

// Deducation
// router.post('/list/deducation', authenticationToken, PostDeducation)

// money
router.get('/list/money', authenticationToken, getAllPlayListMoney)
router.put('/list/money/:id', authenticationToken, putAddMoney)

export default router
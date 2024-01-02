import express from 'express';
import { authenticationToken } from '../Middleware/auth.js';
import { deleteMember, getByHomeShare, getMemberByHome, postMemberByHome, postNewMember, putMember, putMemberByHome } from '../Controllers/Member.js';
const router = express.Router();

router.get('/:home_share_id', authenticationToken, getByHomeShare)
router.post('/', authenticationToken , postNewMember)
router.delete('/:id', authenticationToken, deleteMember)
router.put('/', authenticationToken , putMember)

// for Home
router.get('/home/:home_share_id' , authenticationToken , getMemberByHome )
router.post('/home' , authenticationToken , postMemberByHome)
router.put('/home' , authenticationToken , putMemberByHome)


export default router
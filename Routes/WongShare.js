import express from 'express';
import { authenticationToken } from '../Middleware/auth.js';
import { deleteWongShare, getAllWongShare, getWongShareById, postWongShare, postWongShareById, putWongShare, putWongShareById } from '../Controllers/WongShare.js';
const router = express.Router();

router.get('/', authenticationToken , getAllWongShare)
router.post('/', authenticationToken, postWongShare)
router.delete('/:id', authenticationToken , deleteWongShare )
router.put('/', authenticationToken , putWongShare)

// Home Share
router.get('/home/:home_share_id', authenticationToken , getWongShareById)
router.post('/home' , authenticationToken, postWongShareById)
router.put('/home', authenticationToken , putWongShareById )


export default router
import express from 'express';
import { deleteHomeShare, getHomeShare, postHomeShare, putHomeShare } from '../Controllers/homeShare.js';
import { authenticationToken } from '../Middleware/auth.js';
const router = express.Router();

router.get('/' ,authenticationToken, getHomeShare)
router.post('/' ,authenticationToken, postHomeShare)
router.delete('/:id', authenticationToken , deleteHomeShare)
router.put('/', authenticationToken , putHomeShare)


export default router
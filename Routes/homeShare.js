import express from 'express';
import { deleteHomeShare, getHomeShare, getHomeShareById, getUsersInMYHomeShare, postHomeShare, postUserToMyHome, putHomeShare, updateStatusUserInMyHome } from '../Controllers/homeShare.js';
import { authenticationToken } from '../Middleware/auth.js';
const router = express.Router();

router.get('/' ,authenticationToken, getHomeShare)
router.get('/:id', authenticationToken , getHomeShareById)
router.post('/' ,authenticationToken, postHomeShare)
router.delete('/:id', authenticationToken , deleteHomeShare)
router.put('/', authenticationToken , putHomeShare)


// Users
router.get('/users/:home_share_id', authenticationToken , getUsersInMYHomeShare)
router.put('/users', authenticationToken , updateStatusUserInMyHome)
router.post('/users' , authenticationToken ,postUserToMyHome)

export default router
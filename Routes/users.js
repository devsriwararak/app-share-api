import express from 'express';
import { deleteUser, getUsers, putuser } from '../Controllers/users.js';
import { authenticationToken } from '../Middleware/auth.js';
const router = express.Router();

router.get('/', authenticationToken ,getUsers);
router.delete('/:id' , authenticationToken , deleteUser)
router.put('/', authenticationToken , putuser)

export default router;
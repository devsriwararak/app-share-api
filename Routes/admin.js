import express from 'express';
import { authenticationToken } from '../Middleware/auth.js';
import { getAllAdmin, putAdmin } from '../Controllers/admin.js';

const router = express.Router();

router.get('/' , authenticationToken, getAllAdmin)
router.put('/', authenticationToken , putAdmin)


export default router
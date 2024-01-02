import express from 'express';
import { postRegister } from '../Controllers/register.js';
const router = express.Router();

router.post('/', postRegister)


export default router

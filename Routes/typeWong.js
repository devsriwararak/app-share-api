import express from 'express';
import { getAllTypeWong } from '../Controllers/typeWong.js';
const router = express.Router();

router.get('/', getAllTypeWong)


export default router

import express from 'express';
import { getAntiCorruptionNews } from '../controllers/newsController';
const router = express.Router();
router.get('/', getAntiCorruptionNews);
export default router;

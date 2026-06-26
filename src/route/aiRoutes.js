import express from 'express';
import { chatWithAi } from '../controller/aiController';
const router = express.Router();

router.post('/chat', chatWithAi);
export default router;
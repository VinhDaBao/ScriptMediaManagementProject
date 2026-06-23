import express from 'express';
import ttsController from '../controller/ttsController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/synthesize', authMiddleware, ttsController.synthesize);
router.get('/voices', authMiddleware, ttsController.getVoices);

export default router;

import express from 'express';
import blockController from '../controller/blockController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import { authorizeWorkspace } from '../middlewares/authorMiddleware.js';

const router = express.Router({ mergeParams: true });

router.post('/', authMiddleware, authorizeWorkspace("EDITOR"), blockController.createBlock);
router.get('/', authMiddleware, authorizeWorkspace("VIEWER"), blockController.getAllBlocks);
router.get('/:id', authMiddleware, authorizeWorkspace("VIEWER"), blockController.getBlockById);
router.put('/:id', authMiddleware, authorizeWorkspace("EDITOR"), blockController.updateBlock);
router.delete('/:id', authMiddleware, authorizeWorkspace("EDITOR"), blockController.deleteBlock);

export default router;
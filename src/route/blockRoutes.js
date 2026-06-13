import express from 'express';
import blockController from '../controller/blockController.js';

const router = express.Router();

router.post('/', blockController.createBlock);
router.get('/', blockController.getAllBlocks);
router.get('/:id', blockController.getBlockById);
router.put('/:id', blockController.updateBlock);
router.delete('/:id', blockController.deleteBlock);

export default router;
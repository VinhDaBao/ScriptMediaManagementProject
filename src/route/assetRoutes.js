import express from 'express';
import { uploadAsset, getAllAssets, getWorkspaceTags, updateAsset, deleteAsset } from '../controller/assetController.js';
import uploadCloud from '../config/cloudinary.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();
router.post('/upload', authMiddleware, uploadCloud.single('fileMedia'), uploadAsset);
router.get('/', authMiddleware, getAllAssets);
router.get('/tags', authMiddleware, getWorkspaceTags);
router.put('/:id', authMiddleware, updateAsset);
router.delete('/:id', authMiddleware, deleteAsset);
export default router;
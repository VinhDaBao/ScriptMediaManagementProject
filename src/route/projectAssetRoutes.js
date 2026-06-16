import express from 'express';
import projectAssetController from '../controller/projectAssetController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import { authorizeWorkspace } from '../middlewares/authorMiddleware.js';

const router = express.Router({ mergeParams: true });

router.post('/', authMiddleware, authorizeWorkspace("EDITOR"), projectAssetController.createProjectAsset);
router.post('/attach', authMiddleware, authorizeWorkspace("EDITOR"), projectAssetController.attachAssets);
router.get('/', authMiddleware, authorizeWorkspace("VIEWER"), projectAssetController.getAllProjectAssets);
router.get('/:id', authMiddleware, authorizeWorkspace("VIEWER"), projectAssetController.getProjectAssetById);
router.put('/:id', authMiddleware, authorizeWorkspace("EDITOR"), projectAssetController.updateProjectAsset);
router.delete('/:id', authMiddleware, authorizeWorkspace("EDITOR"), projectAssetController.deleteProjectAsset);

export default router;
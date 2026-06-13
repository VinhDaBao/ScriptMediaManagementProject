import express from 'express';
import projectAssetController from '../controller/projectAssetController.js';

const router = express.Router();

router.post('/', projectAssetController.createProjectAsset);
router.get('/', projectAssetController.getAllProjectAssets);
router.get('/:id', projectAssetController.getProjectAssetById);
router.put('/:id', projectAssetController.updateProjectAsset);
router.delete('/:id', projectAssetController.deleteProjectAsset);

export default router;
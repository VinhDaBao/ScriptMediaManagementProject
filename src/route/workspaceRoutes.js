import express from 'express';
import workspaceController from '../controller/workspaceController.js';

const router = express.Router();

router.post('/', workspaceController.createWorkspace);
router.get('/', workspaceController.getAllWorkspaces);
router.get('/:id', workspaceController.getWorkspaceById);
router.put('/:id', workspaceController.updateWorkspace);
router.delete('/:id', workspaceController.deleteWorkspace);

export default router;
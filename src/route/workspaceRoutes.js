import express from 'express';
import workspaceController from '../controller/workspaceController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware, workspaceController.createWorkspace);
router.get('/', authMiddleware, workspaceController.getAllWorkspaces);
router.get('/:id', authMiddleware, workspaceController.getWorkspaceById);
router.put('/:id', authMiddleware, workspaceController.updateWorkspace);
router.delete('/:id', authMiddleware, workspaceController.deleteWorkspace);

export default router;
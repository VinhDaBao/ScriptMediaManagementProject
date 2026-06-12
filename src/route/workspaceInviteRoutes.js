import express from 'express';
import workspaceInviteController from '../controller/workspaceInviteController.js';

const router = express.Router();

router.post('/', workspaceInviteController.createWorkspaceInvite);
router.get('/', workspaceInviteController.getAllWorkspaceInvites);
router.get('/:id', workspaceInviteController.getWorkspaceInviteById);
router.put('/:id', workspaceInviteController.updateWorkspaceInvite);
router.delete('/:id', workspaceInviteController.deleteWorkspaceInvite);

export default router;
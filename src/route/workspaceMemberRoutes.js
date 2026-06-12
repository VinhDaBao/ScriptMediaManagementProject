import express from 'express';
import workspaceMemberController from '../controller/workspaceMemberController.js';

const router = express.Router();

router.post('/', workspaceMemberController.createWorkspaceMember);
router.get('/', workspaceMemberController.getAllWorkspaceMembers);
router.get('/:id', workspaceMemberController.getWorkspaceMemberById);
router.put('/:id', workspaceMemberController.updateWorkspaceMember);
router.delete('/:id', workspaceMemberController.deleteWorkspaceMember);

export default router;
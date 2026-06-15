import express from 'express';
import {getMembers, changeRole, removeMember, leaveWorkspace} from '../controller/workspaceMemberController.js';
import {authorizeWorkspace} from '../middlewares/authorMiddleware.js';
import authMiddleware from '../middlewares/authMiddleware.js';
const router = express.Router();

router.get("/:workspaceId/members",authMiddleware, authorizeWorkspace("VIEWER"), getMembers);

router.patch("/:workspaceId/members/:memberId/role", authMiddleware, authorizeWorkspace("OWNER"), changeRole);

router.delete("/:workspaceId/members/:memberId", authMiddleware, authorizeWorkspace("OWNER"), removeMember);
router.post("/:workspaceId/leave", authMiddleware, authorizeWorkspace("VIEWER"), leaveWorkspace);

export default router;
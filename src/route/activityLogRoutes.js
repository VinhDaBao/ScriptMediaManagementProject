import express from 'express';
import activityLogController from '../controller/activityLogController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import { authorizeWorkspace } from '../middlewares/authorMiddleware.js';

const router = express.Router();

router.get('/:workspaceId/activity-logs', authMiddleware, authorizeWorkspace("VIEWER"), activityLogController.getWorkspaceLogs);

export default router;

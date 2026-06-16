import express from 'express';
import projectSnapshotController from '../controller/projectSnapshotController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import { authorizeWorkspace } from '../middlewares/authorMiddleware.js';

const router = express.Router({ mergeParams: true });

router.post('/:projectId/snapshots', authMiddleware, authorizeWorkspace("EDITOR"), projectSnapshotController.createSnapshot);
router.get('/:projectId/snapshots', authMiddleware, authorizeWorkspace("VIEWER"), projectSnapshotController.getProjectSnapshots);
router.post('/:projectId/snapshots/:snapshotId/restore', authMiddleware, authorizeWorkspace("EDITOR"), projectSnapshotController.restoreSnapshot);

export default router;

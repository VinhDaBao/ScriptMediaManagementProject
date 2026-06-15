import express from 'express';
import projectController from '../controller/projectController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import { authorizeWorkspace } from '../middlewares/authorMiddleware.js';

const router = express.Router({ mergeParams: true });

router.post('/', authMiddleware, authorizeWorkspace("ADMIN"), projectController.createProject);
router.get('/', authMiddleware, authorizeWorkspace("VIEWER"), projectController.getAllProjects);
router.get('/:id', authMiddleware, authorizeWorkspace("VIEWER"), projectController.getProjectById);
router.put('/:id', authMiddleware, authorizeWorkspace("ADMIN"), projectController.updateProject);
router.delete('/:id', authMiddleware, authorizeWorkspace("ADMIN"), projectController.deleteProject);
router.post('/:id/duplicate', authMiddleware, authorizeWorkspace("ADMIN"), projectController.duplicateProject);

export default router;
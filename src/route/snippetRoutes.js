import express from 'express';
import snippetController from '../controller/snippetController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import { authorizeWorkspace } from '../middlewares/authorMiddleware.js';

const router = express.Router({ mergeParams: true });

router.post('/', authMiddleware, authorizeWorkspace("EDITOR"), snippetController.createSnippet);
router.get('/', authMiddleware, authorizeWorkspace("VIEWER"), snippetController.getAllSnippets);
router.get('/:id', authMiddleware, authorizeWorkspace("VIEWER"), snippetController.getSnippetById);
router.put('/:id', authMiddleware, authorizeWorkspace("EDITOR"), snippetController.updateSnippet);
router.delete('/:id', authMiddleware, authorizeWorkspace("EDITOR"), snippetController.deleteSnippet);

export default router;
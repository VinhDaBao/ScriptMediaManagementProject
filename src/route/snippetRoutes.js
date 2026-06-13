import express from 'express';
import snippetController from '../controller/snippetController.js';

const router = express.Router();

router.post('/', snippetController.createSnippet);
router.get('/', snippetController.getAllSnippets);
router.get('/:id', snippetController.getSnippetById);
router.put('/:id', snippetController.updateSnippet);
router.delete('/:id', snippetController.deleteSnippet);

export default router;
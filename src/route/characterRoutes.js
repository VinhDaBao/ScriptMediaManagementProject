import express from 'express';
import characterController from '../controller/characterController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import { authorizeWorkspace } from '../middlewares/authorMiddleware.js';

const router = express.Router({ mergeParams: true });

router.post('/', authMiddleware, authorizeWorkspace("EDITOR"), characterController.createCharacter);
router.get('/', authMiddleware, authorizeWorkspace("VIEWER"), characterController.getAllCharacters);
router.get('/:id', authMiddleware, authorizeWorkspace("VIEWER"), characterController.getCharacterById);
router.put('/:id', authMiddleware, authorizeWorkspace("EDITOR"), characterController.updateCharacter);

export default router;
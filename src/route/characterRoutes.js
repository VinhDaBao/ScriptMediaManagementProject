import express from 'express';
import characterController from '../controller/characterController.js';

const router = express.Router();

router.post('/', characterController.createCharacter);
router.get('/', characterController.getAllCharacters);
router.get('/:id', characterController.getCharacterById);
router.put('/:id', characterController.updateCharacter);
router.delete('/:id', characterController.deleteCharacter);

export default router;
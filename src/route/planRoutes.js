import express from 'express';
import planController from '../controller/planController.js';

const router = express.Router();

router.post('/', planController.createPlan);
router.get('/', planController.getAllPlans);
router.get('/:id', planController.getPlanById);
router.put('/:id', planController.updatePlan);
router.delete('/:id', planController.deletePlan);

export default router;
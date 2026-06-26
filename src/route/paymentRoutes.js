import express from 'express';
import paymentController from '../controller/paymentController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', paymentController.createPayment);
router.get('/', paymentController.getAllPayments);
router.get('/:id', paymentController.getPaymentById);
router.put('/:id', paymentController.updatePayment);
router.delete('/:id', paymentController.deletePayment);
router.post('/create-payos-link', authMiddleware, paymentController.createPayOSLink);
router.post('/webhook', paymentController.handleWebhook);

export default router;
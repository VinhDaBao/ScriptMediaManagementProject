import paymentService from '../services/paymentService.js';

const sendError = (res, error) => {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ errCode: 1, message: error.message || 'Internal server error' });
};

const createPayment = async (req, res) => {
    try {
        const payment = await paymentService.createPayment(req.body);
        return res.status(201).json({ errCode: 0, message: 'Payment created successfully', data: payment });
    } catch (error) {
        return sendError(res, error);
    }
};

const getAllPayments = async (req, res) => {
    try {
        const payments = await paymentService.getAllPayments();
        return res.status(200).json({ errCode: 0, message: 'Payments fetched successfully', data: payments });
    } catch (error) {
        return sendError(res, error);
    }
};

const getPaymentById = async (req, res) => {
    try {
        const payment = await paymentService.getPaymentById(req.params.id);
        return res.status(200).json({ errCode: 0, message: 'Payment fetched successfully', data: payment });
    } catch (error) {
        return sendError(res, error);
    }
};

const updatePayment = async (req, res) => {
    try {
        const payment = await paymentService.updatePayment(req.params.id, req.body);
        return res.status(200).json({ errCode: 0, message: 'Payment updated successfully', data: payment });
    } catch (error) {
        return sendError(res, error);
    }
};

const deletePayment = async (req, res) => {
    try {
        await paymentService.deletePayment(req.params.id);
        return res.status(200).json({ errCode: 0, message: 'Payment deleted successfully' });
    } catch (error) {
        return sendError(res, error);
    }
};

const createPayOSLink = async (req, res) => {
    try {
        const { planId, amount } = req.body;
        const userId = req.user._id || req.user.id;

        const linkData = await paymentService.createPayOSLink(
            userId,
            planId,
            amount
        );

        return res.status(200).json({
            errCode: 0,
            data: linkData
        });
    } catch (error) {
        console.error("ERROR WHILE CREATING PAYOS LINK:", error);
        return res.status(500).json({
            errCode: 1,
            message: error.message
        });
    }
};

const handleWebhook = async (req, res) => {
    try {
        await paymentService.handlePayOSWebhook(req.body);

        return res.status(200).json({
            errCode: 0,
            message: 'Webhook processed.'
        });
    } catch (error) {
        return res.status(200).json({
            errCode: 1,
            message: error.message
        });
    }
};

export default {
    createPayment,
    getAllPayments,
    getPaymentById,
    updatePayment,
    deletePayment,
    createPayOSLink,
    handleWebhook
};
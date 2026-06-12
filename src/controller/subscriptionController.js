import subscriptionService from '../services/subscriptionService.js';

const sendError = (res, error) => {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ errCode: 1, message: error.message || 'Internal server error' });
};

const createSubscription = async (req, res) => {
    try {
        const subscription = await subscriptionService.createSubscription(req.body);
        return res.status(201).json({ errCode: 0, message: 'Subscription created successfully', data: subscription });
    } catch (error) {
        return sendError(res, error);
    }
};

const getAllSubscriptions = async (req, res) => {
    try {
        const subscriptions = await subscriptionService.getAllSubscriptions();
        return res.status(200).json({ errCode: 0, message: 'Subscriptions fetched successfully', data: subscriptions });
    } catch (error) {
        return sendError(res, error);
    }
};

const getSubscriptionById = async (req, res) => {
    try {
        const subscription = await subscriptionService.getSubscriptionById(req.params.id);
        return res.status(200).json({ errCode: 0, message: 'Subscription fetched successfully', data: subscription });
    } catch (error) {
        return sendError(res, error);
    }
};

const updateSubscription = async (req, res) => {
    try {
        const subscription = await subscriptionService.updateSubscription(req.params.id, req.body);
        return res.status(200).json({ errCode: 0, message: 'Subscription updated successfully', data: subscription });
    } catch (error) {
        return sendError(res, error);
    }
};

const deleteSubscription = async (req, res) => {
    try {
        await subscriptionService.deleteSubscription(req.params.id);
        return res.status(200).json({ errCode: 0, message: 'Subscription deleted successfully' });
    } catch (error) {
        return sendError(res, error);
    }
};

export default {
    createSubscription,
    getAllSubscriptions,
    getSubscriptionById,
    updateSubscription,
    deleteSubscription,
};
import planService from '../services/planService.js';

const sendError = (res, error) => {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ errCode: 1, message: error.message || 'Internal server error' });
};

const createPlan = async (req, res) => {
    try {
        const plan = await planService.createPlan(req.body);
        return res.status(201).json({ errCode: 0, message: 'Plan created successfully', data: plan });
    } catch (error) {
        return sendError(res, error);
    }
};

const getAllPlans = async (req, res) => {
    try {
        const plans = await planService.getAllPlans();
        return res.status(200).json({ errCode: 0, message: 'Plans fetched successfully', data: plans });
    } catch (error) {
        return sendError(res, error);
    }
};

const getPlanById = async (req, res) => {
    try {
        const plan = await planService.getPlanById(req.params.id);
        return res.status(200).json({ errCode: 0, message: 'Plan fetched successfully', data: plan });
    } catch (error) {
        return sendError(res, error);
    }
};

const updatePlan = async (req, res) => {
    try {
        const plan = await planService.updatePlan(req.params.id, req.body);
        return res.status(200).json({ errCode: 0, message: 'Plan updated successfully', data: plan });
    } catch (error) {
        return sendError(res, error);
    }
};

const deletePlan = async (req, res) => {
    try {
        await planService.deletePlan(req.params.id);
        return res.status(200).json({ errCode: 0, message: 'Plan deleted successfully' });
    } catch (error) {
        return sendError(res, error);
    }
};

export default {
    createPlan,
    getAllPlans,
    getPlanById,
    updatePlan,
    deletePlan,
};
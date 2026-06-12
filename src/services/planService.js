import mongoose from 'mongoose';
import Plan from '../models/plan.js';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const buildValidationError = (message) => {
    const error = new Error(message);
    error.statusCode = 400;
    return error;
};

const createPlan = async (data) => {
    if (!data?.name) {
        throw buildValidationError('Missing required field: name');
    }

    if (data.price === undefined || data.price === null || data.price === '') {
        throw buildValidationError('Missing required field: price');
    }

    return await Plan.create({
        name: data.name,
        price: data.price,
        limits: data.limits ?? {},
        features: Array.isArray(data.features) ? data.features : [],
    });
};

const getAllPlans = async () => {
    return await Plan.find({}).sort({ createdAt: -1 });
};

const getPlanById = async (id) => {
    if (!isValidObjectId(id)) {
        throw buildValidationError('Invalid plan id');
    }

    const plan = await Plan.findById(id);

    if (!plan) {
        const error = new Error('Plan not found');
        error.statusCode = 404;
        throw error;
    }

    return plan;
};

const updatePlan = async (id, data) => {
    if (!isValidObjectId(id)) {
        throw buildValidationError('Invalid plan id');
    }

    const plan = await Plan.findById(id);

    if (!plan) {
        const error = new Error('Plan not found');
        error.statusCode = 404;
        throw error;
    }

    if (data.name !== undefined) plan.name = data.name;
    if (data.price !== undefined) plan.price = data.price;
    if (data.limits !== undefined) plan.limits = data.limits;
    if (data.features !== undefined) plan.features = Array.isArray(data.features) ? data.features : [];

    return await plan.save();
};

const deletePlan = async (id) => {
    if (!isValidObjectId(id)) {
        throw buildValidationError('Invalid plan id');
    }

    const plan = await Plan.findById(id);

    if (!plan) {
        const error = new Error('Plan not found');
        error.statusCode = 404;
        throw error;
    }

    await plan.deleteOne();
    return { deleted: true };
};

export default {
    createPlan,
    getAllPlans,
    getPlanById,
    updatePlan,
    deletePlan,
};
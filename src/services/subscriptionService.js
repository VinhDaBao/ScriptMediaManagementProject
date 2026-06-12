import mongoose from 'mongoose';
import Subscription from '../models/subscription.js';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const buildValidationError = (message) => {
    const error = new Error(message);
    error.statusCode = 400;
    return error;
};

const createSubscription = async (data) => {
    const requiredFields = ['userId', 'planId'];
    const missingField = requiredFields.find((field) => !data?.[field]);

    if (missingField) {
        throw buildValidationError(`Missing required field: ${missingField}`);
    }

    if (!isValidObjectId(data.userId)) {
        throw buildValidationError('Invalid userId');
    }

    if (!isValidObjectId(data.planId)) {
        throw buildValidationError('Invalid planId');
    }

    return await Subscription.create({
        userId: data.userId,
        planId: data.planId,
        status: data.status ?? 'ACTIVE',
        startDate: data.startDate,
        endDate: data.endDate,
        autoRenew: data.autoRenew ?? false,
    });
};

const getAllSubscriptions = async () => {
    return await Subscription.find({}).sort({ createdAt: -1 });
};

const getSubscriptionById = async (id) => {
    if (!isValidObjectId(id)) {
        throw buildValidationError('Invalid subscription id');
    }

    const subscription = await Subscription.findById(id);

    if (!subscription) {
        const error = new Error('Subscription not found');
        error.statusCode = 404;
        throw error;
    }

    return subscription;
};

const updateSubscription = async (id, data) => {
    if (!isValidObjectId(id)) {
        throw buildValidationError('Invalid subscription id');
    }

    const subscription = await Subscription.findById(id);

    if (!subscription) {
        const error = new Error('Subscription not found');
        error.statusCode = 404;
        throw error;
    }

    if (data.userId !== undefined) {
        if (!isValidObjectId(data.userId)) {
            throw buildValidationError('Invalid userId');
        }
        subscription.userId = data.userId;
    }

    if (data.planId !== undefined) {
        if (!isValidObjectId(data.planId)) {
            throw buildValidationError('Invalid planId');
        }
        subscription.planId = data.planId;
    }

    if (data.status !== undefined) subscription.status = data.status;
    if (data.startDate !== undefined) subscription.startDate = data.startDate;
    if (data.endDate !== undefined) subscription.endDate = data.endDate;
    if (data.autoRenew !== undefined) subscription.autoRenew = data.autoRenew;

    return await subscription.save();
};

const deleteSubscription = async (id) => {
    if (!isValidObjectId(id)) {
        throw buildValidationError('Invalid subscription id');
    }

    const subscription = await Subscription.findById(id);

    if (!subscription) {
        const error = new Error('Subscription not found');
        error.statusCode = 404;
        throw error;
    }

    await subscription.deleteOne();
    return { deleted: true };
};

export default {
    createSubscription,
    getAllSubscriptions,
    getSubscriptionById,
    updateSubscription,
    deleteSubscription,
};
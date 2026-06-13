import mongoose from 'mongoose';
import Payment from '../models/payment.js';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const buildValidationError = (message) => {
    const error = new Error(message);
    error.statusCode = 400;
    return error;
};

const createPayment = async (data) => {
    const requiredFields = ['userId', 'amount', 'method'];
    const missingField = requiredFields.find((field) => data?.[field] === undefined || data?.[field] === null || data?.[field] === '');

    if (missingField) {
        throw buildValidationError(`Missing required field: ${missingField}`);
    }

    if (!isValidObjectId(data.userId)) {
        throw buildValidationError('Invalid userId');
    }

    if (data.subscriptionId !== undefined && data.subscriptionId !== null && data.subscriptionId !== '' && !isValidObjectId(data.subscriptionId)) {
        throw buildValidationError('Invalid subscriptionId');
    }

    return await Payment.create({
        userId: data.userId,
        subscriptionId: data.subscriptionId,
        amount: data.amount,
        method: data.method,
        status: data.status ?? 'SUCCESS',
        transactionRef: data.transactionRef,
    });
};

const getAllPayments = async () => {
    return await Payment.find({}).sort({ createdAt: -1 });
};

const getPaymentById = async (id) => {
    if (!isValidObjectId(id)) {
        throw buildValidationError('Invalid payment id');
    }

    const payment = await Payment.findById(id);

    if (!payment) {
        const error = new Error('Payment not found');
        error.statusCode = 404;
        throw error;
    }

    return payment;
};

const updatePayment = async (id, data) => {
    if (!isValidObjectId(id)) {
        throw buildValidationError('Invalid payment id');
    }

    const payment = await Payment.findById(id);

    if (!payment) {
        const error = new Error('Payment not found');
        error.statusCode = 404;
        throw error;
    }

    if (data.userId !== undefined) {
        if (!isValidObjectId(data.userId)) {
            throw buildValidationError('Invalid userId');
        }
        payment.userId = data.userId;
    }

    if (data.subscriptionId !== undefined) {
        if (data.subscriptionId !== null && data.subscriptionId !== '' && !isValidObjectId(data.subscriptionId)) {
            throw buildValidationError('Invalid subscriptionId');
        }
        payment.subscriptionId = data.subscriptionId;
    }

    if (data.amount !== undefined) payment.amount = data.amount;
    if (data.method !== undefined) payment.method = data.method;
    if (data.status !== undefined) payment.status = data.status;
    if (data.transactionRef !== undefined) payment.transactionRef = data.transactionRef;

    return await payment.save();
};

const deletePayment = async (id) => {
    if (!isValidObjectId(id)) {
        throw buildValidationError('Invalid payment id');
    }

    const payment = await Payment.findById(id);

    if (!payment) {
        const error = new Error('Payment not found');
        error.statusCode = 404;
        throw error;
    }

    await payment.deleteOne();
    return { deleted: true };
};

export default {
    createPayment,
    getAllPayments,
    getPaymentById,
    updatePayment,
    deletePayment,
};
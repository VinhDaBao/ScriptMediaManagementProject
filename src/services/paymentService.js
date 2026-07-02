import mongoose from 'mongoose';
import Payment from '../models/payment.js';
import Subscription from '../models/subscription.js';
import Plan from '../models/plan.js';
import dotenv from 'dotenv';
import payOS from '../config/payos.js';

dotenv.config();

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const buildValidationError = (message) => {
    const error = new Error(message);
    error.statusCode = 400;
    return error;
};

// 1. KHÔI PHỤC LẠI HÀM GỐC
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
        planId: data.planId,
        planSnapshot: data.planSnapshot,
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

// 2. HÀM TẠO LINK PAYOS CHUẨN
const createPayOSLink = async (userId, planId, amount) => {
    const plan = await Plan.findById(planId);
    if (!plan) {
        throw new Error('This service plan could not be found in the system.');
    }

    const orderCode = Number(String(Date.now()).slice(-6) + Math.floor(Math.random() * 100));

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    const body = {
        orderCode: orderCode,
        amount: amount,
        description: `Nang cap ${orderCode}`, 
        cancelUrl: `${frontendUrl}/workspace/settings?status=cancel`,
        returnUrl: `${frontendUrl}/workspace/settings?status=success`
    };

    const paymentLinkResponse = await payOS.paymentRequests.create(body);

    await Payment.create({
        userId: userId,
        planId: planId,
        amount: amount,
        method: 'PAYOS',
        status: 'PENDING',
        transactionRef: String(orderCode),
        planSnapshot: {
            name: plan.name,
            price: plan.price
        }
    });

    return paymentLinkResponse;
};

// 3. HÀM XỬ LÝ WEBHOOK KHI KHÁCH QUÉT MÃ XONG
const handlePayOSWebhook = async (webhookBody) => {
    try {
        const webhookData = await payOS.webhooks.verify(webhookBody);

        if (webhookData.code === '00') {
            const orderCode = webhookData.orderCode;

            const payment = await Payment.findOne({ transactionRef: String(orderCode) });

            if (!payment || payment.status === 'SUCCESS') {
                return { status: 'Ignored' };
            }

            payment.status = 'SUCCESS';
            await payment.save();

            let subscription = await Subscription.findOne({
                userId: payment.userId,
                status: 'ACTIVE'
            });

            const now = new Date();
            const expireDate = new Date();
            expireDate.setDate(now.getDate() + 30);

            if (subscription) {
                subscription.planId = payment.planId;
                subscription.endDate = expireDate;
            } else {
                subscription = await Subscription.create({
                    userId: payment.userId,
                    planId: payment.planId,
                    status: 'ACTIVE',
                    startDate: now,
                    endDate: expireDate
                });
            }

            await subscription.save();

            return { success: true };
        }
    } catch (error) {
        console.error('PayOS webhook error:', error);
        throw error;
    }
};

export default {
    createPayment,
    getAllPayments,
    getPaymentById,
    createPayOSLink,
    handlePayOSWebhook,
    updatePayment,
    deletePayment,
};
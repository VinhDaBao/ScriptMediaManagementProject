import mongoose from 'mongoose';
import Notification from '../models/notification.js';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const buildValidationError = (message) => {
    const error = new Error(message);
    error.statusCode = 400;
    return error;
};

const createNotification = async (data) => {
    const requiredFields = ['userId', 'type', 'title'];
    const missingField = requiredFields.find((field) => !data?.[field]);

    if (missingField) {
        throw buildValidationError(`Missing required field: ${missingField}`);
    }

    if (!isValidObjectId(data.userId)) {
        throw buildValidationError('Invalid userId');
    }

    if (data.workspaceId !== undefined && data.workspaceId !== null && data.workspaceId !== '' && !isValidObjectId(data.workspaceId)) {
        throw buildValidationError('Invalid workspaceId');
    }

    return await Notification.create({
        userId: data.userId,
        workspaceId: data.workspaceId,
        type: data.type,
        title: data.title,
        message: data.message ?? '',
        isRead: data.isRead ?? false,
    });
};

const getAllNotifications = async () => {
    return await Notification.find({}).sort({ createdAt: -1 });
};

const getNotificationById = async (id) => {
    if (!isValidObjectId(id)) {
        throw buildValidationError('Invalid notification id');
    }

    const notification = await Notification.findById(id);

    if (!notification) {
        const error = new Error('Notification not found');
        error.statusCode = 404;
        throw error;
    }

    return notification;
};

const updateNotification = async (id, data) => {
    if (!isValidObjectId(id)) {
        throw buildValidationError('Invalid notification id');
    }

    const notification = await Notification.findById(id);

    if (!notification) {
        const error = new Error('Notification not found');
        error.statusCode = 404;
        throw error;
    }

    if (data.userId !== undefined) {
        if (!isValidObjectId(data.userId)) {
            throw buildValidationError('Invalid userId');
        }
        notification.userId = data.userId;
    }

    if (data.workspaceId !== undefined) {
        if (data.workspaceId !== null && data.workspaceId !== '' && !isValidObjectId(data.workspaceId)) {
            throw buildValidationError('Invalid workspaceId');
        }
        notification.workspaceId = data.workspaceId;
    }

    if (data.type !== undefined) notification.type = data.type;
    if (data.title !== undefined) notification.title = data.title;
    if (data.message !== undefined) notification.message = data.message;
    if (data.isRead !== undefined) notification.isRead = data.isRead;

    return await notification.save();
};

const deleteNotification = async (id) => {
    if (!isValidObjectId(id)) {
        throw buildValidationError('Invalid notification id');
    }

    const notification = await Notification.findById(id);

    if (!notification) {
        const error = new Error('Notification not found');
        error.statusCode = 404;
        throw error;
    }

    await notification.deleteOne();
    return { deleted: true };
};

export default {
    createNotification,
    getAllNotifications,
    getNotificationById,
    updateNotification,
    deleteNotification,
};
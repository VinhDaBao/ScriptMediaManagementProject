import mongoose from 'mongoose';
import Notification from '../models/notification.js';
import User from '../models/user.js';
import WorkspaceMember from '../models/workspacemember.js';
import socketService from './socketService.js';

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
        navigate: data.navigate ?? '',
        isRead: data.isRead ?? false,
    });
};

const getUserNotifications = async (userId, page = 1, limit = 10) => {
    if (!isValidObjectId(userId)) {
        throw buildValidationError('Invalid userId');
    }

    const skip = (page - 1) * limit;
    const [notifications, total, unreadCount] = await Promise.all([
        Notification.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
        Notification.countDocuments({ userId }),
        Notification.countDocuments({ userId, isRead: false })
    ]);

    return {
        notifications,
        pagination: {
            page: Number(page),
            limit: Number(limit),
            totalItems: total,
            totalPages: Math.ceil(total / limit),
            unreadCount
        }
    };
};

const markAllAsRead = async (userId) => {
    if (!isValidObjectId(userId)) {
        throw buildValidationError('Invalid userId');
    }
    return await Notification.updateMany({ userId, isRead: false }, { isRead: true });
};

const sendNotificationToUser = async ({ userId, workspaceId, type, title, message, navigate }) => {
    if (!isValidObjectId(userId)) {
        throw buildValidationError('Invalid userId');
    }

    const notification = await Notification.create({
        userId,
        workspaceId,
        type,
        title,
        message: message ?? '',
        navigate: navigate ?? '',
        isRead: false,
    });

    socketService.sendToUser(userId, 'new-notification', notification);
    return notification;
};

const sendNotificationToWorkspace = async ({ workspaceId, type, title, message, navigate, excludeUserId }) => {
    if (!isValidObjectId(workspaceId)) {
        throw buildValidationError('Invalid workspaceId');
    }

    const members = await WorkspaceMember.find({ workspaceId });
    if (members.length === 0) return [];

    const targetMembers = members.filter(
        (m) => !excludeUserId || String(m.userId) !== String(excludeUserId)
    );

    if (targetMembers.length === 0) return [];

    const notificationDocs = targetMembers.map((m) => ({
        userId: m.userId,
        workspaceId,
        type,
        title,
        message: message ?? '',
        navigate: navigate ?? '',
        isRead: false,
    }));

    const createdNotifications = await Notification.insertMany(notificationDocs);

    // Emit live socket event to all workspace members
    createdNotifications.forEach((notification) => {
        socketService.sendToUser(notification.userId, 'new-notification', notification);
    });

    return createdNotifications;
};

const sendSystemNotification = async (title, message) => {
    const users = await User.find({}, '_id');
    if (users.length === 0) return [];

    const notificationDocs = users.map((u) => ({
        userId: u._id,
        type: 'SYSTEM',
        title,
        message: message ?? '',
        navigate: '',
        isRead: false,
    }));

    const createdNotifications = await Notification.insertMany(notificationDocs);

    // Broadcast to all active users via Socket.IO
    socketService.broadcast('new-notification', {
        type: 'SYSTEM',
        title,
        message,
        createdAt: new Date(),
    });

    return createdNotifications;
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
    if (data.navigate !== undefined) notification.navigate = data.navigate;
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
    getUserNotifications,
    markAllAsRead,
    sendNotificationToUser,
    sendNotificationToWorkspace,
    sendSystemNotification,
    getAllNotifications,
    getNotificationById,
    updateNotification,
    deleteNotification,
};
import notificationService from '../services/notificationService.js';

const sendError = (res, error) => {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ errCode: 1, message: error.message || 'Internal server error' });
};

const createNotification = async (req, res) => {
    try {
        const notification = await notificationService.createNotification(req.body);
        return res.status(201).json({ errCode: 0, message: 'Notification created successfully', data: notification });
    } catch (error) {
        return sendError(res, error);
    }
};

const getUserNotifications = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const userId = req.user.id;

        const result = await notificationService.getUserNotifications(userId, page, limit);
        return res.status(200).json({
            errCode: 0,
            message: 'Notifications fetched successfully',
            data: result.notifications,
            pagination: result.pagination
        });
    } catch (error) {
        return sendError(res, error);
    }
};

const markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        await notificationService.markAllAsRead(userId);
        return res.status(200).json({ errCode: 0, message: 'All notifications marked as read successfully' });
    } catch (error) {
        return sendError(res, error);
    }
};

const sendSystemNotification = async (req, res) => {
    try {
        const { title, message } = req.body;
        if (!title || !message) {
            return res.status(400).json({ errCode: 1, message: 'Title and message are required' });
        }
        const notifications = await notificationService.sendSystemNotification(title, message);
        return res.status(201).json({
            errCode: 0,
            message: 'System notification sent to all users successfully',
            data: notifications
        });
    } catch (error) {
        return sendError(res, error);
    }
};

const getAllNotifications = async (req, res) => {
    try {
        const notifications = await notificationService.getAllNotifications();
        return res.status(200).json({ errCode: 0, message: 'Notifications fetched successfully', data: notifications });
    } catch (error) {
        return sendError(res, error);
    }
};

const getNotificationById = async (req, res) => {
    try {
        const notification = await notificationService.getNotificationById(req.params.id);
        return res.status(200).json({ errCode: 0, message: 'Notification fetched successfully', data: notification });
    } catch (error) {
        return sendError(res, error);
    }
};

const updateNotification = async (req, res) => {
    try {
        const notification = await notificationService.updateNotification(req.params.id, req.body);
        return res.status(200).json({ errCode: 0, message: 'Notification updated successfully', data: notification });
    } catch (error) {
        return sendError(res, error);
    }
};

const deleteNotification = async (req, res) => {
    try {
        await notificationService.deleteNotification(req.params.id);
        return res.status(200).json({ errCode: 0, message: 'Notification deleted successfully' });
    } catch (error) {
        return sendError(res, error);
    }
};

export default {
    createNotification,
    getUserNotifications,
    markAllAsRead,
    sendSystemNotification,
    getAllNotifications,
    getNotificationById,
    updateNotification,
    deleteNotification,
};
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
    getAllNotifications,
    getNotificationById,
    updateNotification,
    deleteNotification,
};
import workspaceService from '../services/workspaceService.js';
import WorkspaceMember from "../models/workspacemember.js";
import notificationService from '../services/notificationService.js';

const sendError = (res, error) => {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
        errCode: 1,
        message: error.message || 'Internal server error',
    });
};

const createWorkspace = async (req, res) => {
    try {
        const workspace = await workspaceService.createWorkspace(req.body, req.user?.id);
        return res.status(201).json({ errCode: 0, message: 'Workspace created successfully', data: workspace });
    } catch (error) {
        return sendError(res, error);
    }
};

const getAllWorkspaces = async (req, res) => {
    try {
        const workspaces = await workspaceService.getAllWorkspaces(req.user?.id);
        return res.status(200).json({ errCode: 0, message: 'Workspaces fetched successfully', data: workspaces });
    } catch (error) {
        return sendError(res, error);
    }
};

const getWorkspaceById = async (req, res) => {
    try {
        const workspace = await workspaceService.getWorkspaceById(req.params.id);
        return res.status(200).json({ errCode: 0, message: 'Workspace fetched successfully', data: workspace });
    } catch (error) {
        return sendError(res, error);
    }
};

const updateWorkspace = async (req, res) => {
    try {
        const workspace = await workspaceService.updateWorkspace(req.params.id, req.body);

        // Send workspace update notification
        try {
            await notificationService.sendNotificationToWorkspace({
                workspaceId: req.params.id,
                type: "WORKSPACE",
                title: "Workspace Updated",
                message: `Workspace "${workspace.name}" has been updated.`,
                excludeUserId: req.user?.id
            });
        } catch (notiError) {
            console.error("Failed to send workspace update notification:", notiError);
        }

        return res.status(200).json({ errCode: 0, message: 'Workspace updated successfully', data: workspace });
    } catch (error) {
        return sendError(res, error);
    }
};

const deleteWorkspace = async (req, res) => {
    try {
        const workspaceId = req.params.id;

        // Notify workspace members before deletion
        try {
            await notificationService.sendNotificationToWorkspace({
                workspaceId,
                type: "WORKSPACE",
                title: "Workspace Deleted",
                message: "A workspace you were in has been deleted.",
                excludeUserId: req.user?.id
            });
        } catch (notiError) {
            console.error("Failed to send workspace delete notification:", notiError);
        }

        await workspaceService.deleteWorkspace(workspaceId);
        return res.status(200).json({ errCode: 0, message: 'Workspace deleted successfully' });
    } catch (error) {
        return sendError(res, error);
    }
};

export default {
    createWorkspace,
    getAllWorkspaces,
    getWorkspaceById,
    updateWorkspace,
    deleteWorkspace,
};
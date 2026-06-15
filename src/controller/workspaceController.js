import workspaceService from '../services/workspaceService.js';
import WorkspaceMember from "../models/WorkspaceMember.js";

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
        return res.status(200).json({ errCode: 0, message: 'Workspace updated successfully', data: workspace });
    } catch (error) {
        return sendError(res, error);
    }
};

const deleteWorkspace = async (req, res) => {
    try {
        await workspaceService.deleteWorkspace(req.params.id);
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
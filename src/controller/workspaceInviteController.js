import workspaceInviteService from '../services/workspaceInviteService.js';

const sendError = (res, error) => {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ errCode: 1, message: error.message || 'Internal server error' });
};

const createWorkspaceInvite = async (req, res) => {
    try {
        const workspaceInvite = await workspaceInviteService.createWorkspaceInvite(req.body);
        return res.status(201).json({ errCode: 0, message: 'Workspace invite created successfully', data: workspaceInvite });
    } catch (error) {
        return sendError(res, error);
    }
};

const getAllWorkspaceInvites = async (req, res) => {
    try {
        const workspaceInvites = await workspaceInviteService.getAllWorkspaceInvites();
        return res.status(200).json({ errCode: 0, message: 'Workspace invites fetched successfully', data: workspaceInvites });
    } catch (error) {
        return sendError(res, error);
    }
};

const getWorkspaceInviteById = async (req, res) => {
    try {
        const workspaceInvite = await workspaceInviteService.getWorkspaceInviteById(req.params.id);
        return res.status(200).json({ errCode: 0, message: 'Workspace invite fetched successfully', data: workspaceInvite });
    } catch (error) {
        return sendError(res, error);
    }
};

const updateWorkspaceInvite = async (req, res) => {
    try {
        const workspaceInvite = await workspaceInviteService.updateWorkspaceInvite(req.params.id, req.body);
        return res.status(200).json({ errCode: 0, message: 'Workspace invite updated successfully', data: workspaceInvite });
    } catch (error) {
        return sendError(res, error);
    }
};

const deleteWorkspaceInvite = async (req, res) => {
    try {
        await workspaceInviteService.deleteWorkspaceInvite(req.params.id);
        return res.status(200).json({ errCode: 0, message: 'Workspace invite deleted successfully' });
    } catch (error) {
        return sendError(res, error);
    }
};

export default {
    createWorkspaceInvite,
    getAllWorkspaceInvites,
    getWorkspaceInviteById,
    updateWorkspaceInvite,
    deleteWorkspaceInvite,
};
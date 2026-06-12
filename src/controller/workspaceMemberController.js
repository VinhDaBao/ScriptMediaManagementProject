import workspaceMemberService from '../services/workspaceMemberService.js';

const sendError = (res, error) => {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ errCode: 1, message: error.message || 'Internal server error' });
};

const createWorkspaceMember = async (req, res) => {
    try {
        const workspaceMember = await workspaceMemberService.createWorkspaceMember(req.body);
        return res.status(201).json({ errCode: 0, message: 'Workspace member created successfully', data: workspaceMember });
    } catch (error) {
        return sendError(res, error);
    }
};

const getAllWorkspaceMembers = async (req, res) => {
    try {
        const workspaceMembers = await workspaceMemberService.getAllWorkspaceMembers();
        return res.status(200).json({ errCode: 0, message: 'Workspace members fetched successfully', data: workspaceMembers });
    } catch (error) {
        return sendError(res, error);
    }
};

const getWorkspaceMemberById = async (req, res) => {
    try {
        const workspaceMember = await workspaceMemberService.getWorkspaceMemberById(req.params.id);
        return res.status(200).json({ errCode: 0, message: 'Workspace member fetched successfully', data: workspaceMember });
    } catch (error) {
        return sendError(res, error);
    }
};

const updateWorkspaceMember = async (req, res) => {
    try {
        const workspaceMember = await workspaceMemberService.updateWorkspaceMember(req.params.id, req.body);
        return res.status(200).json({ errCode: 0, message: 'Workspace member updated successfully', data: workspaceMember });
    } catch (error) {
        return sendError(res, error);
    }
};

const deleteWorkspaceMember = async (req, res) => {
    try {
        await workspaceMemberService.deleteWorkspaceMember(req.params.id);
        return res.status(200).json({ errCode: 0, message: 'Workspace member deleted successfully' });
    } catch (error) {
        return sendError(res, error);
    }
};

export default {
    createWorkspaceMember,
    getAllWorkspaceMembers,
    getWorkspaceMemberById,
    updateWorkspaceMember,
    deleteWorkspaceMember,
};
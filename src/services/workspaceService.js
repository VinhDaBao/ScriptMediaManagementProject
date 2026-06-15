import mongoose from 'mongoose';
import Workspace from '../models/workspace.js';
import WorkspaceMember from '../models/workspacemember.js';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const buildValidationError = (message) => {
    const error = new Error(message);
    error.statusCode = 400;
    return error;
};

const resolveOwnerId = (data, userId) => userId || data?.ownerId;

const createWorkspace = async (data, userId) => {
    const ownerId = resolveOwnerId(data, userId);
    if (!data?.name) {
        throw buildValidationError('Missing required field: name');
    }

    if (!ownerId) {
        throw buildValidationError('Missing required field: ownerId');
    }

    if (!isValidObjectId(ownerId)) {
        throw buildValidationError('Invalid ownerId');
    }

    const workspace = await Workspace.create({
        name: data.name,
        description: data.description ?? '',
        ownerId,
    });

    try {
        await WorkspaceMember.create({
            workspaceId: workspace._id,
            userId: ownerId,
            role: 'OWNER',
        });
    } catch (error) {
        await Workspace.deleteOne({ _id: workspace._id });
        throw error;
    }

    return workspace;
};

const getAllWorkspaces = async (userId) => {
    if (!isValidObjectId(userId)) {
        throw buildValidationError('Invalid user id');
    }

    const memberships = await WorkspaceMember.find({ userId })
        .populate('workspaceId')
        .sort({ createdAt: -1 });

    return memberships
        .filter((membership) => membership.workspaceId)
        .map((membership) => ({
            ...membership.workspaceId.toObject(),
            memberRole: membership.role,
        }));
};

const getWorkspaceById = async (id) => {
    if (!isValidObjectId(id)) {
        throw buildValidationError('Invalid workspace id');
    }

    const workspace = await Workspace.findById(id);

    if (!workspace) {
        const error = new Error('Workspace not found');
        error.statusCode = 404;
        throw error;
    }

    return workspace;
};

const updateWorkspace = async (id, data) => {
    if (!isValidObjectId(id)) {
        throw buildValidationError('Invalid workspace id');
    }

    const workspace = await Workspace.findById(id);

    if (!workspace) {
        const error = new Error('Workspace not found');
        error.statusCode = 404;
        throw error;
    }

    if (data.name !== undefined) workspace.name = data.name;
    if (data.description !== undefined) workspace.description = data.description;
    if (data.ownerId !== undefined) {
        if (!isValidObjectId(data.ownerId)) {
            throw buildValidationError('Invalid ownerId');
        }
        workspace.ownerId = data.ownerId;
    }

    return await workspace.save();
};

const deleteWorkspace = async (id) => {
    if (!isValidObjectId(id)) {
        throw buildValidationError('Invalid workspace id');
    }

    const workspace = await Workspace.findById(id);

    if (!workspace) {
        const error = new Error('Workspace not found');
        error.statusCode = 404;
        throw error;
    }

    await WorkspaceMember.deleteMany({ workspaceId: id });
    await workspace.deleteOne();
    return { deleted: true };
};

export default {
    createWorkspace,
    getAllWorkspaces,
    getWorkspaceById,
    updateWorkspace,
    deleteWorkspace,
};
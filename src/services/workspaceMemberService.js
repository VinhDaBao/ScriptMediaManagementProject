import mongoose from 'mongoose';
import WorkspaceMember from '../models/workspacemember.js';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const buildValidationError = (message) => {
    const error = new Error(message);
    error.statusCode = 400;
    return error;
};

const createWorkspaceMember = async (data) => {
    const requiredFields = ['workspaceId', 'userId'];
    const missingField = requiredFields.find((field) => !data?.[field]);

    if (missingField) {
        throw buildValidationError(`Missing required field: ${missingField}`);
    }

    if (!isValidObjectId(data.workspaceId)) {
        throw buildValidationError('Invalid workspaceId');
    }

    if (!isValidObjectId(data.userId)) {
        throw buildValidationError('Invalid userId');
    }

    const existingMember = await WorkspaceMember.findOne({ workspaceId: data.workspaceId, userId: data.userId });
    if (existingMember) {
        throw buildValidationError('Workspace member already exists');
    }

    return await WorkspaceMember.create({
        workspaceId: data.workspaceId,
        userId: data.userId,
        role: data.role ?? 'VIEWER',
        joinedAt: data.joinedAt,
    });
};

const getAllWorkspaceMembers = async () => {
    return await WorkspaceMember.find({}).sort({ createdAt: -1 });
};

const getWorkspaceMemberById = async (id) => {
    if (!isValidObjectId(id)) {
        throw buildValidationError('Invalid workspace member id');
    }

    const workspaceMember = await WorkspaceMember.findById(id);

    if (!workspaceMember) {
        const error = new Error('Workspace member not found');
        error.statusCode = 404;
        throw error;
    }

    return workspaceMember;
};

const updateWorkspaceMember = async (id, data) => {
    if (!isValidObjectId(id)) {
        throw buildValidationError('Invalid workspace member id');
    }

    const workspaceMember = await WorkspaceMember.findById(id);

    if (!workspaceMember) {
        const error = new Error('Workspace member not found');
        error.statusCode = 404;
        throw error;
    }

    if (data.workspaceId !== undefined) {
        if (!isValidObjectId(data.workspaceId)) {
            throw buildValidationError('Invalid workspaceId');
        }
        workspaceMember.workspaceId = data.workspaceId;
    }

    if (data.userId !== undefined) {
        if (!isValidObjectId(data.userId)) {
            throw buildValidationError('Invalid userId');
        }
        workspaceMember.userId = data.userId;
    }

    if (data.role !== undefined) workspaceMember.role = data.role;
    if (data.joinedAt !== undefined) workspaceMember.joinedAt = data.joinedAt;

    return await workspaceMember.save();
};

const deleteWorkspaceMember = async (id) => {
    if (!isValidObjectId(id)) {
        throw buildValidationError('Invalid workspace member id');
    }

    const workspaceMember = await WorkspaceMember.findById(id);

    if (!workspaceMember) {
        const error = new Error('Workspace member not found');
        error.statusCode = 404;
        throw error;
    }

    await workspaceMember.deleteOne();
    return { deleted: true };
};

export default {
    createWorkspaceMember,
    getAllWorkspaceMembers,
    getWorkspaceMemberById,
    updateWorkspaceMember,
    deleteWorkspaceMember,
};
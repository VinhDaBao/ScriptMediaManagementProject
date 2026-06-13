import mongoose from 'mongoose';
import WorkspaceInvite from '../models/workspaceinvite.js';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const buildValidationError = (message) => {
    const error = new Error(message);
    error.statusCode = 400;
    return error;
};

const createWorkspaceInvite = async (data) => {
    const requiredFields = ['workspaceId', 'email', 'token', 'expiresAt'];
    const missingField = requiredFields.find((field) => !data?.[field]);

    if (missingField) {
        throw buildValidationError(`Missing required field: ${missingField}`);
    }

    if (!isValidObjectId(data.workspaceId)) {
        throw buildValidationError('Invalid workspaceId');
    }

    const normalizedEmail = String(data.email).trim().toLowerCase();

    const existingToken = await WorkspaceInvite.findOne({ token: data.token });
    if (existingToken) {
        throw buildValidationError('Workspace invite token already exists');
    }

    const existingPendingInvite = await WorkspaceInvite.findOne({
        workspaceId: data.workspaceId,
        email: normalizedEmail,
        status: 'PENDING',
    });

    if (existingPendingInvite) {
        throw buildValidationError('Pending workspace invite already exists for this email');
    }

    return await WorkspaceInvite.create({
        workspaceId: data.workspaceId,
        email: normalizedEmail,
        role: data.role ?? 'VIEWER',
        token: data.token,
        status: data.status ?? 'PENDING',
        expiresAt: data.expiresAt,
    });
};

const getAllWorkspaceInvites = async () => {
    return await WorkspaceInvite.find({}).sort({ createdAt: -1 });
};

const getWorkspaceInviteById = async (id) => {
    if (!isValidObjectId(id)) {
        throw buildValidationError('Invalid workspace invite id');
    }

    const workspaceInvite = await WorkspaceInvite.findById(id);

    if (!workspaceInvite) {
        const error = new Error('Workspace invite not found');
        error.statusCode = 404;
        throw error;
    }

    return workspaceInvite;
};

const updateWorkspaceInvite = async (id, data) => {
    if (!isValidObjectId(id)) {
        throw buildValidationError('Invalid workspace invite id');
    }

    const workspaceInvite = await WorkspaceInvite.findById(id);

    if (!workspaceInvite) {
        const error = new Error('Workspace invite not found');
        error.statusCode = 404;
        throw error;
    }

    if (data.workspaceId !== undefined) {
        if (!isValidObjectId(data.workspaceId)) {
            throw buildValidationError('Invalid workspaceId');
        }
        workspaceInvite.workspaceId = data.workspaceId;
    }

    if (data.email !== undefined) workspaceInvite.email = String(data.email).trim().toLowerCase();
    if (data.role !== undefined) workspaceInvite.role = data.role;
    if (data.token !== undefined) workspaceInvite.token = data.token;
    if (data.status !== undefined) workspaceInvite.status = data.status;
    if (data.expiresAt !== undefined) workspaceInvite.expiresAt = data.expiresAt;

    return await workspaceInvite.save();
};

const deleteWorkspaceInvite = async (id) => {
    if (!isValidObjectId(id)) {
        throw buildValidationError('Invalid workspace invite id');
    }

    const workspaceInvite = await WorkspaceInvite.findById(id);

    if (!workspaceInvite) {
        const error = new Error('Workspace invite not found');
        error.statusCode = 404;
        throw error;
    }

    await workspaceInvite.deleteOne();
    return { deleted: true };
};

export default {
    createWorkspaceInvite,
    getAllWorkspaceInvites,
    getWorkspaceInviteById,
    updateWorkspaceInvite,
    deleteWorkspaceInvite,
};
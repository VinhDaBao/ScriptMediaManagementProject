import mongoose from 'mongoose';
import Workspace from '../models/workspace.js';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const buildValidationError = (message) => {
    const error = new Error(message);
    error.statusCode = 400;
    return error;
};

const createWorkspace = async (data) => {
    const requiredFields = ['name', 'ownerId'];
    const missingField = requiredFields.find((field) => !data?.[field]);

    if (missingField) {
        throw buildValidationError(`Missing required field: ${missingField}`);
    }

    if (!isValidObjectId(data.ownerId)) {
        throw buildValidationError('Invalid ownerId');
    }

    return await Workspace.create({
        name: data.name,
        description: data.description ?? '',
        ownerId: data.ownerId,
    });
};

const getAllWorkspaces = async () => {
    return await Workspace.find({}).sort({ createdAt: -1 });
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
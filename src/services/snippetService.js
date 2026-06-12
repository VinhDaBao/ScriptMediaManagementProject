import mongoose from 'mongoose';
import Snippet from '../models/snippet.js';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const buildValidationError = (message) => {
    const error = new Error(message);
    error.statusCode = 400;
    return error;
};

const createSnippet = async (data) => {
    const requiredFields = ['workspaceId', 'title'];
    const missingField = requiredFields.find((field) => !data?.[field]);

    if (missingField) {
        throw buildValidationError(`Missing required field: ${missingField}`);
    }

    if (!isValidObjectId(data.workspaceId)) {
        throw buildValidationError('Invalid workspaceId');
    }

    return await Snippet.create({
        workspaceId: data.workspaceId,
        title: data.title,
        tags: Array.isArray(data.tags) ? data.tags : [],
        content: Array.isArray(data.content) ? data.content : [],
        isFavorite: data.isFavorite ?? false,
        usageCount: data.usageCount ?? 0,
    });
};

const getAllSnippets = async () => {
    return await Snippet.find({}).sort({ createdAt: -1 });
};

const getSnippetById = async (id) => {
    if (!isValidObjectId(id)) {
        throw buildValidationError('Invalid snippet id');
    }

    const snippet = await Snippet.findById(id);

    if (!snippet) {
        const error = new Error('Snippet not found');
        error.statusCode = 404;
        throw error;
    }

    return snippet;
};

const updateSnippet = async (id, data) => {
    if (!isValidObjectId(id)) {
        throw buildValidationError('Invalid snippet id');
    }

    const snippet = await Snippet.findById(id);

    if (!snippet) {
        const error = new Error('Snippet not found');
        error.statusCode = 404;
        throw error;
    }

    if (data.workspaceId !== undefined) {
        if (!isValidObjectId(data.workspaceId)) {
            throw buildValidationError('Invalid workspaceId');
        }
        snippet.workspaceId = data.workspaceId;
    }

    if (data.title !== undefined) snippet.title = data.title;
    if (data.tags !== undefined) snippet.tags = Array.isArray(data.tags) ? data.tags : [];
    if (data.content !== undefined) snippet.content = Array.isArray(data.content) ? data.content : [];
    if (data.isFavorite !== undefined) snippet.isFavorite = data.isFavorite;
    if (data.usageCount !== undefined) snippet.usageCount = data.usageCount;

    return await snippet.save();
};

const deleteSnippet = async (id) => {
    if (!isValidObjectId(id)) {
        throw buildValidationError('Invalid snippet id');
    }

    const snippet = await Snippet.findById(id);

    if (!snippet) {
        const error = new Error('Snippet not found');
        error.statusCode = 404;
        throw error;
    }

    await snippet.deleteOne();
    return { deleted: true };
};

export default {
    createSnippet,
    getAllSnippets,
    getSnippetById,
    updateSnippet,
    deleteSnippet,
};
import mongoose from 'mongoose';
import Block from '../models/block.js';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const buildValidationError = (message) => {
    const error = new Error(message);
    error.statusCode = 400;
    return error;
};

const createBlock = async (data) => {
    const requiredFields = ['projectId', 'type', 'position', 'content'];
    const missingField = requiredFields.find((field) => data?.[field] === undefined || data?.[field] === null || data?.[field] === '');

    if (missingField) {
        throw buildValidationError(`Missing required field: ${missingField}`);
    }

    if (!isValidObjectId(data.projectId)) {
        throw buildValidationError('Invalid projectId');
    }

    return await Block.create({
        projectId: data.projectId,
        type: data.type,
        position: data.position,
        content: data.content,
    });
};

const getAllBlocks = async () => {
    return await Block.find({}).sort({ createdAt: -1 });
};

const getBlockById = async (id) => {
    if (!isValidObjectId(id)) {
        throw buildValidationError('Invalid block id');
    }

    const block = await Block.findById(id);

    if (!block) {
        const error = new Error('Block not found');
        error.statusCode = 404;
        throw error;
    }

    return block;
};

const updateBlock = async (id, data) => {
    if (!isValidObjectId(id)) {
        throw buildValidationError('Invalid block id');
    }

    const block = await Block.findById(id);

    if (!block) {
        const error = new Error('Block not found');
        error.statusCode = 404;
        throw error;
    }

    if (data.projectId !== undefined) {
        if (!isValidObjectId(data.projectId)) {
            throw buildValidationError('Invalid projectId');
        }
        block.projectId = data.projectId;
    }

    if (data.type !== undefined) block.type = data.type;
    if (data.position !== undefined) block.position = data.position;
    if (data.content !== undefined) block.content = data.content;

    return await block.save();
};

const deleteBlock = async (id) => {
    if (!isValidObjectId(id)) {
        throw buildValidationError('Invalid block id');
    }

    const block = await Block.findById(id);

    if (!block) {
        const error = new Error('Block not found');
        error.statusCode = 404;
        throw error;
    }

    await block.deleteOne();
    return { deleted: true };
};

export default {
    createBlock,
    getAllBlocks,
    getBlockById,
    updateBlock,
    deleteBlock,
};
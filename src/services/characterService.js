import mongoose from 'mongoose';
import Character from '../models/character.js';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const buildValidationError = (message) => {
    const error = new Error(message);
    error.statusCode = 400;
    return error;
};

const createCharacter = async (data) => {
    const requiredFields = ['workspaceId', 'name'];
    const missingField = requiredFields.find((field) => !data?.[field]);

    if (missingField) {
        throw buildValidationError(`Missing required field: ${missingField}`);
    }

    if (!isValidObjectId(data.workspaceId)) {
        throw buildValidationError('Invalid workspaceId');
    }

    return await Character.create({
        workspaceId: data.workspaceId,
        name: data.name,
        description: data.description ?? '',
        tags: Array.isArray(data.tags) ? data.tags : [],
        attributes: Array.isArray(data.attributes) ? data.attributes : [],
    });
};

const getAllCharacters = async (workspaceId) => {
    if (!workspaceId) {
        throw buildValidationError('workspaceId is required');
    }
    if (!isValidObjectId(workspaceId)) {
        throw buildValidationError('Invalid workspaceId');
    }
    return await Character.find({ workspaceId }).sort({ createdAt: -1 });
};

const getCharacterById = async (id) => {
    if (!isValidObjectId(id)) {
        throw buildValidationError('Invalid character id');
    }

    const character = await Character.findById(id);

    if (!character) {
        const error = new Error('Character not found');
        error.statusCode = 404;
        throw error;
    }

    return character;
};

const updateCharacter = async (id, data) => {
    if (!isValidObjectId(id)) {
        throw buildValidationError('Invalid character id');
    }

    const character = await Character.findById(id);

    if (!character) {
        const error = new Error('Character not found');
        error.statusCode = 404;
        throw error;
    }

    if (data.workspaceId !== undefined) {
        if (!isValidObjectId(data.workspaceId)) {
            throw buildValidationError('Invalid workspaceId');
        }
        character.workspaceId = data.workspaceId;
    }

    if (data.name !== undefined) character.name = data.name;
    if (data.description !== undefined) character.description = data.description;
    if (data.tags !== undefined) character.tags = Array.isArray(data.tags) ? data.tags : [];
    if (data.attributes !== undefined) character.attributes = Array.isArray(data.attributes) ? data.attributes : [];

    return await character.save();
};

export default {
    createCharacter,
    getAllCharacters,
    getCharacterById,
    updateCharacter,
};
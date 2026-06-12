import mongoose from 'mongoose';
import ProjectAsset from '../models/projectAsset.js';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const buildValidationError = (message) => {
    const error = new Error(message);
    error.statusCode = 400;
    return error;
};

const createProjectAsset = async (data) => {
    const requiredFields = ['projectId', 'assetId'];
    const missingField = requiredFields.find((field) => !data?.[field]);

    if (missingField) {
        throw buildValidationError(`Missing required field: ${missingField}`);
    }

    if (!isValidObjectId(data.projectId)) {
        throw buildValidationError('Invalid projectId');
    }

    if (!isValidObjectId(data.assetId)) {
        throw buildValidationError('Invalid assetId');
    }

    const existingProjectAsset = await ProjectAsset.findOne({ projectId: data.projectId, assetId: data.assetId });
    if (existingProjectAsset) {
        throw buildValidationError('Project asset already exists');
    }

    return await ProjectAsset.create({
        projectId: data.projectId,
        assetId: data.assetId,
        status: data.status ?? 'UNUSED',
        usageCount: data.usageCount ?? 0,
        lastUsedAt: data.lastUsedAt,
    });
};

const getAllProjectAssets = async () => {
    return await ProjectAsset.find({}).sort({ createdAt: -1 });
};

const getProjectAssetById = async (id) => {
    if (!isValidObjectId(id)) {
        throw buildValidationError('Invalid project asset id');
    }

    const projectAsset = await ProjectAsset.findById(id);

    if (!projectAsset) {
        const error = new Error('Project asset not found');
        error.statusCode = 404;
        throw error;
    }

    return projectAsset;
};

const updateProjectAsset = async (id, data) => {
    if (!isValidObjectId(id)) {
        throw buildValidationError('Invalid project asset id');
    }

    const projectAsset = await ProjectAsset.findById(id);

    if (!projectAsset) {
        const error = new Error('Project asset not found');
        error.statusCode = 404;
        throw error;
    }

    if (data.projectId !== undefined) {
        if (!isValidObjectId(data.projectId)) {
            throw buildValidationError('Invalid projectId');
        }
        projectAsset.projectId = data.projectId;
    }

    if (data.assetId !== undefined) {
        if (!isValidObjectId(data.assetId)) {
            throw buildValidationError('Invalid assetId');
        }
        projectAsset.assetId = data.assetId;
    }

    if (data.status !== undefined) projectAsset.status = data.status;
    if (data.usageCount !== undefined) projectAsset.usageCount = data.usageCount;
    if (data.lastUsedAt !== undefined) projectAsset.lastUsedAt = data.lastUsedAt;

    return await projectAsset.save();
};

const deleteProjectAsset = async (id) => {
    if (!isValidObjectId(id)) {
        throw buildValidationError('Invalid project asset id');
    }

    const projectAsset = await ProjectAsset.findById(id);

    if (!projectAsset) {
        const error = new Error('Project asset not found');
        error.statusCode = 404;
        throw error;
    }

    await projectAsset.deleteOne();
    return { deleted: true };
};

export default {
    createProjectAsset,
    getAllProjectAssets,
    getProjectAssetById,
    updateProjectAsset,
    deleteProjectAsset,
};
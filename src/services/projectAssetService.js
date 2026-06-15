import mongoose from 'mongoose';
import ProjectAsset from '../models/projectAsset.js';
import Block from '../models/block.js';

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

const attachAssets = async (projectId, assetIds) => {
    if (!projectId || !isValidObjectId(projectId)) {
        throw buildValidationError('Invalid projectId');
    }
    if (!Array.isArray(assetIds)) {
        throw buildValidationError('assetIds must be an array');
    }

    const results = [];
    for (const assetId of assetIds) {
        if (!isValidObjectId(assetId)) continue;

        let pa = await ProjectAsset.findOne({ projectId, assetId });
        if (!pa) {
            pa = await ProjectAsset.create({
                projectId,
                assetId,
                status: 'UNUSED',
                usageCount: 0,
            });
        }
        results.push(pa);
    }
    return results;
};

const getAllProjectAssets = async (projectId) => {
    if (!projectId) {
        throw buildValidationError('projectId is required');
    }
    if (!isValidObjectId(projectId)) {
        throw buildValidationError('Invalid projectId');
    }
    return await ProjectAsset.find({ projectId })
        .populate('assetId')
        .sort({ createdAt: -1 });
};

const getProjectAssetById = async (id) => {
    if (!isValidObjectId(id)) {
        throw buildValidationError('Invalid project asset id');
    }

    const projectAsset = await ProjectAsset.findById(id).populate('assetId');

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

    if (projectAsset.status === 'USED' || projectAsset.usageCount > 0) {
        throw buildValidationError('Cannot delete an asset that is currently used in the script');
    }

    await projectAsset.deleteOne();
    return { deleted: true };
};

const syncProjectAssetUsage = async (projectId) => {
    if (!projectId || !isValidObjectId(projectId)) return;

    // Load media blocks
    const blocks = await Block.find({
        projectId,
        type: { $in: ['IMAGE', 'VIDEO', 'AUDIO'] },
    });

    // Calculate usage count for each asset
    const assetUsageCounts = {};
    blocks.forEach((b) => {
        const assetId = b.content?.assetId || b.content?.id;
        if (assetId) {
            const assetIdStr = String(assetId);
            assetUsageCounts[assetIdStr] = (assetUsageCounts[assetIdStr] || 0) + 1;
        }
    });

    const projectAssets = await ProjectAsset.find({ projectId }).populate('assetId');

    for (const pa of projectAssets) {
        const assetIdStr = String(pa.assetId?._id || pa.assetId);
        const count = assetUsageCounts[assetIdStr] || 0;

        if (count > 0) {
            pa.status = 'USED';
            pa.usageCount = count;
            pa.lastUsedAt = new Date();
            await pa.save();
        } else {
            pa.status = 'UNUSED';
            pa.usageCount = 0;
            await pa.save();
        }
    }
};

export default {
    createProjectAsset,
    attachAssets,
    getAllProjectAssets,
    getProjectAssetById,
    updateProjectAsset,
    deleteProjectAsset,
    syncProjectAssetUsage,
};
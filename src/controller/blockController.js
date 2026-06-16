import blockService from '../services/blockService.js';
import activityLogService from '../services/activityLogService.js';
import projectAssetService from '../services/projectAssetService.js';
import Project from '../models/project.js';

const sendError = (res, error) => {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ errCode: 1, message: error.message || 'Internal server error' });
};

const createBlock = async (req, res) => {
    try {
        req.body.projectId = req.params.projectId;
        const block = await blockService.createBlock(req.body);

        // Sync project asset usage
        await projectAssetService.syncProjectAssetUsage(block.projectId);

        // Fetch project to get workspaceId
        const project = await Project.findById(block.projectId);
        if (project) {
            await activityLogService.createLog({
                workspaceId: project.workspaceId,
                userId: req.user.id,
                entityType: "BLOCK",
                entityId: block._id,
                action: "CREATE",
                metadata: {
                    projectId: block.projectId,
                    type: block.type,
                },
            });
        }

        return res.status(201).json({ errCode: 0, message: 'Block created successfully', data: block });
    } catch (error) {
        return sendError(res, error);
    }
};

const getAllBlocks = async (req, res) => {
    try {
        const projectId = req.params.projectId || req.query.projectId;
        const blocks = await blockService.getAllBlocks(projectId);
        return res.status(200).json({ errCode: 0, message: 'Blocks fetched successfully', data: blocks });
    } catch (error) {
        return sendError(res, error);
    }
};

const getBlockById = async (req, res) => {
    try {
        const block = await blockService.getBlockById(req.params.id);
        return res.status(200).json({ errCode: 0, message: 'Block fetched successfully', data: block });
    } catch (error) {
        return sendError(res, error);
    }
};

const updateBlock = async (req, res) => {
    try {
        const updated = await blockService.updateBlock(req.params.id, req.body);

        // Sync project asset usage
        await projectAssetService.syncProjectAssetUsage(updated.projectId);

        // Fetch project to get workspaceId
        const project = await Project.findById(updated.projectId);
        if (project) {
            await activityLogService.createLog({
                workspaceId: project.workspaceId,
                userId: req.user.id,
                entityType: "BLOCK",
                entityId: updated._id,
                action: "UPDATE",
                metadata: {
                    projectId: updated.projectId,
                    type: updated.type,
                },
            });
        }

        return res.status(200).json({ errCode: 0, message: 'Block updated successfully', data: updated });
    } catch (error) {
        return sendError(res, error);
    }
};

const deleteBlock = async (req, res) => {
    try {
        const block = await blockService.getBlockById(req.params.id);
        await blockService.deleteBlock(req.params.id);

        // Sync project asset usage
        await projectAssetService.syncProjectAssetUsage(block.projectId);

        // Fetch project to get workspaceId
        const project = await Project.findById(block.projectId);
        if (project) {
            await activityLogService.createLog({
                workspaceId: project.workspaceId,
                userId: req.user.id,
                entityType: "BLOCK",
                entityId: block._id,
                action: "DELETE",
                metadata: {
                    projectId: block.projectId,
                    type: block.type,
                },
            });
        }

        return res.status(200).json({ errCode: 0, message: 'Block deleted successfully' });
    } catch (error) {
        return sendError(res, error);
    }
};

export default {
    createBlock,
    getAllBlocks,
    getBlockById,
    updateBlock,
    deleteBlock,
};
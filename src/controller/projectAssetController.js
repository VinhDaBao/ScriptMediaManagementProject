import projectAssetService from '../services/projectAssetService.js';

const sendError = (res, error) => {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ errCode: 1, message: error.message || 'Internal server error' });
};

const createProjectAsset = async (req, res) => {
    try {
        const projectAsset = await projectAssetService.createProjectAsset(req.body);
        return res.status(201).json({ errCode: 0, message: 'Project asset created successfully', data: projectAsset });
    } catch (error) {
        return sendError(res, error);
    }
};

const getAllProjectAssets = async (req, res) => {
    try {
        const projectAssets = await projectAssetService.getAllProjectAssets();
        return res.status(200).json({ errCode: 0, message: 'Project assets fetched successfully', data: projectAssets });
    } catch (error) {
        return sendError(res, error);
    }
};

const getProjectAssetById = async (req, res) => {
    try {
        const projectAsset = await projectAssetService.getProjectAssetById(req.params.id);
        return res.status(200).json({ errCode: 0, message: 'Project asset fetched successfully', data: projectAsset });
    } catch (error) {
        return sendError(res, error);
    }
};

const updateProjectAsset = async (req, res) => {
    try {
        const projectAsset = await projectAssetService.updateProjectAsset(req.params.id, req.body);
        return res.status(200).json({ errCode: 0, message: 'Project asset updated successfully', data: projectAsset });
    } catch (error) {
        return sendError(res, error);
    }
};

const deleteProjectAsset = async (req, res) => {
    try {
        await projectAssetService.deleteProjectAsset(req.params.id);
        return res.status(200).json({ errCode: 0, message: 'Project asset deleted successfully' });
    } catch (error) {
        return sendError(res, error);
    }
};

export default {
    createProjectAsset,
    getAllProjectAssets,
    getProjectAssetById,
    updateProjectAsset,
    deleteProjectAsset,
};
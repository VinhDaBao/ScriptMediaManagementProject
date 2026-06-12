import blockService from '../services/blockService.js';

const sendError = (res, error) => {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ errCode: 1, message: error.message || 'Internal server error' });
};

const createBlock = async (req, res) => {
    try {
        const block = await blockService.createBlock(req.body);
        return res.status(201).json({ errCode: 0, message: 'Block created successfully', data: block });
    } catch (error) {
        return sendError(res, error);
    }
};

const getAllBlocks = async (req, res) => {
    try {
        const blocks = await blockService.getAllBlocks();
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
        const block = await blockService.updateBlock(req.params.id, req.body);
        return res.status(200).json({ errCode: 0, message: 'Block updated successfully', data: block });
    } catch (error) {
        return sendError(res, error);
    }
};

const deleteBlock = async (req, res) => {
    try {
        await blockService.deleteBlock(req.params.id);
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
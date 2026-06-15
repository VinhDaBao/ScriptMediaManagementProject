import snippetService from '../services/snippetService.js';

const sendError = (res, error) => {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ errCode: 1, message: error.message || 'Internal server error' });
};

const createSnippet = async (req, res) => {
    try {
        req.body.workspaceId = req.params.workspaceId;
        const snippet = await snippetService.createSnippet(req.body);
        return res.status(201).json({ errCode: 0, message: 'Snippet created successfully', data: snippet });
    } catch (error) {
        return sendError(res, error);
    }
};

const getAllSnippets = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const snippets = await snippetService.getAllSnippets(workspaceId);
        return res.status(200).json({ errCode: 0, message: 'Snippets fetched successfully', data: snippets });
    } catch (error) {
        return sendError(res, error);
    }
};

const getSnippetById = async (req, res) => {
    try {
        const snippet = await snippetService.getSnippetById(req.params.id);
        return res.status(200).json({ errCode: 0, message: 'Snippet fetched successfully', data: snippet });
    } catch (error) {
        return sendError(res, error);
    }
};

const updateSnippet = async (req, res) => {
    try {
        const snippet = await snippetService.updateSnippet(req.params.id, req.body);
        return res.status(200).json({ errCode: 0, message: 'Snippet updated successfully', data: snippet });
    } catch (error) {
        return sendError(res, error);
    }
};

const deleteSnippet = async (req, res) => {
    try {
        await snippetService.deleteSnippet(req.params.id);
        return res.status(200).json({ errCode: 0, message: 'Snippet deleted successfully' });
    } catch (error) {
        return sendError(res, error);
    }
};

export default {
    createSnippet,
    getAllSnippets,
    getSnippetById,
    updateSnippet,
    deleteSnippet,
};
import mongoose from 'mongoose';
import Project from '../models/project.js';
import Block from '../models/block.js';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const buildValidationError = (message) => {
    const error = new Error(message);
    error.statusCode = 400;
    return error;
};

const createProject = async (data, userId) => {
    const requiredFields = ['workspaceId', 'title'];
    const missingField = requiredFields.find((field) => !data?.[field]);

    if (missingField) {
        throw buildValidationError(`Missing required field: ${missingField}`);
    }

    if (!isValidObjectId(data.workspaceId)) {
        throw buildValidationError('Invalid workspaceId');
    }

    if (!userId || !isValidObjectId(userId)) {
        throw buildValidationError('Invalid user id for creation');
    }

    return await Project.create({
        workspaceId: data.workspaceId,
        title: data.title,
        description: data.description ?? '',
        status: data.status ?? 'IDEA',
        tags: Array.isArray(data.tags) ? data.tags : [],
        createdBy: userId,
        lastEditedBy: userId,
    });
};

const getAllProjects = async (workspaceId) => {
    if (!workspaceId) {
        throw buildValidationError('workspaceId is required');
    }
    if (!isValidObjectId(workspaceId)) {
        throw buildValidationError('Invalid workspaceId');
    }
    return await Project.find({ workspaceId }).sort({ createdAt: -1 });
};

const getProjectById = async (id) => {
    if (!isValidObjectId(id)) {
        throw buildValidationError('Invalid project id');
    }

    const project = await Project.findById(id);

    if (!project) {
        const error = new Error('Project not found');
        error.statusCode = 404;
        throw error;
    }

    return project;
};

const updateProject = async (id, data, userId) => {
    if (!isValidObjectId(id)) {
        throw buildValidationError('Invalid project id');
    }

    const project = await Project.findById(id);

    if (!project) {
        const error = new Error('Project not found');
        error.statusCode = 404;
        throw error;
    }

    if (data.workspaceId !== undefined) {
        if (!isValidObjectId(data.workspaceId)) {
            throw buildValidationError('Invalid workspaceId');
        }
        project.workspaceId = data.workspaceId;
    }

    if (data.title !== undefined) project.title = data.title;
    if (data.description !== undefined) project.description = data.description;
    if (data.status !== undefined) project.status = data.status;
    if (data.tags !== undefined) project.tags = Array.isArray(data.tags) ? data.tags : [];

    if (userId) {
        project.lastEditedBy = userId;
    }

    return await project.save();
};

const deleteProject = async (id) => {
    if (!isValidObjectId(id)) {
        throw buildValidationError('Invalid project id');
    }

    const project = await Project.findById(id);

    if (!project) {
        const error = new Error('Project not found');
        error.statusCode = 404;
        throw error;
    }

    // Delete associated blocks when project is deleted
    await Block.deleteMany({ projectId: id });

    await project.deleteOne();
    return { deleted: true };
};

const duplicateProject = async (projectId, userId) => {
    if (!isValidObjectId(projectId)) {
        throw buildValidationError('Invalid project id');
    }

    const original = await Project.findById(projectId);
    if (!original) {
        const error = new Error('Project not found');
        error.statusCode = 404;
        throw error;
    }

    // Duplicate project metadata
    const duplicate = await Project.create({
        workspaceId: original.workspaceId,
        title: `${original.title} (Copy)`,
        description: original.description,
        status: original.status,
        tags: original.tags,
        createdBy: userId,
        lastEditedBy: userId,
    });

    // Load original blocks
    const originalBlocks = await Block.find({ projectId }).sort({ position: 1 });

    // Duplicate blocks
    const duplicatedBlocks = originalBlocks.map((b) => ({
        projectId: duplicate._id,
        type: b.type,
        position: b.position,
        content: b.content,
    }));

    if (duplicatedBlocks.length > 0) {
        await Block.insertMany(duplicatedBlocks);
    }

    return duplicate;
};

export default {
    createProject,
    getAllProjects,
    getProjectById,
    updateProject,
    deleteProject,
    duplicateProject,
};
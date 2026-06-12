import mongoose from 'mongoose';
import Project from '../models/project.js';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const buildValidationError = (message) => {
    const error = new Error(message);
    error.statusCode = 400;
    return error;
};

const createProject = async (data) => {
    const requiredFields = ['workspaceId', 'title'];
    const missingField = requiredFields.find((field) => !data?.[field]);

    if (missingField) {
        throw buildValidationError(`Missing required field: ${missingField}`);
    }

    if (!isValidObjectId(data.workspaceId)) {
        throw buildValidationError('Invalid workspaceId');
    }

    return await Project.create({
        workspaceId: data.workspaceId,
        title: data.title,
        description: data.description ?? '',
        status: data.status ?? 'IDEA',
        tags: Array.isArray(data.tags) ? data.tags : [],
    });
};

const getAllProjects = async () => {
    return await Project.find({}).sort({ createdAt: -1 });
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

const updateProject = async (id, data) => {
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

    await project.deleteOne();
    return { deleted: true };
};

export default {
    createProject,
    getAllProjects,
    getProjectById,
    updateProject,
    deleteProject,
};
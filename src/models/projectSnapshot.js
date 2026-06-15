import mongoose from "mongoose";

const projectSnapshotSchema = new mongoose.Schema(
    {
        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
            required: true,
            index: true,
        },

        version: {
            type: Number,
            required: true,
        },

        title: {
            type: String,
            trim: true,
        },

        changeSummary: {
            type: String,
            trim: true,
            default: "",
        },

        snapshotType: {
            type: String,
            enum: ["AUTO", "MANUAL"],
            default: "AUTO",
        },

        blocks: [
            {
                blockId: {
                    type: mongoose.Schema.Types.ObjectId,
                },

                type: {
                    type: String,
                },

                position: {
                    type: Number,
                },

                content: {
                    type: mongoose.Schema.Types.Mixed,
                },
            },
        ],

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    {
        timestamps: true,
    }
);

projectSnapshotSchema.index({
    projectId: 1,
    version: -1,
});

const ProjectSnapshot = mongoose.model(
    "ProjectSnapshot",
    projectSnapshotSchema
);

export default ProjectSnapshot;
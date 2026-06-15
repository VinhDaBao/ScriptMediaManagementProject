import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
    {
        workspaceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Workspace",
            required: true,
            index: true,
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        entityType: {
            type: String,
            enum: [
                "PROJECT",
                "BLOCK",
                "WORLD",
                "WORLD_NODE",
                "ASSET",
                "INVITE",
                "SNAPSHOT",
                "CHARACTER",
            ],
            required: true,
        },

        entityId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },

        action: {
            type: String,
            enum: [
                "CREATE",
                "UPDATE",
                "DELETE",
                "INVITE",
                "ACCEPT_INVITE",
                "RESTORE_SNAPSHOT",
                "DUPLICATE",
            ],
            required: true,
        },

        metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
    },
    {
        timestamps: true,
    }
);

activityLogSchema.index({
    workspaceId: 1,
    createdAt: -1,
});

const ActivityLog = mongoose.model(
    "ActivityLog",
    activityLogSchema
);

export default ActivityLog;
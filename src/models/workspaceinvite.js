import mongoose from "mongoose";

const workspaceInviteSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    role: {
      type: String,
      enum: ["ADMIN", "EDITOR", "VIEWER"],
      default: "VIEWER",
      required: true,
    },

    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "EXPIRED"],
      default: "PENDING",
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false,
    },
  }
);

workspaceInviteSchema.index(
  {
    workspaceId: 1,
    email: 1,
    status: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      status: "PENDING",
    },
  }
);

const WorkspaceInvite = mongoose.model(
  "WorkspaceInvite",
  workspaceInviteSchema
);

export default WorkspaceInvite;
import mongoose from "mongoose";

const workspaceMemberSchema = new mongoose.Schema(
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
      index: true,
    },

    role: {
      type: String,
      enum: ["OWNER", "ADMIN", "EDITOR", "VIEWER"],
      default: "VIEWER",
      required: true,
    },

    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false,
    },
  }
);

workspaceMemberSchema.index(
  { workspaceId: 1, userId: 1 },
  { unique: true }
);

const WorkspaceMember =
  mongoose.models.WorkspaceMember ||
  mongoose.model("WorkspaceMember", workspaceMemberSchema);

export default WorkspaceMember;
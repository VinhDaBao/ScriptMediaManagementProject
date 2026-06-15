import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["IDEA", "WRITING", "MEDIA", "PUBLISHED"],
      default: "IDEA",
      index: true,
    },

    tags: [
      {
        type: String,
        index: true,
        trim: true,
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    lastEditedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },

  {
    timestamps: true,
  }
);
const Project = mongoose.model("Project", projectSchema);

export default Project;
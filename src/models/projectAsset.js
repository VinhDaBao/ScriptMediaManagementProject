import mongoose from "mongoose";

const projectAssetSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },

    assetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Media",
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["USED", "UNUSED"],
      default: "UNUSED",
      index: true,
    },

    usageCount: {
      type: Number,
      default: 0,
    },

    lastUsedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

projectAssetSchema.index(
  { projectId: 1, assetId: 1 },
  { unique: true }
);

projectAssetSchema.index({ projectId: 1, status: 1 });
projectAssetSchema.index({ projectId: 1, lastUsedAt: -1 });

const ProjectAsset = mongoose.model("ProjectAsset", projectAssetSchema);

export default ProjectAsset;
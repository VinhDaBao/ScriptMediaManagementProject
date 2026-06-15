import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: ["IMAGE", "VIDEO", "AUDIO", "FILE"],
      required: true,
    },

    url: {
      type: String,
      required: true,
    },

    fileName: {
      type: String,
      required: true,
      trim: true,
    },

    mimeType: {
      type: String,
    },

    fileSize: {
      type: Number,
    },

    duration: {
      type: Number,
    },

    tags: [
      {
        type: String,
        trim: true,
      },
    ],

    isFavorite: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

mediaSchema.index({ workspaceId: 1, type: 1 });
mediaSchema.index({ tags: 1 });
mediaSchema.index({ isFavorite: 1 });

const Asset = mongoose.model("Asset", mediaSchema);

export default Asset;
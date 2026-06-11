import mongoose from "mongoose";

const worldSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    tags: [
      {
        type: String,
        trim: true,
        index: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

worldSchema.index({ workspaceId: 1, createdAt: -1 });
worldSchema.index({ tags: 1 });

const World = mongoose.model("World", worldSchema);

export default World;
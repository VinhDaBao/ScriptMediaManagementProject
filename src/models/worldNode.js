import mongoose from "mongoose";

const worldNodeSchema = new mongoose.Schema(
  {
    worldId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "World",
      required: true,
      index: true,
    },

    stageId: {
        type: String,
        default: "stage_1", // mặc định gán vào Tab chính ban đầu
        required: true
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

    keyValues: [
      {
        key: {
          type: String,
          trim: true,
        },
        value: {
          type: String,
          trim: true,
        },
      },
    ],

    avatarUrl: {
        type: String,
        default: ""
    },

    tags: [
      {
        type: String,
        trim: true,
        index: true,
      },
    ],

    position: {
      x: {
        type: Number,
        default: 0,
      },
      y: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

worldNodeSchema.index({ worldId: 1 });
worldNodeSchema.index({ worldId: 1, createdAt: -1 });
worldNodeSchema.index({ tags: 1 });

const WorldNode = mongoose.model("WorldNode", worldNodeSchema);

export default WorldNode;
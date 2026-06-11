import mongoose from "mongoose";

const worldEdgeSchema = new mongoose.Schema(
  {
    worldId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "World",
      required: true,
      index: true,
    },

    fromNodeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WorldNode",
      required: true,
      index: true,
    },

    toNodeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WorldNode",
      required: true,
      index: true,
    },

    type: {
      type: String,
      default: "RELATION",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

worldEdgeSchema.index({ worldId: 1 });
worldEdgeSchema.index({ fromNodeId: 1 });
worldEdgeSchema.index({ toNodeId: 1 });

worldEdgeSchema.index(
  { worldId: 1, fromNodeId: 1, toNodeId: 1 },
  { unique: true }
);

const WorldEdge = mongoose.model("WorldEdge", worldEdgeSchema);

export default WorldEdge;
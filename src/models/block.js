import mongoose from "mongoose";

const blockSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: [
        "TEXT",
        "IMAGE",
        "VIDEO",
        "AUDIO",
        "DIALOGUE",
      ],
      required: true,
    },

    position: {
      type: Number,
      required: true,
      min: 0,
    },

    content: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

blockSchema.index(
  { projectId: 1, position: 1 }
);

const Block = mongoose.model(
  "Block",
  blockSchema
);

export default Block;
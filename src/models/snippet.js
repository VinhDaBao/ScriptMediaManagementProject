import mongoose from "mongoose";

const snippetSchema = new mongoose.Schema(
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

    tags: [
      {
        type: String,
        trim: true,
        index: true,
      },
    ],

    content: [
      {
        type: {
          type: String,
          enum: ["TEXT", "DIALOGUE"],
          required: true,
        },

        data: {
          type: mongoose.Schema.Types.Mixed,
          required: true,
        },
      },
    ],

    isFavorite: {
      type: Boolean,
      default: false,
    },

    usageCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);
const Snippet = mongoose.model("Snippet", snippetSchema);

export default Snippet;
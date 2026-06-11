import mongoose from "mongoose";

const characterSchema = new mongoose.Schema(
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
      index: true,
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

    attributes: [
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
  },
  {
    timestamps: true,
  }
);

characterSchema.index({ workspaceId: 1, name: 1 });
characterSchema.index({ workspaceId: 1, createdAt: -1 });
characterSchema.index({ tags: 1 });

const Character = mongoose.model("Character", characterSchema);

export default Character;
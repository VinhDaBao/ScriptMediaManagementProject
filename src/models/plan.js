import mongoose from "mongoose";

const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      default: 0,
    },

    limits: {
      workspace: {
        type: Number,
        default: 1,
      },

      projects: {
        type: Number,
        default: 5,
      },

      assets: {
        type: Number,
        default: 50,
      },

      worlds: {
        type: Number,
        default: 5,
      },

      members: {
        type: Number,
        default: 1,
      },
    },

    features: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Plan = mongoose.model("Plan", planSchema);

export default Plan;
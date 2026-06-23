import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
    },

    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "VND",
    },

    method: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED", "REFUNDED"],
      default: "PENDING",
      index: true,
    },

    transactionRef: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },

    planSnapshot: {
      name: {
        type: String,
        required: true,
      },

      price: {
        type: Number,
        required: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

paymentSchema.index({ userId: 1, createdAt: -1 });
paymentSchema.index({ subscriptionId: 1 });
paymentSchema.index({ planId: 1 });
paymentSchema.index({ transactionRef: 1 });

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
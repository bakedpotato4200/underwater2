// backend/models/Recurring.js
// ========================================
// Underground Water 2 - Recurring Model
// Supports recurring bills AND recurring income
// ========================================

import mongoose from "mongoose";

const recurringSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    type: {
      type: String,
      enum: ["income", "expense"],
      required: true,
    },

    frequency: {
      type: String,
      enum: ["weekly", "biweekly", "monthly"],
      required: true,
    },

    startDate: {
      type: Date,
      required: true,
    }
  },
  { timestamps: true }
);

// Prevent OverwriteModelError (important for dev)
export default mongoose.models.Recurring ||
  mongoose.model("Recurring", recurringSchema);
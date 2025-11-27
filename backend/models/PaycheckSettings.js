// backend/models/PaycheckSettings.js
// ========================================
// Underground Water 2 - Paycheck Settings Model
// Stores user paycheck amount, frequency, and start date
// ========================================

import mongoose from "mongoose";

const paycheckSettingsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },

    payAmount: {
      type: Number,
      required: true,
      default: 0
    },

    frequency: {
      type: String,
      enum: ["weekly", "biweekly", "monthly"],
      required: true,
      default: "biweekly"
    },

    startDate: {
      type: Date,
      required: true,
    }
  },
  { timestamps: true }
);

// Prevent OverwriteModelError
export default mongoose.models.PaycheckSettings ||
  mongoose.model("PaycheckSettings", paycheckSettingsSchema);
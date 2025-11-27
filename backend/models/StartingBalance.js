// backend/models/StartingBalance.js
// ========================================
// Underground Water 2 - Starting Balance Model
// Stores the user's chosen starting balance
// ========================================

import mongoose from "mongoose";

const startingBalanceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    startingBalance: {
      type: Number,
      required: true,
      default: 0
    }
  },
  { timestamps: true }
);

// Prevent OverwriteModelError
export default mongoose.models.StartingBalance ||
  mongoose.model("StartingBalance", startingBalanceSchema);
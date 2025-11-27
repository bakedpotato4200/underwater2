import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    category: { type: String, required: true },
    date: { type: Date, required: true }
  },
  { timestamps: true }
);

// Prevent OverwriteModelError
export default mongoose.models.Transaction ||
  mongoose.model("Transaction", transactionSchema);

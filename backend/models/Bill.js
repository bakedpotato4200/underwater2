import mongoose from "mongoose";

const billSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    amount: { type: Number, required: true },
    dueDate: { type: Date, required: true },
    frequency: { type: String, required: true }
  },
  { timestamps: true }
);

export default mongoose.models.Bill ||
  mongoose.model("Bill", billSchema);

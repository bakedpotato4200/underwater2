import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, default: "" },
    resetCode: { type: String, default: null },
    resetCodeExpiry: { type: Date, default: null }
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", userSchema);

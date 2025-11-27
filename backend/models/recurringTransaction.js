import mongoose from "mongoose";

const RecurringTransactionSchema = new mongoose.Schema({
  name: String,
  amount: Number,
  date: Number, 
  category: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
});

export default mongoose.model("RecurringTransaction", RecurringTransactionSchema);

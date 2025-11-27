import RecurringTransaction from "../models/recurringTransaction.js";

// GET all recurring transactions
export const getRecurringTransactions = async (req, res) => {
  try {
    const items = await RecurringTransaction.find({ user: req.user.id });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// CREATE new recurring record
export const createRecurringTransaction = async (req, res) => {
  try {
    const item = await RecurringTransaction.create({
    ...req.body,
    user: req.user.id
  });

  res.json(item);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// UPDATE
export const updateRecurringTransaction = async (req, res) => {
  try {
    const updated = await RecurringTransaction.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// DELETE
export const deleteRecurringTransaction = async (req, res) => {
  try {
    await RecurringTransaction.deleteOne({
      _id: req.params.id,
      user: req.user.id
    });

    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

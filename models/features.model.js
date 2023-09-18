const mongoose = require("mongoose");

const billSchema = new mongoose.Schema({
  account: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
  payee: String,
  amount: Number,
  dueDate: Date,
  isPaid: { type: Boolean, default: false },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const goalSchema = new mongoose.Schema({
  account: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
  goalName: String,
  targetAmount: Number,
  currentAmount: Number,
  deadline: Date,
});

const statementSchema = new mongoose.Schema({
  account: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
  startDate: Date,
  endDate: Date,
  transactions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Transaction" }],
});

const Goal = mongoose.model("Goal", goalSchema);
const Bill = mongoose.model("Bill", billSchema);
const Statement = mongoose.model("Statement", statementSchema);

module.exports = { Goal, Bill, Statement };

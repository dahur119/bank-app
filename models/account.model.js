const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
});

const accountSchema = new mongoose.Schema({
  accountNumber: { type: String, required: true, unique: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  balance: { type: Number, default: 0 },
  accountType: { type: String, enum: ["savings", "checking"], required: true },
  minimumBalance: { type: Number, default: 0 },
  overdraftLimit: { type: Number, default: 0 },
});

const transactionSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);
const Account = mongoose.model("Account", accountSchema);
const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = { User, Account, Transaction };

const express = require("express");
const account = express.Router();
const {
  UserController,
  TransactionController,
  AccountController,
  TransactionService,
} = require("../controller/account.controller");

const userController = new UserController();
const accountController = new AccountController();
const transactionController = new TransactionController();
const transactionService = new TransactionService();

account.post("/user", userController.createUser);
account.get("/user/:userId", userController.getUser);

account.post("/account", accountController.createAccount);
account.get("/account/:accountId", accountController.getAccount);

account.post("transaction", transactionController.createTransaction);
account.get(
  "/transaction/:transactionId",
  transactionController.getTransaction
);

account.post("/send-funds", async (req, res) => {
  try {
    const { senderAccountId, receiverAccountId, amount } = req.body;
    const transaction = await transactionService.sendFunds(
      senderAccountId,
      receiverAccountId,
      amount
    );
    res.status(201).json(transaction);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

account.get("/transactions/:accountId", async (req, res) => {
  try {
    const accountId = req.params.accountId;
    const transactions = await transactionService.getTransactionByAccountId(
      accountId
    );
    res.json(transactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = account;

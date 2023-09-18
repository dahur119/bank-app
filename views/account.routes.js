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
account.get("/logout", userController.logOut);
account.post("/login", userController.loginUser);
account.get("/user/:userId", userController.getUser);

account.post("/account", accountController.createAccount);
account.get("/account/:accountId", accountController.getAccount);

account.post("/transaction", transactionController.createTransaction);
account.get(
  "/transaction/:transactionId",
  transactionController.getTransaction
);

account.post("/send-funds", async (req, res) => {
  try {
    const transaction = await transactionService.sendFunds(req);

    if (transaction.error) {
      // Handle error case
      return res.status(400).json({ error: transaction.error });
    }

    // Sanitize the transaction object to remove circular references
    const sanitizedTransaction = {
      _id: transaction._id, // Add other relevant fields here
      sender: transaction.sender,
      receiver: transaction.receiver,
      amount: transaction.amount,
      // Add other relevant fields here
    };

    res.status(201).json(sanitizedTransaction);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

account.get("/transactions/:accountId", async (req, res) => {
  try {
    // Call the getTransactionByAccountId function and pass both req and res
    await transactionService.getTransactionByAccountId(req, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = account;

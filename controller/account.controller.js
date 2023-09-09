const { User, Account, Transaction } = require("../models/account.model");
const errorHandler = require("../middleware/errorHandler");

class UserController {
  async createUser(req, res) {
    try {
      const { username, password, fullName, email } = req.body;

      const newUser = new User({
        username,
        password,
        fullName,
        email,
      });

      await newUser.save();

      res.status(201).json(newUser);
    } catch (error) {
      errorHandler(error, req, res);
    }
  }

  async getUser(req, res) {
    try {
      const userId = req.params.userId;
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }
      res.json(user);
    } catch (error) {
      errorHandler(error, req, res);
    }
  }
}

class AccountController {
  async createAccount(req, res) {
    try {
      const { accountNumber, accountType, owner } = req.body;

      const newAccount = new Account({
        accountNumber,
        accountType,
        owner,
      });
      await newAccount.save();

      res.status(201).json(newAccount);
    } catch (error) {
      errorHandler(error, req, res);
    }
  }

  async getAccount(req, res) {
    try {
      const accountId = req.params.accountId;

      const account = await Account.findById(accountId).populate("owner");
      if (!account) {
        return res.status(404).json({
          message: "Account not found",
        });
      }
      res.json(account);
    } catch (error) {
      errorHandler(error, req, res);
    }
  }
}

class TransactionController {
  async createTransaction(req, res) {
    try {
      const { sender, receiver, amount } = req.body;
      const newTransaction = new Transaction({
        sender,
        receiver,
        amount,
      });
      await newTransaction.save();
      res.status(201).json(newTransaction);
    } catch (error) {
      errorHandler(error, req, res);
    }
  }

  async getTransaction(req, res) {
    try {
      const transactionId = req.params.transactionId;

      const transaction = await Transaction.findById(transactionId);

      if (!transaction) {
        return res.status(404).json({
          message: "Transaction not found",
        });
      }
      res.json(transaction);
    } catch (error) {
      errorHandler(error, req, res);
    }
  }
}

class TransactionService {
  async sendFunds(senderAccountId, receiverAccountId, amount) {
    try {
      const senderAccount = await Account.findById(senderAccountId);
      const receiverAccount = await Account.findById(receiverAccountId);

      if (!senderAccount || !receiverAccount) {
        throw new Error("Sender or receiver account not found");
      }

      if (senderAccount.balance < amount) {
        throw new Error("Insufficient balance");
      }
      const transaction = new Transaction({
        sender: senderAccount._id,
        receiver: receiverAccount._id,
        amount: amount,
      });

      senderAccount.balance = -amount;
      receiverAccount.balance += amount;

      await transaction.save();
      await senderAccount.save();
      await receiverAccount.save();
      return transaction;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getTransactionByAccountId(accountId) {
    try {
      const transactions = await Transaction.find({
        $or: [{ sender: accountId }, { receiver: accountId }],
      });
      return transactions;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

module.exports = {
  UserController,
  AccountController,
  TransactionController,
  TransactionService,
};

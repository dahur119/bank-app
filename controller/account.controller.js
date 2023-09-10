const { User, Account, Transaction } = require("../models/account.model");
const jwt = require("jsonwebtoken");
const errorHandler = require("../middleware/errorHandler");
const bcrypt = require("bcrypt");
require("dotenv").config;

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

      const accessToken = jwt.sign(
        { _id: newUser._id },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "30m" }
      );

      res.status(201).json({
        message: "account create successfully",
        accessToken,
      });
    } catch (error) {
      errorHandler(error, req, res);
    }
  }

  async loginUser(req, res) {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({
        message: "invalid username and password ",
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid username and password",
      });
    }

    res.status(200).json({
      message: "Login successful",
    });

    const accessToken = jwt.sign(
      { _id: user._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "30m" }
    );

    const refreshToken = jwt.sign(
      { _id: user._id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "30m" }
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
    });

    res.json({
      passwordMatch,
      accessToken,
      refreshToken,
    });
  }
  catch(error) {
    errorHandler(error, req, res);
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
    const { authorization } = req.headers;
    try {
      if (!authorization) {
        return res.status(401).json({
          error: "Unauthorized: Missing Authorization Header",
        });
      }
      const token = authorization.split(" ")[1];
      const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

      const { _id: userId } = decodedToken;
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          error: "user not found",
        });
      }
      const { accountNumber, accountType, owner } = req.body;

      const newAccount = new Account({
        accountNumber,
        accountType,
        owner,
      });

      newAccount.owner = user._id;
      await newAccount.save();

      res.status(201).json(newAccount);
    } catch (error) {
      errorHandler(error, req, res);
    }
  }

  async getAccount(req, res) {
    const { authorization } = req.headers;
    try {
      if (!authorization) {
        return res.status(401).json({
          error: "Unauthorized: Missing Authorization Header",
        });
      }
      const token = authorization.split(" ")[1];
      const decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      const userId = decodeToken._id;

      const accountId = req.params.accountId;

      const account = await Account.findById(accountId).populate("owner");
      if (!account) {
        return res.status(404).json({
          message: "Account not found",
        });
      }
      if (userId !== account.owner._id.toString()) {
        return res.status(403).json({
          message:
            "Forbidden: You do not have permission to access this account.",
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
    const { authorization } = req.headers;

    try {
      if (!authorization) {
        return res.status(401).json({
          error: "Unauthorized: Missing Authorization Header",
        });
      }
      const token = authorization.split(" ")[1];
      const decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      const userId = decodeToken._id;

      const { receiver, amount } = req.body;
      const newTransaction = new Transaction({
        sender: userId,
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
    const { authorization } = req.headers;
    try {
      if (!authorization) {
        return res.status(401).json({
          error: "Unauthorized: Missing Authorization Header",
        });
      }
      const token = authorization.split(" ")[1];
      const decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      const userId = decodeToken._id;

      const transactionId = req.params.transactionId;

      const transaction = await Transaction.findById(transactionId);

      if (!transaction) {
        return res.status(404).json({
          message: "Transaction not found",
        });
      }
      if (
        userId.toString() !== transaction.sender.toString() &&
        userId.toString() !== transaction.receiver.toString()
      ) {
        return res.status(403).json({
          message:
            "Forbidden: You do not have permission to access this transaction.",
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
    const { authorization } = req.headers;
    try {
      if (!authorization) {
        return res.status(401).json({
          error: "Unauthorized: Missing Authorization Header",
        });
      }

      const token = authorization.split(" ")[1];
      const decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

      const userId = decodeToken._id;
      const senderAccount = await Account.findById(senderAccountId);
      const receiverAccount = await Account.findById(receiverAccountId);

      if (!senderAccount || !receiverAccount) {
        throw new Error("Sender or receiver account not found");
      }

      if (senderAccount._id.toString() !== userId) {
        return res.status(403).json({
          error: "Unauthorized: You are not the owner of the sender account",
        });
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

      res.status(201).json(transaction);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getTransactionByAccountId(accountId) {
    try {
      const { authorization } = req.headers;
      if (!authorization) {
        return res.status(401).json({
          error: "Unauthorized: Missing Authorization Header",
        });
      }
      const token = authorization.split(" ")[1];
      const decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      const userId = decodeToken._id;

      if (userId !== accountId) {
        return res.status(403).json({
          error:
            "Unauthorized: You do not have permission to access these transactions",
        });
      }

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

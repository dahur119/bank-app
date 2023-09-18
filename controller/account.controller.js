const {
  User,
  Account,
  Transaction,
  ObjectId,
} = require("../models/account.model");
const jwt = require("jsonwebtoken");

const axios = require("axios");
const { sendEmail } = require("../email");
const errorHandler = require("../middleware/errorHandler");
const bcrypt = require("bcryptjs");
require("dotenv").config;

class UserController {
  async getIpAddress(req) {
    const ipAddress =
      req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    return ipAddress.split(",")[0];
  }

  async getUserLocation(ipAddress) {
    try {
      const response = await axios.get(`https://ipinfo.io/${ipAddress}/json`);
      const { city, region, country } = response.data;
      return `${city}, ${region}, ${country}`;
    } catch (error) {
      console.error("Error fetching location:", error);
      return "Unknown Location";
    }
  }

  async createUser(req, res) {
    try {
      const { username, password, fullName, email } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new User({
        username,
        password: hashedPassword,
        fullName,
        email,
      });

      // Save the new user to the database first
      await newUser.save();

      const accessToken = jwt.sign(
        { _id: newUser._id },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "30m" }
      );

      const userAgent = req.useragent.source;

      const ipAddress = await getIpAddress(req);
      const userLocation = await getUserLocation(ipAddress);

      // Compose the welcome email
      const welcomeEmail = {
        from: "your-email@gmail.com",
        to: email, // User's email address
        subject: "Welcome to Your App!",
        text: "Welcome to Your App! We are excited to have you on board.",
        html: "<p>Welcome to Your App! We are excited to have you on board.</p>",
      };

      // Send the welcome email after saving the user
      await sendEmail(welcomeEmail);

      res.status(201).json({
        message: "Account created successfully",
        accessToken,
        userLocation,
        userAgent,
      });
    } catch (error) {
      errorHandler(error, req, res);
    }
  }

  async loginUser(req, res) {
    try {
      const { username, password } = req.body;
      const user = await User.findOne({ username });

      if (!user) {
        return res.status(401).json({
          message: "Invalid username and password",
        });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        return res.status(401).json({
          message: "Invalid username and password",
        });
      }

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

      res.status(200).json({
        message: "Login successful",
        passwordMatch,
        accessToken,
        refreshToken,
      });
    } catch (error) {
      errorHandler(error, req, res);
    }
  }

  async logOut(req, res) {
    try {
      res.clearCookie("accessToken");
      res.status(200).json({ message: "Logout successful" });
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

      const receiverAccount = await Account.findById(receiver);
      console.log(receiverAccount);

      if (!receiverAccount) {
        return res.status(400).json({
          error: "Receiver account not found",
        });
      }

      if (!amount || typeof amount !== "number" || amount <= 0) {
        return res.status(400).json({
          error: "Invalid amount",
        });
      }

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
      console.log("checking the transaction id", transactionId);

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
      throw error;
    }
  }
}

class TransactionService {
  async sendFunds(req, res) {
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
      const { senderAccountNumber, receiverAccountNumber, amount } = req.body;

      const senderAccount = await Account.findOne({
        accountNumber: senderAccountNumber,
        owner: userId,
      }).populate("owner");
      console.log("senderAccount", senderAccount);

      if (senderAccount.owner._id.toString() !== userId) {
        return res.status(403).json({
          error: "Unauthorized: You are not the owner of the sender account",
        });
      }

      const receiverAccount = await Account.findOne({
        accountNumber: receiverAccountNumber,
      });
      console.log("reciver Account", receiverAccount);
      if (!receiverAccount) {
        return res.status(400).json({
          error: "Receiver account not found",
        });
      }

      // Check if the sender has sufficient balance
      if (senderAccount.balance < amount) {
        return res.status(400).json({
          error: "Insufficient balance",
        });
      }

      // Create a new transaction
      const transaction = new Transaction({
        sender: senderAccount._id,
        receiver: receiverAccount._id,
        amount: amount,
      });

      // Update balances and save the transaction and account documents
      senderAccount.balance -= amount;
      receiverAccount.balance += amount;

      await transaction.save();
      await senderAccount.save();
      await receiverAccount.save();

      return transaction;
    } catch (error) {
      console.error(error);
      // Handle other errors here if needed
      return res.status(500).json({ error: "Internal Server Error" }); // Send a generic error response
    }
  }

  async getTransactionByAccountId(req, res) {
    try {
      const accountId = req.params.accountId;

      // if (!ObjectId.isValid(accountId)) {
      //   return res.status(400).json({
      //     error: "Invalid account ID",
      //   });
      // }

      const transactions = await Transaction.find({
        $or: [{ sender: accountId }, { receiver: accountId }],
      });

      // Send the response back to the client
      res.json(transactions);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
}

module.exports = {
  UserController,
  AccountController,
  TransactionController,
  TransactionService,
};

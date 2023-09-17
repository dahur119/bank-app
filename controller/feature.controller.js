const { Goal, Bill, Statement } = require("../models/features.model");
const { User } = require("../models/account.model");
const errorHandler = require("../middleware/errorHandler");
const jwt = require("jsonwebtoken");

const bcrypt = require("bcryptjs");
require("dotenv").config;

class BillController {
  async createBill(req, res) {
    const { authorization } = req.headers;
    try {
      if (!authorization) {
        return res.status(401).json({
          error: "Unauthorized: Missing Authorization Header",
        });
      }
      const token = authorization.split(" ")[1];
      const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

      const userId = decodedToken._id;

      const { account, payee, amount, dueDate } = req.body;
      const newBill = new Bill({
        account,
        payee,
        amount,
        dueDate,
        userId,
      });

      await newBill.save();
      res.status(201).json(newBill);
    } catch (error) {
      errorHandler(error, req, res);
    }
  }
  async getBill(req, res) {
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

      const billId = req.params.billId;

      const bill = await Bill.findById(billId);

      if (!bill) {
        return res.status(404).json({
          message: "Bill not found",
        });
      }
      if (userId.toString() !== bill.userId.toString()) {
        return res.status(403).json({
          message:
            "Forbidden: You do not have permission to access this account.",
        });
      }
      res.json(bill);
    } catch (error) {
      errorHandler(error, req, res);
    }
  }
  async updateBill(req, res) {
    const { authorization } = req.headers;
    try {
      if (!authorization) {
        return res.status(401).json({
          error: "Unauthorized: Missing Authorization Header",
        });
      }

      const token = authorization.split(" ")[1];
      const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      const userId = decodedToken._id;

      const billId = req.params.billId;

      const bill = await Bill.findById(billId);

      const { account, payee, amount, dueDate, isPaid } = req.body;

      if (!bill) {
        return res.status(404).json({
          message: "Bill not found",
        });
      }

      if (userId.toString() !== bill.userId.toString()) {
        return res.status(403).json({
          message: "Forbidden: You do not have permission to access this bill.",
        });
      }

      bill.account = account;
      bill.payee = payee;
      bill.amount = amount;
      bill.dueDate = dueDate;
      bill.isPaid = isPaid;

      await bill.save();
    } catch (error) {
      errorHandler(error, req, res);
    }
  }

  async deleteBill(req, res) {
    const { authorization } = req.headers;
    try {
      if (!authorization) {
        return res.status(401).json({
          error: "Unauthorized: Missing Authorization Header",
        });
      }
      const billId = req.params.billId;

      const token = authorization.split(" ")[1];
      const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      const userId = decodedToken._id;

      const bill = await Bill.findById(billId);

      if (!bill) {
        return res.status(404).json({
          message: "Bill not found",
        });
      }

      if (userId.toString() !== bill.userId.toString()) {
        return res.status(403).json({
          message: "Forbidden: You do not have permission to delete this bill.",
        });
      }

      const deleteBill = await Bill.findByIdAndRemove(billId);

      if (!deleteBill) {
        return res.status(404).json({
          message: "Bill not Found",
        });
      }
      res.json(deleteBill);
    } catch (error) {
      errorHandler(error, req, res);
    }
  }
}

class StatementController {
  async generateStatement(req, res) {
    const { authorization } = req.headers;

    try {
      if (!authorization) {
        return res.status(401).json({
          error: "Unauthorized: Missing Authorization Header",
        });
      }
      const token = authorization.split(" ")[1];
      const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

      const userId = decodedToken._id;

      const { account, startDate, endDate } = req.body;
      const newStatement = new Statement({
        account,
        startDate,
        endDate,
        userId,
      });
      await newStatement.save();
      res.status(201).json(newStatement);
    } catch (error) {
      errorHandler(error, req, res);
    }
  }

  async getStatement(req, res) {
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

      const statementId = req.params.statementId;

      const statement = await Statement.findById(statementId).populate(
        "transactions"
      );
      if (!statement) {
        return res.status(404).json({
          message: "Statement not found",
        });
      }
      if (userId.toString() !== statement.statementId.toString()) {
        return res.status(403).json({
          message:
            "Forbidden: You do not have permission to access this account.",
        });
      }
      res.json(statement);
    } catch (error) {
      errorHandler(error, req, res);
    }
  }
}

class GoalController {
  async createGoal(req, res) {
    const { authorization } = req.headers;
    try {
      if (!authorization) {
        return res.status(401).json({
          error: "Unauthorized: Missing Authorization Header",
        });
      }
      const token = authorization.split(" ")[1];
      const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      const userId = decodedToken._id;

      const { account, goalName, targetAmount, currentAmount, deadline } =
        req.body;

      const newGoal = new Goal({
        account,
        goalName,
        targetAmount,
        currentAmount,
        deadline,
        userId,
      });
      await newGoal.save();

      res.status(201).json(newGoal);
    } catch (error) {
      errorHandler(error, req, res);
    }
  }

  async getGoal(req, res) {
    const { authorization } = req.headers;
    try {
      if (!authorization) {
        return res.status(401).json({
          error: "Unauthorized: Missing Authorization Header",
        });
      }
      const token = authorization.split(" ")[1];
      const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      const userId = decodedToken._id;

      const goalId = req.params.goalId;

      const goal = await Goal.findById(goalId);

      if (!goal) {
        return res.status(404).json({
          message: "Goal not found",
        });
      }

      if (userId.toString() !== goal.userId.toString()) {
        return res.status(403).json({
          message: "Forbidden: You do not have permission to access this goal.",
        });
      }

      res.json(goal);
    } catch (error) {
      errorHandler(error, req, res);
    }
  }

  async updateGoal(req, res) {
    const { authorization } = req.headers;
    try {
      if (!authorization) {
        return res.status(401).json({
          error: "Unauthorized: Missing Authorization Header",
        });
      }

      const token = authorization.split(" ")[1];
      const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      const userId = decodedToken._id;

      const goalId = req.params.goalId;

      const goal = await Goal.findById(goalId);

      const { goalName, targetAmount, currentAmount, deadline } = req.body;

      if (!goal) {
        return res.status(404).json({
          message: "Goal not found",
        });
      }

      if (userId.toString() !== goal.userId.toString()) {
        return res.status(403).json({
          message: "Forbidden: You do not have permission to update this goal.",
        });
      }
      goal.goalName = goalName;
      goal.targetAmount = targetAmount;
      goal.currentAmount = currentAmount;
      goal.deadline = deadline;
      await goal.save();
      res.json(goal);
    } catch (error) {
      errorHandler(error, req, res);
    }
  }

  async deleteGoal(req, res) {
    const { authorization } = req.headers;
    try {
      if (!authorization) {
        return res.status(401).json({
          error: "Unauthorized: Missing Authorization Header",
        });
      }

      const goalId = req.params.goalId;

      const token = authorization.split(" ")[1];
      const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      const userId = decodedToken._id;

      const goal = await Goal.findById(goalId);

      if (!goal) {
        return res.status(404).json({
          message: "Goal not found",
        });
      }

      if (userId.toString() !== goal.userId.toString()) {
        return res.status(403).json({
          message: "Forbidden: You do not have permission to delete this goal.",
        });
      }

      const deletedGoal = await Goal.findByIdAndRemove(goalId);

      if (!deletedGoal) {
        return res.status(404).json({
          message: "Goal not found",
        });
      }
      res.json(deletedGoal);
    } catch (error) {
      errorHandler(error, req, res);
    }
  }
}

module.exports = { BillController, GoalController, StatementController };

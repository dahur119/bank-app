const { Goal, Bill, Statement } = require("../models/features.model");
const errorHandler = require("../middleware/errorHandler");
const jwt = require("jsonwebtoken");

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

      const billId = req.params.billId.trim();

      // Fetch the bill from the database
      const bill = await Bill.findById(billId);

      if (!bill) {
        return res.status(404).json({
          message: "Bill not found",
        });
      }

      if (!bill.userId) {
        return res.status(500).json({
          message: "Bill does not have a userId",
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

      const billId = req.params.billId.trim();

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
      const billId = req.params.billId.trim;

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
    try {
      const { account, startDate, endDate, transactions } = req.body;

      // Assuming you have the 'Statement' model properly defined
      const newStatement = new Statement({
        account,
        startDate,
        endDate,
        transactions,
      });

      // Save the statement and wait for it to be saved
      await newStatement.save();

      // Send a success response with the newly created statement
      res.status(201).json(newStatement);
    } catch (error) {
      // Handle errors appropriately, log them for debugging
      console.error(error);

      // Send an error response
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  async getStatement(req, res) {
    try {
      const statementId = req.params.statementId.trim();

      const statement = await Statement.findById(statementId).populate(
        "transactions"
      );
      console.log("statemt", statement);
      if (!statement) {
        return res.status(404).json({
          message: "Statement not found",
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

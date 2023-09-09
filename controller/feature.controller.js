const { Goal, Bill, Statement } = require("../models/features.model");
const errorHandler = require("../middleware/errorHandler");

class BillController {
  async createBill(req, res) {
    try {
      const { account, payee, amount, dueDate } = req.body;
      const newBill = new Bill({
        account,
        payee,
        amount,
        dueDate,
      });
      await newBill.save();
      res.status(201).json(newBill);
    } catch (error) {
      errorHandler(error, req, res);
    }
  }
  async getBill(req, res) {
    try {
      const billId = req.params.billId;

      const bill = await Bill.findById(billId);

      if (!bill) {
        return res.status(404).json({
          message: "Bill not found",
        });
      }
      res.json(bill);
    } catch (error) {
      errorHandler(error, req, res);
    }
  }
  async updateBill(req, res) {
    try {
      const billId = req.params.billId;
      const { account, payee, amount, dueDate, isPaid } = req.body;

      const updatedBill = await Bill.findByIdAndUpdate(
        billId,
        {
          account,
          payee,
          amount,
          dueDate,
          isPaid,
        },
        { new: true }
      );
      if (!updatedBill) {
        return res.status(404).json({
          message: "Bill not found",
        });
      }
    } catch (error) {
      errorHandler(error, req, res);
    }
  }

  async deleteBill(req, res) {
    try {
      const billId = req.params.billId;

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
      const { account, startDate, endDate } = req.body;
      const newStatement = new Statement({
        account,
        startDate,
        endDate,
      });
      await newStatement.save();
      res.status(201).json(newStatement);
    } catch (error) {
      errorHandler(error, req, res);
    }
  }

  async getStatement(req, res) {
    try {
      const statementId = req.params.statementId;

      const statement = await Statement.findById(statementId).populate(
        "transactions"
      );
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
    try {
      const { account, goalName, targetAmount, currentAmount, deadline } =
        req.body;

      const newGoal = new Goal({
        account,
        goalName,
        targetAmount,
        currentAmount,
        deadline,
      });
      await newGoal.save();

      res.status(201).json(newGoal);
    } catch (error) {
      errorHandler(error, req, res);
    }
  }

  async getGoal(req, res) {
    try {
      const goalId = req.params.goalId;

      const goal = await Goal.findById(goalId);

      if (!goal) {
        return res.status(404).json({
          message: "Goal not found ",
        });
      }
      res.json(goal);
    } catch (error) {
      errorHandler(error, req, res);
    }
  }

  async updateGoal(req, res) {
    try {
      const goalId = req.params.goalId;
      const { goalName, targetAmount, currentAmount, deadline } = req.body;
      const updateGoal = await Goal.findByIdAndUpdate(
        goalId,
        {
          goalName,
          targetAmount,
          currentAmount,
          deadline,
        },
        { new: true }
      );
      if (!updateGoal) {
        return res.status(404).json({
          message: "Goal not found",
        });
      }
    } catch (error) {
      errorHandler(error, req, res);
    }
  }

  async deleteGoal(req, res) {
    try {
      const gaolId = req.params.goalId;

      const deletedGoal = await Goal.findByIdAndRemove(gaolId);

      if (!deletedGoal) {
        return res.status(404).json({
          message: "gaol not found",
        });
      }
      res.json(deletedGoal);
    } catch (error) {
      errorHandler(error, req, res);
    }
  }
}
module.exports = { BillController, GoalController, StatementController };

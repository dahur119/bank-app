const express = require("express");
const feature = express.Router();

const {
  BillController,
  GoalController,
  StatementController,
} = require("../controller/feature.controller");

const billController = new BillController();
const goalController = new GoalController();
const statementController = new StatementController();

feature.post("/bill", billController.createBill);
feature.get("/bill/:billId", billController.getBill);
feature.put("/bill/:billId", billController.updateBill);
feature.delete("/bill/:billId", billController.deleteBill);

feature.post("/statement", statementController.generateStatement);
feature.get("/statement/:statementId", statementController.getStatement);

feature.post("/goal", goalController.createGoal);
feature.get("/goal/:goalId", goalController.getGoal);
feature.put("/goal/:goalId", goalController.updateGoal);
feature.delete("/goal/:goalId", goalController.deleteGoal);

module.exports = feature;
// del

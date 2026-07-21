const express = require("express");
const router = express.Router();

const budgetController = require("../controllers/budgetController");
const { validateBudget } = require("../validators/budgetValidator");

// Create Budget
router.post("/", validateBudget, budgetController.createBudget);

// Get All Budgets
router.get("/", budgetController.getAllBudgets);

// Get Budget By ID
router.get("/:id", budgetController.getBudgetById);

// Update Budget
router.put("/:id", validateBudget, budgetController.updateBudget);

// Delete Budget
router.delete("/:id", budgetController.deleteBudget);

module.exports = router;
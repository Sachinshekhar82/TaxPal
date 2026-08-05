const express = require("express");
const router = express.Router();
<<<<<<< HEAD

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
=======
const budgetController = require("../controllers/budgetController");
const { protect } = require("../middleware/authMiddleware");

const { budgetValidation, validate } = require("../validators/budgetValidator");

router.use(protect);

router.get("/progress", budgetController.getBudgetProgress);
router.post("/", budgetValidation, validate, budgetController.createBudget);
router.get("/", budgetController.getBudgets);
router.get("/:id", budgetController.getBudgetById);
router.put("/:id", budgetValidation, validate, budgetController.updateBudget);
router.delete("/:id", budgetController.deleteBudget);

module.exports = router;
>>>>>>> main

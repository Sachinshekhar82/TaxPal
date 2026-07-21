const Budget = require("../models/Budget");

// Create a new budget
const createBudget = async (budgetData) => {
  const budget = new Budget(budgetData);
  return await budget.save();
};

// Get all budgets
const getAllBudgets = async () => {
  return await Budget.find();
};

// Get budget by ID
const getBudgetById = async (id) => {
  return await Budget.findById(id);
};

// Update budget
const updateBudget = async (id, budgetData) => {
  return await Budget.findByIdAndUpdate(id, budgetData, {
    new: true,
    runValidators: true,
  });
};

// Delete budget
const deleteBudget = async (id) => {
  return await Budget.findByIdAndDelete(id);
};

module.exports = {
  createBudget,
  getAllBudgets,
  getBudgetById,
  updateBudget,
  deleteBudget,
};
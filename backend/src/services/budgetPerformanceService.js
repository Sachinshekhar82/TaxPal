const Budget = require("../models/Budget");
const Transaction = require("../models/Transaction");
const mongoose = require("mongoose");

// Compares each budget's limit against actual spending in the period,
// and flags whether the category (and overall) went over budget.
async function getBudgetPerformanceData(userId, startDate, endDate) {
  const startMonthStr = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}`;
  const endMonthStr = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}`;

  // Find all budgets in the period range
  const budgets = await Budget.find({
    userId,
    month: { $gte: startMonthStr, $lte: endMonthStr }
  });

  // Find all expense transactions in the period range
  const transactions = await Transaction.find({
    userId,
    type: "expense",
    date: { $gte: startDate, $lte: endDate }
  });

  // Aggregate limits by category (case-insensitive grouping)
  const categoryBudgetMap = {};
  budgets.forEach(b => {
    const cat = b.category.trim().toLowerCase();
    categoryBudgetMap[cat] = (categoryBudgetMap[cat] || 0) + (b.limit || 0);
  });

  // Aggregate expenses by category
  const categorySpentMap = {};
  transactions.forEach(tx => {
    const cat = (tx.category || "Uncategorized").trim().toLowerCase();
    categorySpentMap[cat] = (categorySpentMap[cat] || 0) + (tx.amount || 0);
  });

  // Collect all unique categories
  const categoriesSet = new Set([
    ...Object.keys(categoryBudgetMap),
    ...Object.keys(categorySpentMap)
  ]);

  const categoryPerformance = Array.from(categoriesSet).map(catKey => {
    const budgetMatch = budgets.find(b => b.category.toLowerCase() === catKey);
    const txMatch = transactions.find(tx => (tx.category || "").toLowerCase() === catKey);
    const displayName = budgetMatch ? budgetMatch.category : (txMatch ? txMatch.category : catKey);

    const limit = categoryBudgetMap[catKey] || 0;
    const spent = categorySpentMap[catKey] || 0;
    const variance = limit - spent;
    const status = spent > limit ? "Limit Exceeded" : "On Track";

    return {
      category: displayName,
      categoryName: displayName,
      budgetLimit: limit,
      actualSpent: spent,
      variance,
      status
    };
  });

  const totalLimit = budgets.reduce((sum, b) => sum + (b.limit || 0), 0);
  const totalActualSpent = transactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);
  const remainingBalance = totalLimit - totalActualSpent;
  const overBudget = totalActualSpent > totalLimit;

  return {
    metrics: {
      totalLimit,
      totalActualSpent,
      remainingBalance,
      overBudget,
    },
    isOverBudget: overBudget,
    categoryPerformance
  };
}

module.exports = { getBudgetPerformanceData };

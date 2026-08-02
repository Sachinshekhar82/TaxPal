const mongoose = require("mongoose");
const Transaction = require("../models/Transaction");

// Existing Dashboard API
const getDashboardData = async (userId) => {
  const transactions = await Transaction.find({ userId }).sort({ date: -1 });

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  const recentTransactions = transactions.slice(0, 5);

  return {
    totalIncome,
    totalExpense,
    balance,
    recentTransactions,
  };
};

// Spending Breakdown API
const getSpendingBreakdown = async (userId) => {
  const breakdown = await Transaction.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        type: "expense",
      },
    },
    {
      $group: {
        _id: "$category",
        total: { $sum: "$amount" },
      },
    },
    {
      $project: {
        _id: 0,
        category: "$_id",
        total: 1,
      },
    },
    {
      $sort: {
        total: -1,
      },
    },
  ]);

  return breakdown;
};

module.exports = {
  getDashboardData,
  getSpendingBreakdown,
};
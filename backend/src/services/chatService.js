const ChatHistory = require("../models/ChatHistory");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const Budget = require("../models/Budget");
const TaxEstimate = require("../models/TaxEstimate");
const Report = require("../models/Report");
const taxCalendarService = require("./taxCalendarService");
const geminiService = require("./geminiService");
const chatActionService = require("./chatActionService");

function getCurrencySymbol(country) {
  if (!country) return '$';
  const c = country.trim().toUpperCase();
  if (c === 'US' || c === 'UNITED STATES') return '$';
  if (c === 'CA' || c === 'CANADA') return 'CA$';
  if (c === 'UK' || c === 'UNITED KINGDOM') return '£';
  if (c === 'AU' || c === 'AUSTRALIA') return 'AU$';
  if (c === 'IN' || c === 'INDIA') return '₹';
  return '$';
}

/**
 * Builds user's financial context strictly scoped to userId
 */
async function buildUserContext(userId) {
  const user = await User.findById(userId);
  const currencySymbol = user ? getCurrencySymbol(user.country) : "$";

  // Date range for current month
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  // 1. Transactions summary for current month
  const transactions = await Transaction.find({ userId }).sort({ date: -1 });

  let totalIncome = 0;
  let totalExpenses = 0;
  const categorySpending = {};

  transactions.forEach((tx) => {
    const amt = tx.amount || 0;
    if (tx.type === "income") {
      totalIncome += amt;
    } else {
      totalExpenses += amt;
      const cat = tx.category || "Uncategorized";
      categorySpending[cat] = (categorySpending[cat] || 0) + amt;
    }
  });

  const spendingBreakdown = Object.keys(categorySpending).map((cat) => ({
    category: cat,
    amount: categorySpending[cat],
  })).sort((a, b) => b.amount - a.amount);

  // 2. Budgets & progress
  const budgets = await Budget.find({ userId });
  let totalBudgetLimit = 0;
  let totalBudgetSpent = 0;
  const overBudgetCategories = [];

  budgets.forEach((b) => {
    totalBudgetLimit += b.limit || 0;
    totalBudgetSpent += b.spent || 0;
    if ((b.spent || 0) > (b.limit || 0)) {
      overBudgetCategories.push(b.category);
    }
  });

  const budgetSummary = {
    totalLimit: totalBudgetLimit,
    totalSpent: totalBudgetSpent,
    remaining: totalBudgetLimit - totalBudgetSpent,
    overBudgetCategories,
    budgetCount: budgets.length,
  };

  // 3. Tax Estimate
  const latestTaxEstimate = await TaxEstimate.findOne({ userId }).sort({ updatedAt: -1 });

  // 4. Reminders
  let reminders = [];
  try {
    reminders = await taxCalendarService.getUpcomingReminders(userId);
  } catch (err) {
    reminders = [];
  }

  // 5. Recent Reports
  const recentReports = await Report.find({ userId }).sort({ createdAt: -1 }).limit(5);

  return {
    userName: user ? user.name : "User",
    userEmail: user ? user.email : "",
    currencySymbol,
    summary: {
      totalIncome,
      totalExpenses,
      netIncome: totalIncome - totalExpenses,
      transactionCount: transactions.length,
    },
    spendingBreakdown,
    recentTransactions: transactions.slice(0, 10).map(t => ({
      type: t.type,
      category: t.category,
      amount: t.amount,
      date: t.date ? t.date.toISOString().split("T")[0] : "",
      description: t.description || "",
    })),
    budgetSummary,
    taxEstimate: latestTaxEstimate ? {
      quarter: latestTaxEstimate.quarter,
      year: latestTaxEstimate.year,
      grossIncomeForQuarter: latestTaxEstimate.grossIncomeForQuarter,
      totalDeductions: latestTaxEstimate.totalDeductions,
      taxableIncome: latestTaxEstimate.taxableIncome,
      nationalTax: latestTaxEstimate.nationalTax,
      stateTax: latestTaxEstimate.stateTax,
      estimatedTax: latestTaxEstimate.estimatedTax,
      effectiveTaxRate: latestTaxEstimate.effectiveTaxRate,
      dueDate: latestTaxEstimate.dueDate ? latestTaxEstimate.dueDate.toISOString().split("T")[0] : "",
    } : null,
    reminders: reminders.map(r => ({
      quarter: r.quarter,
      daysRemaining: r.daysRemaining,
      status: r.status,
      paymentStatus: r.paymentStatus,
      dueDate: r.dueDate,
    })),
    recentReports: recentReports.map(rp => ({
      id: rp._id,
      name: rp.reportName,
      type: rp.reportType,
      format: rp.format,
    })),
  };
}

/**
 * Processes user chat message
 */
async function processChatMessage(userId, userMessage) {
  if (!userMessage || typeof userMessage !== "string" || userMessage.trim() === "") {
    throw new Error("Message cannot be empty.");
  }

  const cleanMessage = userMessage.trim();

  // 1. Save user message to ChatHistory
  await ChatHistory.create({
    userId,
    role: "user",
    message: cleanMessage,
  });

  // 2. Fetch recent chat history
  const recentHistory = await ChatHistory.find({ userId }).sort({ createdAt: -1 }).limit(6);
  const formattedHistory = recentHistory.reverse().map(h => ({
    role: h.role,
    message: h.message,
  }));

  // 3. Build context & call Gemini
  const contextData = await buildUserContext(userId);
  const aiResponse = await geminiService.generateChatResponse(cleanMessage, contextData, formattedHistory);

  // 4. Validate & process intent action
  const action = await chatActionService.processIntent(userId, aiResponse.intent, aiResponse.parameters, contextData);

  // 5. Save assistant response to ChatHistory
  const assistantDoc = await ChatHistory.create({
    userId,
    role: "assistant",
    message: aiResponse.reply,
    action: action,
  });

  return {
    success: true,
    message: aiResponse.reply,
    action: action,
    createdAt: assistantDoc.createdAt,
  };
}

async function getChatHistory(userId) {
  const history = await ChatHistory.find({ userId }).sort({ createdAt: 1 }).limit(50);
  return history;
}

async function clearChatHistory(userId) {
  await ChatHistory.deleteMany({ userId });
  return { success: true, message: "Chat history cleared successfully." };
}

function getSuggestions() {
  return [
    "How much did I spend this month?",
    "What's my remaining budget?",
    "Explain my tax estimate.",
    "Show my upcoming reminders.",
    "Generate my monthly report.",
    "Export my transactions.",
  ];
}

module.exports = {
  processChatMessage,
  getChatHistory,
  clearChatHistory,
  getSuggestions,
};

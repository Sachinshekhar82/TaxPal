const dashboardService = require("../services/dashboardService");

// Existing Dashboard API
const getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    const dashboard = await dashboardService.getDashboardData(userId);

    res.status(200).json(dashboard);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// NEW Spending Breakdown API
const getSpendingBreakdown = async (req, res) => {
  try {
    const userId = req.user.id;

    const data = await dashboardService.getSpendingBreakdown(userId);

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getDashboard,
  getSpendingBreakdown,
};
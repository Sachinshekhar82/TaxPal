const express = require("express");
const router = express.Router();

const dashboardController = require("../controllers/dashboardController");
const { protect } = require("../middleware/authMiddleware");

// Protected Dashboard APIs
router.get("/", protect, dashboardController.getDashboard);
router.get(
  "/spending-breakdown",
  protect,
  dashboardController.getSpendingBreakdown
);

module.exports = router;
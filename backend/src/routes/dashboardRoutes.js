const express = require("express");
const router = express.Router();

const dashboardController = require("../controllers/dashboardController");

router.get("/", dashboardController.getDashboard);

// NEW API
router.get("/spending-breakdown", dashboardController.getSpendingBreakdown);

module.exports = router;
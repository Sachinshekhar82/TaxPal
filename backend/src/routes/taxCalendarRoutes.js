const express = require("express");
const router = express.Router();

const {
  getAllReminders,
  getUpcomingReminders,
  getReminderById,
} = require("../controllers/taxCalendarController");

const { protect } = require("../middleware/authMiddleware");

const {
  validateYear,
  validateQuarter,
  validateReminderId,
  validate,
} = require("../validators/taxCalendarValidator");

// Get all reminders (optionally filter by year and quarter)
router.get(
  "/",
  protect,
  validateYear,
  validateQuarter,
  validate,
  getAllReminders
);

// Get upcoming reminders
router.get("/upcoming", protect, getUpcomingReminders);

// Get reminder by ID
router.get(
  "/:id",
  protect,
  validateReminderId,
  validate,
  getReminderById
);

module.exports = router;
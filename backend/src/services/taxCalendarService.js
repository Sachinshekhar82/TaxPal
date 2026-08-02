const TaxEstimate = require("../models/TaxEstimate");

const {
  calculateDaysRemaining,
  getReminderStatus,
  sortByDueDate,
} = require("../utils/taxCalendarUtils");

// Get all reminders
const getAllReminders = async (userId, year) => {
  const filter = { userId };

  if (year) {
    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year}-12-31`);

    filter.dueDate = {
      $gte: startDate,
      $lte: endDate,
    };
  }

  let reminders = await TaxEstimate.find(filter);

  // Sort reminders by due date
  reminders = sortByDueDate(reminders);

  // Add reminder status and days remaining
  return reminders.map((reminder) => {
    const daysRemaining = calculateDaysRemaining(reminder.dueDate);
    const status = getReminderStatus(daysRemaining);

    return {
      ...reminder.toObject(),
      daysRemaining,
      status,
    };
  });
};

// Get upcoming reminders
const getUpcomingReminders = async (userId) => {
  const today = new Date();

  let reminders = await TaxEstimate.find({
    userId,
    dueDate: { $gte: today },
  });

  // Sort reminders by due date
  reminders = sortByDueDate(reminders);

  // Add reminder status and days remaining
  return reminders.map((reminder) => {
    const daysRemaining = calculateDaysRemaining(reminder.dueDate);
    const status = getReminderStatus(daysRemaining);

    return {
      ...reminder.toObject(),
      daysRemaining,
      status,
    };
  });
};

// Get reminder by ID
const getReminderById = async (userId, id) => {
  const reminder = await TaxEstimate.findOne({
    _id: id,
    userId,
  });

  if (!reminder) {
    throw new Error("Reminder not found");
  }

  const daysRemaining = calculateDaysRemaining(reminder.dueDate);
  const status = getReminderStatus(daysRemaining);

  return {
    ...reminder.toObject(),
    daysRemaining,
    status,
  };
};

module.exports = {
  getAllReminders,
  getUpcomingReminders,
  getReminderById,
};
const taxCalendarService = require("../services/taxCalendarService");

// Get all reminders
const getAllReminders = async (req, res) => {
  try {
    const userId = req.user.id;
    const { year } = req.query;

    const reminders = await taxCalendarService.getAllReminders(userId, year);

    res.status(200).json({
      success: true,
      message: "Tax reminders fetched successfully",
      data: reminders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get upcoming reminders
const getUpcomingReminders = async (req, res) => {
  try {
    const userId = req.user.id;

    const reminders = await taxCalendarService.getUpcomingReminders(userId);

    res.status(200).json({
      success: true,
      message: "Upcoming reminders fetched successfully",
      data: reminders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get reminder by ID
const getReminderById = async (req, res) => {
  try {
    const userId = req.user.id;
    const reminderId = req.params.id;

    const reminder = await taxCalendarService.getReminderById(
      userId,
      reminderId
    );

    res.status(200).json({
      success: true,
      message: "Reminder fetched successfully",
      data: reminder,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getAllReminders,
  getUpcomingReminders,
  getReminderById,
};
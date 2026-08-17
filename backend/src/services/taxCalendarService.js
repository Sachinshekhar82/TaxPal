const TaxEstimate = require("../models/TaxEstimate");
const User = require("../models/User");
const emailService = require("./emailService");
const taxReminderService = require("./taxReminderService");

const {
  getQuarterFromDate,
  calculateDaysRemaining,
  getReminderStatus,
  sortByDueDate,
} = require("../utils/taxCalendarUtils");

// ==============================
// GET ALL REMINDERS
// ==============================

exports.getAllReminders = async (userId, year) => {
  let query = {
    userId: userId,
  };

  if (year) {
    query.dueDate = {
      $gte: new Date(`${year}-01-01`),
      $lte: new Date(`${year}-12-31`),
    };
  }

  const reminders = await TaxEstimate.find(query);

  const formatted = reminders.map((reminder) => {
    const daysRemaining = calculateDaysRemaining(reminder.dueDate);

    return {
      ...reminder.toObject(),

      quarter:
        reminder.quarter || getQuarterFromDate(reminder.dueDate),

      daysRemaining,

      status: getReminderStatus(daysRemaining),
    };
  });

  return sortByDueDate(formatted);
};

// ==============================
// GET UPCOMING REMINDERS
// ==============================

exports.getUpcomingReminders = async (userId) => {
  const today = new Date();

  const reminders = await TaxEstimate.find({
    userId,
    dueDate: {
      $gte: today,
    },
  });

  return reminders.map((reminder) => {
    const daysRemaining = calculateDaysRemaining(reminder.dueDate);

    return {
      ...reminder.toObject(),

      daysRemaining,

      status: getReminderStatus(daysRemaining),
    };
  });
};

// ==============================
// GET REMINDER BY ID
// ==============================

exports.getReminderById = async (id, userId) => {
  const reminder = await TaxEstimate.findOne({
    _id: id,
    userId,
  });

  if (!reminder) {
    throw new Error("Reminder not found");
  }

  const daysRemaining = calculateDaysRemaining(reminder.dueDate);

  return {
    ...reminder.toObject(),

    daysRemaining,

    status: getReminderStatus(daysRemaining),
  };
};

// ==============================
// MARK AS READ
// ==============================

exports.markAsRead = async (id, userId) => {
  const reminder = await TaxEstimate.findOne({
    _id: id,
    userId,
  });

  if (!reminder) {
    throw new Error("Reminder not found");
  }

  reminder.isRead = true;

  await reminder.save();

  return reminder;
};

// ==============================
// UNDO MARK AS READ
// ==============================

exports.undoMarkAsRead = async (id, userId) => {
  const reminder = await TaxEstimate.findOne({
    _id: id,
    userId,
  });

  if (!reminder) {
    throw new Error("Reminder not found");
  }

  reminder.isRead = false;

  await reminder.save();

  return reminder;
};

// ==============================
// MARK PAYMENT AS COMPLETED
// ==============================

exports.markPaymentDone = async (id, userId) => {
  const reminder = await TaxEstimate.findOne({
    _id: id,
    userId,
  });

  if (!reminder) {
    throw new Error("Reminder not found");
  }

  // 1. Check for Duplicate Payment Confirmation
  if (reminder.paymentStatus === "Completed") {
    return {
      reminder,
      alreadyCompleted: true,
      emailSent: false,
      message: "Payment has already been marked as completed.",
    };
  }

  // 2. Update Payment Status in Database FIRST
  reminder.paymentStatus = "Completed";
  reminder.paymentCompletedAt = new Date();
  await reminder.save();

  let emailSent = false;
  let emailMessage = "Tax payment marked as completed successfully.";

  // 3. Check User Notification Preferences & Send Email
  try {
    const user = await User.findById(userId);
    const notifPrefs = user?.notificationPreferences || {};
    
    // Only send email if taxPaymentConfirmation is NOT explicitly disabled
    if (user && user.email && notifPrefs.taxPaymentConfirmation !== false) {
      const currencySymbol = user.country === "US" ? "$" : "₹";
      await emailService.sendTaxPaymentConfirmationEmail({
        toEmail: user.email,
        userName: user.name || user.username,
        quarter: reminder.quarter,
        estimatedTax: reminder.estimatedTax,
        paymentDate: reminder.paymentCompletedAt,
        currencySymbol,
      });

      reminder.confirmationEmailSent = true;
      reminder.confirmationEmailSentAt = new Date();
      await reminder.save();

      emailSent = true;
      emailMessage = "Tax payment marked as completed successfully. A confirmation email has been sent to your registered email.";
    } else {
      emailMessage = "Tax payment marked as completed.";
    }
  } catch (emailErr) {
    console.error("❌ [TaxCalendarService] Email sending failed during payment completion:", emailErr.message);
    emailSent = false;
    emailMessage = "Tax payment marked as completed. We couldn't send the confirmation email right now.";
  }

  return {
    reminder,
    alreadyCompleted: false,
    emailSent,
    message: emailMessage,
  };
};

// ==============================
// UNDO PAYMENT COMPLETED
// ==============================

exports.undoPaymentDone = async (id, userId) => {
  const reminder = await TaxEstimate.findOne({
    _id: id,
    userId,
  });

  if (!reminder) {
    throw new Error("Reminder not found");
  }

  reminder.paymentStatus = "Pending";
  reminder.paymentCompletedAt = null;

  await reminder.save();

  return reminder;
};

// ==============================
// TRIGGER UPCOMING REMINDERS MANUAL RUN
// ==============================

exports.triggerReminders = async () => {
  return await taxReminderService.processUpcomingTaxReminders();
};
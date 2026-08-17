const TaxEstimate = require('../models/TaxEstimate');
const User = require('../models/User');
const emailService = require('./emailService');
const { calculateDaysRemaining } = require('../utils/taxCalendarUtils');

/**
 * Scan database and send upcoming tax reminder emails
 */
exports.processUpcomingTaxReminders = async () => {
  console.log(`⏰ [TaxReminderJob] Running upcoming tax reminder check...`);
  
  try {
    // Find all pending tax estimates
    const pendingEstimates = await TaxEstimate.find({
      paymentStatus: { $ne: 'Completed' }
    });

    let sentCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const estimate of pendingEstimates) {
      try {
        const daysRemaining = calculateDaysRemaining(estimate.dueDate);

        // Check if reminder is due (<= 7 days or <= 1 day)
        const is7DayDue = daysRemaining <= 7 && daysRemaining > 1 && !estimate.reminderEmailSent7Days;
        const is1DayDue = daysRemaining <= 1 && daysRemaining >= 0 && !estimate.reminderEmailSent1Day;

        if (!is7DayDue && !is1DayDue) {
          skippedCount++;
          continue;
        }

        // Fetch User details
        const user = await User.findById(estimate.userId);
        if (!user || !user.email) {
          console.warn(`⚠️ [TaxReminderJob] Skipping estimate ${estimate._id}: User or email not found`);
          skippedCount++;
          continue;
        }

        // Check Notification Preference
        const notifPrefs = user.notificationPreferences || {};
        if (notifPrefs.taxDeadlines === false) {
          console.log(`ℹ️ [TaxReminderJob] User ${user.email} has disabled taxDeadlines notifications`);
          skippedCount++;
          continue;
        }

        // Currency symbol formatting
        const currencySymbol = user.country === 'US' ? '$' : '₹';

        // Send Email
        console.log(`🚀 [TaxReminderJob] Sending ${daysRemaining}-day tax reminder email to ${user.email}...`);
        await emailService.sendTaxReminderEmail({
          toEmail: user.email,
          userName: user.name || user.username,
          quarter: estimate.quarter,
          estimatedTax: estimate.estimatedTax,
          dueDate: estimate.dueDate,
          daysRemaining,
          currencySymbol
        });

        // Update database flags to prevent duplicate emails
        if (is7DayDue) {
          estimate.reminderEmailSent7Days = true;
        }
        if (is1DayDue) {
          estimate.reminderEmailSent1Day = true;
        }
        estimate.reminderEmailSentAt = new Date();
        await estimate.save();

        sentCount++;
      } catch (err) {
        console.error(`❌ [TaxReminderJob] Failed to process reminder for estimate ${estimate._id}:`, err.message);
        errorCount++;
      }
    }

    console.log(`✅ [TaxReminderJob] Completed. Sent: ${sentCount}, Skipped: ${skippedCount}, Errors: ${errorCount}`);
    return { sentCount, skippedCount, errorCount };
  } catch (error) {
    console.error(`❌ [TaxReminderJob] Job execution error:`, error.message);
    throw error;
  }
};

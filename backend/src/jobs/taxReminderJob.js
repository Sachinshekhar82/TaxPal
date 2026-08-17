const cron = require('node-cron');
const { processUpcomingTaxReminders } = require('../services/taxReminderService');

/**
 * Initialize background cron job for tax reminder emails
 */
const initTaxReminderJob = () => {
  console.log(`⏰ [TaxReminderJob] Cron scheduler initialized (Runs daily at 08:00 AM)`);
  
  // Run once every day at 08:00 AM
  cron.schedule('0 8 * * *', async () => {
    try {
      await processUpcomingTaxReminders();
    } catch (err) {
      console.error('❌ [TaxReminderJob] Cron execution failed:', err);
    }
  });
};

module.exports = { initTaxReminderJob };

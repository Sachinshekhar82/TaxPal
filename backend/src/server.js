require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const { initTaxReminderJob } = require('./jobs/taxReminderJob');

const PORT = process.env.PORT || 5000;

// Connect Database
connectDB();

// Initialize background cron scheduler
initTaxReminderJob();

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

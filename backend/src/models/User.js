const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    country: { type: String, default: "" },
    income_bracket: {
      type: String,
      enum: ["low", "middle", "high", ""],
      default: "",
    },
    notificationPreferences: {
      emailAlerts: { type: Boolean, default: true },
      weeklyDigest: { type: Boolean, default: false },
      budgetAlerts: { type: Boolean, default: true },
      taxDeadlines: { type: Boolean, default: true },
      taxPaymentConfirmation: { type: Boolean, default: true },
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);

const mongoose = require("mongoose");

const taxEstimateSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    country: {
      type: String,
      default: "India",
    },

    state: {
      type: String,
    },

    quarter: {
      type: String,
      enum: ["Q1", "Q2", "Q3", "Q4"],
      required: true,
    },

    filingStatus: {
      type: String,
      default: "Pending",
    },

    grossIncome: {
      type: Number,
      default: 0,
    },

    deductions: {
      type: Number,
      default: 0,
    },

    estimatedTax: {
      type: Number,
      default: 0,
    },

    dueDate: {
      type: Date,
      required: true,
    },


    // NEW FIELDS

    isRead: {
      type: Boolean,
      default: false,
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Completed"],
      default: "Pending",
    },

  },
  {
    timestamps: true,
  }
);


module.exports = mongoose.model(
  "TaxEstimate",
  taxEstimateSchema
);
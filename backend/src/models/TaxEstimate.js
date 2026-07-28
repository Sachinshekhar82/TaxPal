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
      required: true,
    },
    state: {
      type: String,
      default: "",
    },
    quarter: {
      type: String,
      enum: ["Q1", "Q2", "Q3", "Q4"],
      required: true,
    },
    filingStatus: {
      type: String,
      default: "",
    },
    grossIncomeForQuarter: {
      type: Number,
      required: true,
      min: [0, "Income cannot be negative"],
    },
    businessExpenses: {
      type: Number,
      default: 0,
    },
    retirementContribution: {
      type: Number,
      default: 0,
    },
    healthInsurancePremiums: {
      type: Number,
      default: 0,
    },
    homeOfficeDeduction: {
      type: Number,
      default: 0,
    },
    estimatedTax: {
      type: Number,
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true },
);

taxEstimateSchema.index({ userId: 1, quarter: 1 });

module.exports = mongoose.model("TaxEstimate", taxEstimateSchema);

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
    filingStatus: {
      type: String,
      enum: ["Single", "Married", "Married Separately", "Head of Household"],
      required: true,
    },
    quarter: {
      type: String,
      enum: ["Q1", "Q2", "Q3", "Q4"],
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },

    // Quarterly inputs (as entered in the form — NOT annual)
    grossIncomeForQuarter: {
      type: Number,
      required: true,
      min: [0, "Income cannot be negative"],
    },
    businessExpenses: { type: Number, default: 0 },
    retirementContribution: { type: Number, default: 0 },
    healthInsurancePremiums: { type: Number, default: 0 },
    homeOfficeDeduction: { type: Number, default: 0 },

    // Calculated summary (quarterly figures)
    totalDeductions: { type: Number, required: true },
    taxableIncome: { type: Number, required: true },
    nationalTax: { type: Number, required: true },
    stateTax: { type: Number, required: true },
    estimatedTax: { type: Number, required: true }, // nationalTax + stateTax
    effectiveTaxRate: { type: Number, required: true }, // percentage

    dueDate: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true },
);

taxEstimateSchema.index({ userId: 1, quarter: 1, year: 1 });

module.exports = mongoose.model("TaxEstimate", taxEstimateSchema);

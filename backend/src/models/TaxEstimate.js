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
      enum: ["US", "CA", "UK", "AU", "IN"],
      required: true,
    },
    state: {
      type: String,
      default: "",
    },
    filingStatus: {
      type: String,
      enum: [
        "Single",
        "Married (Joint)",
        "Married (Separately)",
        "Head of Household",
      ],
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
    grossIncomeForQuarter: {
      type: Number,
      required: true,
      min: [0, "Income cannot be negative"],
    },
    businessExpenses: { type: Number, default: 0 },
    retirementContribution: { type: Number, default: 0 },
    healthInsurancePremiums: { type: Number, default: 0 },
    homeOfficeDeduction: { type: Number, default: 0 },

    totalDeductions: { type: Number, required: true },
    taxableIncome: { type: Number, required: true },
    nationalTax: { type: Number, required: true },
    stateTax: { type: Number, required: true },
    estimatedTax: { type: Number, required: true },
    effectiveTaxRate: { type: Number, required: true },

    dueDate: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true },
);

taxEstimateSchema.index({ userId: 1, quarter: 1, year: 1 });

module.exports = mongoose.model("TaxEstimate", taxEstimateSchema);

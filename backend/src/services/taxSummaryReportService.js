const TaxEstimate = require("../models/TaxEstimate");
const Transaction = require("../models/Transaction");
const User = require("../models/User");

// Pulls the saved TaxEstimate for the selected quarter/year and
// reshapes it into the fields the Tax Summary report needs.
// If no saved estimate is found, it falls back to dynamic estimation from transactions.
async function getTaxSummaryData(userId, quarter, year, defaultCountry = "US") {
  const qUpper = quarter.toUpperCase();
  const estimate = await TaxEstimate.findOne({ userId, quarter: qUpper, year }).sort({
    createdAt: -1,
  });

  if (estimate) {
    const dateFormatted = estimate.dueDate ? new Date(estimate.dueDate).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    }) : '';

    return {
      metrics: {
        grossIncome: estimate.grossIncomeForQuarter || 0,
        totalDeductions: estimate.totalDeductions || 0,
        taxableIncome: estimate.taxableIncome || 0,
        estimatedTax: estimate.estimatedTax || 0
      },
      deductionsBreakdown: {
        businessExpenses: estimate.businessExpenses || 0,
        retirement: estimate.retirementContribution || 0,
        healthInsurance: estimate.healthInsurancePremiums || 0,
        homeOffice: estimate.homeOfficeDeduction || 0
      },
      taxCalculations: {
        nationalTax: estimate.nationalTax || 0,
        stateTax: estimate.stateTax || 0,
        effectiveTaxRate: estimate.effectiveTaxRate || 0,
        dueDate: dateFormatted
      },
      isSavedEstimate: true,
      country: estimate.country || defaultCountry
    };
  }

  // Fallback: Dynamic estimation from transactions in the quarter
  const quarterMonths = { Q1: [0, 2], Q2: [3, 5], Q3: [6, 8], Q4: [9, 11] };
  const months = quarterMonths[qUpper] || [0, 11];
  const startDate = new Date(year, months[0], 1);
  const endDate = new Date(year, months[1] + 1, 0, 23, 59, 59);

  const transactions = await Transaction.find({
    userId,
    date: { $gte: startDate, $lte: endDate }
  });

  const grossIncome = transactions
    .filter(tx => tx.type === 'income')
    .reduce((sum, tx) => sum + (tx.amount || 0), 0);

  const businessExpenses = transactions
    .filter(tx => tx.type === 'expense')
    .reduce((sum, tx) => sum + (tx.amount || 0), 0);

  const retirement = 0;
  const healthInsurance = 0;
  const homeOffice = 0;

  const totalDeductions = businessExpenses + retirement + healthInsurance + homeOffice;
  const taxableIncome = Math.max(0, grossIncome - totalDeductions);

  const nationalTax = taxableIncome * 0.12;
  const stateTax = taxableIncome * 0.045;
  const estimatedTax = nationalTax + stateTax;
  const effectiveTaxRate = grossIncome > 0 ? (estimatedTax / grossIncome) * 100 : 0;

  let dueDate = '';
  if (qUpper === 'Q1') dueDate = `April 15, ${year}`;
  else if (qUpper === 'Q2') dueDate = `June 15, ${year}`;
  else if (qUpper === 'Q3') dueDate = `September 15, ${year}`;
  else if (qUpper === 'Q4') dueDate = `January 15, ${year + 1}`;

  return {
    metrics: {
      grossIncome,
      totalDeductions,
      taxableIncome,
      estimatedTax
    },
    deductionsBreakdown: {
      businessExpenses,
      retirement,
      healthInsurance,
      homeOffice
    },
    taxCalculations: {
      nationalTax,
      stateTax,
      effectiveTaxRate,
      dueDate
    },
    isSavedEstimate: false,
    country: defaultCountry
  };
}

module.exports = { getTaxSummaryData };

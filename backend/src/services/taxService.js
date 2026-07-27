const taxSlabs = require("../utils/taxSlabs");

function calculateEstimatedTax(country, filingStatus, taxableIncome) {
  const slabs = taxSlabs[country]?.[filingStatus];
  if (!slabs) {
    throw new Error("Tax slabs not available for this country/filing status");
  }

  let tax = 0;
  let previousLimit = 0;

  for (const slab of slabs) {
    if (taxableIncome > previousLimit) {
      const taxableAtThisSlab =
        Math.min(taxableIncome, slab.upTo) - previousLimit;
      tax += taxableAtThisSlab * slab.rate;
      previousLimit = slab.upTo;
    } else {
      break;
    }
  }

  // Annual estimate ko quarterly me convert karna
  return Math.round((tax / 4) * 100) / 100;
}

function getTaxableIncome(
  grossIncome,
  businessExpenses,
  retirementContribution,
  healthInsurancePremiums,
  homeOfficeDeduction,
) {
  const totalDeductions =
    (businessExpenses || 0) +
    (retirementContribution || 0) +
    (healthInsurancePremiums || 0) +
    (homeOfficeDeduction || 0);

  return Math.max(0, grossIncome - totalDeductions);
}

function getQuarterlyDueDates(year) {
  return [
    { quarter: "Q1", dueDate: new Date(`${year}-04-15`) },
    { quarter: "Q2", dueDate: new Date(`${year}-06-15`) },
    { quarter: "Q3", dueDate: new Date(`${year}-09-15`) },
    { quarter: "Q4", dueDate: new Date(`${year + 1}-01-15`) },
  ];
}

module.exports = {
  calculateEstimatedTax,
  getTaxableIncome,
  getQuarterlyDueDates,
};

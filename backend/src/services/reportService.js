const Report = require("../models/Report");
const User = require("../models/User");
const { resolvePeriod } = require("../utils/periodResolver");
const { getIncomeStatementData } = require("./incomeStatementService");
const { getTaxSummaryData } = require("./taxSummaryReportService");
const { getBudgetPerformanceData } = require("./budgetPerformanceService");
const { generateCSV, generatePDF } = require("../utils/exportUtils");

function getCurrencySymbolForCountry(country) {
  if (!country) return '$';
  const c = country.trim().toUpperCase();
  if (c === 'US' || c === 'UNITED STATES') return '$';
  if (c === 'CA' || c === 'CANADA') return 'CA$';
  if (c === 'UK' || c === 'UNITED KINGDOM') return '£';
  if (c === 'AU' || c === 'AUSTRALIA') return 'AU$';
  if (c === 'IN' || c === 'INDIA') return '₹';
  return '$';
}

async function generateReport(userId, { reportType, period, format, year = 2026 }) {
  const user = await User.findById(userId);
  const userCountry = (user && user.country) ? user.country : "IN"; // default to IN per frontend auth service

  let reportData;
  let reportName;
  let periodLabel;
  let currencySymbol = "₹";

  const { startDate, endDate, label } = resolvePeriod(period, year);
  periodLabel = label;

  if (reportType === "income_statement") {
    reportData = await getIncomeStatementData(userId, startDate, endDate);
    reportName = `Income Statement - ${label}`;
    currencySymbol = getCurrencySymbolForCountry(userCountry);
  } else if (reportType === "tax_summary") {
    // Pass userCountry as the fallback country if no estimate is saved
    reportData = await getTaxSummaryData(userId, period, year, userCountry);
    reportName = `Tax Summary - ${label}`;
    currencySymbol = getCurrencySymbolForCountry(reportData.country);
  } else if (reportType === "budget_performance") {
    reportData = await getBudgetPerformanceData(userId, startDate, endDate);
    reportName = `Budget Performance - ${label}`;
    currencySymbol = getCurrencySymbolForCountry(userCountry);
  } else {
    throw new Error(`Unknown report type: ${reportType}`);
  }

  const generatedDateStr = new Date().toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const userName = user ? user.name : "TaxPal User";
  const userEmail = user ? user.email : "";

  const reportHeader = {
    logo: "TaxPal",
    title: reportType === "income_statement" 
      ? "Income Statement" 
      : reportType === "tax_summary" 
        ? "Tax Summary Report" 
        : "Budget Performance Report",
    userName,
    userEmail,
    periodLabel,
    generatedDate: generatedDateStr,
    currencySymbol
  };

  const finalReportData = {
    header: reportHeader,
    currencySymbol,
    ...reportData
  };

  const safeFileName = `${reportType}_${userId}_${Date.now()}`;
  let filePath;

  if (format === "CSV") {
    filePath = generateCSV(safeFileName, reportType, finalReportData);
  } else {
    filePath = generatePDF(safeFileName, reportType, finalReportData);
  }

  const report = await Report.create({
    userId,
    reportName,
    reportType,
    period: periodLabel,
    format,
    filePath,
    data: finalReportData
  });

  return report;
}

module.exports = { generateReport };

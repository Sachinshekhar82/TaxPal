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

async function generateReport(userId, { reportType, period = "current_month", format = "PDF", year = 2026, startDate, endDate }) {
  const user = await User.findById(userId);
  const userCountry = (user && user.country) ? user.country : "IN"; // default to IN per frontend auth service

  let reportData;
  let reportName;
  let periodLabel;
  let currencySymbol = "₹";

  const { startDate: resolvedStart, endDate: resolvedEnd, label } = resolvePeriod(period, year, startDate, endDate);
  periodLabel = label;

  // Normalize report type aliases
  const rawType = (reportType || "income_statement").trim().toLowerCase();
  let normalizedType = "income_statement";
  if (rawType.includes("tax")) {
    normalizedType = "tax_summary";
  } else if (rawType.includes("budget")) {
    normalizedType = "budget_performance";
  } else {
    normalizedType = "income_statement";
  }

  let titleLabel = "Financial Statement";
  if (rawType.includes("expense")) titleLabel = "Expense Report";
  else if (rawType.includes("income")) titleLabel = "Income Report";
  else if (rawType.includes("transaction")) titleLabel = "Transaction Report";
  else if (rawType.includes("savings")) titleLabel = "Savings Report";
  else if (rawType.includes("tax")) titleLabel = "Tax Summary Report";
  else if (rawType.includes("budget")) titleLabel = "Budget Performance Report";
  else if (rawType.includes("monthly") || rawType.includes("financial")) titleLabel = "Monthly Financial Report";

  if (normalizedType === "income_statement") {
    reportData = await getIncomeStatementData(userId, resolvedStart, resolvedEnd);
    reportName = `${titleLabel} - ${label}`;
    currencySymbol = getCurrencySymbolForCountry(userCountry);
  } else if (normalizedType === "tax_summary") {
    reportData = await getTaxSummaryData(userId, period, year, userCountry);
    reportName = `Tax Summary - ${label}`;
    currencySymbol = getCurrencySymbolForCountry(reportData.country);
  } else if (normalizedType === "budget_performance") {
    reportData = await getBudgetPerformanceData(userId, resolvedStart, resolvedEnd);
    reportName = `Budget Performance - ${label}`;
    currencySymbol = getCurrencySymbolForCountry(userCountry);
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
    reportType: normalizedType,
    period: periodLabel,
    format,
    filePath,
    data: finalReportData
  });

  return report;
}

module.exports = { generateReport };

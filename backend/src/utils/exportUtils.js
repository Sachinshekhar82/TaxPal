const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

const REPORTS_DIR = path.join(__dirname, "../../reports");

// Make sure reports directory exists
if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

function formatCurrency(val, symbol) {
  let safeSymbol = symbol || "$";
  if (safeSymbol === "₹") {
    safeSymbol = "Rs. ";
  } else if (safeSymbol !== "$" && safeSymbol !== "£" && !safeSymbol.endsWith(" ")) {
    safeSymbol = safeSymbol + " ";
  }

  if (val === undefined || val === null || isNaN(val)) {
    return `${safeSymbol}0.00`;
  }

  const formatted = Math.abs(val).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return val < 0 ? `-${safeSymbol}${formatted}` : `${safeSymbol}${formatted}`;
}

// Custom CSV Builder
function generateCSV(fileName, reportType, finalReportData) {
  const d = finalReportData;
  const currency = d.header.currencySymbol;
  let csvContent = "";

  // Common Header Metadata
  csvContent += `Report Name,${d.header.title} - ${d.header.periodLabel}\n`;
  csvContent += `Period,${d.header.periodLabel}\n`;
  csvContent += `Generated Date,${d.header.generatedDate}\n`;
  csvContent += `User,${d.header.userName} (${d.header.userEmail})\n\n`;

  if (reportType === "income_statement") {
    csvContent += `INCOME STATEMENT SUMMARY\n`;
    csvContent += `Metric,Amount (${currency})\n`;
    csvContent += `Total Income,${(d.metrics.totalIncome || 0).toFixed(2)}\n`;
    csvContent += `Total Expenses,${(d.metrics.totalExpenses || 0).toFixed(2)}\n`;
    csvContent += `Net Income,${(d.metrics.netIncome || 0).toFixed(2)}\n\n`;

    csvContent += `INCOME BREAKDOWN\n`;
    csvContent += `Category,Amount (${currency})\n`;
    (d.incomeBreakdown || []).forEach((row) => {
      csvContent += `"${row.category}",${(row.amount || 0).toFixed(2)}\n`;
    });
    csvContent += `\n`;

    csvContent += `EXPENSE BREAKDOWN\n`;
    csvContent += `Category,Amount (${currency})\n`;
    (d.expenseBreakdown || []).forEach((row) => {
      csvContent += `"${row.category}",${(row.amount || 0).toFixed(2)}\n`;
    });
  } else if (reportType === "tax_summary") {
    csvContent += `TAX SUMMARY REPORT METRICS\n`;
    csvContent += `Metric,Amount (${currency})\n`;
    csvContent += `Gross Income,${(d.metrics.grossIncome || 0).toFixed(2)}\n`;
    csvContent += `Total Deductions,${(d.metrics.totalDeductions || 0).toFixed(2)}\n`;
    csvContent += `Taxable Income,${(d.metrics.taxableIncome || 0).toFixed(2)}\n`;
    csvContent += `Estimated Tax,${(d.metrics.estimatedTax || 0).toFixed(2)}\n\n`;

    csvContent += `DEDUCTIONS BREAKDOWN\n`;
    csvContent += `Deduction Type,Amount (${currency})\n`;
    csvContent += `Business Expenses,${(d.deductionsBreakdown.businessExpenses || 0).toFixed(2)}\n`;
    csvContent += `Retirement Contributions,${(d.deductionsBreakdown.retirement || 0).toFixed(2)}\n`;
    csvContent += `Health Insurance Premiums,${(d.deductionsBreakdown.healthInsurance || 0).toFixed(2)}\n`;
    csvContent += `Home Office Deduction,${(d.deductionsBreakdown.homeOffice || 0).toFixed(2)}\n\n`;

    csvContent += `TAX CALCULATIONS & ESTIMATIONS\n`;
    csvContent += `Tax Type,Rate/Value\n`;
    csvContent += `National Tax,${(d.taxCalculations.nationalTax || 0).toFixed(2)}\n`;
    csvContent += `State Tax,${(d.taxCalculations.stateTax || 0).toFixed(2)}\n`;
    csvContent += `Effective Tax Rate,${(d.taxCalculations.effectiveTaxRate || 0).toFixed(2)}%\n`;
    csvContent += `Target Due Date,"${d.taxCalculations.dueDate}"\n`;
  } else if (reportType === "budget_performance") {
    csvContent += `BUDGET PERFORMANCE SUMMARY\n`;
    csvContent += `Metric,Amount (${currency})\n`;
    csvContent += `Total Budget Limit,${(d.metrics.totalLimit || 0).toFixed(2)}\n`;
    csvContent += `Total Actual Spent,${(d.metrics.totalActualSpent || 0).toFixed(2)}\n`;
    csvContent += `Remaining Balance,${(d.metrics.remainingBalance || 0).toFixed(2)}\n`;
    csvContent += `Over Budget Indicator,${d.metrics.overBudget ? "YES" : "NO"}\n\n`;

    csvContent += `CATEGORY PERFORMANCE\n`;
    csvContent += `Category,Budget Limit (${currency}),Actual Spent (${currency}),Variance (${currency}),Status\n`;
    (d.categoryPerformance || []).forEach((row) => {
      csvContent += `"${row.categoryName}",${(row.budgetLimit || 0).toFixed(2)},${(row.actualSpent || 0).toFixed(2)},${(row.variance || 0).toFixed(2)},"${row.status}"\n`;
    });
  }

  const filePath = path.join(REPORTS_DIR, `${fileName}.csv`);
  fs.writeFileSync(filePath, "\uFEFF" + csvContent, "utf8");
  return filePath;
}

// Custom Visual PDF Builder using pdfkit
function generatePDF(fileName, reportType, finalReportData) {
  const filePath = path.join(REPORTS_DIR, `${fileName}.pdf`);
  const doc = new PDFDocument({
    size: "LETTER",
    margins: { top: 40, bottom: 40, left: 40, right: 40 },
  });

  const writeStream = fs.createWriteStream(filePath);
  doc.pipe(writeStream);

  const d = finalReportData;
  const currency = d.header.currencySymbol;

  // 1. Header Layout
  doc.fillColor("#4F46E5").fontSize(20).text("TaxPal", 40, 40, { lineGap: 4, bold: true });
  doc.fillColor("#111827").fontSize(14).text(d.header.title.toUpperCase(), 40, doc.y, { lineGap: 8, bold: true });

  // Metadata block (left column)
  const metaY = doc.y;
  doc.fillColor("#374151").fontSize(10);
  doc.text(`Prepared For: `, 40, metaY, { continued: true, bold: true });
  doc.text(`${d.header.userName} (${d.header.userEmail})`, { bold: false });
  doc.text(`Period: `, 40, doc.y, { continued: true, bold: true });
  doc.text(`${d.header.periodLabel}`, { bold: false });

  // Timestamp block (right column)
  doc.text(`Generated: ${d.header.generatedDate}`, 360, metaY, { align: "right", width: 212 });
  doc.text(`Format: PDF Document`, 360, doc.y, { align: "right", width: 212 });

  doc.moveDown(1.5);
  doc.moveTo(40, doc.y).lineTo(572, doc.y).strokeColor("#E5E7EB").stroke();
  doc.moveDown(1.5);

  const gridY = doc.y;

  // 2. Report Specific Summary Metrics Grid
  if (reportType === "income_statement") {
    // 3 cards
    const cardW = 166;
    const gap = 16;
    const cardH = 50;

    // Total Income
    drawMetricCard(doc, 40, gridY, cardW, cardH, "Total Income", formatCurrency(d.metrics.totalIncome, currency), "#10B981");
    // Total Expenses
    drawMetricCard(doc, 40 + cardW + gap, gridY, cardW, cardH, "Total Expenses", formatCurrency(d.metrics.totalExpenses, currency), "#EF4444");
    // Net Income
    const netColor = d.metrics.netIncome >= 0 ? "#10B981" : "#EF4444";
    drawMetricCard(doc, 40 + 2 * (cardW + gap), gridY, cardW, cardH, "Net Income", formatCurrency(d.metrics.netIncome, currency), netColor);

    doc.y = gridY + cardH + 20;

    // Tables
    drawSectionHeader(doc, "Income Breakdown");
    drawTable(doc, ["Category", "Amount"], (d.incomeBreakdown || []).map(r => ({
      name: r.category,
      val: formatCurrency(r.amount, currency)
    })));

    doc.moveDown(1.5);

    drawSectionHeader(doc, "Expense Breakdown");
    drawTable(doc, ["Category", "Amount"], (d.expenseBreakdown || []).map(r => ({
      name: r.category,
      val: formatCurrency(r.amount, currency)
    })));

  } else if (reportType === "tax_summary") {
    // 4 cards
    const cardW = 124;
    const gap = 12;
    const cardH = 50;

    drawMetricCard(doc, 40, gridY, cardW, cardH, "Gross Income", formatCurrency(d.metrics.grossIncome, currency), "#111827");
    drawMetricCard(doc, 40 + cardW + gap, gridY, cardW, cardH, "Total Deductions", formatCurrency(d.metrics.totalDeductions, currency), "#111827");
    drawMetricCard(doc, 40 + 2 * (cardW + gap), gridY, cardW, cardH, "Taxable Income", formatCurrency(d.metrics.taxableIncome, currency), "#111827");
    drawMetricCard(doc, 40 + 3 * (cardW + gap), gridY, cardW, cardH, "Estimated Tax", formatCurrency(d.metrics.estimatedTax, currency), "#4F46E5", true);

    doc.y = gridY + cardH + 20;

    // Two tables side by side
    const tableY = doc.y;

    // Left Column: Deductions Breakdown
    doc.fillColor("#374151").fontSize(12).text("Deductions Breakdown Detail", 40, tableY, { bold: true });
    doc.moveDown(0.5);
    const deductions = [
      { name: "Business Expenses", val: formatCurrency(d.deductionsBreakdown.businessExpenses, currency) },
      { name: "Retirement Contributions", val: formatCurrency(d.deductionsBreakdown.retirement, currency) },
      { name: "Health Insurance Premiums", val: formatCurrency(d.deductionsBreakdown.healthInsurance, currency) },
      { name: "Home Office Deduction", val: formatCurrency(d.deductionsBreakdown.homeOffice, currency) }
    ];
    drawTable(doc, ["Deduction Type", "Amount"], deductions, 250);

    // Right Column: Tax Calculations
    doc.fillColor("#374151").fontSize(12).text("Tax Calculations & Projections", 312, tableY, { bold: true });
    doc.moveDown(0.5);
    const calculations = [
      { name: "National Tax Estimation", val: formatCurrency(d.taxCalculations.nationalTax, currency) },
      { name: "State Tax Estimation", val: formatCurrency(d.taxCalculations.stateTax, currency) },
      { name: "Effective Tax Rate", val: `${Number(d.taxCalculations.effectiveTaxRate).toFixed(2)}%` },
      { name: "Payment Due Date", val: d.taxCalculations.dueDate }
    ];
    drawTable(doc, ["Calculation / Metric", "Value"], calculations, 260, 312);

  } else if (reportType === "budget_performance") {
    // 3 cards
    const cardW = 166;
    const gap = 16;
    const cardH = 50;

    drawMetricCard(doc, 40, gridY, cardW, cardH, "Total Limit", formatCurrency(d.metrics.totalLimit, currency), "#111827");
    const spentColor = d.metrics.overBudget ? "#EF4444" : "#111827";
    drawMetricCard(doc, 40 + cardW + gap, gridY, cardW, cardH, "Total Actual Spent", formatCurrency(d.metrics.totalActualSpent, currency), spentColor);
    const remColor = d.metrics.remainingBalance >= 0 ? "#10B981" : "#EF4444";
    drawMetricCard(doc, 40 + 2 * (cardW + gap), gridY, cardW, cardH, "Remaining Balance", formatCurrency(d.metrics.remainingBalance, currency), remColor);

    doc.y = gridY + cardH + 16;

    // Over budget banner
    const bannerY = doc.y;
    const bannerBg = d.metrics.overBudget ? "#FEE2E2" : "#D1FAE5";
    const bannerBorder = d.metrics.overBudget ? "#FCA5A5" : "#A7F3D0";
    const bannerText = d.metrics.overBudget ? "#991B1B" : "#065F46";
    const bannerTitle = d.metrics.overBudget ? "Limit Exceeded" : "Within Budget Limits";
    const bannerDesc = d.metrics.overBudget
      ? "Your overall actual expenses have exceeded the total allocated budget limit."
      : "Your overall actual expenses are within the total allocated budget limits.";

    doc.fillColor(bannerBg).rect(40, bannerY, 532, 36).fill();
    doc.strokeColor(bannerBorder).rect(40, bannerY, 532, 36).stroke();
    doc.fillColor(bannerText).fontSize(10).text(bannerTitle, 50, bannerY + 6, { bold: true });
    doc.fontSize(8.5).text(bannerDesc, 50, bannerY + 20);

    doc.y = bannerY + 36 + 20;

    // Grid Table
    drawSectionHeader(doc, "Category Performance Grid");
    drawCategoryPerformanceTable(doc, d.categoryPerformance || [], currency);
  }

  // 3. Footer Layout
  const footerY = doc.page.height - 60;
  doc.moveTo(40, footerY).lineTo(572, footerY).strokeColor("#E5E7EB").stroke();
  doc.fillColor("#9CA3AF").fontSize(8)
     .text("Generated by TaxPal Technologies, Inc. Private & Confidential. For review only.", 40, footerY + 10, { align: "center", width: 532 });
  doc.text(`© ${new Date().getFullYear()} TaxPal. All rights reserved.`, 40, footerY + 22, { align: "center", width: 532 });

  doc.end();
  return filePath;
}

// Helpers for visual PDF layouts
function drawMetricCard(doc, x, y, w, h, label, value, valColor, isHighlight = false) {
  const bg = isHighlight ? "#EEF2F6" : "#F9FAFB";
  const border = isHighlight ? "#4F46E5" : "#E5E7EB";
  
  doc.fillColor(bg).rect(x, y, w, h).fill();
  doc.strokeColor(border).rect(x, y, w, h).stroke();

  doc.fillColor("#6B7280").fontSize(7.5).text(label, x + 6, y + 8, { width: w - 12, align: "center", bold: true });
  doc.fillColor(valColor).fontSize(13).text(value, x + 6, y + 22, { width: w - 12, align: "center", bold: true });
}

function drawSectionHeader(doc, title) {
  doc.fillColor("#1f2937").fontSize(11).text(title.toUpperCase(), 40, doc.y, { bold: true });
  doc.moveDown(0.5);
}

function drawTable(doc, headers, rows, width = 532, leftX = 40) {
  const headerY = doc.y;
  doc.fillColor("#F3F4F6").rect(leftX, headerY, width, 18).fill();
  doc.fillColor("#374151").fontSize(8.5);
  doc.text(headers[0], leftX + 8, headerY + 4, { bold: true });
  doc.text(headers[1], leftX + width - 108, headerY + 4, { align: "right", width: 100, bold: true });

  let curY = headerY + 18;
  doc.fontSize(9);
  rows.forEach((row) => {
    doc.moveTo(leftX, curY).lineTo(leftX + width, curY).strokeColor("#E5E7EB").stroke();
    doc.fillColor("#111827").text(row.name, leftX + 8, curY + 5);
    doc.text(row.val, leftX + width - 108, curY + 5, { align: "right", width: 100 });
    curY += 18;
  });
  doc.moveTo(leftX, curY).lineTo(leftX + width, curY).strokeColor("#E5E7EB").stroke();
  doc.y = curY;
}

function drawCategoryPerformanceTable(doc, rows, currency, width = 532, leftX = 40) {
  const headerY = doc.y;
  doc.fillColor("#F3F4F6").rect(leftX, headerY, width, 18).fill();
  doc.fillColor("#374151").fontSize(8.5);
  
  // Headers
  doc.text("Category", leftX + 8, headerY + 4, { bold: true });
  doc.text("Budget Limit", leftX + 160, headerY + 4, { align: "right", width: 80, bold: true });
  doc.text("Actual Spent", leftX + 250, headerY + 4, { align: "right", width: 80, bold: true });
  doc.text("Variance", leftX + 340, headerY + 4, { align: "right", width: 80, bold: true });
  doc.text("Status", leftX + 440, headerY + 4, { align: "center", width: 80, bold: true });

  let curY = headerY + 18;
  doc.fontSize(8.5);
  rows.forEach((row) => {
    doc.moveTo(leftX, curY).lineTo(leftX + width, curY).strokeColor("#E5E7EB").stroke();
    
    // Category Name
    doc.fillColor("#111827").text(row.categoryName, leftX + 8, curY + 5, { bold: true });
    
    // Budget Limit
    doc.fillColor("#374151").text(formatCurrency(row.budgetLimit, currency), leftX + 160, curY + 5, { align: "right", width: 80 });
    
    // Actual Spent
    doc.text(formatCurrency(row.actualSpent, currency), leftX + 250, curY + 5, { align: "right", width: 80 });
    
    // Variance
    const varColor = row.variance >= 0 ? "#10B981" : "#EF4444";
    doc.fillColor(varColor).text(formatCurrency(row.variance, currency), leftX + 340, curY + 5, { align: "right", width: 80 });
    
    // Status Badge text
    const statusColor = row.status === "On Track" ? "#10B981" : "#EF4444";
    doc.fillColor(statusColor).text(row.status, leftX + 440, curY + 5, { align: "center", width: 80, bold: true });

    curY += 18;
  });
  doc.moveTo(leftX, curY).lineTo(leftX + width, curY).strokeColor("#E5E7EB").stroke();
  doc.y = curY;
}

module.exports = { generateCSV, generatePDF, REPORTS_DIR };

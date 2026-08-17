const jwt = require("jsonwebtoken");
const reportService = require("./reportService");

const ALLOWED_ROUTES = [
  "/dashboard",
  "/transactions",
  "/budgets",
  "/tax-estimator",
  "/reports",
  "/settings",
  "/income",
  "/expense",
];

const ALLOWED_VIEWS = [
  "BUDGET_SUMMARY",
  "SPENDING_BREAKDOWN",
  "TAX_SUMMARY",
  "TRANSACTION_SUMMARY",
];

/**
 * Validates and executes application actions returned by Gemini intent classification.
 */
async function processIntent(userId, intent, parameters = {}, userContext = {}) {
  if (!intent || intent === "NONE") {
    return null;
  }

  const User = require("../models/User");
  const emailService = require("./emailService");

  // 1. DOWNLOAD_REPORT, GENERATE_REPORT, EXPORT_TRANSACTIONS, GENERATE_AND_EMAIL_REPORT, EMAIL_REPORT
  if (
    intent === "DOWNLOAD_REPORT" ||
    intent === "GENERATE_REPORT" ||
    intent === "EXPORT_TRANSACTIONS" ||
    intent === "GENERATE_AND_EMAIL_REPORT" ||
    intent === "EMAIL_REPORT"
  ) {
    try {
      const reportType = parameters.reportType || "income_statement";
      const period = parameters.period || "current_month";
      const format = parameters.format || (intent === "EXPORT_TRANSACTIONS" ? "CSV" : "PDF");
      const year = parameters.year ? parseInt(parameters.year, 10) : 2026;
      const startDate = parameters.startDate;
      const endDate = parameters.endDate;
      const shouldEmail = intent === "GENERATE_AND_EMAIL_REPORT" || intent === "EMAIL_REPORT" || parameters.emailRequested === true;

      // Call existing reportService to generate real authenticated report
      const report = await reportService.generateReport(userId, {
        reportType,
        period,
        format,
        year,
        startDate,
        endDate,
      });

      // Generate temporary auth token for secure file download URL
      const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "1h" });
      const downloadUrl = `/api/reports/${report._id}/download?token=${encodeURIComponent(token)}`;

      const ext = format === "CSV" ? "csv" : "pdf";
      const fileName = `${report.reportName.replace(/\s+/g, "_")}.${ext}`;

      // Extract real summary metrics from report data
      const data = report.data || {};
      const summaryMetrics = {
        income: data.totalIncome !== undefined ? data.totalIncome : (data.grossIncomeForQuarter || 0),
        expenses: data.totalExpenses !== undefined ? data.totalExpenses : (data.businessExpenses || 0),
        savings: data.netIncome !== undefined ? data.netIncome : (data.taxableIncome || 0),
        currencySymbol: data.currencySymbol || "₹"
      };

      let emailStatus = { sent: false, message: "" };

      // Send email if requested by prompt intent
      if (shouldEmail) {
        try {
          const user = await User.findById(userId);
          if (user && user.email) {
            await emailService.sendReportEmail({
              toEmail: user.email,
              userName: user.name || user.username,
              reportName: report.reportName,
              periodLabel: report.period,
              filePath: report.filePath,
              format: format
            });
            emailStatus = {
              sent: true,
              message: `Your ${report.reportName} has been sent to your registered email (${user.email}). 📧`
            };
          } else {
            emailStatus = {
              sent: false,
              message: "Registered user email not found."
            };
          }
        } catch (emailErr) {
          console.error("❌ Failed to send report email via chatbot action:", emailErr);
          emailStatus = {
            sent: false,
            message: `Your report was generated successfully, but we couldn't send the email right now. You can download it here.`
          };
        }
      }

      return {
        type: "DOWNLOAD",
        fileType: format,
        fileName: fileName,
        downloadUrl: downloadUrl,
        reportId: report._id,
        reportName: report.reportName,
        periodLabel: report.period,
        summary: summaryMetrics,
        emailRequested: shouldEmail,
        emailStatus: emailStatus
      };
    } catch (err) {
      console.error("Error processing report intent:", err);
      return null;
    }
  }

  // 2. NAVIGATE Action
  if (intent === "NAVIGATE") {
    const route = parameters.route || "/dashboard";
    const cleanRoute = route.startsWith("/") ? route : `/${route}`;

    if (ALLOWED_ROUTES.includes(cleanRoute)) {
      return {
        type: "NAVIGATE",
        route: cleanRoute,
        label: getRouteLabel(cleanRoute),
      };
    }
    return {
      type: "NAVIGATE",
      route: "/dashboard",
      label: "Dashboard",
    };
  }

  // 3. VIEW_CARD Action
  if (intent === "VIEW_CARD") {
    const view = parameters.view || "TRANSACTION_SUMMARY";
    if (ALLOWED_VIEWS.includes(view)) {
      let cardData = {};
      if (view === "BUDGET_SUMMARY") {
        cardData = userContext.budgetSummary || {};
      } else if (view === "TAX_SUMMARY") {
        cardData = userContext.taxEstimate || {};
      } else if (view === "SPENDING_BREAKDOWN") {
        cardData = userContext.spendingBreakdown || [];
      } else {
        cardData = userContext.summary || {};
      }

      return {
        type: "VIEW",
        view: view,
        data: cardData,
      };
    }
  }

  return null;
}

function getRouteLabel(route) {
  switch (route) {
    case "/dashboard": return "Open Dashboard";
    case "/transactions": return "Open Transactions";
    case "/budgets": return "Open Budgets";
    case "/tax-estimator": return "Open Tax Estimator";
    case "/reports": return "Open Reports";
    case "/settings": return "Open Settings";
    case "/income": return "Add Income";
    case "/expense": return "Add Expense";
    default: return "Open Page";
  }
}

module.exports = { processIntent, ALLOWED_ROUTES };

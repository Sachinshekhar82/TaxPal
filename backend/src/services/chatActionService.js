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

  // 1. DOWNLOAD_REPORT or EXPORT_TRANSACTIONS
  if (intent === "DOWNLOAD_REPORT" || intent === "EXPORT_TRANSACTIONS") {
    try {
      const reportType = parameters.reportType || "income_statement";
      const period = parameters.period || "current_month";
      const format = parameters.format || (intent === "EXPORT_TRANSACTIONS" ? "CSV" : "PDF");
      const year = parameters.year || 2026;

      // Call existing reportService
      const report = await reportService.generateReport(userId, {
        reportType,
        period,
        format,
        year,
      });

      // Generate temporary auth token for secure file download URL
      const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "1h" });
      const downloadUrl = `/api/reports/${report._id}/download?token=${encodeURIComponent(token)}`;

      const ext = format === "CSV" ? "csv" : "pdf";
      const fileName = `${report.reportName.replace(/\s+/g, "_")}.${ext}`;

      return {
        type: "DOWNLOAD",
        fileType: format,
        fileName: fileName,
        downloadUrl: downloadUrl,
        reportId: report._id,
      };
    } catch (err) {
      console.error("Error processing DOWNLOAD intent:", err);
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

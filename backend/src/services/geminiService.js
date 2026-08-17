const { GoogleGenerativeAI } = require("@google/generative-ai");

/**
 * Communicates with Google Gemini API to generate structured financial responses.
 */
async function generateChatResponse(userPrompt, contextData, history = []) {
  const apiKey = process.env.GEMINI_API_KEY;
  const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  // System instructions for Gemini
  const systemInstruction = `
You are the AI Financial Assistant for TaxPal, a personal finance and tax estimation platform.
Your primary role is to answer questions using the logged-in user's personal financial data and recommend or trigger appropriate application actions.

CRITICAL INSTRUCTIONS:
1. NEVER invent, fake, or extrapolate financial figures or tax amounts. Rely strictly on the provided Context Data.
2. FORMAT QUESTION WORKFLOW:
   - If the user asks to generate a report (e.g. "Generate my tax report", "Generate my budget report") BUT HAS NOT specified a format (PDF or CSV):
     - Ask the user which period and format (PDF or CSV) they prefer.
     - Set "intent": "NONE" and "parameters": {} so that NO report action button is generated before they choose!
   - If the user DOES specify a format (e.g. "PDF", "CSV", "as PDF", "generate in CSV format") OR is answering a format question (e.g. "PDF"):
     - Set "intent": "DOWNLOAD_REPORT" or "GENERATE_AND_EMAIL_REPORT".
     - Set "parameters": { "reportType": "...", "format": "PDF" | "CSV", "period": "..." }.
     - In "reply", confirm that their report is ready for download/email below.
3. Be professional, friendly, clear, and concise.
4. Currency symbol to use: ${contextData.currencySymbol || '$'}.

FORMATTING YOUR RESPONSE:
Always reply in JSON format with two keys:
{
  "reply": "Your natural language response to the user here.",
  "intent": "INTENT_NAME",
  "parameters": { ... }
}
Do not enclose the JSON in markdown block unless necessary, but raw JSON string is preferred.
`;

  // If Gemini API Key is missing, provide intelligent local fallback parsing
  if (!apiKey || apiKey === "YOUR_REAL_KEY" || apiKey.trim() === "") {
    console.log("ℹ️ GEMINI_API_KEY is not set or placeholder. Operating in intelligent fallback mode.");
    return fallbackResponseGenerator(userPrompt, contextData, history);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const fullPrompt = `${systemInstruction}

CONTEXT DATA:
${JSON.stringify(contextData, null, 2)}

RECENT CHAT HISTORY:
${history.map(h => `${h.role}: ${h.message}`).join("\n")}

USER QUESTION:
"${userPrompt}"
`;

    const result = await model.generateContent(fullPrompt);
    const text = result.response.text();

    try {
      const parsed = JSON.parse(text);
      return {
        reply: parsed.reply || "Here is your requested financial information.",
        intent: parsed.intent || "NONE",
        parameters: parsed.parameters || {},
      };
    } catch (parseErr) {
      return {
        reply: text,
        intent: "NONE",
        parameters: {},
      };
    }
  } catch (error) {
    console.error("⚠️ Gemini API Error:", error.message);
    // Fall back to rule-based parser on API error (e.g. invalid key or network issue)
    return fallbackResponseGenerator(userPrompt, contextData, history);
  }
}

/**
 * Intelligent local fallback parser when GEMINI_API_KEY is absent or API call fails
 */
function fallbackResponseGenerator(prompt, ctx, history = []) {
  const lower = prompt.toLowerCase();
  const symbol = ctx.currencySymbol || "$";

  // Check if format (PDF / CSV / Excel) is specified in current prompt or recent message
  const hasFormatMention = lower.includes("pdf") || lower.includes("csv") || lower.includes("excel");
  const isDirectFormatChoice = lower === "pdf" || lower === "csv" || lower === "excel" || lower.startsWith("pdf") || lower.startsWith("csv");

  // Detect email request intent
  const isEmailIntent = lower.includes("email") || lower.includes("send to my mail") || lower.includes("send it to my email") || lower.includes("send to registered email");

  // Detect report type in natural language prompt
  let reportType = "income_statement";
  if (lower.includes("tax")) reportType = "tax_summary";
  else if (lower.includes("budget")) reportType = "budget_performance";
  else if (lower.includes("expense")) reportType = "expense";
  else if (lower.includes("income")) reportType = "income";
  else if (lower.includes("transaction")) reportType = "transaction";
  else if (lower.includes("savings")) reportType = "savings";
  else if (lower.includes("summary") || lower.includes("complete")) reportType = "financial_summary";
  else if (lower.includes("monthly")) reportType = "monthly_financial";

  // Check recent history if assistant asked for format
  const lastAssistantMsg = (history || []).slice().reverse().find(h => h.role === "assistant");
  const wasAskedFormat = lastAssistantMsg && (lastAssistantMsg.message.includes("format") || lastAssistantMsg.message.includes("PDF or CSV"));

  // If user asks for a report BUT hasn't specified format and wasn't answering a format question:
  if ((lower.includes("generate") || lower.includes("download") || lower.includes("report")) && !hasFormatMention && !isDirectFormatChoice && !wasAskedFormat) {
    const reportTitle = reportType.replace(/_/g, " ");
    return {
      reply: `I can generate your ${reportTitle}. Which period would you like it for (e.g., current month, Q3, current year)? And what format do you prefer (PDF or CSV)?`,
      intent: "NONE",
      parameters: {},
    };
  }

  // Detect period / month in natural language prompt
  let period = "current_month";
  if (lower.includes("july")) period = "july";
  else if (lower.includes("august")) period = "august";
  else if (lower.includes("june")) period = "june";
  else if (lower.includes("may")) period = "may";
  else if (lower.includes("last month")) period = "last_month";
  else if (lower.includes("this month")) period = "current_month";
  else if (lower.includes("this year") || lower.includes("2026") || lower.includes("q3")) period = lower.includes("q3") ? "q3" : "current_year";

  const requestedFormat = lower.includes("csv") || lower.includes("excel") ? "CSV" : "PDF";

  // 1. Report & Export Requests (when format IS specified or user answered)
  if (lower.includes("generate") || lower.includes("download") || lower.includes("export") || lower.includes("report") || hasFormatMention || isDirectFormatChoice || isEmailIntent) {
    const reportTitle = reportType.replace(/_/g, " ");
    const intentName = isEmailIntent ? "GENERATE_AND_EMAIL_REPORT" : "DOWNLOAD_REPORT";
    const replyText = isEmailIntent 
      ? `Generating your ${reportTitle} in ${requestedFormat} format and emailing it to your registered email address.`
      : `Your ${reportTitle} is ready in ${requestedFormat} format!`;

    return {
      reply: replyText,
      intent: intentName,
      parameters: { reportType, period, format: requestedFormat, emailRequested: isEmailIntent },
    };
  }

  // 2. Navigation Requests
  if (lower.includes("open") || lower.includes("take me to") || lower.includes("go to") || lower.includes("show page")) {
    if (lower.includes("transaction")) {
      return { reply: "Opening your Transactions page.", intent: "NAVIGATE", parameters: { route: "/transactions" } };
    }
    if (lower.includes("budget")) {
      return { reply: "Opening your Budgets page.", intent: "NAVIGATE", parameters: { route: "/budgets" } };
    }
    if (lower.includes("tax")) {
      return { reply: "Opening your Tax Estimator page.", intent: "NAVIGATE", parameters: { route: "/tax-estimator" } };
    }
    if (lower.includes("report")) {
      return { reply: "Opening your Financial Reports page.", intent: "NAVIGATE", parameters: { route: "/reports" } };
    }
    if (lower.includes("settings") || lower.includes("profile")) {
      return { reply: "Opening your Settings page.", intent: "NAVIGATE", parameters: { route: "/settings" } };
    }
    if (lower.includes("income") || lower.includes("add income")) {
      return { reply: "Opening Add Income form.", intent: "NAVIGATE", parameters: { route: "/income" } };
    }
    if (lower.includes("expense") || lower.includes("add expense")) {
      return { reply: "Opening Add Expense form.", intent: "NAVIGATE", parameters: { route: "/expense" } };
    }
    return { reply: "Opening your Dashboard.", intent: "NAVIGATE", parameters: { route: "/dashboard" } };
  }

  // 3. Budget Queries
  if (lower.includes("budget")) {
    const totalLimit = ctx.budgetSummary?.totalLimit || 0;
    const totalSpent = ctx.budgetSummary?.totalSpent || 0;
    const remaining = ctx.budgetSummary?.remaining || 0;
    const over = ctx.budgetSummary?.overBudgetCategories || [];

    if (over.length > 0) {
      return {
        reply: `You have total budget limits of ${symbol}${totalLimit.toLocaleString()}, actual spent ${symbol}${totalSpent.toLocaleString()}, leaving ${symbol}${remaining.toLocaleString()} remaining. Warning: ${over.join(", ")} category has exceeded its allocated limit.`,
        intent: "VIEW_CARD",
        parameters: { view: "BUDGET_SUMMARY" },
      };
    }

    return {
      reply: `Your total budget is ${symbol}${totalLimit.toLocaleString()}. You have spent ${symbol}${totalSpent.toLocaleString()} and have ${symbol}${remaining.toLocaleString()} remaining.`,
      intent: "VIEW_CARD",
      parameters: { view: "BUDGET_SUMMARY" },
    };
  }

  // 4. Tax Queries
  if (lower.includes("tax") || lower.includes("due date") || lower.includes("quarter")) {
    if (ctx.taxEstimate) {
      const taxEst = ctx.taxEstimate;
      return {
        reply: `For ${taxEst.quarter || 'current quarter'} ${taxEst.year || 2026}, your estimated gross income is ${symbol}${(taxEst.grossIncomeForQuarter || 0).toLocaleString()}, taxable income is ${symbol}${(taxEst.taxableIncome || 0).toLocaleString()}, and estimated tax is ${symbol}${(taxEst.estimatedTax || 0).toLocaleString()} (effective rate ${taxEst.effectiveTaxRate || 0}%).`,
        intent: "VIEW_CARD",
        parameters: { view: "TAX_SUMMARY" },
      };
    }
    return {
      reply: "You haven't saved a tax estimate yet for this quarter. You can calculate and save one in the Tax Estimator page.",
      intent: "NAVIGATE",
      parameters: { route: "/tax-estimator" },
    };
  }

  // 5. Transaction / Income / Expense Queries
  if (lower.includes("spend") || lower.includes("expense") || lower.includes("income") || lower.includes("transaction")) {
    const totalIncome = ctx.summary?.totalIncome || 0;
    const totalExpense = ctx.summary?.totalExpenses || 0;
    const net = ctx.summary?.netIncome || 0;
    const topCat = ctx.spendingBreakdown?.[0];

    let reply = `This month, your total income is ${symbol}${totalIncome.toLocaleString()} and total expenses are ${symbol}${totalExpense.toLocaleString()} (Net balance: ${symbol}${net.toLocaleString()}).`;
    if (topCat) {
      reply += ` Your top spending category is ${topCat.category} at ${symbol}${topCat.amount.toLocaleString()}.`;
    }

    return {
      reply,
      intent: "VIEW_CARD",
      parameters: { view: "TRANSACTION_SUMMARY" },
    };
  }

  // 6. Reminder Queries
  if (lower.includes("reminder") || lower.includes("alert")) {
    const count = ctx.reminders?.length || 0;
    if (count > 0) {
      const upcoming = ctx.reminders[0];
      return {
        reply: `You have ${count} upcoming tax reminders. Next due date: ${upcoming.dueDate ? new Date(upcoming.dueDate).toLocaleDateString() : 'Quarterly Due'} (${upcoming.daysRemaining || 0} days remaining).`,
        intent: "NAVIGATE",
        parameters: { route: "/tax-estimator" },
      };
    }
    return {
      reply: "You currently have no pending tax reminders due.",
      intent: "NONE",
      parameters: {},
    };
  }

  // Generic Default Response
  return {
    reply: `Hello! I'm your TaxPal AI Financial Assistant. I can help you analyze your transactions, check budgets (${symbol}${ctx.budgetSummary?.remaining || 0} remaining), review tax estimates (${symbol}${ctx.taxEstimate?.estimatedTax || 0}), or generate downloadable PDF/CSV reports. What would you like to check?`,
    intent: "NONE",
    parameters: {},
  };
}

module.exports = { generateChatResponse };

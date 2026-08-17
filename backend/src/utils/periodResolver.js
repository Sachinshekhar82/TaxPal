// Converts a period selection from the form into a concrete date range
// and a human-readable label, so every report service can share this logic.

const MONTH_NAMES_MAP = {
  january: 0, jan: 0,
  february: 1, feb: 1,
  march: 2, mar: 2,
  april: 3, apr: 3,
  may: 4,
  june: 5, jun: 5,
  july: 6, jul: 6,
  august: 7, aug: 7,
  september: 8, sep: 8, sept: 8,
  october: 9, oct: 9,
  november: 10, nov: 10,
  december: 11, dec: 11,
};

function resolvePeriod(periodKey = "current_month", year, customStartDate, customEndDate) {
  const now = new Date();
  const targetYear = year || now.getFullYear();

  // 1. Explicit Custom Dates
  if (customStartDate && customEndDate) {
    const start = new Date(customStartDate);
    const end = new Date(customEndDate);
    if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
      const label = `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
      return { startDate: start, endDate: end, label };
    }
  }

  const normalizedKey = (periodKey || "").trim().toLowerCase();

  // 2. Month Names (e.g. "july", "july_2026", "august")
  if (MONTH_NAMES_MAP[normalizedKey] !== undefined) {
    const monthIdx = MONTH_NAMES_MAP[normalizedKey];
    const start = new Date(targetYear, monthIdx, 1);
    const end = new Date(targetYear, monthIdx + 1, 0, 23, 59, 59);
    const label = start.toLocaleString("en-US", { month: "long", year: "numeric" });
    return { startDate: start, endDate: end, label };
  }

  switch (normalizedKey) {
    case "current_month":
    case "this_month": {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      const label = start.toLocaleString("en-US", { month: "long", year: "numeric" });
      return { startDate: start, endDate: end, label };
    }

    case "last_month": {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
      const label = start.toLocaleString("en-US", { month: "long", year: "numeric" });
      return { startDate: start, endDate: end, label };
    }

    case "current_year":
    case "full_year":
    case "this_year":
    case "annual":
    case "year": {
      const start = new Date(targetYear, 0, 1);
      const end = new Date(targetYear, 11, 31, 23, 59, 59);
      return { startDate: start, endDate: end, label: `${targetYear}` };
    }

    case "q1":
    case "q2":
    case "q3":
    case "q4": {
      const qUpper = normalizedKey.toUpperCase();
      const quarterMonths = { Q1: [0, 2], Q2: [3, 5], Q3: [6, 8], Q4: [9, 11] };
      const [startMonth, endMonth] = quarterMonths[qUpper];
      const start = new Date(targetYear, startMonth, 1);
      const end = new Date(targetYear, endMonth + 1, 0, 23, 59, 59);
      return { startDate: start, endDate: end, label: `${qUpper} ${targetYear}` };
    }

    default: {
      const numericYear = parseInt(normalizedKey, 10);
      if (!isNaN(numericYear) && numericYear > 1900 && numericYear < 2100) {
        const start = new Date(numericYear, 0, 1);
        const end = new Date(numericYear, 11, 31, 23, 59, 59);
        return { startDate: start, endDate: end, label: `${numericYear}` };
      }
      // Default fallback to current month
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      const label = start.toLocaleString("en-US", { month: "long", year: "numeric" });
      return { startDate: start, endDate: end, label };
    }
  }
}

module.exports = { resolvePeriod };

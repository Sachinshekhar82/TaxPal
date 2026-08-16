// Converts a period selection from the form into a concrete date range
// and a human-readable label, so every report service can share this logic.

function resolvePeriod(periodKey, year) {
  const now = new Date();
  const normalizedKey = periodKey.trim().toLowerCase();

  switch (normalizedKey) {
    case "current_month": {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      const label = start.toLocaleString("en-US", {
        month: "long",
        year: "numeric",
      });
      return { startDate: start, endDate: end, label };
    }

    case "last_month": {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
      const label = start.toLocaleString("en-US", {
        month: "long",
        year: "numeric",
      });
      return { startDate: start, endDate: end, label };
    }

    case "current_year": {
      const start = new Date(now.getFullYear(), 0, 1);
      const end = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
      return { startDate: start, endDate: end, label: `${now.getFullYear()}` };
    }

    case "q1":
    case "q2":
    case "q3":
    case "q4": {
      const qUpper = normalizedKey.toUpperCase();
      const quarterMonths = { Q1: [0, 2], Q2: [3, 5], Q3: [6, 8], Q4: [9, 11] };
      const [startMonth, endMonth] = quarterMonths[qUpper];
      const start = new Date(year, startMonth, 1);
      const end = new Date(year, endMonth + 1, 0, 23, 59, 59);
      return { startDate: start, endDate: end, label: `${qUpper} ${year}` };
    }

    default:
      throw new Error(`Unknown period: ${periodKey}`);
  }
}

module.exports = { resolvePeriod };

// Tax slabs for quarterly estimated tax calculation — Updated for 2026
// Sources: IRS Rev. Proc. 2025-32 (US), India Union Budget 2026 (new regime),
// CRA 2026 federal rates (Canada), ATO 2026-27 resident rates (Australia),
// HMRC 2026/27 rates (UK)

const taxSlabs = {
  "United States": {
    // 2026 federal brackets, Single filer
    Single: [
      { upTo: 12400, rate: 0.1 },
      { upTo: 50400, rate: 0.12 },
      { upTo: 105700, rate: 0.22 },
      { upTo: 201775, rate: 0.24 },
      { upTo: 256225, rate: 0.32 },
      { upTo: 640600, rate: 0.35 },
      { upTo: Infinity, rate: 0.37 },
    ],
  },
  India: {
    // New tax regime, FY 2025-26 / FY 2026-27 (unchanged in Budget 2026)
    Individual: [
      { upTo: 400000, rate: 0.0 },
      { upTo: 800000, rate: 0.05 },
      { upTo: 1200000, rate: 0.1 },
      { upTo: 1600000, rate: 0.15 },
      { upTo: 2000000, rate: 0.2 },
      { upTo: 2400000, rate: 0.25 },
      { upTo: Infinity, rate: 0.3 },
    ],
  },
  Canada: {
    // 2026 federal brackets (provincial tax not included)
    Individual: [
      { upTo: 58523, rate: 0.14 },
      { upTo: 117045, rate: 0.205 },
      { upTo: 181440, rate: 0.26 },
      { upTo: 258482, rate: 0.29 },
      { upTo: Infinity, rate: 0.33 },
    ],
  },
  Australia: {
    // 2026-27 resident rates (Medicare levy not included)
    Individual: [
      { upTo: 18200, rate: 0.0 },
      { upTo: 45000, rate: 0.15 },
      { upTo: 135000, rate: 0.3 },
      { upTo: 190000, rate: 0.37 },
      { upTo: Infinity, rate: 0.45 },
    ],
  },
  "United Kingdom": {
    // 2026/27 rates (England, Wales, Northern Ireland)
    Individual: [
      { upTo: 12570, rate: 0.0 },
      { upTo: 50270, rate: 0.2 },
      { upTo: 125140, rate: 0.4 },
      { upTo: Infinity, rate: 0.45 },
    ],
  },
};

module.exports = taxSlabs;

const taxSlabs = {
  "United States": {
    Single: [
      { upTo: 11000, rate: 0.1 },
      { upTo: 44725, rate: 0.12 },
      { upTo: 95375, rate: 0.22 },
      { upTo: 182100, rate: 0.24 },
      { upTo: Infinity, rate: 0.32 },
    ],
  },
  India: {
    Individual: [
      { upTo: 300000, rate: 0.0 },
      { upTo: 600000, rate: 0.05 },
      { upTo: 900000, rate: 0.1 },
      { upTo: 1200000, rate: 0.15 },
      { upTo: 1500000, rate: 0.2 },
      { upTo: Infinity, rate: 0.3 },
    ],
  },
};

module.exports = taxSlabs;

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import Routes
// const taxPolicyRoutes = require("./routes/taxPolicyRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

// Use Routes
// app.use("/api/tax-policy", taxPolicyRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Default Route
app.get("/", (req, res) => {
  res.json({
    message: "TaxPal API is running successfully.",
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

module.exports = app;
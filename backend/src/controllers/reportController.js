const fs = require("fs");
const jwt = require("jsonwebtoken");
const Report = require("../models/Report");
const reportService = require("../services/reportService");

const generateReport = async (req, res, next) => {
  try {
    const { reportType, period, format, year } = req.body;
    if (!reportType || !period || !format) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: reportType, period, and format are required.",
      });
    }

    const report = await reportService.generateReport(req.user.id, {
      reportType,
      period,
      format,
      year: year ? parseInt(year, 10) : 2026,
    });

    res.status(201).json({
      success: true,
      message: "Report generated successfully.",
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

const getReports = async (req, res, next) => {
  try {
    const reports = await Report.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      message: "Reports retrieved successfully.",
      data: reports,
    });
  } catch (error) {
    next(error);
  }
};

const deleteReport = async (req, res, next) => {
  try {
    const report = await Report.findOne({ _id: req.params.id, userId: req.user.id });
    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found or access denied.",
      });
    }

    // Delete the file on disk if it exists
    if (report.filePath && fs.existsSync(report.filePath)) {
      try {
        fs.unlinkSync(report.filePath);
      } catch (fileErr) {
        console.error("Error deleting physical file:", fileErr);
      }
    }

    await Report.deleteOne({ _id: req.params.id });

    res.status(200).json({
      success: true,
      message: "Report deleted successfully.",
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

const downloadReportFile = async (req, res, next) => {
  try {
    let token = req.query.token;
    if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. Token is missing.",
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. Invalid or expired token.",
      });
    }

    const report = await Report.findOne({ _id: req.params.id, userId: decoded.id });
    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found or access denied.",
      });
    }

    if (!fs.existsSync(report.filePath)) {
      return res.status(404).json({
        success: false,
        message: "The requested report file could not be found on the server.",
      });
    }

    // Determine download filename
    const ext = report.format === "CSV" ? ".csv" : ".pdf";
    const downloadName = `${report.reportName.replace(/\s+/g, "_")}${ext}`;

    res.download(report.filePath, downloadName);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateReport,
  getReports,
  deleteReport,
  downloadReportFile,
};

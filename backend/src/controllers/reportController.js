const fs = require("fs");
const jwt = require("jsonwebtoken");
const Report = require("../models/Report");
const reportService = require("../services/reportService");
const { generateCSV, generatePDF } = require("../utils/exportUtils");

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

    let filePath = report.filePath;
    const safeFileName = `${report.reportType}_${report.userId}_${report._id}`;

    // If file is missing on disk, regenerate PDF or CSV file on the fly using report.data!
    if (!filePath || !fs.existsSync(filePath)) {
      if (report.format === "CSV") {
        filePath = generateCSV(safeFileName, report.reportType, report.data);
      } else {
        filePath = generatePDF(safeFileName, report.reportType, report.data);
      }
      report.filePath = filePath;
      await report.save();
    }

    const ext = report.format === "CSV" ? ".csv" : ".pdf";
    const cleanTitle = (report.reportName || "Report").replace(/[^a-zA-Z0-9_\-]/g, "_");
    const downloadName = `${cleanTitle}${ext}`;

    const mimeType = report.format === "CSV" ? "text/csv" : "application/pdf";
    res.setHeader("Content-Type", mimeType);
    res.setHeader("Content-Disposition", `attachment; filename="${downloadName}"`);

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
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

const express = require("express");
const router = express.Router();

const controller = require("../controllers/categoryController");
const { protect } = require("../middleware/authMiddleware");

const {
  getCategories,
  getDefaultCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  suggestCategory,
} = controller;

// Public Routes
router.get("/default", getDefaultCategories);
router.post("/suggest", suggestCategory);

// Protected Routes
router.get("/", protect, getCategories);
router.post("/", protect, createCategory);
router.put("/:id", protect, updateCategory);
router.delete("/:id", protect, deleteCategory);

module.exports = router;
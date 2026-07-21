const express = require("express");
const router = express.Router();

const controller = require("../controllers/categoryController");

const {
  getCategories,
  getDefaultCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  suggestCategory,
} = controller;

// GET default categories
router.get("/default", getDefaultCategories);

// GET all categories
router.get("/", getCategories);

// CREATE category
router.post("/", createCategory);

// Suggest category
router.post("/suggest", suggestCategory);

// UPDATE category
router.put("/:id", updateCategory);

// DELETE category
router.delete("/:id", deleteCategory);

module.exports = router;
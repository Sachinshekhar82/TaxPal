const categoryService = require("../services/categoryService");

// Get all categories
const getCategories = async (req, res) => {
  try {
    const userId = req.user.id;

    const categories = await categoryService.getCategories(userId);

    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get default categories
const getDefaultCategories = async (req, res) => {
  try {
    const categories = await categoryService.getDefaultCategories();

    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Suggest category
const suggestCategory = async (req, res) => {
  try {
    const { merchant } = req.body;

    const category = await categoryService.suggestCategory(merchant);

    res.status(200).json({
      category,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Create category
const createCategory = async (req, res) => {
  try {
    const userId = req.user.id;

    const category = await categoryService.createCategory(userId, req.body);

    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

// Update category
const updateCategory = async (req, res) => {
  try {
    const userId = req.user.id;
    const categoryId = req.params.id;

    const category = await categoryService.updateCategory(
      userId,
      categoryId,
      req.body
    );

    res.status(200).json(category);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

// Delete category
const deleteCategory = async (req, res) => {
  try {
    const userId = req.user.id;
    const categoryId = req.params.id;

    await categoryService.deleteCategory(userId, categoryId);

    res.status(200).json({
      message: "Category deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

module.exports = {
  getCategories,
  getDefaultCategories,
  suggestCategory,
  createCategory,
  updateCategory,
  deleteCategory,
};
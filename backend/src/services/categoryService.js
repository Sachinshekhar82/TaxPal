const Category = require("../models/category");
const defaultCategories = require("../utils/defaultCategories");

// Get all categories of a user
const getCategories = async (userId) => {
  return await Category.find({ userId });
};

// Get default categories
const getDefaultCategories = async () => {
  return defaultCategories;
};

// Suggest category based on merchant
const suggestCategory = async (merchant) => {
  const name = merchant.toLowerCase();

  if (name.includes("swiggy") || name.includes("zomato")) {
    return "Food";
  }

  if (name.includes("uber") || name.includes("ola")) {
    return "Travel";
  }

  if (name.includes("salary")) {
    return "Income";
  }

  if (name.includes("amazon") || name.includes("flipkart")) {
    return "Shopping";
  }

  return "Others";
};

// Create a new category
const createCategory = async (userId, data) => {
  const { name, type, isDefault = false } = data;

  const existingCategory = await Category.findOne({
    userId,
    name,
  });

  if (existingCategory) {
    throw new Error("Category already exists");
  }

  const category = await Category.create({
    userId,
    name,
    type,
    isDefault,
  });

  return category;
};

// Update category
const updateCategory = async (userId, categoryId, data) => {
  const category = await Category.findOneAndUpdate(
    {
      _id: categoryId,
      userId,
    },
    data,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!category) {
    throw new Error("Category not found");
  }

  return category;
};

// Delete category
const deleteCategory = async (userId, categoryId) => {
  const category = await Category.findOneAndDelete({
    _id: categoryId,
    userId,
  });

  if (!category) {
    throw new Error("Category not found");
  }

  return category;
};

module.exports = {
  getCategories,
  getDefaultCategories,
  suggestCategory,
  createCategory,
  updateCategory,
  deleteCategory,
};
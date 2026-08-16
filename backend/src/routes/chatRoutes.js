const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");
const { protect } = require("../middleware/authMiddleware");

// All chat routes are protected by JWT authentication
router.post("/", protect, chatController.sendMessage);
router.get("/history", protect, chatController.getHistory);
router.delete("/history", protect, chatController.clearHistory);
router.get("/suggestions", protect, chatController.getSuggestions);

module.exports = router;

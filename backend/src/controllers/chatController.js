const chatService = require("../services/chatService");

const sendMessage = async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message || message.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Message is required and cannot be empty.",
      });
    }

    const result = await chatService.processChatMessage(req.user.id, message);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const getHistory = async (req, res, next) => {
  try {
    const history = await chatService.getChatHistory(req.user.id);
    res.status(200).json({
      success: true,
      message: "Chat history retrieved successfully.",
      data: history,
    });
  } catch (error) {
    next(error);
  }
};

const clearHistory = async (req, res, next) => {
  try {
    const result = await chatService.clearChatHistory(req.user.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const getSuggestions = async (req, res, next) => {
  try {
    const suggestions = chatService.getSuggestions();
    res.status(200).json({
      success: true,
      data: suggestions,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendMessage,
  getHistory,
  clearHistory,
  getSuggestions,
};

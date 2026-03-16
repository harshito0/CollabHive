const Message = require('../models/messageModel');

exports.getProjectMessages = async (req, res) => {
  const messages = await Message.getProjectMessages(req.params.projectId);
  res.json(messages);
};

exports.getDirectMessages = async (req, res) => {
  const messages = await Message.getChatHistory(req.user.id, req.params.userId);
  res.json(messages);
};

import express from 'express';
import {
  getChatMessages,
  sendChatMessage,
  likeMessage,
  replyToMessage,
  editMessage,
  deleteMessage,
  getChatStats
} from '../controllers/chatController.js';

const chatRouter = express.Router();

// Chat routes
chatRouter.get('/messages', getChatMessages);
chatRouter.post('/messages', sendChatMessage);
chatRouter.put('/messages/:messageId/like', likeMessage);
chatRouter.post('/messages/:messageId/reply', replyToMessage);
chatRouter.put('/messages/:messageId', editMessage);
chatRouter.delete('/messages/:messageId', deleteMessage);
chatRouter.get('/stats', getChatStats);

export default chatRouter;

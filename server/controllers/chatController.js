import ChatMessage from '../models/ChatMessage.js';
import Movie from '../models/Movie.js';
import { clerkClient } from '@clerk/clerk-sdk-node';

export const getChatMessages = async (req, res) => {
  try {
    const { page = 1, limit = 50, movieId } = req.query;
    
    const query = { isDeleted: false };
    if (movieId) {
      query.movieId = movieId;
    }
    
    const messages = await ChatMessage.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('movieId', 'title poster_path')
      .lean();
    
    messages.reverse();
    
    const total = await ChatMessage.countDocuments(query);
    
    res.json({
      success: true,
      messages,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    
    if (error.name === 'MongooseError' && error.message.includes('buffering timed out')) {
      return res.json({
        success: true,
        messages: [],
        pagination: {
          current: parseInt(req.query.page || 1),
          pages: 0,
          total: 0
        }
      });
    }
    
    res.status(500).json({ success: false, message: 'Failed to fetch chat messages' });
  }
};

export const sendChatMessage = async (req, res) => {
  try {
    const { content, movieId, messageType = 'text', isSpoiler = false } = req.body;
    const userId = req.user?.userId || 'demo-user';
    
    let userName = 'Demo User';
    let userEmail = 'demo@example.com';
    let userAvatar = '';
    
    if (userId !== 'demo-user' && req.user?.userId) {
      try {
        const clerkUser = await clerkClient.users.getUser(req.user.userId);
        userName = clerkUser.firstName && clerkUser.lastName 
          ? `${clerkUser.firstName} ${clerkUser.lastName}` 
          : clerkUser.username || 'User';
        userEmail = clerkUser.emailAddresses?.[0]?.emailAddress || 'user@example.com';
        userAvatar = clerkUser.imageUrl || '';
      } catch (error) {
        console.error('Error fetching user from Clerk:', error);
      }
    }
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Message content is required' });
    }
    
    if (content.length > 1000) {
      return res.status(400).json({ success: false, message: 'Message too long (max 1000 characters)' });
    }
    
    let movieTitle = '';
    if (movieId) {
      const movie = await Movie.findById(movieId);
      if (movie) {
        movieTitle = movie.title;
      }
    }
    
    const message = new ChatMessage({
      content: content.trim(),
      sender: {
        userId,
        name: userName,
        email: userEmail,
        avatar: userAvatar
      },
      movieId: movieId || null,
      movieTitle,
      messageType,
      isSpoiler
    });
    
    await message.save();
    
    await message.populate('movieId', 'title poster_path');
    
    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      chatMessage: message
    });
  } catch (error) {
    console.error('Error sending chat message:', error);
    res.status(500).json({ success: false, message: 'Failed to send message' });
  }
};

export const likeMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user?.userId || 'demo-user';
    
    const message = await ChatMessage.findById(messageId);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }
    
    const alreadyLiked = message.likes.some(like => like.userId === userId);
    
    if (alreadyLiked) {
      message.likes = message.likes.filter(like => like.userId !== userId);
    } else {
      message.likes.push({ userId, likedAt: new Date() });
    }
    
    await message.save();
    
    res.json({
      success: true,
      message: alreadyLiked ? 'Message unliked' : 'Message liked',
      likesCount: message.likes.length,
      isLiked: !alreadyLiked
    });
  } catch (error) {
    console.error('Error liking message:', error);
    res.status(500).json({ success: false, message: 'Failed to like message' });
  }
};

export const replyToMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;
    const userId = req.user?.userId || 'demo-user';
    
    let userName = 'Demo User';
    let userEmail = 'demo@example.com';
    let userAvatar = '';
    
    if (userId !== 'demo-user' && req.user?.userId) {
      try {
        const clerkUser = await clerkClient.users.getUser(req.user.userId);
        userName = clerkUser.firstName && clerkUser.lastName 
          ? `${clerkUser.firstName} ${clerkUser.lastName}` 
          : clerkUser.username || 'User';
        userEmail = clerkUser.emailAddresses?.[0]?.emailAddress || 'user@example.com';
        userAvatar = clerkUser.imageUrl || '';
      } catch (error) {
        console.error('Error fetching user from Clerk:', error);
      }
    }
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Reply content is required' });
    }
    
    const message = await ChatMessage.findById(messageId);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }
    
    const reply = {
      content: content.trim(),
      sender: {
        userId,
        name: userName,
        email: userEmail,
        avatar: userAvatar
      },
      createdAt: new Date()
    };
    
    message.replies.push(reply);
    await message.save();
    
    res.json({
      success: true,
      message: 'Reply sent successfully',
      reply
    });
  } catch (error) {
    console.error('Error replying to message:', error);
    res.status(500).json({ success: false, message: 'Failed to send reply' });
  }
};

export const editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;
    const userId = req.user?.userId || 'demo-user';
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Message content is required' });
    }
    
    const message = await ChatMessage.findById(messageId);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }
    
    if (message.sender.userId !== userId) {
      return res.status(403).json({ success: false, message: 'You can only edit your own messages' });
    }
    
    message.content = content.trim();
    message.isEdited = true;
    message.editedAt = new Date();
    
    await message.save();
    
    res.json({
      success: true,
      message: 'Message edited successfully',
      chatMessage: message
    });
  } catch (error) {
    console.error('Error editing message:', error);
    res.status(500).json({ success: false, message: 'Failed to edit message' });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user?.userId || 'demo-user';
    const isAdmin = req.user?.isAdmin || false;
    
    const message = await ChatMessage.findById(messageId);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }
    
    if (message.sender.userId !== userId && !isAdmin) {
      return res.status(403).json({ success: false, message: 'You can only delete your own messages' });
    }
    
    message.isDeleted = true;
    message.deletedAt = new Date();
    message.content = '[Message deleted]';
    
    await message.save();
    
    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ success: false, message: 'Failed to delete message' });
  }
};

export const getChatStats = async (req, res) => {
  try {
    const totalMessages = await ChatMessage.countDocuments({ isDeleted: false });
    const todayMessages = await ChatMessage.countDocuments({
      isDeleted: false,
      createdAt: { $gte: new Date().setHours(0, 0, 0, 0) }
    });
    const activeUsers = await ChatMessage.distinct('sender.userId', { isDeleted: false });
    
    res.json({
      success: true,
      stats: {
        totalMessages,
        todayMessages,
        activeUsers: activeUsers.length
      }
    });
  } catch (error) {
    console.error('Error fetching chat stats:', error);
    
    if (error.name === 'MongooseError' && error.message.includes('buffering timed out')) {
      return res.json({
        success: true,
        stats: {
          totalMessages: 0,
          todayMessages: 0,
          activeUsers: 0
        }
      });
    }
    
    res.status(500).json({ success: false, message: 'Failed to fetch chat stats' });
  }
};

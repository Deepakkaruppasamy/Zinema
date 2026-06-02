import mongoose from 'mongoose';
import 'dotenv/config';
import connectDB from '../configs/db.js';
import ChatMessage from '../models/ChatMessage.js';

const updateChatMessages = async () => {
  try {
    await connectDB();
    console.log('Connected to database');
    
    const result = await ChatMessage.updateMany(
      { 'sender.email': { $exists: false } },
      { $set: { 'sender.email': 'demo@example.com' } }
    );
    
    console.log('Updated', result.modifiedCount, 'messages with email field');
    
    await ChatMessage.updateMany(
      { 'sender.name': 'Demo User' },
      { $set: { 'sender.name': 'Demo User', 'sender.email': 'demo@example.com' } }
    );
    
    console.log('Updated Demo User messages');
    
    const messages = await ChatMessage.find({});
    console.log('Current messages:');
    messages.forEach(msg => {
      console.log(`- ${msg.sender.name} (${msg.sender.email}): ${msg.content}`);
    });
    
  } catch (error) {
    console.error('Error updating messages:', error);
  } finally {
    mongoose.connection.close();
  }
};

updateChatMessages();

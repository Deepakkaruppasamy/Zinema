import mongoose from 'mongoose';
import Notification from '../models/Notification.js';
import Movie from '../models/Movie.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://Deepak:123@cluster0.5pdgn48.mongodb.net';

async function seedNotifications() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get a sample movie
    const sampleMovie = await Movie.findOne();
    
    // Create sample notifications
    const notifications = [
      {
        title: 'Welcome to Zinema!',
        message: 'Thank you for joining our movie community. Start exploring amazing movies and book your tickets!',
        type: 'general',
        priority: 'medium',
        targetAudience: 'all',
        createdBy: 'admin'
      },
      {
        title: 'New Movie Alert!',
        message: 'Check out the latest blockbuster that just released in our theaters. Book your tickets now!',
        type: 'new_movie',
        priority: 'high',
        targetAudience: 'all',
        movieId: sampleMovie?._id,
        createdBy: 'admin'
      },
      {
        title: 'Special Promotion',
        message: 'Get 20% off on all movie tickets this weekend! Use code WEEKEND20 at checkout.',
        type: 'promotion',
        priority: 'high',
        targetAudience: 'all',
        createdBy: 'admin'
      },
      {
        title: 'System Maintenance',
        message: 'We will be performing scheduled maintenance on Sunday from 2 AM to 4 AM. Some features may be temporarily unavailable.',
        type: 'system',
        priority: 'medium',
        targetAudience: 'all',
        createdBy: 'admin'
      },
      {
        title: 'Premium User Benefits',
        message: 'As a premium user, you get early access to new releases and exclusive discounts!',
        type: 'promotion',
        priority: 'low',
        targetAudience: 'premium',
        createdBy: 'admin'
      }
    ];

    for (const notificationData of notifications) {
      const notification = new Notification(notificationData);
      await notification.save();
      console.log('Notification created:', notification.title);
    }

    console.log('✅ Sample notifications created successfully!');

  } catch (error) {
    console.error('Error seeding notifications:', error);
  } finally {
    await mongoose.disconnect();
  }
}

seedNotifications();

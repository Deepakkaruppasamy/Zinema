import mongoose from 'mongoose';
import Badge from '../models/Badge.js';
import Reward from '../models/Reward.js';
import connectDB from '../configs/db.js';

const badges = [
  {
    id: 'first_booking',
    type: 'first_booking',
    name: 'First Steps',
    description: 'Complete your first booking',
    points: 50,
    requirement: 'Make your first movie booking',
    icon: '🎬',
    color: 'green'
  },
  {
    id: 'loyal_customer',
    type: 'loyal_customer',
    name: 'Loyal Customer',
    description: 'Book 10 or more movies',
    points: 200,
    requirement: 'Book 10 movies',
    icon: '❤️',
    color: 'red'
  },
  {
    id: 'early_bird',
    type: 'early_bird',
    name: 'Early Bird',
    description: 'Book tickets for early morning shows',
    points: 100,
    requirement: 'Book 5 early morning shows',
    icon: '🌅',
    color: 'yellow'
  },
  {
    id: 'social_butterfly',
    type: 'social_butterfly',
    name: 'Social Butterfly',
    description: 'Book group tickets with friends',
    points: 150,
    requirement: 'Book 5 group bookings',
    icon: '👥',
    color: 'blue'
  },
  {
    id: 'movie_buff',
    type: 'movie_buff',
    name: 'Movie Buff',
    description: 'Watch 20 or more movies',
    points: 300,
    requirement: 'Book 20 movies',
    icon: '🎭',
    color: 'purple'
  },
  {
    id: 'streak_master',
    type: 'streak_master',
    name: 'Streak Master',
    description: 'Book movies for 7 consecutive days',
    points: 250,
    requirement: 'Book movies for 7 consecutive days',
    icon: '🔥',
    color: 'orange'
  }
];

const rewards = [
  {
    name: '10% Off Next Booking',
    description: 'Get 10% discount on your next movie booking',
    cost: 100,
    type: 'discount',
    value: 10,
    requirements: {
      minLevel: 1,
      minRank: 'Bronze'
    }
  },
  {
    name: 'Free Popcorn',
    description: 'Get a free large popcorn with your next booking',
    cost: 200,
    type: 'concession',
    value: 5,
    requirements: {
      minLevel: 2,
      minRank: 'Silver'
    }
  },
  {
    name: 'Premium Seat Upgrade',
    description: 'Upgrade to premium seats for free',
    cost: 500,
    type: 'premium_seat',
    value: 15,
    requirements: {
      minLevel: 3,
      minRank: 'Gold'
    }
  },
  {
    name: 'Free Movie Ticket',
    description: 'Get a completely free movie ticket',
    cost: 1000,
    type: 'free_ticket',
    value: 20,
    requirements: {
      minLevel: 5,
      minRank: 'Platinum'
    }
  },
  {
    name: 'VIP Experience',
    description: 'Get VIP treatment with premium seating and concessions',
    cost: 2000,
    type: 'merchandise',
    value: 50,
    requirements: {
      minLevel: 10,
      minRank: 'Diamond'
    }
  }
];

const seedGamification = async () => {
  try {
    await connectDB();
    console.log('Connected to database');

    // Clear existing data
    await Badge.deleteMany({});
    await Reward.deleteMany({});
    console.log('Cleared existing gamification data');

    // Insert badges
    await Badge.insertMany(badges);
    console.log(`Inserted ${badges.length} badges`);

    // Insert rewards
    await Reward.insertMany(rewards);
    console.log(`Inserted ${rewards.length} rewards`);

    console.log('Gamification data seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding gamification data:', error);
    process.exit(1);
  }
};

seedGamification();

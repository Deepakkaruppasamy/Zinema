import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import Show from '../models/Show.js';
import Movie from '../models/Movie.js';
import Gamification from '../models/Gamification.js';
import User from '../models/User.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://Deepak:123@cluster0.5pdgn48.mongodb.net';

async function seedTestData() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create a test user
    const testUser = await User.findOneAndUpdate(
      { email: 'test@zinema.com' },
      {
        name: 'Test User',
        email: 'test@zinema.com',
        tier: 'SILVER'
      },
      { upsert: true, new: true }
    );

    console.log('Test user created:', testUser._id);

    // Create a test movie
    const testMovie = await Movie.findOneAndUpdate(
      { title: 'Test Movie' },
      {
        title: 'Test Movie',
        overview: 'A test movie for demonstration',
        release_date: '2024-01-01',
        vote_average: 8.5,
        poster_path: '/test-poster.jpg',
        backdrop_path: '/test-backdrop.jpg'
      },
      { upsert: true, new: true }
    );

    console.log('Test movie created:', testMovie._id);

    // Create a test show
    const testShow = await Show.findOneAndUpdate(
      { movie: testMovie._id },
      {
        movie: testMovie._id,
        showDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        showPrice: 250,
        occupiedSeats: {}
      },
      { upsert: true, new: true }
    );

    console.log('Test show created:', testShow._id);

    // Create test bookings
    const testBookings = [
      {
        user: testUser._id,
        show: testShow._id,
        amount: 500,
        bookedSeats: ['A1', 'A2'],
        isPaid: true,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      },
      {
        user: testUser._id,
        show: testShow._id,
        amount: 250,
        bookedSeats: ['B1'],
        isPaid: false,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
      }
    ];

    for (const bookingData of testBookings) {
      const booking = await Booking.findOneAndUpdate(
        { user: bookingData.user, show: bookingData.show, bookedSeats: bookingData.bookedSeats },
        bookingData,
        { upsert: true, new: true }
      );
      console.log('Test booking created:', booking._id);
    }

    // Create gamification data
    let gamification = await Gamification.findOne({ userId: testUser._id.toString() });
    
    if (!gamification) {
      gamification = new Gamification({
        userId: testUser._id.toString(),
        level: 2,
        experience: 150,
        points: 350,
        totalBookings: 2,
        totalSpent: 500,
        streak: 2,
        rank: 'Silver',
        lastBookingDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      });
      
      // Add badges
      gamification.badges.push({
        id: 'first_booking',
        type: 'first_booking',
        name: 'First Booking',
        description: 'Made your first booking',
        points: 50,
        earnedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      });
      
      gamification.badges.push({
        id: 'loyal_customer',
        type: 'loyal_customer',
        name: 'Loyal Customer',
        description: 'Made multiple bookings',
        points: 100,
        earnedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      });
      
      // Add achievements (simplified for now)
      // gamification.achievements.push({
      //   id: 'booked_2_movies',
      //   type: 'booking_milestone',
      //   name: 'Movie Buff',
      //   description: 'Booked 2 movies',
      //   unlockedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      // });
      
      await gamification.save();
    }

    console.log('Gamification data created:', gamification._id);

    console.log('✅ Test data seeded successfully!');
    console.log('Test user ID:', testUser._id);
    console.log('You can now test the gamification system with this user.');

  } catch (error) {
    console.error('Error seeding test data:', error);
  } finally {
    await mongoose.disconnect();
  }
}

seedTestData();

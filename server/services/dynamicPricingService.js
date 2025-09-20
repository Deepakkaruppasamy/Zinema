import Show from '../models/Show.js';
import Booking from '../models/Booking.js';
import Movie from '../models/Movie.js';

class DynamicPricingService {
  constructor() {
    this.baseMultipliers = {
      // Time-based multipliers
      peakHours: 1.3,      // 6-10 PM
      weekend: 1.2,        // Friday-Sunday
      holiday: 1.5,        // Special dates
      
      // Demand-based multipliers
      highDemand: 1.4,     // >80% seats booked
      mediumDemand: 1.1,   // 50-80% seats booked
      lowDemand: 0.9,      // <30% seats booked
      
      // Movie-based multipliers
      blockbuster: 1.3,    // High-rated movies
      newRelease: 1.2,     // Recent releases
      classic: 0.8,        // Older movies
      
      // Seat-based multipliers
      premiumSeats: 1.5,   // Front rows, center
      standardSeats: 1.0,  // Regular seats
      budgetSeats: 0.7,    // Back rows, corners
    };
  }

  // Calculate dynamic price based on multiple factors
  async calculateDynamicPrice(showId, seatPosition = 'standard') {
    try {
      const show = await Show.findById(showId).populate('movie');
      if (!show) throw new Error('Show not found');

      const basePrice = show.showPrice;
      let finalPrice = basePrice;

      // Get current booking data
      const bookingStats = await this.getBookingStats(showId);
      
      // Apply time-based pricing
      const timeMultiplier = this.getTimeBasedMultiplier(show.showDateTime);
      finalPrice *= timeMultiplier;

      // Apply demand-based pricing
      const demandMultiplier = this.getDemandBasedMultiplier(bookingStats.occupancyRate);
      finalPrice *= demandMultiplier;

      // Apply movie-based pricing
      const movieMultiplier = this.getMovieBasedMultiplier(show.movie);
      finalPrice *= movieMultiplier;

      // Apply seat-based pricing
      const seatMultiplier = this.getSeatBasedMultiplier(seatPosition);
      finalPrice *= seatMultiplier;

      // Apply seasonal pricing
      const seasonalMultiplier = this.getSeasonalMultiplier(show.showDateTime);
      finalPrice *= seasonalMultiplier;

      // Round to nearest 5
      finalPrice = Math.round(finalPrice / 5) * 5;

      // Ensure minimum price
      finalPrice = Math.max(finalPrice, basePrice * 0.5);

      return {
        basePrice,
        finalPrice,
        multipliers: {
          time: timeMultiplier,
          demand: demandMultiplier,
          movie: movieMultiplier,
          seat: seatMultiplier,
          seasonal: seasonalMultiplier
        },
        bookingStats
      };
    } catch (error) {
      console.error('Error calculating dynamic price:', error);
      return { basePrice: show.showPrice, finalPrice: show.showPrice, error: error.message };
    }
  }

  // Get booking statistics for a show
  async getBookingStats(showId) {
    const show = await Show.findById(showId);
    const totalSeats = 100; // Assuming 100 seats per show
    const occupiedSeats = Object.keys(show.occupiedSeats || {}).length;
    const occupancyRate = occupiedSeats / totalSeats;

    // Get recent booking trends
    const recentBookings = await Booking.find({
      show: showId,
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
    });

    return {
      totalSeats,
      occupiedSeats,
      occupancyRate,
      recentBookings: recentBookings.length,
      trend: this.calculateTrend(recentBookings)
    };
  }

  // Calculate booking trend
  calculateTrend(recentBookings) {
    if (recentBookings.length === 0) return 'stable';
    
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;
    const recentCount = recentBookings.filter(b => b.createdAt >= oneHourAgo).length;
    
    if (recentCount > 3) return 'increasing';
    if (recentCount === 0) return 'decreasing';
    return 'stable';
  }

  // Time-based pricing
  getTimeBasedMultiplier(showDateTime) {
    const date = new Date(showDateTime);
    const hour = date.getHours();
    const dayOfWeek = date.getDay();
    
    let multiplier = 1.0;

    // Peak hours (6-10 PM)
    if (hour >= 18 && hour <= 22) {
      multiplier *= this.baseMultipliers.peakHours;
    }

    // Weekend pricing
    if (dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0) { // Fri, Sat, Sun
      multiplier *= this.baseMultipliers.weekend;
    }

    // Holiday pricing (simplified - you can expand this)
    if (this.isHoliday(date)) {
      multiplier *= this.baseMultipliers.holiday;
    }

    return multiplier;
  }

  // Demand-based pricing
  getDemandBasedMultiplier(occupancyRate) {
    if (occupancyRate >= 0.8) return this.baseMultipliers.highDemand;
    if (occupancyRate >= 0.5) return this.baseMultipliers.mediumDemand;
    if (occupancyRate <= 0.3) return this.baseMultipliers.lowDemand;
    return 1.0;
  }

  // Movie-based pricing
  getMovieBasedMultiplier(movie) {
    const releaseDate = new Date(movie.release_date);
    const now = new Date();
    const daysSinceRelease = (now - releaseDate) / (1000 * 60 * 60 * 24);

    // New release (within 30 days)
    if (daysSinceRelease <= 30) {
      return this.baseMultipliers.newRelease;
    }

    // Blockbuster (high rating)
    if (movie.vote_average >= 7.5) {
      return this.baseMultipliers.blockbuster;
    }

    // Classic (older than 2 years)
    if (daysSinceRelease > 730) {
      return this.baseMultipliers.classic;
    }

    return 1.0;
  }

  // Seat-based pricing
  getSeatBasedMultiplier(seatPosition) {
    switch (seatPosition) {
      case 'premium': return this.baseMultipliers.premiumSeats;
      case 'budget': return this.baseMultipliers.budgetSeats;
      default: return this.baseMultipliers.standardSeats;
    }
  }

  // Seasonal pricing
  getSeasonalMultiplier(showDateTime) {
    const date = new Date(showDateTime);
    const month = date.getMonth();
    
    // Holiday seasons
    if (month === 11 || month === 0) return 1.2; // December, January
    if (month === 6 || month === 7) return 1.1;  // Summer months
    
    return 1.0;
  }

  // Check if date is a holiday
  isHoliday(date) {
    const month = date.getMonth();
    const day = date.getDate();
    
    // Simple holiday check (you can expand this)
    const holidays = [
      { month: 0, day: 1 },   // New Year
      { month: 6, day: 4 },   // Independence Day
      { month: 10, day: 24 }, // Thanksgiving
      { month: 11, day: 25 }, // Christmas
    ];
    
    return holidays.some(holiday => holiday.month === month && holiday.day === day);
  }

  // Get price recommendations for admin
  async getPriceRecommendations(showId) {
    const pricing = await this.calculateDynamicPrice(showId);
    const stats = await this.getBookingStats(showId);
    
    return {
      currentPrice: pricing.finalPrice,
      basePrice: pricing.basePrice,
      recommendations: {
        optimal: pricing.finalPrice,
        aggressive: Math.round(pricing.finalPrice * 0.8), // 20% discount
        premium: Math.round(pricing.finalPrice * 1.2),    // 20% premium
      },
      factors: {
        occupancyRate: stats.occupancyRate,
        trend: stats.trend,
        multipliers: pricing.multipliers
      },
      suggestions: this.generatePriceSuggestions(stats, pricing.multipliers)
    };
  }

  // Generate price suggestions
  generatePriceSuggestions(stats, multipliers) {
    const suggestions = [];
    
    if (stats.occupancyRate < 0.3) {
      suggestions.push({
        type: 'discount',
        message: 'Low occupancy - consider offering discounts',
        recommendedAction: 'Reduce price by 10-15%'
      });
    }
    
    if (multipliers.demand > 1.3) {
      suggestions.push({
        type: 'premium',
        message: 'High demand detected - premium pricing recommended',
        recommendedAction: 'Increase price by 10-20%'
      });
    }
    
    if (multipliers.time > 1.2) {
      suggestions.push({
        type: 'peak',
        message: 'Peak time slot - standard premium pricing',
        recommendedAction: 'Maintain current pricing'
      });
    }
    
    return suggestions;
  }
}

export default new DynamicPricingService();

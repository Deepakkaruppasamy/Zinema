import Show from '../models/Show.js';
import Booking from '../models/Booking.js';
import Movie from '../models/Movie.js';

class DynamicPricingService {
  constructor() {
    this.baseMultipliers = {
      peakHours: 1.3,
      weekend: 1.2,
      holiday: 1.5,
      
      highDemand: 1.4,
      mediumDemand: 1.1,
      lowDemand: 0.9,
      
      blockbuster: 1.3,
      newRelease: 1.2,
      classic: 0.8,
      
      premiumSeats: 1.5,
      standardSeats: 1.0,
      budgetSeats: 0.7,
    };
  }

  async calculateDynamicPrice(showId, seatPosition = 'standard') {
    try {
      const show = await Show.findById(showId).populate('movie');
      if (!show) throw new Error('Show not found');

      const basePrice = show.showPrice;
      let finalPrice = basePrice;

      const bookingStats = await this.getBookingStats(showId);
      
      const timeMultiplier = this.getTimeBasedMultiplier(show.showDateTime);
      finalPrice *= timeMultiplier;

      const demandMultiplier = this.getDemandBasedMultiplier(bookingStats.occupancyRate);
      finalPrice *= demandMultiplier;

      const movieMultiplier = this.getMovieBasedMultiplier(show.movie);
      finalPrice *= movieMultiplier;

      const seatMultiplier = this.getSeatBasedMultiplier(seatPosition);
      finalPrice *= seatMultiplier;

      const seasonalMultiplier = this.getSeasonalMultiplier(show.showDateTime);
      finalPrice *= seasonalMultiplier;

      finalPrice = Math.round(finalPrice / 5) * 5;

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

  async getBookingStats(showId) {
    const show = await Show.findById(showId);
    const totalSeats = 100;
    const occupiedSeats = Object.keys(show.occupiedSeats || {}).length;
    const occupancyRate = occupiedSeats / totalSeats;

    const recentBookings = await Booking.find({
      show: showId,
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    return {
      totalSeats,
      occupiedSeats,
      occupancyRate,
      recentBookings: recentBookings.length,
      trend: this.calculateTrend(recentBookings)
    };
  }

  calculateTrend(recentBookings) {
    if (recentBookings.length === 0) return 'stable';
    
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;
    const recentCount = recentBookings.filter(b => b.createdAt >= oneHourAgo).length;
    
    if (recentCount > 3) return 'increasing';
    if (recentCount === 0) return 'decreasing';
    return 'stable';
  }

  getTimeBasedMultiplier(showDateTime) {
    const date = new Date(showDateTime);
    const hour = date.getHours();
    const dayOfWeek = date.getDay();
    
    let multiplier = 1.0;

    if (hour >= 18 && hour <= 22) {
      multiplier *= this.baseMultipliers.peakHours;
    }

    if (dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0) {
      multiplier *= this.baseMultipliers.weekend;
    }

    if (this.isHoliday(date)) {
      multiplier *= this.baseMultipliers.holiday;
    }

    return multiplier;
  }

  getDemandBasedMultiplier(occupancyRate) {
    if (occupancyRate >= 0.8) return this.baseMultipliers.highDemand;
    if (occupancyRate >= 0.5) return this.baseMultipliers.mediumDemand;
    if (occupancyRate <= 0.3) return this.baseMultipliers.lowDemand;
    return 1.0;
  }

  getMovieBasedMultiplier(movie) {
    const releaseDate = new Date(movie.release_date);
    const now = new Date();
    const daysSinceRelease = (now - releaseDate) / (1000 * 60 * 60 * 24);

    if (daysSinceRelease <= 30) {
      return this.baseMultipliers.newRelease;
    }

    if (movie.vote_average >= 7.5) {
      return this.baseMultipliers.blockbuster;
    }

    if (daysSinceRelease > 730) {
      return this.baseMultipliers.classic;
    }

    return 1.0;
  }

  getSeatBasedMultiplier(seatPosition) {
    switch (seatPosition) {
      case 'premium': return this.baseMultipliers.premiumSeats;
      case 'budget': return this.baseMultipliers.budgetSeats;
      default: return this.baseMultipliers.standardSeats;
    }
  }

  getSeasonalMultiplier(showDateTime) {
    const date = new Date(showDateTime);
    const month = date.getMonth();
    
    if (month === 11 || month === 0) return 1.2;
    if (month === 6 || month === 7) return 1.1;
    
    return 1.0;
  }

  isHoliday(date) {
    const month = date.getMonth();
    const day = date.getDate();
    
    const holidays = [
      { month: 0, day: 1 },
      { month: 6, day: 4 },
      { month: 10, day: 24 },
      { month: 11, day: 25 },
    ];
    
    return holidays.some(holiday => holiday.month === month && holiday.day === day);
  }

  async getPriceRecommendations(showId) {
    const pricing = await this.calculateDynamicPrice(showId);
    const stats = await this.getBookingStats(showId);
    
    return {
      currentPrice: pricing.finalPrice,
      basePrice: pricing.basePrice,
      recommendations: {
        optimal: pricing.finalPrice,
        aggressive: Math.round(pricing.finalPrice * 0.8),
        premium: Math.round(pricing.finalPrice * 1.2),
      },
      factors: {
        occupancyRate: stats.occupancyRate,
        trend: stats.trend,
        multipliers: pricing.multipliers
      },
      suggestions: this.generatePriceSuggestions(stats, pricing.multipliers)
    };
  }

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

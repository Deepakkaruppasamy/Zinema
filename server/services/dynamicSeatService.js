import Show from '../models/Show.js';
import Booking from '../models/Booking.js';
import User from '../models/User.js';

class DynamicSeatService {
  constructor() {
    this.seatTypes = {
      premium: { rows: ['A', 'B', 'C'], multiplier: 1.5 },
      standard: { rows: ['D', 'E', 'F', 'G', 'H'], multiplier: 1.0 },
      budget: { rows: ['I', 'J', 'K', 'L'], multiplier: 0.7 }
    };
    
    this.preferences = {
      social: ['center', 'middle'],
      intimate: ['back', 'corner'],
      immersive: ['front', 'center'],
      budget: ['back', 'side']
    };
  }

  async getSeatRecommendations(showId, userId, preferences = {}) {
    try {
      const show = await Show.findById(showId);
      if (!show) throw new Error('Show not found');

      const user = await User.findById(userId);
      const userProfile = await this.createUserProfile(userId);
      
      const availableSeats = this.getAvailableSeats(show);
      
      const seatRecommendations = await this.calculateSeatScores(
        availableSeats,
        userProfile,
        preferences,
        show
      );

      return seatRecommendations
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
        
    } catch (error) {
      console.error('Error getting seat recommendations:', error);
      throw error;
    }
  }

  async createUserProfile(userId) {
    const bookings = await Booking.find({ userId, isPaid: true })
      .populate('show')
      .sort({ createdAt: -1 })
      .limit(20);

    const profile = {
      preferredSeatTypes: {},
      preferredPositions: {},
      averagePartySize: 0,
      priceSensitivity: 'medium',
      socialPreference: 'neutral'
    };

    if (bookings.length === 0) {
      return profile;
    }

    bookings.forEach(booking => {
      const seats = booking.bookedSeats;
      const partySize = seats.length;
      
      profile.averagePartySize += partySize;
      
      seats.forEach(seat => {
        const seatType = this.getSeatType(seat);
        const position = this.getSeatPosition(seat);
        
        profile.preferredSeatTypes[seatType] = (profile.preferredSeatTypes[seatType] || 0) + 1;
        profile.preferredPositions[position] = (profile.preferredPositions[position] || 0) + 1;
      });
    });

    profile.averagePartySize = Math.round(profile.averagePartySize / bookings.length);
    profile.preferredSeatTypes = this.normalizePreferences(profile.preferredSeatTypes);
    profile.preferredPositions = this.normalizePreferences(profile.preferredPositions);
    
    const avgPrice = bookings.reduce((sum, b) => sum + b.amount, 0) / bookings.length;
    if (avgPrice < 200) profile.priceSensitivity = 'high';
    else if (avgPrice > 400) profile.priceSensitivity = 'low';
    else profile.priceSensitivity = 'medium';

    return profile;
  }

  async calculateSeatScores(availableSeats, userProfile, preferences, show) {
    const recommendations = [];

    for (const seat of availableSeats) {
      let score = 0;
      const reasons = [];

      score += 50;

      const seatType = this.getSeatType(seat);
      const typePreference = userProfile.preferredSeatTypes[seatType] || 0;
      score += typePreference * 30;
      if (typePreference > 0.3) reasons.push(`Matches your preferred ${seatType} seats`);

      const position = this.getSeatPosition(seat);
      const positionPreference = userProfile.preferredPositions[position] || 0;
      score += positionPreference * 25;
      if (positionPreference > 0.3) reasons.push(`Matches your preferred ${position} position`);

      const priceScore = this.calculatePriceScore(seat, userProfile.priceSensitivity, show);
      score += priceScore * 20;
      if (priceScore > 0.7) reasons.push('Good value for your budget');

      const socialScore = this.calculateSocialScore(seat, availableSeats, userProfile);
      score += socialScore * 15;
      if (socialScore > 0.7) reasons.push('Good for your social preference');

      const viewScore = this.calculateViewScore(seat);
      score += viewScore * 10;
      if (viewScore > 0.8) reasons.push('Excellent view');

      recommendations.push({
        seat,
        score: Math.round(score),
        reasons,
        seatType,
        position,
        price: this.calculateSeatPrice(seat, show.showPrice),
        features: this.getSeatFeatures(seat)
      });
    }

    return recommendations;
  }

  getAvailableSeats(show) {
    const allSeats = this.generateAllSeats();
    const occupiedSeats = Object.keys(show.occupiedSeats || {});
    
    return allSeats.filter(seat => !occupiedSeats.includes(seat));
  }

  generateAllSeats() {
    const seats = [];
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
    const numbers = Array.from({ length: 20 }, (_, i) => i + 1);
    
    rows.forEach(row => {
      numbers.forEach(number => {
        seats.push(`${row}${number}`);
      });
    });
    
    return seats;
  }

  getSeatType(seat) {
    const row = seat.charAt(0);
    
    for (const [type, config] of Object.entries(this.seatTypes)) {
      if (config.rows.includes(row)) {
        return type;
      }
    }
    
    return 'standard';
  }

  getSeatPosition(seat) {
    const row = seat.charAt(0);
    const number = parseInt(seat.slice(1));
    
    let rowPosition;
    if (['A', 'B', 'C', 'D'].includes(row)) rowPosition = 'front';
    else if (['E', 'F', 'G', 'H'].includes(row)) rowPosition = 'middle';
    else rowPosition = 'back';
    
    let colPosition;
    if (number >= 8 && number <= 13) colPosition = 'center';
    else if (number >= 4 && number <= 7 || number >= 14 && number <= 17) colPosition = 'side';
    else colPosition = 'corner';
    
    return `${rowPosition}-${colPosition}`;
  }

  calculatePriceScore(seat, priceSensitivity, show) {
    const seatType = this.getSeatType(seat);
    const seatPrice = this.calculateSeatPrice(seat, show.showPrice);
    const basePrice = show.showPrice;
    
    switch (priceSensitivity) {
      case 'high':
        return seatPrice <= basePrice ? 1.0 : 0.3;
      case 'low':
        return seatPrice >= basePrice * 1.2 ? 1.0 : 0.7;
      default:
        return seatPrice <= basePrice * 1.1 ? 1.0 : 0.5;
    }
  }

  calculateSocialScore(seat, availableSeats, userProfile) {
    const position = this.getSeatPosition(seat);
    const [rowPos, colPos] = position.split('-');
    
    const nearbySeats = this.getNearbySeats(seat, availableSeats);
    const groupScore = nearbySeats.length > 0 ? 0.8 : 0.5;
    
    let socialScore = 0.5;
    if (userProfile.socialPreference === 'social' && colPos === 'center') socialScore = 0.9;
    else if (userProfile.socialPreference === 'intimate' && colPos === 'corner') socialScore = 0.9;
    
    return (groupScore + socialScore) / 2;
  }

  calculateViewScore(seat) {
    const row = seat.charAt(0);
    const number = parseInt(seat.slice(1));
    
    let score = 0.5;
    
    const rowIndex = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'].indexOf(row);
    if (rowIndex >= 3 && rowIndex <= 7) score += 0.4;
    else if (rowIndex >= 0 && rowIndex <= 2) score += 0.2;
    
    if (number >= 9 && number <= 12) score += 0.3;
    else if (number >= 6 && number <= 15) score += 0.1;
    
    return Math.min(score, 1.0);
  }

  calculateSeatPrice(seat, basePrice) {
    const seatType = this.getSeatType(seat);
    const multiplier = this.seatTypes[seatType].multiplier;
    return Math.round(basePrice * multiplier);
  }

  getSeatFeatures(seat) {
    const features = [];
    const seatType = this.getSeatType(seat);
    const position = this.getSeatPosition(seat);
    
    if (seatType === 'premium') features.push('Premium seating', 'Extra legroom');
    if (position.includes('center')) features.push('Center view');
    if (position.includes('front')) features.push('Close to screen');
    if (position.includes('back')) features.push('Wider view');
    
    return features;
  }

  getNearbySeats(seat, availableSeats) {
    const row = seat.charAt(0);
    const number = parseInt(seat.slice(1));
    const nearby = [];
    
    const adjacentNumbers = [number - 1, number + 1];
    adjacentNumbers.forEach(num => {
      if (num >= 1 && num <= 20) {
        const adjacentSeat = `${row}${num}`;
        if (availableSeats.includes(adjacentSeat)) {
          nearby.push(adjacentSeat);
        }
      }
    });
    
    return nearby;
  }

  normalizePreferences(preferences) {
    const total = Object.values(preferences).reduce((sum, val) => sum + val, 0);
    if (total === 0) return {};
    
    const normalized = {};
    Object.entries(preferences).forEach(([key, value]) => {
      normalized[key] = value / total;
    });
    return normalized;
  }

  async getSeatAnalytics(showId) {
    try {
      const show = await Show.findById(showId);
      if (!show) throw new Error('Show not found');

      const allSeats = this.generateAllSeats();
      const occupiedSeats = Object.keys(show.occupiedSeats || {});
      const availableSeats = allSeats.filter(seat => !occupiedSeats.includes(seat));

      const analytics = {
        totalSeats: allSeats.length,
        occupiedSeats: occupiedSeats.length,
        availableSeats: availableSeats.length,
        occupancyRate: occupiedSeats.length / allSeats.length,
        seatTypeBreakdown: {},
        positionBreakdown: {},
        revenue: 0
      };

      occupiedSeats.forEach(seat => {
        const seatType = this.getSeatType(seat);
        const position = this.getSeatPosition(seat);
        const price = this.calculateSeatPrice(seat, show.showPrice);
        
        analytics.seatTypeBreakdown[seatType] = (analytics.seatTypeBreakdown[seatType] || 0) + 1;
        analytics.positionBreakdown[position] = (analytics.positionBreakdown[position] || 0) + 1;
        analytics.revenue += price;
      });

      analytics.recommendations = this.generateSeatRecommendations(analytics);

      return analytics;
    } catch (error) {
      console.error('Error getting seat analytics:', error);
      throw error;
    }
  }

  generateSeatRecommendations(analytics) {
    const recommendations = [];
    
    if (analytics.occupancyRate < 0.3) {
      recommendations.push({
        type: 'pricing',
        message: 'Low occupancy - consider dynamic pricing',
        action: 'Reduce premium seat prices by 20%'
      });
    }
    
    if (analytics.seatTypeBreakdown.premium > analytics.seatTypeBreakdown.budget * 2) {
      recommendations.push({
        type: 'inventory',
        message: 'Premium seats selling well',
        action: 'Consider increasing premium seat allocation'
      });
    }
    
    return recommendations;
  }
}

export default new DynamicSeatService();

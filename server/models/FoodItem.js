import mongoose from 'mongoose';

const foodItemSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  category: { 
    type: String, 
    enum: ['appetizers', 'main_course', 'beverages', 'desserts', 'snacks', 'combo_meals'],
    required: true 
  },
  price: { 
    type: Number, 
    required: true,
    min: 0 
  },
  image: { 
    type: String,
    default: '' 
  },
  available: { 
    type: Boolean, 
    default: true 
  },
  stock: { 
    type: Number, 
    default: -1, // -1 means unlimited
    min: -1 
  },
  theater: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Theater',
    required: true 
  },
  // Food-specific fields
  dietaryInfo: {
    vegetarian: { type: Boolean, default: false },
    vegan: { type: Boolean, default: false },
    glutenFree: { type: Boolean, default: false },
    containsNuts: { type: Boolean, default: false },
    spicy: { type: Boolean, default: false }
  },
  preparationTime: { 
    type: Number, 
    default: 15, // minutes
    min: 0 
  },
  calories: { 
    type: Number,
    min: 0 
  },
  ingredients: [String],
  allergens: [String],
  // Admin fields
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  }
}, { 
  timestamps: true 
});

// Indexes for better performance
foodItemSchema.index({ theater: 1, available: 1, isActive: 1 });
foodItemSchema.index({ category: 1 });
foodItemSchema.index({ name: 'text', description: 'text' });

const FoodItem = mongoose.model('FoodItem', foodItemSchema);
export default FoodItem;

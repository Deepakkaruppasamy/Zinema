import mongoose from 'mongoose';

const foodOrderSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  theater: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Theater',
    required: true 
  },
  show: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Show',
    required: true 
  },
  items: [{
    foodItem: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'FoodItem',
      required: true 
    },
    quantity: { 
      type: Number, 
      required: true,
      min: 1,
      max: 10 
    },
    unitPrice: { 
      type: Number, 
      required: true,
      min: 0 
    },
    specialInstructions: { 
      type: String,
      maxlength: 200 
    }
  }],
  subtotal: { 
    type: Number, 
    required: true,
    min: 0 
  },
  tax: { 
    type: Number, 
    default: 0,
    min: 0 
  },
  serviceCharge: { 
    type: Number, 
    default: 0,
    min: 0 
  },
  totalAmount: { 
    type: Number, 
    required: true,
    min: 0 
  },
  // Delivery preferences
  deliveryMethod: { 
    type: String, 
    enum: ['seat_delivery', 'pickup_counter', 'interval_delivery'],
    required: true 
  },
  seatNumber: { 
    type: String,
    required: function() {
      return this.deliveryMethod === 'seat_delivery';
    }
  },
  rowNumber: { 
    type: String,
    required: function() {
      return this.deliveryMethod === 'seat_delivery';
    }
  },
  // Timing
  preferredDeliveryTime: { 
    type: Date,
    required: function() {
      return this.deliveryMethod === 'interval_delivery';
    }
  },
  // Special instructions
  orderNotes: { 
    type: String,
    maxlength: 500 
  },
  // Payment
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending' 
  },
  paymentIntentId: { 
    type: String 
  },
  paymentMethod: { 
    type: String 
  },
  // Order status
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'],
    default: 'pending' 
  },
  // Admin fields
  kitchenNotes: { 
    type: String 
  },
  preparedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  preparedAt: { 
    type: Date 
  },
  deliveredBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  deliveredAt: { 
    type: Date 
  },
  // Cancellation
  cancelledAt: { 
    type: Date 
  },
  cancellationReason: { 
    type: String 
  },
  refundAmount: { 
    type: Number,
    default: 0 
  },
  // Order tracking
  estimatedReadyTime: { 
    type: Date 
  },
  actualReadyTime: { 
    type: Date 
  }
}, { 
  timestamps: true 
});

// Indexes for better performance
foodOrderSchema.index({ user: 1, createdAt: -1 });
foodOrderSchema.index({ theater: 1, status: 1 });
foodOrderSchema.index({ show: 1, status: 1 });
foodOrderSchema.index({ paymentStatus: 1 });
foodOrderSchema.index({ status: 1 });

// Pre-save middleware to calculate totals
foodOrderSchema.pre('save', function(next) {
  if (this.isModified('items')) {
    this.subtotal = this.items.reduce((total, item) => total + (item.quantity * item.unitPrice), 0);
    
    // Calculate tax (18% GST for India)
    this.tax = Math.round(this.subtotal * 0.18);
    
    // Service charge (5% of subtotal)
    this.serviceCharge = Math.round(this.subtotal * 0.05);
    
    this.totalAmount = this.subtotal + this.tax + this.serviceCharge;
  }
  next();
});

// Virtual for order summary
foodOrderSchema.virtual('orderSummary').get(function() {
  return this.items.map(item => `${item.quantity}x ${item.foodItem?.name || 'Item'}`).join(', ');
});

const FoodOrder = mongoose.model('FoodOrder', foodOrderSchema);
export default FoodOrder;

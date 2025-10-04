import Show from '../models/Show.js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// GET /api/food/:showId - Get available food items for a show
export const getFoodItemsForShow = async (req, res) => {
  try {
    const { showId } = req.params;
    
    // Verify show exists
    const show = await Show.findById(showId).populate('movie');
    if (!show) {
      return res.status(404).json({ success: false, message: 'Show not found' });
    }

    // Sample food items for demonstration
    const sampleFoodItems = {
      'appetizers': [
        {
          _id: 'sample1',
          name: 'Popcorn (Large)',
          description: 'Freshly popped popcorn with butter',
          category: 'appetizers',
          price: 150,
          available: true,
          stock: -1,
          dietaryInfo: { vegetarian: true, vegan: false, glutenFree: false, spicy: false },
          preparationTime: 5,
          calories: 200
        },
        {
          _id: 'sample2',
          name: 'Nachos with Cheese',
          description: 'Crispy nachos with melted cheese sauce',
          category: 'appetizers',
          price: 200,
          available: true,
          stock: -1,
          dietaryInfo: { vegetarian: true, vegan: false, glutenFree: false, spicy: false },
          preparationTime: 8,
          calories: 350
        }
      ],
      'beverages': [
        {
          _id: 'sample3',
          name: 'Soft Drink (Large)',
          description: 'Coca Cola, Pepsi, or Sprite',
          category: 'beverages',
          price: 120,
          available: true,
          stock: -1,
          dietaryInfo: { vegetarian: true, vegan: true, glutenFree: true, spicy: false },
          preparationTime: 2,
          calories: 150
        },
        {
          _id: 'sample4',
          name: 'Fresh Juice',
          description: 'Orange, Apple, or Mixed Fruit Juice',
          category: 'beverages',
          price: 180,
          available: true,
          stock: -1,
          dietaryInfo: { vegetarian: true, vegan: true, glutenFree: true, spicy: false },
          preparationTime: 5,
          calories: 120
        }
      ],
      'main_course': [
        {
          _id: 'sample5',
          name: 'Burger Combo',
          description: 'Chicken burger with fries and drink',
          category: 'main_course',
          price: 350,
          available: true,
          stock: -1,
          dietaryInfo: { vegetarian: false, vegan: false, glutenFree: false, spicy: false },
          preparationTime: 15,
          calories: 600
        }
      ]
    };

    res.json({
      success: true,
      show: {
        id: show._id,
        movie: show.movie?.title || 'Unknown Movie',
        showDateTime: show.showDateTime,
        showPrice: show.showPrice
      },
      foodItems: sampleFoodItems,
      categories: Object.keys(sampleFoodItems)
    });
  } catch (error) {
    console.error('Error fetching food items:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch food items' });
  }
};

// POST /api/food/order - Create food order
export const createFoodOrder = async (req, res) => {
  try {
    const {
      theaterId,
      showId,
      items,
      deliveryMethod,
      seatNumber,
      rowNumber,
      preferredDeliveryTime,
      orderNotes
    } = req.body;

    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    // Validate required fields
    if (!showId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: showId, items' 
      });
    }

    // Validate delivery method specific fields
    if (deliveryMethod === 'seat_delivery' && (!seatNumber || !rowNumber)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Seat number and row number required for seat delivery' 
      });
    }

    // Verify show exists
    const show = await Show.findById(showId);
    if (!show) {
      return res.status(404).json({ success: false, message: 'Show not found' });
    }

    if (new Date(show.showDateTime) < new Date()) {
      return res.status(400).json({ success: false, message: 'Cannot order food for past shows' });
    }

    // Calculate totals (simplified for demo)
    let subtotal = 0;
    const processedItems = [];

    for (const item of items) {
      // Sample pricing for demo items
      const samplePrices = {
        'sample1': 150, // Popcorn
        'sample2': 200, // Nachos
        'sample3': 120, // Soft Drink
        'sample4': 180, // Fresh Juice
        'sample5': 350  // Burger Combo
      };
      
      const price = samplePrices[item.foodItemId] || 100;
      const itemTotal = price * item.quantity;
      subtotal += itemTotal;

      processedItems.push({
        foodItemId: item.foodItemId,
        quantity: item.quantity,
        unitPrice: price,
        specialInstructions: item.specialInstructions || ''
      });
    }

    // Calculate totals
    const tax = Math.round(subtotal * 0.18); // 18% GST
    const serviceCharge = Math.round(subtotal * 0.05); // 5% service charge
    const totalAmount = subtotal + tax + serviceCharge;

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100), // Convert to cents
      currency: 'inr',
      metadata: {
        type: 'food_order',
        showId: showId,
        userId: userId,
        items: JSON.stringify(processedItems)
      },
      description: `Food order for ${show.movie?.title || 'movie'}`
    });

    res.json({
      success: true,
      message: 'Food order created successfully',
      order: {
        id: `food_${Date.now()}`,
        items: processedItems.length,
        subtotal,
        tax,
        serviceCharge,
        totalAmount,
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret
      }
    });

  } catch (error) {
    console.error('Error creating food order:', error);
    res.status(500).json({ success: false, message: 'Failed to create food order' });
  }
};

// GET /api/food/orders/my - Get user's food orders (simplified)
export const getMyFoodOrders = async (req, res) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    // Return empty array for now since we're not storing orders in DB
    res.json({
      success: true,
      orders: []
    });
  } catch (error) {
    console.error('Error fetching food orders:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
};

// POST /api/food/orders/:id/cancel - Cancel food order (simplified)
export const cancelFoodOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.auth?.userId;
    
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    // For demo purposes, just return success
    res.json({
      success: true,
      message: 'Order cancelled successfully',
      refundAmount: 0
    });

  } catch (error) {
    console.error('Error cancelling food order:', error);
    res.status(500).json({ success: false, message: 'Failed to cancel order' });
  }
};

// POST /api/food/webhook - Stripe webhook for food order payments
export const foodOrderPaymentWebhook = async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      
      if (paymentIntent.metadata.type === 'food_order') {
        console.log(`✅ Food order payment confirmed for show ${paymentIntent.metadata.showId}`);
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Food order webhook error:', error);
    res.status(500).json({ success: false, message: 'Webhook processing failed' });
  }
};
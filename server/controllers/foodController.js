import FoodItem from '../models/FoodItem.js';
import FoodOrder from '../models/FoodOrder.js';
import Show from '../models/Show.js';
import Theater from '../models/Theater.js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// GET /api/food/:theaterId - Get available food items for a theater
export const getFoodItemsForTheater = async (req, res) => {
  try {
    const { theaterId } = req.params;
    
    // Verify theater exists
    const theater = await Theater.findById(theaterId);
    if (!theater) {
      return res.status(404).json({ success: false, message: 'Theater not found' });
    }

    // Get available food items for this theater
    const foodItems = await FoodItem.find({
      theater: theaterId,
      available: true,
      isActive: true,
      $or: [
        { stock: -1 }, // Unlimited stock
        { stock: { $gt: 0 } } // Has stock
      ]
    }).sort({ category: 1, name: 1 });

    // Group food items by category
    const groupedItems = foodItems.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {});

    res.json({
      success: true,
      theater: {
        id: theater._id,
        name: theater.name,
        location: theater.location
      },
      foodItems: groupedItems,
      categories: Object.keys(groupedItems)
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
    if (!theaterId || !showId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: theaterId, showId, items' 
      });
    }

    // Validate delivery method specific fields
    if (deliveryMethod === 'seat_delivery' && (!seatNumber || !rowNumber)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Seat number and row number required for seat delivery' 
      });
    }

    if (deliveryMethod === 'interval_delivery' && !preferredDeliveryTime) {
      return res.status(400).json({ 
        success: false, 
        message: 'Preferred delivery time required for interval delivery' 
      });
    }

    // Verify theater and show exist
    const [theater, show] = await Promise.all([
      Theater.findById(theaterId),
      Show.findById(showId)
    ]);

    if (!theater) {
      return res.status(404).json({ success: false, message: 'Theater not found' });
    }

    if (!show) {
      return res.status(404).json({ success: false, message: 'Show not found' });
    }

    if (new Date(show.showDateTime) < new Date()) {
      return res.status(400).json({ success: false, message: 'Cannot order food for past shows' });
    }

    // Validate and process food items
    const processedItems = [];
    let subtotal = 0;

    for (const item of items) {
      const foodItem = await FoodItem.findById(item.foodItemId);
      if (!foodItem) {
        return res.status(404).json({ 
          success: false, 
          message: `Food item not found: ${item.foodItemId}` 
        });
      }

      if (!foodItem.available || !foodItem.isActive) {
        return res.status(400).json({ 
          success: false, 
          message: `Food item not available: ${foodItem.name}` 
        });
      }

      if (foodItem.stock !== -1 && foodItem.stock < item.quantity) {
        return res.status(400).json({ 
          success: false, 
          message: `Only ${foodItem.stock} ${foodItem.name} available` 
        });
      }

      const itemTotal = foodItem.price * item.quantity;
      subtotal += itemTotal;

      processedItems.push({
        foodItem: foodItem._id,
        quantity: item.quantity,
        unitPrice: foodItem.price,
        specialInstructions: item.specialInstructions || ''
      });
    }

    // Calculate totals
    const tax = Math.round(subtotal * 0.18); // 18% GST
    const serviceCharge = Math.round(subtotal * 0.05); // 5% service charge
    const totalAmount = subtotal + tax + serviceCharge;

    // Create food order
    const foodOrder = new FoodOrder({
      user: userId,
      theater: theaterId,
      show: showId,
      items: processedItems,
      subtotal,
      tax,
      serviceCharge,
      totalAmount,
      deliveryMethod,
      seatNumber,
      rowNumber,
      preferredDeliveryTime: preferredDeliveryTime ? new Date(preferredDeliveryTime) : undefined,
      orderNotes
    });

    await foodOrder.save();

    // Update food item stock
    for (const item of processedItems) {
      const foodItem = await FoodItem.findById(item.foodItem);
      if (foodItem && foodItem.stock !== -1) {
        foodItem.stock -= item.quantity;
        await foodItem.save();
      }
    }

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100), // Convert to cents
      currency: 'inr',
      metadata: {
        type: 'food_order',
        foodOrderId: foodOrder._id.toString(),
        userId: userId,
        theaterId: theaterId
      },
      description: `Food order for ${theater.name}`
    });

    // Update order with payment intent
    foodOrder.paymentIntentId = paymentIntent.id;
    await foodOrder.save();

    res.json({
      success: true,
      message: 'Food order created successfully',
      order: {
        id: foodOrder._id,
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

// GET /api/food/orders/my - Get user's food orders
export const getMyFoodOrders = async (req, res) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const orders = await FoodOrder.find({ user: userId })
      .populate('theater', 'name location')
      .populate('show', 'showDateTime')
      .populate({
        path: 'show',
        populate: { path: 'movie', model: 'Movie', select: 'title' }
      })
      .populate('items.foodItem', 'name category price image')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      orders: orders.map(order => ({
        id: order._id,
        theater: order.theater,
        show: order.show,
        items: order.items,
        subtotal: order.subtotal,
        tax: order.tax,
        serviceCharge: order.serviceCharge,
        totalAmount: order.totalAmount,
        deliveryMethod: order.deliveryMethod,
        seatNumber: order.seatNumber,
        rowNumber: order.rowNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt,
        preferredDeliveryTime: order.preferredDeliveryTime,
        orderNotes: order.orderNotes,
        estimatedReadyTime: order.estimatedReadyTime
      }))
    });
  } catch (error) {
    console.error('Error fetching food orders:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
};

// POST /api/food/orders/:id/cancel - Cancel food order
export const cancelFoodOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.auth?.userId;
    
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const order = await FoodOrder.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.user.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (order.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Order already cancelled' });
    }

    if (order.status === 'delivered') {
      return res.status(400).json({ success: false, message: 'Cannot cancel delivered order' });
    }

    if (order.status === 'preparing') {
      return res.status(400).json({ success: false, message: 'Cannot cancel order that is being prepared' });
    }

    // Cancel the order
    order.status = 'cancelled';
    order.cancelledAt = new Date();
    order.cancellationReason = req.body.reason || 'User cancelled';

    // Refund if payment was made
    if (order.paymentStatus === 'paid' && order.paymentIntentId) {
      try {
        const refund = await stripe.refunds.create({
          payment_intent: order.paymentIntentId,
          amount: Math.round(order.totalAmount * 100)
        });
        order.refundAmount = order.totalAmount;
        order.paymentStatus = 'refunded';
      } catch (refundError) {
        console.error('Refund failed:', refundError);
        // Continue with cancellation even if refund fails
      }
    }

    await order.save();

    // Restore food item stock
    for (const item of order.items) {
      const foodItem = await FoodItem.findById(item.foodItem);
      if (foodItem && foodItem.stock !== -1) {
        foodItem.stock += item.quantity;
        await foodItem.save();
      }
    }

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      refundAmount: order.refundAmount
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
        const foodOrderId = paymentIntent.metadata.foodOrderId;
        
        const order = await FoodOrder.findById(foodOrderId);
        if (order) {
          order.paymentStatus = 'paid';
          order.status = 'confirmed';
          
          // Set estimated ready time (15 minutes from now)
          order.estimatedReadyTime = new Date(Date.now() + 15 * 60 * 1000);
          
          await order.save();
          
          console.log(`✅ Food order ${foodOrderId} payment confirmed`);
        }
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Food order webhook error:', error);
    res.status(500).json({ success: false, message: 'Webhook processing failed' });
  }
};

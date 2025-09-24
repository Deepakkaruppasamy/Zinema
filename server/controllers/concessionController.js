import ConcessionItem from '../models/ConcessionItem.js';
import ConcessionOrder from '../models/ConcessionOrder.js';
import Coupon from '../models/Coupon.js';
import sendEmail from '../configs/nodeMailer.js';

// ITEMS
export const listItems = async (req, res) => {
  try {
    const { q } = req.query;
    const filter = { isActive: true };
    if (q) filter.$text = { $search: q };
    const items = await ConcessionItem.find(filter).sort({ category: 1, name: 1 });
    res.json({ success: true, items });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to fetch items' });
  }
};

export const adminListItems = async (req, res) => {
  try {
    const items = await ConcessionItem.find({}).sort({ createdAt: -1 });
    res.json({ success: true, items });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to fetch items' });
  }
};

export const createItem = async (req, res) => {
  try {
    const item = await ConcessionItem.create(req.body);
    res.status(201).json({ success: true, item });
  } catch (e) {
    res.status(400).json({ success: false, message: 'Failed to create item' });
  }
};

export const updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await ConcessionItem.findByIdAndUpdate(id, req.body, { new: true });
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, item });
  } catch (e) {
    res.status(400).json({ success: false, message: 'Failed to update item' });
  }
};

export const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    await ConcessionItem.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (e) {
    res.status(400).json({ success: false, message: 'Failed to delete item' });
  }
};

// ORDERS
export const createOrder = async (req, res) => {
  try {
    const { items, pickupTime, pickupLocation, notes, couponCode } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Items required' });
    }
    const itemIds = items.map(i => i.itemId);
    const dbItems = await ConcessionItem.find({ _id: { $in: itemIds }, isActive: true });
    const dbItemById = new Map(dbItems.map(d => [String(d._id), d]));

    const orderItems = items.map(i => {
      const d = dbItemById.get(String(i.itemId));
      if (!d) throw new Error('Invalid item');
      const options = Array.isArray(i.selectedOptions) ? i.selectedOptions : [];
      const priceDeltaSum = options.reduce((sum, o) => sum + (o.priceDelta || 0), 0);
      const unitPrice = d.basePrice + priceDeltaSum;
      const quantity = Math.max(1, Number(i.quantity || 1));
      const lineTotal = unitPrice * quantity;
      return {
        item: d._id,
        nameSnapshot: d.name,
        imageUrlSnapshot: d.imageUrl,
        unitPrice,
        quantity,
        selectedOptions: options.map(o => ({ label: o.label, value: o.value, priceDelta: o.priceDelta || 0 })),
        lineTotal,
      };
    });

    const subtotal = orderItems.reduce((s, li) => s + li.lineTotal, 0);
    const taxTotal = 0; // Placeholder; compute via tax rules
    let discountTotal = 0;

    // Apply coupon if provided and valid
    if (couponCode) {
      const code = String(couponCode).trim().toUpperCase();
      const coupon = await Coupon.findOne({ code, active: true });
      const now = new Date();
      const withinWindow = !coupon?.validFrom || !coupon?.validUntil || (now >= coupon.validFrom && now <= coupon.validUntil);
      if (coupon && withinWindow && subtotal >= (coupon.minAmount || 0)) {
        if (coupon.type === 'percent') {
          discountTotal = Math.min(subtotal, (subtotal * (coupon.value / 100)));
        } else if (coupon.type === 'flat') {
          discountTotal = Math.min(subtotal, coupon.value);
        }
      }
    }

    // Bundle pricing: 10% off each popcorn+drink pair
    try {
      const perUnitByCategory = { popcorn: [], drink: [] };
      for (const itemInput of items) {
        const db = dbItemById.get(String(itemInput.itemId));
        if (!db) continue;
        const options = Array.isArray(itemInput.selectedOptions) ? itemInput.selectedOptions : [];
        const priceDeltaSum = options.reduce((sum, o) => sum + (o.priceDelta || 0), 0);
        const unitPrice = db.basePrice + priceDeltaSum;
        const qty = Math.max(1, Number(itemInput.quantity || 1));
        if (db.category === 'popcorn' || db.category === 'drink') {
          for (let k = 0; k < qty; k++) perUnitByCategory[db.category].push(unitPrice);
        }
      }
      perUnitByCategory.popcorn.sort((a,b)=>a-b);
      perUnitByCategory.drink.sort((a,b)=>a-b);
      const pairCount = Math.min(perUnitByCategory.popcorn.length, perUnitByCategory.drink.length);
      let bundleDiscount = 0;
      for (let i = 0; i < pairCount; i++) {
        const pairSum = perUnitByCategory.popcorn[i] + perUnitByCategory.drink[i];
        bundleDiscount += pairSum * 0.10; // 10% off each pair
      }
      if (bundleDiscount > 0) discountTotal += bundleDiscount;
    } catch (_) {}
    const total = subtotal + taxTotal - discountTotal;

    const order = await ConcessionOrder.create({
      user: req.user?.userId || req.auth?.userId || undefined,
      items: orderItems,
      subtotal,
      discountTotal,
      taxTotal,
      total,
      currency: 'USD',
      pickupTime: new Date(pickupTime),
      pickupLocation: pickupLocation || 'Concessions Counter',
      status: 'pending',
      notes: notes || '',
    });

    // Fire-and-forget email confirmation; ignore failures
    try {
      const to = req.auth?.claims?.email || process.env.SMTP_USER;
      await sendEmail({
        to,
        subject: 'Zinema Concession Order Confirmation',
        html: `<p>Thanks for your order! Pickup at ${order.pickupLocation} around ${new Date(order.pickupTime).toLocaleTimeString()}.</p>
               <p>Total: $${order.total.toFixed(2)}</p>`
      });
    } catch (_) {}

    // Schedule a basic near-term reminder by immediate send if within 10 min
    try {
      const to = req.auth?.claims?.email || process.env.SMTP_USER;
      const now = Date.now();
      const msUntilPickup = new Date(order.pickupTime).getTime() - now;
      if (msUntilPickup > 0 && msUntilPickup <= 10 * 60 * 1000) {
        await sendEmail({
          to,
          subject: 'Pickup Reminder',
          html: `<p>Your concession order will be ready soon at ${order.pickupLocation}.</p>`
        });
      }
    } catch (_) {}

    res.status(201).json({ success: true, order });
  } catch (e) {
    res.status(400).json({ success: false, message: 'Failed to create order' });
  }
};

export const myOrders = async (req, res) => {
  try {
    const userId = req.user?.userId || req.auth?.userId;
    const orders = await ConcessionOrder.find({ user: userId }).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const order = await ConcessionOrder.findByIdAndUpdate(id, { status }, { new: true });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, order });
  } catch (e) {
    res.status(400).json({ success: false, message: 'Failed to update order' });
  }
};



import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  Clock, 
  MapPin, 
  CreditCard, 
  CheckCircle, 
  AlertCircle,
  Utensils,
  Star,
  Leaf,
  Zap,
  Coffee,
  IceCream,
  Pizza
} from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '@clerk/clerk-react';

const FoodOrdering = ({ showId, onClose }) => {
  const navigate = useNavigate();
  const { isSignedIn } = useAuth();
  
  const [foodItems, setFoodItems] = useState({});
  const [show, setShow] = useState(null);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);
  const [error, setError] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState('seat_delivery');
  const [seatNumber, setSeatNumber] = useState('');
  const [rowNumber, setRowNumber] = useState('');

  useEffect(() => {
    if (showId) {
      fetchFoodItems();
    }
  }, [showId]);

  const fetchFoodItems = async () => {
    try {
      const response = await api.get(`/api/food/${showId}`);
      if (response.data.success) {
        setFoodItems(response.data.foodItems);
        setShow(response.data.show);
      }
    } catch (error) {
      console.error('Error fetching food items:', error);
      setError('Failed to load food menu');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (item) => {
    const existingItem = cart.find(cartItem => cartItem.foodItemId === item._id);
    if (existingItem) {
      setCart(cart.map(cartItem => 
        cartItem.foodItemId === item._id 
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, {
        foodItemId: item._id,
        name: item.name,
        price: item.price,
        quantity: 1,
        image: item.image,
        category: item.category,
        specialInstructions: ''
      }]);
    }
  };

  const removeFromCart = (foodItemId) => {
    setCart(cart.filter(item => item.foodItemId !== foodItemId));
  };

  const updateQuantity = (foodItemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(foodItemId);
    } else {
      setCart(cart.map(item => 
        item.foodItemId === foodItemId 
          ? { ...item, quantity }
          : item
      ));
    }
  };

  const updateSpecialInstructions = (foodItemId, instructions) => {
    setCart(cart.map(item => 
      item.foodItemId === foodItemId 
        ? { ...item, specialInstructions: instructions }
        : item
    ));
  };

  const getSubtotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTax = () => {
    return Math.round(getSubtotal() * 0.18); // 18% GST
  };

  const getServiceCharge = () => {
    return Math.round(getSubtotal() * 0.05); // 5% service charge
  };

  const getTotalAmount = () => {
    return getSubtotal() + getTax() + getServiceCharge();
  };

  const handleOrder = async () => {
    if (!isSignedIn) {
      navigate('/sign-in');
      return;
    }

    if (cart.length === 0) {
      setError('Please add items to your order');
      return;
    }

    if (deliveryMethod === 'seat_delivery' && (!seatNumber || !rowNumber)) {
      setError('Please provide seat and row number for delivery');
      return;
    }

    setOrdering(true);
    setError('');

    try {
      const response = await api.post('/api/food/order', {
        theaterId: showId, // Using showId as theaterId
        showId: showId,
        items: cart,
        deliveryMethod: deliveryMethod,
        seatNumber: seatNumber,
        rowNumber: rowNumber
      });

      if (response.data.success) {
        // Initialize Stripe payment
        const stripe = window.Stripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);
        const { error } = await stripe.confirmPayment({
          clientSecret: response.data.order.clientSecret,
          confirmParams: {
            return_url: `${window.location.origin}/food-order/success/${response.data.order.id}`,
          },
        });

        if (error) {
          setError(error.message);
        } else {
          // Order successful, close modal
          onClose();
        }
      }
    } catch (error) {
      console.error('Ordering error:', error);
      setError(error.response?.data?.message || 'Order failed');
    } finally {
      setOrdering(false);
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'appetizers': return <Utensils className="h-4 w-4" />;
      case 'main_course': return <Pizza className="h-4 w-4" />;
      case 'beverages': return <Coffee className="h-4 w-4" />;
      case 'desserts': return <IceCream className="h-4 w-4" />;
      case 'snacks': return <Zap className="h-4 w-4" />;
      case 'combo_meals': return <Star className="h-4 w-4" />;
      default: return <Utensils className="h-4 w-4" />;
    }
  };

  const getDietaryBadges = (item) => {
    const badges = [];
    if (item.dietaryInfo?.vegetarian) badges.push({ text: 'Veg', color: 'bg-green-100 text-green-800' });
    if (item.dietaryInfo?.vegan) badges.push({ text: 'Vegan', color: 'bg-green-100 text-green-800' });
    if (item.dietaryInfo?.glutenFree) badges.push({ text: 'GF', color: 'bg-blue-100 text-blue-800' });
    if (item.dietaryInfo?.spicy) badges.push({ text: 'Spicy', color: 'bg-red-100 text-red-800' });
    return badges;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading food menu...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center">
                <Utensils className="h-6 w-6 mr-2" />
                Food & Beverages
              </h2>
              {show && (
                <p className="text-red-100 mt-1">{show.movie}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-red-200 transition-colors"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Food Menu */}
          <div className="flex-1 overflow-y-auto p-6">
            {Object.keys(foodItems).length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Food Available</h3>
                <p className="text-gray-600">This theater doesn't have food service available.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {Object.entries(foodItems).map(([category, items]) => (
                  <div key={category} className="bg-white rounded-lg shadow-sm border">
                    <div className="px-6 py-4 border-b bg-gray-50">
                      <h3 className="text-lg font-semibold text-gray-900 capitalize flex items-center">
                        {getCategoryIcon(category)}
                        <span className="ml-2">{category.replace('_', ' ')}</span>
                      </h3>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {items.map((item) => (
                          <div key={item._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start space-x-4">
                              {item.image && (
                                <img 
                                  src={item.image} 
                                  alt={item.name}
                                  className="w-20 h-20 object-cover rounded-lg"
                                />
                              )}
                              <div className="flex-1">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h4 className="font-medium text-gray-900">{item.name}</h4>
                                    <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                                    
                                    {/* Dietary badges */}
                                    <div className="flex flex-wrap gap-1 mt-2">
                                      {getDietaryBadges(item).map((badge, index) => (
                                        <span key={index} className={`px-2 py-1 text-xs rounded-full ${badge.color}`}>
                                          {badge.text}
                                        </span>
                                      ))}
                                    </div>

                                    {item.calories && (
                                      <p className="text-xs text-gray-500 mt-1">
                                        {item.calories} calories
                                      </p>
                                    )}
                                  </div>
                                  <div className="text-right">
                                    <span className="text-lg font-semibold text-red-600">
                                      ₹{item.price}
                                    </span>
                                    {item.preparationTime && (
                                      <p className="text-xs text-gray-500 mt-1">
                                        <Clock className="h-3 w-3 inline mr-1" />
                                        {item.preparationTime} min
                                      </p>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="flex items-center justify-between mt-3">
                                  {item.stock !== -1 && (
                                    <p className="text-xs text-gray-500">
                                      {item.stock} left in stock
                                    </p>
                                  )}
                                  <button
                                    onClick={() => addToCart(item)}
                                    className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors flex items-center"
                                  >
                                    <ShoppingCart className="h-4 w-4 mr-1" />
                                    Add
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="w-96 bg-gray-50 border-l overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Order</h3>
              
              {cart.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Your cart is empty</p>
                </div>
              ) : (
                <>
                  {/* Cart Items */}
                  <div className="space-y-4 mb-6">
                    {cart.map((item) => (
                      <div key={item.foodItemId} className="bg-white rounded-lg p-4 border">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{item.name}</h4>
                          <button
                            onClick={() => removeFromCart(item.foodItemId)}
                            className="text-red-600 hover:text-red-700 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => updateQuantity(item.foodItemId, item.quantity - 1)}
                              className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-300"
                            >
                              -
                            </button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.foodItemId, item.quantity + 1)}
                              className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-300"
                            >
                              +
                            </button>
                          </div>
                          <span className="font-medium text-gray-900">
                            ₹{item.price * item.quantity}
                          </span>
                        </div>

                        <textarea
                          placeholder="Special instructions..."
                          value={item.specialInstructions}
                          onChange={(e) => updateSpecialInstructions(item.foodItemId, e.target.value)}
                          className="w-full text-xs border rounded p-2 resize-none"
                          rows={2}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Delivery Options */}
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-3">Delivery Method</h4>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="delivery"
                          value="seat_delivery"
                          checked={deliveryMethod === 'seat_delivery'}
                          onChange={(e) => setDeliveryMethod(e.target.value)}
                          className="mr-2"
                        />
                        <span className="text-sm">Seat Delivery</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="delivery"
                          value="pickup_counter"
                          checked={deliveryMethod === 'pickup_counter'}
                          onChange={(e) => setDeliveryMethod(e.target.value)}
                          className="mr-2"
                        />
                        <span className="text-sm">Pickup Counter</span>
                      </label>
                    </div>

                    {deliveryMethod === 'seat_delivery' && (
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Row (e.g., A)"
                          value={rowNumber}
                          onChange={(e) => setRowNumber(e.target.value)}
                          className="text-sm border rounded p-2"
                        />
                        <input
                          type="text"
                          placeholder="Seat (e.g., 12)"
                          value={seatNumber}
                          onChange={(e) => setSeatNumber(e.target.value)}
                          className="text-sm border rounded p-2"
                        />
                      </div>
                    )}
                  </div>

                  {/* Order Summary */}
                  <div className="bg-white rounded-lg p-4 border mb-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>₹{getSubtotal()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax (18%)</span>
                        <span>₹{getTax()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Service Charge (5%)</span>
                        <span>₹{getServiceCharge()}</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between font-semibold">
                        <span>Total</span>
                        <span>₹{getTotalAmount()}</span>
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}

                  <button
                    onClick={handleOrder}
                    disabled={ordering}
                    className="w-full bg-red-600 text-white py-3 rounded-md font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {ordering ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Order Now - ₹{getTotalAmount()}
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodOrdering;

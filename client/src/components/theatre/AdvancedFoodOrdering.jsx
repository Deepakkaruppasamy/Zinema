import React, { useState, useEffect } from 'react';
import { FaUtensils, FaShoppingCart, FaHeart, FaStar, FaFilter, FaSearch, FaClock, FaLeaf, FaFire, FaIceCream, FaCoffee, FaPizzaSlice, FaHamburger, FaPlus, FaMinus, FaTrash, FaCheck } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const AdvancedFoodOrdering = ({ onOrderUpdate, onClose }) => {
  const [foodItems, setFoodItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [filters, setFilters] = useState({
    category: 'all',
    dietary: 'all',
    priceRange: [0, 1000],
    rating: 0
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [favorites, setFavorites] = useState(new Set());
  const [dietaryPreferences, setDietaryPreferences] = useState({
    vegetarian: false,
    vegan: false,
    glutenFree: false,
    nutFree: false,
    spicy: false
  });

  useEffect(() => {
    fetchFoodItems();
  }, []);

  const fetchFoodItems = async () => {
    setLoading(true);
    try {
      // Simulate API call to get food items
      const mockFoodItems = [
        {
          id: 1,
          name: 'Classic Popcorn',
          description: 'Freshly popped with butter and salt',
          price: 120,
          category: 'snacks',
          image: 'https://img.freepik.com/free-photo/popcorn_144627-16132.jpg?w=400',
          rating: 4.5,
          prepTime: 5,
          dietary: ['vegetarian'],
          allergens: ['dairy'],
          calories: 150,
          isPopular: true,
          isNew: false,
          nutrition: {
            calories: 150,
            fat: 8,
            carbs: 18,
            protein: 2
          }
        },
        {
          id: 2,
          name: 'Cheese Nachos',
          description: 'Crispy tortilla chips with melted cheese',
          price: 180,
          category: 'snacks',
          image: 'https://img.freepik.com/free-photo/nachos-with-cheese-sauce_140725-115.jpg?w=400',
          rating: 4.2,
          prepTime: 8,
          dietary: ['vegetarian'],
          allergens: ['dairy', 'gluten'],
          calories: 320,
          isPopular: true,
          isNew: false,
          nutrition: {
            calories: 320,
            fat: 18,
            carbs: 32,
            protein: 8
          }
        },
        {
          id: 3,
          name: 'Veggie Burger',
          description: 'Plant-based patty with fresh vegetables',
          price: 150,
          category: 'main',
          image: 'https://img.freepik.com/free-photo/side-view-burger-with-vegetables_141793-15542.jpg?w=400',
          rating: 4.0,
          prepTime: 12,
          dietary: ['vegetarian', 'vegan'],
          allergens: ['gluten'],
          calories: 280,
          isPopular: false,
          isNew: true,
          nutrition: {
            calories: 280,
            fat: 12,
            carbs: 35,
            protein: 15
          }
        },
        {
          id: 4,
          name: 'Cold Coffee',
          description: 'Iced coffee with milk and ice',
          price: 100,
          category: 'beverages',
          image: 'https://img.freepik.com/free-photo/iced-coffee-glass_144627-16281.jpg?w=400',
          rating: 4.3,
          prepTime: 3,
          dietary: ['vegetarian'],
          allergens: ['dairy'],
          calories: 80,
          isPopular: true,
          isNew: false,
          nutrition: {
            calories: 80,
            fat: 3,
            carbs: 12,
            protein: 2
          }
        },
        {
          id: 5,
          name: 'Chocolate Ice Cream',
          description: 'Rich chocolate ice cream with toppings',
          price: 90,
          category: 'desserts',
          image: 'https://img.freepik.com/free-photo/ice-cream-cone_144627-16133.jpg?w=400',
          rating: 4.6,
          prepTime: 2,
          dietary: ['vegetarian'],
          allergens: ['dairy', 'eggs'],
          calories: 200,
          isPopular: true,
          isNew: false,
          nutrition: {
            calories: 200,
            fat: 12,
            carbs: 22,
            protein: 4
          }
        },
        {
          id: 6,
          name: 'Margherita Pizza',
          description: 'Classic pizza with tomato and mozzarella',
          price: 220,
          category: 'main',
          image: 'https://img.freepik.com/free-photo/pizza-margherita_144627-16134.jpg?w=400',
          rating: 4.4,
          prepTime: 15,
          dietary: ['vegetarian'],
          allergens: ['dairy', 'gluten'],
          calories: 400,
          isPopular: false,
          isNew: true,
          nutrition: {
            calories: 400,
            fat: 18,
            carbs: 45,
            protein: 16
          }
        }
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setFoodItems(mockFoodItems);
    } catch (error) {
      console.error('Error fetching food items:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'snacks': return <FaHamburger />;
      case 'main': return <FaPizzaSlice />;
      case 'beverages': return <FaCoffee />;
      case 'desserts': return <FaIceCream />;
      default: return <FaUtensils />;
    }
  };

  const getDietaryIcon = (dietary) => {
    switch (dietary) {
      case 'vegetarian': return <FaLeaf className="text-green-400" />;
      case 'vegan': return <FaLeaf className="text-green-500" />;
      case 'gluten-free': return <FaCheck className="text-blue-400" />;
      case 'spicy': return <FaFire className="text-red-400" />;
      default: return null;
    }
  };

  const filteredItems = foodItems.filter(item => {
    const matchesCategory = filters.category === 'all' || item.category === filters.category;
    const matchesDietary = filters.dietary === 'all' || item.dietary.includes(filters.dietary);
    const matchesPrice = item.price >= filters.priceRange[0] && item.price <= filters.priceRange[1];
    const matchesRating = item.rating >= filters.rating;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesDietary && matchesPrice && matchesRating && matchesSearch;
  });

  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(cartItem => cartItem.id === item.id);
      if (existing) {
        return prev.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (id, delta) => {
    setCart(prev => {
      const item = prev.find(cartItem => cartItem.id === id);
      if (item) {
        const newQuantity = item.quantity + delta;
        if (newQuantity <= 0) {
          return prev.filter(cartItem => cartItem.id !== id);
        }
        return prev.map(cartItem =>
          cartItem.id === id
            ? { ...cartItem, quantity: newQuantity }
            : cartItem
        );
      }
      return prev;
    });
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(cartItem => cartItem.id !== id));
  };

  const toggleFavorite = (id) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(id)) {
        newFavorites.delete(id);
      } else {
        newFavorites.add(id);
      }
      return newFavorites;
    });
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const categories = [
    { id: 'all', name: 'All Items', icon: <FaUtensils /> },
    { id: 'snacks', name: 'Snacks', icon: <FaHamburger /> },
    { id: 'main', name: 'Main Course', icon: <FaPizzaSlice /> },
    { id: 'beverages', name: 'Beverages', icon: <FaCoffee /> },
    { id: 'desserts', name: 'Desserts', icon: <FaIceCream /> }
  ];

  const dietaryOptions = [
    { id: 'all', name: 'All' },
    { id: 'vegetarian', name: 'Vegetarian' },
    { id: 'vegan', name: 'Vegan' },
    { id: 'gluten-free', name: 'Gluten Free' }
  ];

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-gray-900 rounded-2xl w-full max-w-6xl h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <FaUtensils className="text-primary text-xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Food & Beverages</h2>
                <p className="text-gray-400">Pre-order for pickup at theatre</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowCart(true)}
                className="relative p-3 bg-primary/20 rounded-lg hover:bg-primary/30 transition-colors"
              >
                <FaShoppingCart className="text-primary text-xl" />
                {getCartItemCount() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                    {getCartItemCount()}
                  </span>
                )}
              </button>
              <button
                onClick={onClose}
                className="p-3 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <span className="text-gray-400 text-xl">×</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <div className="w-80 bg-gray-800/30 p-6 border-r border-white/10 overflow-y-auto">
            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search food items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            {/* Categories */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-3">Categories</h3>
              <div className="space-y-2">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setFilters(prev => ({ ...prev, category: category.id }))}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      filters.category === category.id
                        ? 'bg-primary/20 text-primary border border-primary/30'
                        : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
                    }`}
                  >
                    {category.icon}
                    <span>{category.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Dietary Preferences */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-3">Dietary Preferences</h3>
              <div className="space-y-2">
                {dietaryOptions.map(option => (
                  <button
                    key={option.id}
                    onClick={() => setFilters(prev => ({ ...prev, dietary: option.id }))}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      filters.dietary === option.id
                        ? 'bg-primary/20 text-primary border border-primary/30'
                        : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
                    }`}
                  >
                    {getDietaryIcon(option.id)}
                    <span>{option.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-3">Price Range</h3>
              <div className="space-y-3">
                <input
                  type="range"
                  min="0"
                  max="1000"
                  value={filters.priceRange[1]}
                  onChange={(e) => setFilters(prev => ({ ...prev, priceRange: [prev.priceRange[0], parseInt(e.target.value)] }))}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-400">
                  <span>₹{filters.priceRange[0]}</span>
                  <span>₹{filters.priceRange[1]}</span>
                </div>
              </div>
            </div>

            {/* Rating Filter */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-3">Minimum Rating</h3>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map(rating => (
                  <button
                    key={rating}
                    onClick={() => setFilters(prev => ({ ...prev, rating: rating }))}
                    className={`p-2 rounded-lg transition-colors ${
                      filters.rating === rating
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
                    }`}
                  >
                    <FaStar />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="animate-pulse">
                    <div className="h-48 bg-gray-800/50 rounded-xl mb-4"></div>
                    <div className="h-4 bg-gray-800/50 rounded mb-2"></div>
                    <div className="h-4 bg-gray-800/50 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map(item => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-800/30 rounded-xl overflow-hidden border border-white/10 hover:border-primary/30 transition-all duration-300"
                  >
                    <div className="relative">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-3 right-3 flex gap-2">
                        {item.isPopular && (
                          <span className="px-2 py-1 bg-red-500/20 text-red-300 text-xs rounded-full border border-red-500/30">
                            Popular
                          </span>
                        )}
                        {item.isNew && (
                          <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full border border-green-500/30">
                            New
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => toggleFavorite(item.id)}
                        className={`absolute top-3 left-3 p-2 rounded-full transition-colors ${
                          favorites.has(item.id)
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
                        }`}
                      >
                        <FaHeart />
                      </button>
                    </div>
                    
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-white">{item.name}</h3>
                        <div className="text-right">
                          <div className="text-xl font-bold text-primary">₹{item.price}</div>
                          <div className="flex items-center gap-1 text-sm text-gray-400">
                            <FaStar className="text-yellow-400" />
                            <span>{item.rating}</span>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-gray-400 text-sm mb-3">{item.description}</p>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <FaClock />
                          <span>{item.prepTime} min</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <span>{item.calories} cal</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mb-4">
                        {item.dietary.map(diet => (
                          <span key={diet} className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full border border-green-500/30">
                            {diet}
                          </span>
                        ))}
                      </div>
                      
                      <button
                        onClick={() => addToCart(item)}
                        className="w-full py-2 bg-primary hover:bg-primary/80 text-white rounded-lg font-semibold transition-colors"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Cart Sidebar */}
        <AnimatePresence>
          {showCart && (
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="absolute inset-y-0 right-0 w-96 bg-gray-900 border-l border-white/10 p-6 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Your Order</h3>
                <button
                  onClick={() => setShowCart(false)}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <span className="text-gray-400 text-xl">×</span>
                </button>
              </div>
              
              {cart.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  <FaShoppingCart className="text-4xl mx-auto mb-4 opacity-50" />
                  <p>Your cart is empty</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map(item => (
                    <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h4 className="text-white font-medium">{item.name}</h4>
                        <div className="text-sm text-gray-400">₹{item.price} each</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="p-1 hover:bg-gray-700 rounded"
                        >
                          <FaMinus className="text-gray-400" />
                        </button>
                        <span className="text-white font-medium w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="p-1 hover:bg-gray-700 rounded"
                        >
                          <FaPlus className="text-gray-400" />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-1 hover:bg-red-500/20 rounded ml-2"
                        >
                          <FaTrash className="text-red-400" />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  <div className="border-t border-white/10 pt-4">
                    <div className="flex justify-between items-center text-xl font-bold text-white mb-4">
                      <span>Total</span>
                      <span>₹{getCartTotal()}</span>
                    </div>
                    <button
                      onClick={() => {
                        onOrderUpdate(cart);
                        onClose();
                      }}
                      className="w-full py-3 bg-primary hover:bg-primary/80 text-white rounded-lg font-semibold transition-colors"
                    >
                      Place Order
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default AdvancedFoodOrdering;

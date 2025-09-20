import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaHome, 
  FaFilm, 
  FaTicketAlt, 
  FaUser, 
  FaSearch,
  FaBars,
  FaTimes,
  FaBell,
  FaHeart
} from 'react-icons/fa';

const MobileNavigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigationItems = [
    { path: '/', icon: FaHome, label: 'Home' },
    { path: '/movies', icon: FaFilm, label: 'Movies' },
    { path: '/bookings', icon: FaTicketAlt, label: 'Bookings' },
    { path: '/profile', icon: FaUser, label: 'Profile' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}>
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-red-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">Z</span>
            </div>
            <span className="font-bold text-lg text-gray-900">Zinema</span>
          </Link>

          {/* Right side actions */}
          <div className="flex items-center space-x-3">
            <button className="p-2 text-gray-600 hover:text-gray-900">
              <FaSearch className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-900 relative">
              <FaBell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-900">
              <FaHeart className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-600 hover:text-gray-900"
            >
              {isMenuOpen ? <FaTimes className="w-5 h-5" /> : <FaBars className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)}>
          <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300">
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-gray-900">Menu</h2>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 text-gray-600 hover:text-gray-900"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive(item.path)
                          ? 'bg-gradient-to-r from-pink-500 to-red-500 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="space-y-2">
                  <Link
                    to="/settings"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    <span className="font-medium">Settings</span>
                  </Link>
                  <Link
                    to="/help"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    <span className="font-medium">Help & Support</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 safe-area-pb">
        <div className="flex items-center justify-around py-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'text-pink-500'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive(item.path) ? 'text-pink-500' : ''}`} />
                <span className="text-xs font-medium">{item.label}</span>
                {isActive(item.path) && (
                  <div className="w-1 h-1 bg-pink-500 rounded-full"></div>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Spacer for fixed header */}
      <div className="h-16"></div>
      {/* Spacer for bottom navigation */}
      <div className="h-20"></div>
    </>
  );
};

export default MobileNavigation;

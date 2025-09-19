import React from 'react';

const PLAY_STORE = 'https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg';
const APP_STORE = 'https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg';
const PHONE_IMG = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&q=80';

const AppPromotionSection = () => (
  <section className="mt-20 px-6 md:px-16 lg:px-36 xl:px-44">
    <div className="bg-gradient-to-r from-primary/80 to-pink-600/70 rounded-2xl flex flex-col md:flex-row items-center justify-between p-8 md:p-12 gap-8 shadow-xl border border-gray-800">
      <div className="flex-1 flex flex-col items-start">
        <h2 className="text-3xl font-bold text-white mb-2">Get Zinema on Your Phone</h2>
        <p className="text-gray-100 mb-6 max-w-md text-lg">Book tickets, watch trailers, and get personalized recommendations on the go. Download our app for the best movie experience!</p>
        <div className="flex gap-4">
          <a href="#" target="_blank" rel="noopener noreferrer">
            <img src={PLAY_STORE} alt="Get it on Google Play" className="h-12" />
          </a>
          <a href="#" target="_blank" rel="noopener noreferrer">
            <img src={APP_STORE} alt="Download on the App Store" className="h-12" />
          </a>
        </div>
      </div>
      <div className="flex-1 flex justify-center">
        <img src={PHONE_IMG} alt="Zinema Mobile App" className="h-64 rounded-2xl shadow-2xl border-4 border-white/20 object-cover" />
      </div>
    </div>
  </section>
);

export default AppPromotionSection;

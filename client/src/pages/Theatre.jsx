import React, { useState, useEffect } from 'react';
import { FaChair, FaWifi, FaUtensils, FaParking, FaMapMarkerAlt, FaPhoneAlt, FaStar, FaWheelchair, FaTags, FaImages, FaEnvelope } from 'react-icons/fa';
import zinemaImg from '../assets/zinema.jpg';
import FiltersBar from '../components/theatre/FiltersBar';
import TheatreCard from '../components/theatre/TheatreCard';
import QuickBookModal from '../components/theatre/QuickBookModal';
import SeatPickerModal from '../components/theatre/SeatPickerModal';
import useTheatreSearch from '../hooks/useTheatreSearch';

const WIFI_PASSWORD = 'grandcinema@123';
const RECLINER_PRICE = 300;
const PARKING_PRICE = 50;

const mockParkingData = [
  { level: 1, total: 50, available: 12 },
  { level: 2, total: 40, available: 8 },
  { level: 3, total: 30, available: 2 },
];

const mockMenu = [
  { name: 'Classic Popcorn', price: 120, img: 'https://img.freepik.com/free-photo/popcorn_144627-16132.jpg?w=400' },
  { name: 'Cheese Nachos', price: 180, img: 'https://img.freepik.com/free-photo/nachos-with-cheese-sauce_140725-115.jpg?w=400' },
  { name: 'Cold Coffee', price: 100, img: 'https://img.freepik.com/free-photo/iced-coffee-glass_144627-16281.jpg?w=400' },
  { name: 'Veg Burger', price: 150, img: 'https://img.freepik.com/free-photo/side-view-burger-with-vegetables_141793-15542.jpg?w=400' },
];

const reclinerGallery = [
  'https://img.freepik.com/free-photo/luxury-armchair-isolated-white-background_123827-24145.jpg?w=400',
  'https://img.freepik.com/free-photo/modern-armchair-isolated-white-background_123827-24150.jpg?w=400',
  'https://img.freepik.com/free-photo/interior-room-with-armchair_123827-24155.jpg?w=400',
];

const Theatre = () => {
  const [foodCart, setFoodCart] = useState([]);
  const [foodQuantities, setFoodQuantities] = useState(Array(mockMenu.length).fill(0));

  const [showWifiModal, setShowWifiModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showFoodModal, setShowFoodModal] = useState(false);
  const [showReclinerModal, setShowReclinerModal] = useState(false);
  const [reclinerSelected, setReclinerSelected] = useState(false);
  const [showParkingModal, setShowParkingModal] = useState(false);
  const [parkingSelected, setParkingSelected] = useState(false);
  const [selectedParkingLevel, setSelectedParkingLevel] = useState(null);
  const [parkingData, setParkingData] = useState([]);
  const [loadingParking, setLoadingParking] = useState(false);
  const [reclinerIndex, setReclinerIndex] = useState(0);
  const { state, actions, theatres } = useTheatreSearch();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [quickBook, setQuickBook] = useState({ open: false, theatre: '', showtime: '', showId: null, selectedSeats: [] });
  const [seatModal, setSeatModal] = useState({ open: false, theatre: '', show: null });
  const [loadingTheatres, setLoadingTheatres] = useState(true);
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [promoCode, setPromoCode] = useState('');
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [contactOpen, setContactOpen] = useState(false);
  const [showtimeFilter, setShowtimeFilter] = useState('All');
  const [reportOpen, setReportOpen] = useState(false);
  const [reportTheatre, setReportTheatre] = useState('');
  const [reportMessage, setReportMessage] = useState('');

  useEffect(() => {
    // Simulate theatres loading for skeleton UI
    setLoadingTheatres(true);
    const t = setTimeout(() => setLoadingTheatres(false), 800);
    return () => clearTimeout(t);
  }, []);

  // Global ESC to close modals/drawers (UI only)
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setShowFoodModal(false);
        setShowWifiModal(false);
        setShowReclinerModal(false);
        setShowParkingModal(false);
        setGalleryOpen(false);
        setContactOpen(false);
        setReportOpen(false);
        setQuickBook({ open: false, theatre: '', showtime: '' });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (showParkingModal) {
      setLoadingParking(true);
      setTimeout(() => {
        setParkingData(mockParkingData);
        setLoadingParking(false);
      }, 1200);
    }
  }, [showParkingModal]);

  const handleFoodQty = (idx, delta) => {
    setFoodQuantities(qty => {
      const updated = [...qty];
      updated[idx] = Math.max(0, updated[idx] + delta);
      return updated;
    });
  };

  const handleAddToCart = (idx) => {
    setFoodCart(cart => {
      const item = mockMenu[idx];
      const qty = foodQuantities[idx];
      if (!qty) return cart;
      const exists = cart.find(c => c.name === item.name);
      if (exists) {
        return cart.map(c => c.name === item.name ? { ...c, qty: c.qty + qty } : c);
      }
      return [...cart, { ...item, qty }];
    });
    setFoodQuantities(qty => qty.map((q, i) => (i === idx ? 0 : q)));
  };

  const foodTotal = foodCart.reduce((sum, item) => sum + item.qty * item.price, 0);
  const reclinerTotal = reclinerSelected ? RECLINER_PRICE : 0;
  const parkingTotal = parkingSelected ? PARKING_PRICE : 0;
  const grandTotal = foodTotal + reclinerTotal + parkingTotal;
  const payableTotal = Math.max(0, grandTotal - appliedDiscount);

  const timeBucket = (t) => {
    // Expecting formats like '10:30 AM' or '21:15' etc. UI-only approximation
    if (!t || typeof t !== 'string') return 'Other';
    let hour = 0;
    const ampm = t.toUpperCase().includes('AM') || t.toUpperCase().includes('PM');
    if (ampm) {
      const parts = t.trim().split(/[:\s]/); // [HH, MM, AM]
      const h = parseInt(parts[0], 10);
      const am = t.toUpperCase().includes('AM');
      hour = (h % 12) + (am ? 0 : 12);
    } else {
      // 24h like 21:15
      const parts = t.split(':');
      hour = parseInt(parts[0], 10) || 0;
    }
    if (hour < 12) return 'Morning';
    if (hour < 17) return 'Afternoon';
    if (hour < 21) return 'Evening';
    return 'Night';
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col items-center pt-28 pb-20 px-6 md:px-20">
      {/* Filters and dynamic theatre list */}
      <div className="w-full max-w-5xl mb-6">
        <FiltersBar
          city={state.city}
          setCity={actions.setCity}
          date={state.date}
          setDate={actions.setDate}
          format={state.format}
          setFormat={actions.setFormat}
          language={state.language}
          setLanguage={actions.setLanguage}
          sortBy={state.sortBy}
          setSortBy={actions.setSortBy}
          onOpenFilters={() => setFiltersOpen(true)}
        />
      </div>
      <div className="w-full max-w-5xl mb-2 flex items-center justify-between text-sm text-gray-400">
        <span>{theatres.length} theatres found</span>
      </div>
      {/* Quick Date Pills */}
      <div className="w-full max-w-5xl mb-4 flex items-center gap-2">
        {(() => {
          const d = new Date();
          const today = d.toISOString().slice(0, 10);
          d.setDate(d.getDate() + 1);
          const tomorrow = d.toISOString().slice(0, 10);
          const btn = (label, value) => (
            <button
              key={label}
              className={`px-3 py-1 rounded-full text-sm border ${state.date === value ? 'bg-primary text-white border-primary' : 'bg-gray-800 text-gray-200 border-white/10 hover:bg-gray-700'}`}
              onClick={() => actions.setDate(value)}
            >
              {label}
            </button>
          );
          return [btn('Today', today), btn('Tomorrow', tomorrow)];
        })()}
      </div>
      {/* Showtime Filter Pills */}
      <div className="w-full max-w-5xl mb-4 flex flex-wrap items-center gap-2">
        {['All','Morning','Afternoon','Evening','Night'].map(b => (
          <button
            key={b}
            className={`px-3 py-1 rounded-full text-sm border ${showtimeFilter === b ? 'bg-primary text-white border-primary' : 'bg-gray-800 text-gray-200 border-white/10 hover:bg-gray-700'}`}
            onClick={() => setShowtimeFilter(b)}
          >
            {b}
          </button>
        ))}
      </div>

      <div className="w-full max-w-5xl space-y-4 mb-12">
        {loadingTheatres ? (
          <>
            {[1,2,3].map(i => (
              <div key={i} className="w-full h-36 rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
                <div className="h-full w-full animate-pulse bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800"></div>
              </div>
            ))}
          </>
        ) : theatres.length > 0 ? (
          theatres.map(t => {
            const filteredShowtimes = (t.showtimes || []).filter(s => showtimeFilter === 'All' || timeBucket(s.time) === showtimeFilter);
            const theatreForCard = { ...t, showtimes: filteredShowtimes };
            return (
              <TheatreCard
                key={t.id}
                theatre={theatreForCard}
                onQuickBook={(show) => setSeatModal({ open: true, theatre: t.name, show })}
                onReport={() => { setReportTheatre(t.name); setReportOpen(true); }}
              />
            );
          })
        ) : (
          <div className="w-full max-w-5xl rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-gray-300">
            No theatres match your filters. Try adjusting city, format, or language.
          </div>
        )}
      </div>
      <div className="max-w-5xl w-full bg-gray-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        <img src={zinemaImg} alt="Zinema" className="w-full md:w-1/2 h-96 object-cover" />
        <div className="flex-1 p-8 flex flex-col justify-between">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">Zinema Multiplex</h1>
            <p className="text-lg text-gray-300 mb-6">
              <strong>Zinema</strong> is the city’s premier multiplex, offering a world-class movie experience with luxury recliner seating, state-of-the-art projection and sound, and a wide range of gourmet food options...
            </p>
            <div className="flex items-center gap-4 mb-4">
              <FaMapMarkerAlt className="text-primary" size={22} />
              <span className="text-gray-200 text-base">Sri Lakshmi Nagar, Thekkalur, Avinashi</span>
            </div>
            <div className="flex items-center gap-4 mb-8">
              <FaPhoneAlt className="text-primary" size={20} />
              <span className="text-gray-200 text-base">+91 98765 43210</span>
            </div>

            <h2 className="text-2xl font-semibold text-primary mb-3">Facilities</h2>
            <div className="grid grid-cols-2 gap-5 mb-6">
              {/* Recliner Add-on */}
              <div
                className={`flex items-center gap-3 bg-gray-800 p-3 rounded-xl shadow cursor-pointer hover:bg-primary/20 transition ${reclinerSelected ? 'ring-4 ring-primary/40 scale-105' : ''}`}
                onClick={() => setShowReclinerModal(true)}
              >
                <FaChair size={28} className="text-primary" />
                <span className="text-gray-200 text-base font-medium">Luxury Recliner</span>
                <button
                  className={`ml-auto px-4 py-1 rounded-full font-semibold text-sm ${reclinerSelected ? 'bg-primary text-white' : 'bg-gray-700 text-gray-200'} transition`}
                  onClick={e => { e.stopPropagation(); setReclinerSelected(!reclinerSelected); }}
                >
                  {reclinerSelected ? 'Selected' : `Add $${RECLINER_PRICE}`}
                </button>
              </div>

              {/* Parking Add-on */}
              <div
                className={`flex items-center gap-3 bg-gray-800 p-3 rounded-xl shadow cursor-pointer hover:bg-primary/20 transition ${parkingSelected ? 'ring-4 ring-primary/40 scale-105' : ''}`}
                onClick={() => setShowParkingModal(true)}
              >
                <FaParking size={28} className="text-primary" />
                <span className="text-gray-200 text-base font-medium">Ample Parking</span>
                <button
                  className={`ml-auto px-4 py-1 rounded-full font-semibold text-sm ${parkingSelected ? 'bg-primary text-white' : 'bg-gray-700 text-gray-200'} transition`}
                  onClick={e => { e.stopPropagation(); setParkingSelected(!parkingSelected); setSelectedParkingLevel(null); }}
                >
                  {parkingSelected ? 'Selected' : `Add $${PARKING_PRICE}`}
                </button>
              </div>

              {/* Food Facility */}
              <div
                className="flex items-center gap-4 bg-gray-800 p-5 rounded-xl shadow cursor-pointer hover:bg-primary/20 transition"
                onClick={() => setShowFoodModal(true)}
              >
                <FaUtensils size={28} className="text-primary" />
                <span className="text-gray-200 text-lg font-semibold">Available Food</span>
              </div>

              {/* Wi-Fi Facility */}
              <div
                className="flex items-center gap-4 bg-gray-800 p-5 rounded-xl shadow cursor-pointer hover:bg-primary/20 transition"
                onClick={() => setShowWifiModal(true)}
              >
                <FaWifi size={28} className="text-primary" />
                <span className="text-gray-200 text-lg font-semibold">Free Wi-Fi</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ratings & Amenities */}
      <div className="max-w-5xl w-full grid md:grid-cols-2 gap-6 mt-6">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center gap-3 mb-3">
            {[...Array(5)].map((_, i) => (
              <FaStar key={i} className={`${i < 4 ? 'text-yellow-400' : 'text-gray-500'} drop-shadow`} />
            ))}
            <span className="text-gray-200 font-semibold ml-2">4.0/5</span>
            <span className="text-gray-400 text-sm">(1.2k reviews)</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {['Cleanliness','Sound','Seating','Food Variety','Parking'].map(tag => (
              <span key={tag} className="px-3 py-1 rounded-full bg-primary/15 text-primary text-sm font-medium">{tag}</span>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h3 className="text-primary font-semibold mb-3">Amenities</h3>
          <div className="flex flex-wrap gap-2">
            {['Dolby Atmos','4K Projection','Wheelchair Accessible','Family Friendly','Contactless Entry'].map((a, i) => (
              <span key={i} className="px-3 py-1 rounded-full bg-gray-800 text-gray-200 border border-white/10 text-sm flex items-center gap-2">
                {a === 'Wheelchair Accessible' && <FaWheelchair className="text-primary" />}
                {a}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Offers / Coupons */}
      <div className="max-w-5xl w-full rounded-2xl border border-white/10 bg-white/5 p-6 mt-6">
        <div className="flex items-center gap-2 mb-4">
          <FaTags className="text-primary" />
          <h3 className="text-primary font-semibold">Offers & Coupons</h3>
        </div>
        <div className="flex flex-col md:flex-row gap-3 md:items-center">
          <input
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            placeholder="Enter promo code"
            className="flex-1 px-4 py-2 rounded-xl bg-gray-900 border border-white/10 text-gray-200 outline-none"
          />
          <button
            className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-semibold"
            onClick={() => setAppliedDiscount(promoCode.trim() ? 75 : 0)}
          >
            Apply
          </button>
        </div>
        <div className="flex flex-wrap gap-3 mt-4">
          {[
            {label: 'WEEKEND50', off: 50},
            {label: 'FOOD25', off: 25},
            {label: 'PARK10', off: 10},
          ].map(o => (
            <button key={o.label} onClick={() => { setPromoCode(o.label); setAppliedDiscount(o.off); }} className="px-3 py-1 rounded-full bg-primary/15 text-primary border border-primary/30 text-sm font-semibold">
              {o.label} - Save ${o.off}
            </button>
          ))}
        </div>
        {appliedDiscount > 0 && (
          <div className="mt-3 text-sm text-green-400">Applied discount: ${appliedDiscount} (UI only)</div>
        )}
      </div>

      {/* Seat Map Preview */}
      <div className="max-w-5xl w-full rounded-2xl border border-white/10 bg-white/5 p-6 mt-6">
        <h3 className="text-primary font-semibold mb-4">Seat Map Preview (UI)</h3>
        <div className="mb-3 text-xs text-gray-400">Screen this side</div>
        <div className="grid grid-cols-12 gap-1 mb-4">
          {Array.from({ length: 8*12 }).map((_, idx) => {
            const row = Math.floor(idx / 12);
            const isAisle = (idx % 12 === 5);
            const isBooked = (row === 2 && idx % 3 === 0);
            const isRecliner = row > 5;
            return (
              <div key={idx} className={`h-4 rounded ${isAisle ? 'bg-transparent' : isBooked ? 'bg-red-500/60' : isRecliner ? 'bg-yellow-400/60' : 'bg-gray-600'}`}></div>
            );
          })}
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-gray-600 inline-block"></span> Standard</span>
          <span className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-yellow-400/60 inline-block"></span> Recliner</span>
          <span className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-red-500/60 inline-block"></span> Booked</span>
        </div>
      </div>

      {/* Mini Map Placeholder */}
      <div className="max-w-5xl w-full rounded-2xl border border-white/10 bg-white/5 p-6 mt-6">
        <h3 className="text-primary font-semibold mb-3">Location</h3>
        <div className="w-full h-56 rounded-xl overflow-hidden border border-white/10 bg-gray-800">
          {/* Embed Google Maps using the provided link */}
          {/* If the embed is blocked, the Open in Maps button is available below */}
          <iframe
            title="Theatre Location Map"
            className="w-full h-full"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://www.google.com/maps?q=${encodeURIComponent('https://maps.app.goo.gl/u5Fkgw9TP2QqTrwP9')}&output=embed`}
            allowFullScreen
          />
        </div>
        <div className="mt-3 flex items-center gap-2">
          <a
            href="https://maps.app.goo.gl/u5Fkgw9TP2QqTrwP9"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-2 rounded-lg bg-primary text-black font-semibold hover:opacity-90"
          >
            Open in Google Maps
          </a>
        </div>
      </div>

      {/* FAQ / Policy Accordion */}
      <div className="max-w-5xl w-full rounded-2xl border border-white/10 bg-white/5 p-6 mt-6">
        <h3 className="text-primary font-semibold mb-3">FAQs & Policies</h3>
        {[
          {q: 'What is the refund policy?', a: 'Refunds are available on UI within 24 hours before showtime. This is display only.'},
          {q: 'Is outside food allowed?', a: 'Outside food is generally not allowed. Please check theatre policies.'},
          {q: 'Are children allowed for A-rated movies?', a: 'No. Please carry a valid ID for age-restricted shows.'},
        ].map((f, ix) => (
          <details key={ix} className="mb-2 group">
            <summary className="cursor-pointer select-none text-gray-200 bg-gray-800 rounded-lg px-4 py-2 border border-white/10 group-open:border-primary">{f.q}</summary>
            <div className="px-4 py-3 text-gray-300">{f.a}</div>
          </details>
        ))}
      </div>

      {/* Photo Gallery Trigger */}
      <div className="max-w-5xl w-full flex items-center justify-between mt-6">
        <button className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white flex items-center gap-2" onClick={() => { setGalleryIndex(0); setGalleryOpen(true); }}>
          <FaImages className="text-primary" /> View Theatre Photos
        </button>
        <button className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white flex items-center gap-2" onClick={() => setContactOpen(true)}>
          <FaEnvelope className="text-primary" /> Contact Theatre
        </button>
      </div>

      {/* Gallery Modal */}
      {galleryOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center">
          <div className="bg-gray-900 rounded-2xl p-4 w-full max-w-3xl">
            <div className="relative h-[60vh] rounded-xl overflow-hidden border border-white/10 bg-gray-800">
              <img src={[zinemaImg, ...reclinerGallery][galleryIndex]} alt="Gallery" className="w-full h-full object-contain" />
              <button className="absolute left-3 top-1/2 -translate-y-1/2 bg-gray-800/70 hover:bg-gray-700 text-white px-3 py-1 rounded-full" onClick={() => setGalleryIndex(i => (i - 1 + (1 + reclinerGallery.length)) % (1 + reclinerGallery.length))}>‹</button>
              <button className="absolute right-3 top-1/2 -translate-y-1/2 bg-gray-800/70 hover:bg-gray-700 text-white px-3 py-1 rounded-full" onClick={() => setGalleryIndex(i => (i + 1) % (1 + reclinerGallery.length))}>›</button>
            </div>
            <div className="flex items-center justify-between mt-3">
              <div className="flex gap-2">
                {[zinemaImg, ...reclinerGallery].map((src, i) => (
                  <button key={i} className={`w-14 h-10 rounded overflow-hidden border ${i === galleryIndex ? 'border-primary' : 'border-white/10'}`} onClick={() => setGalleryIndex(i)}>
                    <img src={src} alt="thumb" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
              <button className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white" onClick={() => setGalleryOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Contact Drawer */}
      {contactOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60" onClick={() => setContactOpen(false)}></div>
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-gray-900 border-l border-white/10 p-6">
            <h3 className="text-primary font-semibold text-xl mb-4">Contact Theatre (UI)</h3>
            <div className="grid gap-3">
              <input className="px-4 py-2 rounded-xl bg-gray-800 border border-white/10 text-gray-200" placeholder="Your name" />
              <input className="px-4 py-2 rounded-xl bg-gray-800 border border-white/10 text-gray-200" placeholder="Email" />
              <textarea className="px-4 py-2 rounded-xl bg-gray-800 border border-white/10 text-gray-200 h-28" placeholder="Message"></textarea>
              <button className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-dull text-white font-semibold">Send</button>
              <button className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white" onClick={() => setContactOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Food Modal */}
      {showFoodModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className="bg-gray-900 rounded-2xl shadow-lg p-8 max-w-lg w-full flex flex-col items-center animate-fade-in">
            <h3 className="text-2xl font-bold text-primary mb-4">Available Food & Beverages</h3>
            <div className="grid grid-cols-2 gap-6 mb-6 w-full">
              {mockMenu.map((item, idx) => (
                <div key={idx} className="bg-gray-800 rounded-xl p-3 flex flex-col items-center shadow transition-transform hover:scale-105 animate-pop-in">
                  <img src={item.img} alt={item.name} className="w-24 h-24 object-cover rounded-lg mb-2 border-2 border-primary" />
                  <span className="text-gray-100 font-semibold text-lg mb-1">{item.name}</span>
                  <span className="text-primary font-mono mb-2">${item.price}</span>
                  <div className="flex items-center gap-2 mb-2">
                    <button onClick={() => handleFoodQty(idx, -1)} className="px-2 py-1 bg-gray-700 text-white rounded-full text-lg">-</button>
                    <span className="font-bold text-lg text-gray-100">{foodQuantities[idx]}</span>
                    <button onClick={() => handleFoodQty(idx, 1)} className="px-2 py-1 bg-primary text-white rounded-full text-lg">+</button>
                  </div>
                  <button onClick={() => handleAddToCart(idx)} disabled={foodQuantities[idx] === 0} className={`px-4 py-1 bg-primary ${foodQuantities[idx] === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary-dull'} text-white rounded-full font-medium text-sm transition`}>
                    Add to Cart
                  </button>
                </div>
              ))}
            </div>
            <div className="w-full mb-4">
              <h4 className="text-lg font-semibold text-primary mb-2">Order Summary</h4>
              {foodCart.length === 0 ? (
                <div className="text-gray-400">Your cart is empty.</div>
              ) : (
                <ul className="mb-2">
                  {foodCart.map((item, idx) => (
                    <li key={idx} className="flex justify-between text-gray-200">
                      <span>{item.name} x {item.qty}</span>
                      <span>${item.qty * item.price}</span>
                    </li>
                  ))}
                </ul>
              )}
              <div className="flex justify-between font-bold text-primary text-lg border-t border-primary pt-2 mt-2">
                <span>Food Total</span>
                <span>${foodTotal}</span>
              </div>
            </div>
            <button onClick={() => setShowFoodModal(false)} className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-full font-semibold shadow transition-all">Close</button>
          </div>
        </div>
      )}

      {/* Wi-Fi Modal */}
      {showWifiModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className="bg-gray-900 rounded-2xl shadow-lg p-8 max-w-md w-full flex flex-col items-center animate-fade-in">
            <h3 className="text-2xl font-bold text-primary mb-4">Free Wi-Fi Access</h3>
            <div className="mb-4 text-gray-200 text-lg">Connect to <span className="text-primary font-semibold">Zinema-WiFi</span></div>
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-gray-800 px-4 py-2 rounded-lg font-mono text-primary text-lg">{WIFI_PASSWORD}</span>
              <button
                className="px-3 py-1 bg-primary text-white rounded-full font-semibold shadow hover:bg-primary-dull transition"
                onClick={() => {
                  navigator.clipboard.writeText(WIFI_PASSWORD);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1200);
                }}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <button onClick={() => setShowWifiModal(false)} className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-full font-semibold shadow transition-all">Close</button>
          </div>
        </div>
      )}

      {/* Recliner Modal */}
      {showReclinerModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className="bg-gray-900 rounded-2xl shadow-lg p-6 max-w-lg w-full animate-fade-in">
            <h3 className="text-2xl font-bold text-primary mb-4">Luxury Recliner Preview</h3>
            <div className="relative w-full h-64 mb-4 rounded-xl overflow-hidden border border-white/10 bg-gray-800 flex items-center justify-center">
              <img src={reclinerGallery[reclinerIndex]} alt={`Recliner ${reclinerIndex + 1}`} className="w-full h-full object-contain" />
              <button
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-gray-800/70 hover:bg-gray-700 text-white px-3 py-1 rounded-full"
                onClick={() => setReclinerIndex(i => (i - 1 + reclinerGallery.length) % reclinerGallery.length)}
              >
                ‹
              </button>
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-800/70 hover:bg-gray-700 text-white px-3 py-1 rounded-full"
                onClick={() => setReclinerIndex(i => (i + 1) % reclinerGallery.length)}
              >
                ›
              </button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
                {reclinerGallery.map((_, i) => (
                  <span key={i} className={`w-2 h-2 rounded-full ${i === reclinerIndex ? 'bg-primary' : 'bg-white/30'}`}></span>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between text-gray-200 mb-4">
              <span>Upgrade to recliner for</span>
              <span className="text-primary font-bold">${RECLINER_PRICE}</span>
            </div>
            <div className="flex items-center justify-end gap-3">
              {reclinerSelected && (
                <button
                  className="px-4 py-2 rounded-full bg-gray-700 hover:bg-gray-600 text-white font-semibold"
                  onClick={() => setReclinerSelected(false)}
                >
                  Remove
                </button>
              )}
              <button
                className="px-5 py-2 rounded-full bg-primary hover:bg-primary-dull text-white font-semibold shadow"
                onClick={() => { setReclinerSelected(true); setShowReclinerModal(false); }}
              >
                {reclinerSelected ? 'Keep Selected' : 'Select Recliner'}
              </button>
              <button
                className="px-5 py-2 rounded-full bg-gray-800 hover:bg-gray-700 text-white font-semibold"
                onClick={() => setShowReclinerModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Parking Modal */}
      {showParkingModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className="bg-gray-900 rounded-2xl shadow-lg p-6 max-w-xl w-full animate-fade-in">
            <h3 className="text-2xl font-bold text-primary mb-4">Select Parking Level</h3>
            {loadingParking ? (
              <div className="h-40 flex items-center justify-center text-gray-300">Loading availability...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {parkingData.map((p) => (
                  <button
                    key={p.level}
                    className={`text-left p-4 rounded-xl border transition select-none ${selectedParkingLevel === p.level ? 'border-primary bg-primary/10' : 'border-white/10 bg-gray-800 hover:bg-gray-700'}`}
                    onClick={() => setSelectedParkingLevel(p.level)}
                  >
                    <div className="text-gray-200 font-semibold">Level {p.level}</div>
                    <div className="text-sm text-gray-400">Total: {p.total}</div>
                    <div className={`text-sm mt-1 ${p.available > 5 ? 'text-green-400' : p.available > 0 ? 'text-yellow-400' : 'text-red-400'}`}>Available: {p.available}</div>
                  </button>
                ))}
              </div>
            )}
            <div className="flex items-center justify-between text-gray-200 mb-3">
              <span>Parking add-on</span>
              <span className="text-primary font-bold">${PARKING_PRICE}</span>
            </div>
            <div className="flex items-center justify-end gap-3">
              {parkingSelected && (
                <button
                  className="px-4 py-2 rounded-full bg-gray-700 hover:bg-gray-600 text-white font-semibold"
                  onClick={() => { setParkingSelected(false); setSelectedParkingLevel(null); }}
                >
                  Remove
                </button>
              )}
              <button
                className="px-5 py-2 rounded-full bg-primary hover:bg-primary-dull text-white font-semibold shadow disabled:opacity-50"
                disabled={!selectedParkingLevel}
                onClick={() => { setParkingSelected(true); setShowParkingModal(false); }}
              >
                {parkingSelected ? 'Keep Selected' : 'Select Parking'}
              </button>
              <button
                className="px-5 py-2 rounded-full bg-gray-800 hover:bg-gray-700 text-white font-semibold"
                onClick={() => setShowParkingModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Seat Picker + Quick Book */}
      <SeatPickerModal
        open={seatModal.open}
        theatreName={seatModal.theatre}
        showtime={seatModal.show?.time}
        showId={seatModal.show?.showId}
        onClose={() => setSeatModal({ open: false, theatre: '', show: null })}
        onConfirm={(seats) => {
          setSeatModal({ open: false, theatre: '', show: null });
          setQuickBook({ open: true, theatre: seatModal.theatre, showtime: seatModal.show?.time || '', showId: seatModal.show?.showId || null, selectedSeats: seats });
        }}
      />

      <QuickBookModal
        open={quickBook.open}
        theatreName={quickBook.theatre}
        showtime={quickBook.showtime}
        showId={quickBook.showId}
        selectedSeats={quickBook.selectedSeats}
        onClose={() => setQuickBook({ open: false, theatre: '', showtime: '', showId: null, selectedSeats: [] })}
      />

      {/* Sticky Summary Bar */}
      {(foodCart.length > 0 || reclinerSelected || parkingSelected) && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[95%] md:w-[800px]">
          <div className="rounded-2xl border border-white/10 bg-gray-900/90 backdrop-blur shadow-2xl px-5 py-4 flex flex-col md:flex-row md:items-center md:gap-6">
            <div className="flex-1 text-gray-200 text-sm md:text-base">
              <div className="flex flex-wrap items-center gap-3">
                {reclinerSelected && (
                  <span className="px-3 py-1 rounded-full bg-primary/15 text-primary font-semibold text-xs md:text-sm">Recliner +${RECLINER_PRICE}</span>
                )}
                {parkingSelected && (
                  <span className="px-3 py-1 rounded-full bg-primary/15 text-primary font-semibold text-xs md:text-sm">Parking{selectedParkingLevel ? ` L${selectedParkingLevel}` : ''} +${PARKING_PRICE}</span>
                )}
                {foodCart.length > 0 && (
                  <span className="px-3 py-1 rounded-full bg-primary/15 text-primary font-semibold text-xs md:text-sm">Food ${foodTotal}</span>
                )}
                {appliedDiscount > 0 && (
                  <span className="px-3 py-1 rounded-full bg-green-400/20 text-green-300 font-semibold text-xs md:text-sm">Discount -${appliedDiscount}</span>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between md:justify-end gap-4 mt-3 md:mt-0">
              <div className="text-gray-300">
                <div className="text-xs uppercase tracking-wide">Total</div>
                {appliedDiscount > 0 ? (
                  <div className="flex items-end gap-2">
                    <div className="text-lg line-through text-gray-500">${grandTotal}</div>
                    <div className="text-2xl font-bold text-primary">${payableTotal}</div>
                  </div>
                ) : (
                  <div className="text-2xl font-bold text-primary">${grandTotal}</div>
                )}
              </div>
              <button
                className="px-6 py-3 rounded-xl bg-primary hover:bg-primary-dull text-white font-semibold shadow-lg"
                onClick={() => window.alert('Proceeding payment')}
              >
                Proceed
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Theatre;

import React from 'react';
import Slider from 'react-slick';

const testimonials = [
  {
    name: 'Aarav Sharma',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    review: 'Zinema is my go-to for booking the latest movies! The interface is super easy and the recommendations are always spot on.',
    rating: 5,
  },
  {
    name: 'Priya Singh',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    review: 'Love the upcoming movies carousel and how fast I can find showtimes near me. Great experience!',
    rating: 4,
  },
  {
    name: 'Rahul Verma',
    avatar: 'https://randomuser.me/api/portraits/men/76.jpg',
    review: 'The trending and top rated sections helped me discover so many great films. Highly recommended!',
    rating: 5,
  },
  {
    name: 'Sneha Patel',
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    review: 'Beautiful design, easy booking, and I love the quizzes! Zinema is the best movie platform.',
    rating: 5,
  },
];

const settings = {
  dots: true,
  infinite: true,
  speed: 500,
  slidesToShow: 2,
  slidesToScroll: 1,
  arrows: false,
  autoplay: true,
  autoplaySpeed: 6000,
  accessibility: true,
  focusOnSelect: false,
  pauseOnFocus: true,
  pauseOnHover: true,
  responsive: [
    {
      breakpoint: 900,
      settings: { slidesToShow: 1 }
    }
  ]
};

const TestimonialsSection = () => (
  <section className="mt-20 px-6 md:px-16 lg:px-36 xl:px-44">
    <h2 className="text-2xl font-bold mb-6 text-white">What Our Users Say</h2>
    <Slider {...settings}>
      {testimonials.map((t, idx) => (
        <div key={idx} className="flex flex-col items-center bg-gray-900 rounded-2xl p-8 mx-4 shadow-xl border border-gray-800">
          <img src={t.avatar} alt={t.name} className="w-16 h-16 rounded-full mb-4 border-4 border-primary shadow" />
          <p className="text-lg text-gray-100 italic mb-3 text-center">“{t.review}”</p>
          <div className="flex gap-1 mb-2">
            {Array.from({ length: t.rating }).map((_, i) => (
              <span key={i} className="text-primary text-xl">★</span>
            ))}
            {Array.from({ length: 5 - t.rating }).map((_, i) => (
              <span key={i} className="text-gray-600 text-xl">★</span>
            ))}
          </div>
          <span className="text-primary font-semibold">{t.name}</span>
        </div>
      ))}
    </Slider>
  </section>
);

export default TestimonialsSection;

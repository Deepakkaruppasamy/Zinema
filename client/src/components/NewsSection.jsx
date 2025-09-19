import React from 'react';

const news = [
  {
    id: 1,
    image: 'https://image.tmdb.org/t/p/w500/zQ8nJX5l9p7XR1bKOsKX1F9kJpA.jpg',
    title: 'Marvel Announces New Phase of Movies',
    summary: 'Marvel Studios has revealed its upcoming lineup, including several highly anticipated sequels and new heroes joining the MCU.',
    link: '#',
  },
  {
    id: 2,
    image: 'https://image.tmdb.org/t/p/w500/6agKYU5IQFpuDyUYPu39w7UCRrJ.jpg',
    title: 'Oscar Buzz: Early Favorites Revealed',
    summary: 'Critics are already talking about the top contenders for this year’s Academy Awards. See which films are leading the pack.',
    link: '#',
  },
  {
    id: 3,
    image: 'https://image.tmdb.org/t/p/w500/4qPz6GhNATPlFz7z0t7m4f4U1Yu.jpg',
    title: 'Exclusive: Deadpool & Wolverine Set Photos',
    summary: 'Get a sneak peek at the set of the much-awaited Deadpool & Wolverine movie, with exclusive interviews from the cast.',
    link: '#',
  },
];

const NewsSection = () => (
  <section className="mt-20 px-6 md:px-16 lg:px-36 xl:px-44">
    <h2 className="text-2xl font-bold mb-6 text-white">Movie News & Articles</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
      {news.map(item => (
        <a key={item.id} href={item.link} className="bg-gray-900 rounded-2xl shadow-lg border border-gray-800 hover:border-primary transition block overflow-hidden">
          <img src={item.image} alt={item.title} className="h-48 w-full object-cover object-center" />
          <div className="p-5">
            <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
            <p className="text-gray-300 text-sm mb-3">{item.summary}</p>
            <span className="text-primary font-semibold text-xs">Read More →</span>
          </div>
        </a>
      ))}
    </div>
  </section>
);

export default NewsSection;

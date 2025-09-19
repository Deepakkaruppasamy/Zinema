import React from 'react';
import { Instagram, Twitter } from 'lucide-react';

const posts = [
  {
    id: 1,
    platform: 'Instagram',
    user: '@zinema_official',
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=400&q=80',
    text: 'Our new app update is live! Download now for a smoother movie booking experience. 🎬✨',
    link: '#',
  },
  {
    id: 2,
    platform: 'Twitter',
    user: '@zinema_official',
    image: 'https://images.unsplash.com/photo-1517602302552-471fe67acf66?auto=format&fit=crop&w=400&q=80',
    text: 'Don’t miss the exclusive trailer drop for #TheBatman, streaming now on Zinema! 🦇',
    link: '#',
  },
  {
    id: 3,
    platform: 'Instagram',
    user: '@zinema_official',
    image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80',
    text: 'Which superhero are you? Take our quiz and share your result! 💥🦸‍♂️',
    link: '#',
  },
];

const SocialMediaSection = () => (
  <section className="mt-20 px-6 md:px-16 lg:px-36 xl:px-44">
    <h2 className="text-2xl font-bold mb-6 text-white">Social Buzz</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
      {posts.map(post => (
        <a key={post.id} href={post.link} target="_blank" rel="noopener noreferrer" className="bg-gray-900 rounded-2xl shadow-lg border border-gray-800 hover:border-primary transition block overflow-hidden">
          <img src={post.image} alt={post.platform} className="h-48 w-full object-cover object-center" />
          <div className="p-5 flex flex-col gap-2">
            <div className="flex items-center gap-2 mb-1">
              {post.platform === 'Instagram' ? <Instagram className="w-5 h-5 text-pink-500" /> : <Twitter className="w-5 h-5 text-sky-400" />}
              <span className="text-xs text-gray-400 font-semibold">{post.user}</span>
            </div>
            <p className="text-gray-300 text-sm">{post.text}</p>
          </div>
        </a>
      ))}
    </div>
  </section>
);

export default SocialMediaSection;

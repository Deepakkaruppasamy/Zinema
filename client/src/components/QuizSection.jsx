import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';

const quiz = {
  question: 'Which superhero are you most like?',
  options: [
    { label: 'Iron Man', desc: 'Genius, billionaire, playboy, philanthropist.' },
    { label: 'Wonder Woman', desc: 'Strong, compassionate, and a true leader.' },
    { label: 'Spider-Man', desc: 'Witty, responsible, and always helps others.' },
    { label: 'Batman', desc: 'Determined, resourceful, and mysterious.' },
  ],
};

const results = {
  'Iron Man': 'You’re a tech-savvy innovator who loves to lead and inspire! 🦾',
  'Wonder Woman': 'You’re a natural hero, always fighting for justice and kindness! 🦸‍♀️',
  'Spider-Man': 'You have a big heart and always put others first! 🕷️',
  'Batman': 'You’re a strategic thinker, always ready for any challenge! 🦇',
};

const QuizSection = () => {
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const handleSelect = (option) => {
    setSelected(option);
    setTimeout(() => setShowResult(true), 500);
  };

  const handleReset = () => {
    setSelected(null);
    setShowResult(false);
  };

  return (
    <section className="mt-20 px-6 md:px-16 lg:px-36 xl:px-44">
      <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2"><Sparkles className="w-6 h-6 text-primary" /> Movie Personality Quiz</h2>
      <div className="bg-gray-900 rounded-2xl p-8 shadow-xl border border-gray-800 flex flex-col items-center">
        <p className="text-lg text-gray-200 mb-6 font-semibold">{quiz.question}</p>
        <div className="flex flex-wrap gap-6 justify-center">
          {quiz.options.map(opt => (
            <button
              key={opt.label}
              className={`min-w-[180px] px-6 py-4 rounded-xl border-2 text-white text-base font-medium shadow transition-all duration-300 focus:outline-none ${selected === opt.label ? 'bg-primary border-primary scale-105' : 'bg-gray-800 border-gray-700 hover:border-primary hover:bg-primary/10'}`}
              onClick={() => handleSelect(opt.label)}
              disabled={!!selected}
            >
              <span className="block mb-1 text-lg">{opt.label}</span>
              <span className="block text-xs text-gray-300">{opt.desc}</span>
            </button>
          ))}
        </div>
        {showResult && (
          <div className="mt-8 bg-primary/10 border border-primary rounded-xl p-6 text-center animate-fade-in">
            <p className="text-xl font-bold text-primary mb-2">{results[selected]}</p>
            <button onClick={handleReset} className="mt-2 px-5 py-2 bg-primary text-white rounded-full font-semibold hover:bg-primary-dull transition">Try Again</button>
          </div>
        )}
      </div>
    </section>
  );
};

export default QuizSection;

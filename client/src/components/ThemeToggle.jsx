import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      aria-label="Toggle theme"
      title="Toggle theme"
      onClick={toggleTheme}
      className="fixed bottom-6 right-6 z-50 rounded-full p-3 shadow-lg border border-gray-700 bg-gray-900/90 backdrop-blur hover:bg-gray-800 transition-colors"
    >
      {theme === 'dark' ? (
        <Sun className="w-5 h-5 text-yellow-300" />
      ) : (
        <Moon className="w-5 h-5 text-gray-800" />
      )}
    </button>
  );
};

export default ThemeToggle;

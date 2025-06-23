'use client';

import { useState, useEffect } from 'react';

export default function DarkModeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Initialize dark mode
    const stored = localStorage.getItem('darkMode');
    let shouldBeDark = false;

    if (stored !== null) {
      shouldBeDark = stored === 'true';
    } else {
      shouldBeDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    setIsDark(shouldBeDark);

    // Apply to DOM
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const handleToggle = () => {
    const newDarkMode = !isDark;
    setIsDark(newDarkMode);

    // Apply to DOM
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Store preference
    localStorage.setItem('darkMode', newDarkMode.toString());
  };

  if (!mounted) {
    return (
      <button className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
        <div className="w-5 h-5 bg-gray-400 rounded-full"></div>
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200 flex items-center justify-center"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        // Sun icon for light mode
        <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
        </svg>
      ) : (
        // Moon icon for dark mode
        <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" />
        </svg>
      )}
    </button>
  );
}

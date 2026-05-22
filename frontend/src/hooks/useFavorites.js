import { useState, useEffect } from 'react';

export function useFavorites() {
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem('favorites') || '[]'); } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  const isFavorite = (id) => favorites.some(f => f._id === id);

  const toggleFavorite = (text) => {
    setFavorites(prev =>
      prev.some(f => f._id === text._id)
        ? prev.filter(f => f._id !== text._id)
        : [...prev, { _id: text._id, title: text.title, grade: text.grade, quarter: text.quarter }]
    );
  };

  return { favorites, isFavorite, toggleFavorite };
}

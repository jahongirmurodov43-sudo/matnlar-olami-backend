import { useState, useEffect } from 'react';

export function useProgress() {
  const [read, setRead] = useState(() => {
    try { return JSON.parse(localStorage.getItem('readTexts') || '[]'); } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('readTexts', JSON.stringify(read));
  }, [read]);

  const isRead = (id) => read.includes(id);

  const markRead = (id) => {
    setRead(prev => prev.includes(id) ? prev : [...prev, id]);
  };

  return { read, isRead, markRead };
}

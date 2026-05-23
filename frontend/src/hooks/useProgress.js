import { useState, useEffect, useCallback } from 'react';

const API = import.meta.env.VITE_API_BASE_URL;

export function useProgress() {
  const [read, setRead] = useState(() => {
    try { return JSON.parse(localStorage.getItem('readTexts') || '[]'); } catch { return []; }
  });

  // On mount: if user is logged in, fetch server-side progress and merge
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch(`${API}/api/progress`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return;
        const serverIds = data.map(r => r.textId);
        setRead(prev => {
          const merged = Array.from(new Set([...prev, ...serverIds]));
          localStorage.setItem('readTexts', JSON.stringify(merged));
          return merged;
        });
      })
      .catch(() => {});
  }, []);

  // Persist to localStorage on every change
  useEffect(() => {
    localStorage.setItem('readTexts', JSON.stringify(read));
  }, [read]);

  const isRead = useCallback((id) => read.includes(String(id)), [read]);

  const markRead = useCallback((id) => {
    setRead(prev => {
      if (prev.includes(String(id))) return prev;
      return [...prev, String(id)];
    });
    // Also persist to server if logged in
    const token = localStorage.getItem('token');
    if (token && id) {
      fetch(`${API}/api/progress/${id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {}); // silent fail — localStorage is the source of truth
    }
  }, []);

  return { read, isRead, markRead };
}

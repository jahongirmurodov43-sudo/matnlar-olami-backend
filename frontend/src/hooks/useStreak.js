import { useState, useEffect } from 'react';

export function useStreak() {
  const [streak, setStreak] = useState(0);
  const [todayRead, setTodayRead] = useState(false);

  useEffect(() => {
    const data = getStreakData();
    setStreak(data.streak);
    setTodayRead(isToday(data.lastReadDate));
  }, []);

  const markStreakRead = () => {
    const data = getStreakData();
    const today = todayStr();

    if (data.lastReadDate === today) return; // already marked today

    const yesterday = yesterdayStr();
    const newStreak = data.lastReadDate === yesterday ? data.streak + 1 : 1;

    const updated = { streak: newStreak, lastReadDate: today, best: Math.max(newStreak, data.best || 0) };
    localStorage.setItem('streak', JSON.stringify(updated));
    setStreak(newStreak);
    setTodayRead(true);
  };

  return { streak, todayRead, markStreakRead };
}

function getStreakData() {
  try { return JSON.parse(localStorage.getItem('streak') || '{}'); } catch { return {}; }
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayStr() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

function isToday(dateStr) {
  return dateStr === todayStr();
}

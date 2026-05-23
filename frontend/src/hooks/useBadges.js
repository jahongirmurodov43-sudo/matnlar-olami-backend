import { useMemo } from 'react';

export const BADGES = [
  { id: 'first_read',   icon: '📖', label: 'Birinchi qadam',   desc: 'Birinchi matnni o\'qidingiz',        condition: (r) => r.length >= 1 },
  { id: 'read_5',       icon: '⭐', label: 'Faol o\'quvchi',   desc: '5 ta matn o\'qidingiz',              condition: (r) => r.length >= 5 },
  { id: 'read_10',      icon: '🌟', label: 'Kitobxon',         desc: '10 ta matn o\'qidingiz',             condition: (r) => r.length >= 10 },
  { id: 'read_25',      icon: '🏆', label: 'Matn ustasi',      desc: '25 ta matn o\'qidingiz',             condition: (r) => r.length >= 25 },
  { id: 'streak_3',     icon: '🔥', label: '3 kunlik olov',    desc: '3 kun ketma-ket o\'qidingiz',        condition: (r, s) => s >= 3 },
  { id: 'streak_7',     icon: '💫', label: 'Haftalik qahramon', desc: '7 kun ketma-ket o\'qidingiz',       condition: (r, s) => s >= 7 },
  { id: 'streak_30',    icon: '🚀', label: 'Oylik rekord',     desc: '30 kun ketma-ket o\'qidingiz',       condition: (r, s) => s >= 30 },
  { id: 'favorites_3',  icon: '❤️', label: 'Sevimli to\'plovchi', desc: '3 ta matnni sevimliga qo\'shdingiz', condition: (r, s, f) => f >= 3 },
  { id: 'all_grade1',   icon: '1️⃣', label: '1-sinf bajardi',   desc: '1-sinfning barcha matnlari o\'qildi', condition: (r, s, f, counts) => counts[1] > 0 && r.filter(id => id.startsWith('1')).length >= counts[1] },
];

export function useBadges(readIds = [], streak = 0, favCount = 0, gradeCounts = {}) {
  const earned = useMemo(() =>
    BADGES.filter(b => b.condition(readIds, streak, favCount, gradeCounts)),
    [readIds, streak, favCount]
  );
  return { earned, all: BADGES };
}

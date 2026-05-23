import { Link } from 'react-router-dom';
import { useProgress } from '../hooks/useProgress';
import { useFavorites } from '../hooks/useFavorites';
import { useStreak } from '../hooks/useStreak';
import { useBadges } from '../hooks/useBadges';
import BackButton from '../components/BackButton';

function Badges() {
  const { read } = useProgress();
  const { favorites } = useFavorites();
  const { streak } = useStreak();
  const { earned, all } = useBadges(read, streak, favorites.length);

  return (
    <div style={{ minHeight: '100vh', padding: '2rem 1.5rem' }}>
      <div className="container" style={{ maxWidth: '680px' }}>

        <nav style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--ink-muted)', marginBottom: '1.5rem' }}>
          <Link to="/" style={{ color: 'var(--ink-muted)', textDecoration: 'none' }}>Bosh sahifa</Link>
          <span style={{ margin: '0 0.5rem' }}>/</span>
          <span>Yutuqlar</span>
        </nav>

        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', marginBottom: '0.5rem' }}>Yutuqlar</h1>
        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--ink-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
          {earned.length} / {all.length} ta yutuq qo'lga kiritildi
        </p>

        {/* Progress bar */}
        <div style={{ height: '8px', background: 'var(--border)', borderRadius: '4px', marginBottom: '2.5rem', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${(earned.length / all.length) * 100}%`, background: 'var(--forest)', borderRadius: '4px', transition: 'width 0.5s' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
          {all.map(badge => {
            const isEarned = earned.some(e => e.id === badge.id);
            return (
              <div key={badge.id} style={{ background: isEarned ? 'var(--paper-light)' : 'var(--paper-dark)', border: `1px solid ${isEarned ? 'var(--forest)' : 'var(--border-soft)'}`, borderRadius: '12px', padding: '1.25rem', textAlign: 'center', opacity: isEarned ? 1 : 0.5, transition: 'all 0.2s' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem', filter: isEarned ? 'none' : 'grayscale(1)' }}>
                  {badge.icon}
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', color: isEarned ? 'var(--forest-deep)' : 'var(--ink-muted)', marginBottom: '0.3rem', fontWeight: 600 }}>
                  {badge.label}
                </div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--ink-muted)', lineHeight: 1.5 }}>
                  {badge.desc}
                </div>
                {isEarned && (
                  <div style={{ marginTop: '0.5rem', fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: 'var(--forest)', fontWeight: 600 }}>
                    ✓ Qo'lga kiritildi
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <BackButton to="/" label="Bosh sahifaga qaytish" />
      </div>
    </div>
  );
}

export default Badges;

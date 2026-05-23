import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

function Navbar({ user, setUser, darkMode, setDarkMode }) {
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/qidiruv?q=${encodeURIComponent(searchQuery.trim())}`);
    setSearchOpen(false);
    setSearchQuery('');
  };

  return (
    <header style={{
      background: 'rgba(245, 239, 225, 0.92)',
      backdropFilter: 'blur(8px)',
      borderBottom: '1px solid var(--border-soft)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px' }}>
        <Link to="/" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.25rem', color: 'var(--forest-deep)', textDecoration: 'none' }}>
          📖 Matnlar Olami
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          {user && (
            searchOpen ? (
              <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.4rem' }}>
                <input
                  autoFocus
                  type="text"
                  placeholder="Qidirish..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onBlur={() => { if (!searchQuery) setSearchOpen(false); }}
                  style={{ fontFamily: 'var(--font-body)', padding: '6px 12px', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '0.9rem', background: 'var(--paper-light)', color: 'var(--ink)', width: '180px', outline: 'none' }}
                />
                <button type="submit" style={{ background: 'var(--forest)', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontSize: '0.85rem' }}>↵</button>
                <button type="button" onClick={() => { setSearchOpen(false); setSearchQuery(''); }} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '6px', padding: '6px 10px', cursor: 'pointer', color: 'var(--ink-muted)', fontSize: '0.85rem' }}>✕</button>
              </form>
            ) : (
              <button onClick={() => setSearchOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-soft)', fontSize: '1.1rem', padding: '4px', display: 'flex', alignItems: 'center' }} title="Qidirish">
                🔍
              </button>
            )
          )}

          {user && (
            <Link to="/sevimlilar" style={{ fontFamily: 'var(--font-body)', color: 'var(--ink)', textDecoration: 'none', fontSize: '0.95rem' }} title="Sevimlilar">
              ♥
            </Link>
          )}

          <button onClick={() => setDarkMode(d => !d)} title={darkMode ? 'Kunduzgi rejim' : 'Tungi rejim'} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', padding: '4px', color: 'var(--ink-soft)', display: 'flex', alignItems: 'center' }}>
            {darkMode ? '☀️' : '🌙'}
          </button>

          <Link to="/sozlamalar" style={{ fontFamily: 'var(--font-body)', color: 'var(--ink)', textDecoration: 'none', fontSize: '0.95rem' }}>
            Sozlamalar
          </Link>

          {user && (
            <Link to="/sinflar" style={{ fontFamily: 'var(--font-body)', color: 'var(--ink)', textDecoration: 'none', fontSize: '0.95rem' }} title="Sinflar">
              🏫
            </Link>
          )}
          {user && (
            <Link to="/topshiriqlar" style={{ fontFamily: 'var(--font-body)', color: 'var(--ink)', textDecoration: 'none', fontSize: '0.95rem' }} title="Topshiriqlar">
              📚
            </Link>
          )}
          {user?.role === 'admin' && (
            <Link to="/admin" style={{ fontFamily: 'var(--font-body)', color: 'var(--ink)', textDecoration: 'none', fontSize: '0.95rem' }}>
              Admin
            </Link>
          )}

{user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link to="/profil" style={{ fontFamily: 'var(--font-body)', color: 'var(--ink-soft)', fontSize: '0.9rem', textDecoration: 'none' }}>
                👤 {user.name}
              </Link>
              <button
                onClick={() => setUser(null)}
                style={{ fontFamily: 'var(--font-body)', background: 'none', border: '1px solid var(--border)', borderRadius: '6px', padding: '5px 12px', fontSize: '0.82rem', color: 'var(--ink-muted)', cursor: 'pointer' }}
              >
                Chiqish
              </button>
            </div>
          ) : (
            <Link to="/login" style={{
              fontFamily: 'var(--font-body)',
              background: 'var(--forest)',
              color: 'white',
              padding: '8px 20px',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: 500,
            }}>
              Kirish
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;

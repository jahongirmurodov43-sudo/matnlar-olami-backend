import { Link } from 'react-router-dom';

function Navbar({ user, setUser }) {
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
          <Link to="/sozlamalar" style={{ fontFamily: 'var(--font-body)', color: 'var(--ink)', textDecoration: 'none', fontSize: '0.95rem' }}>
            Sozlamalar
          </Link>

          {user?.role === 'admin' && (
            <Link to="/admin" style={{ fontFamily: 'var(--font-body)', color: 'var(--ink)', textDecoration: 'none', fontSize: '0.95rem' }}>
              Admin
            </Link>
          )}

{user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontFamily: 'var(--font-body)', color: 'var(--ink-soft)', fontSize: '0.9rem' }}>
                👤 {user.name}
              </span>
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

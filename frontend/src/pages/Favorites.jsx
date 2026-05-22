import { Link } from 'react-router-dom';
import { useFavorites } from '../hooks/useFavorites';

function Favorites() {
  const { favorites, toggleFavorite } = useFavorites();

  return (
    <div style={{ minHeight: '100vh', padding: '2rem 1.5rem' }}>
      <div className="container" style={{ maxWidth: '720px' }}>

        <nav style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--ink-muted)', marginBottom: '1.5rem' }}>
          <Link to="/" style={{ color: 'var(--ink-muted)', textDecoration: 'none' }}>Bosh sahifa</Link>
          <span style={{ margin: '0 0.5rem' }}>/</span>
          <span>Sevimlilar</span>
        </nav>

        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', marginBottom: '0.5rem' }}>Sevimlilar</h1>
        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--ink-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
          {favorites.length > 0 ? `${favorites.length} ta saqlangan matn` : ''}
        </p>

        {favorites.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔖</div>
            <p style={{ fontFamily: 'var(--font-body)', color: 'var(--ink-muted)', fontStyle: 'italic' }}>
              Hali sevimli matnlar yo'q.<br />Matn o'qiyotganda ♥ tugmasini bosing.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {favorites.map(text => (
              <div
                key={text._id}
                style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--paper-light)', border: '1px solid var(--border-soft)', borderRadius: '10px', padding: '1rem 1.5rem' }}
              >
                <Link
                  to={`/sinf/${text.grade}/chorak/${text.quarter}/matn/${text._id}`}
                  style={{ flex: 1, textDecoration: 'none' }}
                >
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', color: 'var(--forest-deep)', marginBottom: '0.3rem' }}>
                    {text.title}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', background: 'var(--paper-dark)', color: 'var(--ink-muted)', padding: '2px 10px', borderRadius: '20px' }}>
                      {text.grade}-sinf
                    </span>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', background: 'var(--paper-dark)', color: 'var(--ink-muted)', padding: '2px 10px', borderRadius: '20px' }}>
                      {text.quarter}-chorak
                    </span>
                  </div>
                </Link>
                <button
                  onClick={() => toggleFavorite(text)}
                  title="Sevimlilardan olib tashlash"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#c0392b', padding: '4px' }}
                >
                  ♥
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Favorites;

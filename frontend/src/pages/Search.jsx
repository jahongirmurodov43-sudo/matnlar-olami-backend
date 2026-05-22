import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';

function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(!!initialQuery);
  const inputRef = useRef(null);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!initialQuery) return;
    doSearch(initialQuery);
  }, []);

  const doSearch = async (q) => {
    if (!q.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/texts?search=${encodeURIComponent(q)}`);
      setResults(res.data);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSearchParams(query ? { q: query } : {});
    doSearch(query);
  };

  return (
    <div style={{ minHeight: '100vh', padding: '2rem 1.5rem' }}>
      <div className="container" style={{ maxWidth: '720px' }}>

        <nav style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--ink-muted)', marginBottom: '1.5rem' }}>
          <Link to="/" style={{ color: 'var(--ink-muted)', textDecoration: 'none' }}>Bosh sahifa</Link>
          <span style={{ margin: '0 0.5rem' }}>/</span>
          <span>Qidiruv</span>
        </nav>

        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', marginBottom: '1.5rem' }}>Qidiruv</h1>

        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem' }}>
          <input
            ref={inputRef}
            type="text"
            placeholder="Matn sarlavhasi yoki mazmuni..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{
              flex: 1,
              fontFamily: 'var(--font-body)',
              padding: '12px 16px',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              fontSize: '1rem',
              background: 'var(--paper-light)',
              color: 'var(--ink)',
              outline: 'none',
            }}
          />
          <button
            type="submit"
            style={{
              fontFamily: 'var(--font-body)',
              background: 'var(--forest)',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.95rem',
              fontWeight: 500,
            }}
          >
            Qidirish
          </button>
        </form>

        {loading && (
          <p style={{ fontFamily: 'var(--font-body)', color: 'var(--ink-muted)', textAlign: 'center', padding: '2rem 0' }}>
            Qidirilmoqda...
          </p>
        )}

        {!loading && searched && (
          <>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--ink-muted)', marginBottom: '1.25rem' }}>
              {results.length > 0
                ? `${results.length} ta natija topildi`
                : `"${query}" bo'yicha hech narsa topilmadi`}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {results.map(text => (
                <Link
                  key={text._id}
                  to={`/sinf/${text.grade}/chorak/${text.quarter}/matn/${text._id}`}
                  style={{ textDecoration: 'none' }}
                >
                  <div
                    style={{
                      background: 'var(--paper-light)',
                      border: '1px solid var(--border-soft)',
                      borderRadius: '10px',
                      padding: '1rem 1.5rem',
                      transition: 'transform 0.15s, box-shadow 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(4px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(42,38,32,0.1)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
                  >
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', color: 'var(--forest-deep)', marginBottom: '0.4rem' }}>
                      {text.title}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', background: 'var(--paper-dark)', color: 'var(--ink-muted)', padding: '2px 10px', borderRadius: '20px' }}>
                        {text.grade}-sinf
                      </span>
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', background: 'var(--paper-dark)', color: 'var(--ink-muted)', padding: '2px 10px', borderRadius: '20px' }}>
                        {text.quarter}-chorak
                      </span>
                      {text.questions?.length > 0 && (
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', background: 'var(--paper-dark)', color: 'var(--ink-muted)', padding: '2px 10px', borderRadius: '20px' }}>
                          {text.questions.length} ta savol
                        </span>
                      )}
                    </div>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--ink-muted)', margin: 0, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {text.content}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Search;

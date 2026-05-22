import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const QUARTERS = [
  { id: 1, label: 'I-chorak' },
  { id: 2, label: 'II-chorak' },
  { id: 3, label: 'III-chorak' },
  { id: 4, label: 'IV-chorak' },
];

function GradePage({ user }) {
  const lang = 'uz';
  const { grade } = useParams();
  const navigate = useNavigate();
  const [texts, setTexts] = useState([]);
  const [activeQuarter, setActiveQuarter] = useState(1);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/texts?grade=${grade}&language=${lang}`)
      .then(res => setTexts(res.data))
      .catch(err => console.error(err));
  }, [grade, lang, API_BASE_URL]);

  const filtered = texts.filter(t => t.quarter === activeQuarter);

  return (
    <div style={{ minHeight: '100vh', padding: '2rem 1.5rem' }}>
      <div className="container">

        {/* Breadcrumb */}
        <nav style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--ink-muted)', marginBottom: '1.5rem' }}>
          <Link to="/" style={{ color: 'var(--ink-muted)', textDecoration: 'none' }}>Bosh sahifa</Link>
          <span style={{ margin: '0 0.5rem' }}>/</span>
          <span>{grade}-sinf</span>
        </nav>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', marginBottom: '0.25rem' }}>
              {grade}-sinf
            </h1>
            <p style={{ fontFamily: 'var(--font-body)', color: 'var(--ink-muted)', fontSize: '0.9rem' }}>
              Choraklar bo'yicha matnlar ro'yxati
            </p>
          </div>
          {user?.role === 'admin' && (
            <Link to="/admin" style={{
              fontFamily: 'var(--font-body)',
              background: 'var(--forest)',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: 500,
            }}>
              + Yangi matn qo'shish
            </Link>
          )}
        </div>

        {/* Quarter tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '2px solid var(--border)', paddingBottom: '0' }}>
          {QUARTERS.map(q => (
            <button
              key={q.id}
              onClick={() => setActiveQuarter(q.id)}
              style={{
                fontFamily: 'var(--font-body)',
                background: 'none',
                border: 'none',
                padding: '10px 20px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                color: activeQuarter === q.id ? 'var(--forest-deep)' : 'var(--ink-muted)',
                fontWeight: activeQuarter === q.id ? 600 : 400,
                borderBottom: activeQuarter === q.id ? '2px solid var(--forest-deep)' : '2px solid transparent',
                marginBottom: '-2px',
                transition: 'color 0.2s',
              }}
            >
              {q.label}
              <span style={{ marginLeft: '6px', fontSize: '0.75rem', color: 'var(--ink-muted)' }}>
                {texts.filter(t => t.quarter === q.id).length}
              </span>
            </button>
          ))}
        </div>

        {/* Text list */}
        {filtered.length === 0 ? (
          <p style={{ fontFamily: 'var(--font-body)', color: 'var(--ink-muted)', textAlign: 'center', padding: '3rem 0', fontStyle: 'italic' }}>
            Bu chorakda hali matn yo'q
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filtered.map((text, index) => (
              <Link
                key={text._id}
                to={`/sinf/${grade}/chorak/${activeQuarter}/matn/${text._id}`}
                style={{ textDecoration: 'none' }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.25rem',
                  background: 'var(--paper-light)',
                  border: '1px solid var(--border-soft)',
                  borderRadius: '10px',
                  padding: '1rem 1.5rem',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(4px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(42,38,32,0.1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
                >
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: 'var(--ink-muted)', minWidth: '2rem', textAlign: 'center' }}>
                    {index + 1}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', color: 'var(--forest-deep)', marginBottom: '0.2rem' }}>
                      {text.title}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', background: 'var(--paper-dark)', color: 'var(--ink-muted)', padding: '2px 10px', borderRadius: '20px' }}>
                        {activeQuarter}-chorak
                      </span>
                      {text.questions?.length > 0 && (
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', background: 'var(--paper-dark)', color: 'var(--ink-muted)', padding: '2px 10px', borderRadius: '20px' }}>
                          {text.questions.length} ta savol
                        </span>
                      )}
                    </div>
                  </div>
                  <span style={{ color: 'var(--ink-muted)', fontSize: '1.2rem' }}>→</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Back */}
        <div style={{ marginTop: '3rem' }}>
          <button
            onClick={() => navigate('/')}
            style={{ fontFamily: 'var(--font-body)', background: 'none', border: '1px solid var(--border)', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', color: 'var(--ink-soft)', fontSize: '0.9rem' }}
          >
            ← Bosh sahifaga qaytish
          </button>
        </div>
      </div>
    </div>
  );
}

export default GradePage;

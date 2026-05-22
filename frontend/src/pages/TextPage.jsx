import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Play, Pause, Printer, ArrowLeft } from 'lucide-react';
import axios from 'axios';

function TextPage({ user, lang }) {
  const { grade, quarter, id } = useParams();
  const navigate = useNavigate();
  const [text, setText] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/texts/${id}`)
      .then(res => { setText(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id, API_BASE_URL]);

  const speak = () => {
    if (!window.speechSynthesis) return;
    if (isPlaying) {
      speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text.content);
    utterance.lang = lang === 'uz' ? 'uz-UZ' : 'ru-RU';
    utterance.onerror = () => setIsPlaying(false);
    utterance.onend = () => setIsPlaying(false);
    speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  const handleDelete = async () => {
    if (!confirm('Matnni o\'chirishni tasdiqlaysizmi?')) return;
    const token = localStorage.getItem('token');
    await axios.delete(`${API_BASE_URL}/api/texts/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    navigate(`/sinf/${grade}`);
  };

  const handlePrint = () => window.print();

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '5rem', fontFamily: 'var(--font-body)', color: 'var(--ink-muted)' }}>
      Yuklanmoqda...
    </div>
  );

  if (!text) return (
    <div style={{ textAlign: 'center', padding: '5rem', fontFamily: 'var(--font-body)', color: 'var(--ink-muted)' }}>
      Matn topilmadi.
    </div>
  );

  // Split paragraphs
  const paragraphs = text.content.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);

  return (
    <div style={{ minHeight: '100vh', padding: '2rem 1.5rem' }}>
      <div className="container" style={{ maxWidth: '720px' }}>

        {/* Breadcrumb */}
        <nav style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--ink-muted)', marginBottom: '1.5rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          <Link to="/" style={{ color: 'var(--ink-muted)', textDecoration: 'none' }}>Bosh sahifa</Link>
          <span>/</span>
          <Link to={`/sinf/${grade}`} style={{ color: 'var(--ink-muted)', textDecoration: 'none' }}>{grade}-sinf</Link>
          <span>/</span>
          <span>{quarter}-chorak</span>
          <span>/</span>
          <span>{text.title}</span>
        </nav>

        {/* Action bar */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
          <button onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-body)', background: 'none', border: '1px solid var(--border)', padding: '8px 16px', borderRadius: '7px', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--ink-soft)' }}>
            <Printer size={15} /> Chop etish
          </button>
          {user?.role === 'admin' && (
            <>
              <Link to={`/admin?edit=${id}`} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-body)', background: 'none', border: '1px solid var(--border)', padding: '8px 16px', borderRadius: '7px', textDecoration: 'none', fontSize: '0.85rem', color: 'var(--ink-soft)' }}>
                ✎ Tahrirlash
              </Link>
              <button onClick={handleDelete} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-body)', background: 'none', border: '1px solid #e8b4b4', padding: '8px 16px', borderRadius: '7px', cursor: 'pointer', fontSize: '0.85rem', color: '#c0392b' }}>
                ✕ O'chirish
              </button>
            </>
          )}
        </div>

        {/* Grade badge */}
        <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--ink-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            {grade}-sinf ◆ {quarter}-chorak
          </span>
        </div>

        {/* Title */}
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 5vw, 2.8rem)', textAlign: 'center', marginBottom: '1.5rem', lineHeight: 1.2 }}>
          {text.title}
        </h1>

        {/* Audio button */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <button
            onClick={speak}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: isPlaying ? 'var(--forest-deep)' : 'var(--forest)', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '50px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.9rem', fontWeight: 500 }}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            {isPlaying ? 'To\'xtatish' : 'Tinglash'}
          </button>
        </div>

        {/* Divider */}
        <div style={{ width: '40px', height: '2px', background: 'var(--forest)', margin: '0 auto 2.5rem' }} />

        {/* Content with drop cap on first paragraph */}
        <div style={{ fontFamily: 'var(--font-body)', fontSize: '1.08rem', lineHeight: 1.9, color: 'var(--ink)' }}>
          {paragraphs.map((para, i) => (
            <p key={i} style={{ marginBottom: '1.25rem', textIndent: i === 0 ? '0' : '1.5em' }}>
              {i === 0 ? (
                <>
                  <span style={{
                    float: 'left',
                    fontFamily: 'var(--font-display)',
                    fontSize: '4rem',
                    lineHeight: '0.8',
                    marginRight: '0.1em',
                    marginTop: '0.1em',
                    color: 'var(--forest-deep)',
                    fontWeight: 700,
                  }}>
                    {para[0]}
                  </span>
                  {para.slice(1)}
                </>
              ) : para}
            </p>
          ))}
        </div>

        {/* Questions */}
        {text.questions?.length > 0 && (
          <div style={{ marginTop: '3rem', padding: '2rem', background: 'var(--paper-light)', border: '1px solid var(--border)', borderRadius: '12px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', marginBottom: '1.25rem', color: 'var(--forest-deep)' }}>
              Namunaviy savollar
            </h2>
            <ol style={{ fontFamily: 'var(--font-body)', paddingLeft: '0', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {text.questions.map((q, i) => (
                <li key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <span style={{ background: 'var(--forest)', color: 'white', borderRadius: '50%', width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 600, flexShrink: 0, marginTop: '2px' }}>
                    {i + 1}
                  </span>
                  <span style={{ lineHeight: 1.7 }}>{q.question}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Back */}
        <div style={{ marginTop: '3rem' }}>
          <button
            onClick={() => { speechSynthesis.cancel(); navigate(`/sinf/${grade}`); }}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-body)', background: 'none', border: '1px solid var(--border)', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', color: 'var(--ink-soft)', fontSize: '0.9rem' }}
          >
            <ArrowLeft size={15} /> {grade}-sinf sahifasiga qaytish
          </button>
        </div>
      </div>
    </div>
  );
}

export default TextPage;

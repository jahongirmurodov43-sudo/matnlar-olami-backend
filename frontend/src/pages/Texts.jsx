import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Play, Pause } from 'lucide-react';

function Texts({ user, lang }) {
  const [texts, setTexts] = useState([]);
  const [selectedText, setSelectedText] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchParams] = useSearchParams();
  const gradeFilter = searchParams.get('grade');

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const params = new URLSearchParams({ language: lang });
    if (gradeFilter) params.set('grade', gradeFilter);
    axios
      .get(`${API_BASE_URL}/api/texts?${params}`)
      .then(res => setTexts(res.data))
      .catch(err => console.error(err));
  }, [lang, gradeFilter, API_BASE_URL]);

  const speak = (text) => {
    if (!window.speechSynthesis) {
      alert('Bu brauzer audio tinglashni qo\'llab-quvvatlamaydi.');
      return;
    }
    if (isPlaying) {
      speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'uz' ? 'uz-UZ' : 'ru-RU';
    utterance.onerror = () => setIsPlaying(false);
    utterance.onend = () => setIsPlaying(false);
    speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  return (
    <div style={{ minHeight: '100vh', padding: '3rem 1.5rem' }}>
      <div className="container">
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5vw, 3rem)', textAlign: 'center', marginBottom: '0.5rem' }}>
          {lang === 'uz' ? 'Matnlar Olami' : 'Мир Текстов'}
        </h1>
        {gradeFilter && (
          <p style={{ textAlign: 'center', fontFamily: 'var(--font-body)', color: 'var(--ink-muted)', marginBottom: '2.5rem' }}>
            {gradeFilter}-sinf matnlari
          </p>
        )}

        {texts.length === 0 ? (
          <p style={{ textAlign: 'center', fontFamily: 'var(--font-body)', color: 'var(--ink-muted)', marginTop: '3rem' }}>
            Matnlar topilmadi.
          </p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
            {texts.map(text => (
              <div key={text._id} className="card" style={{ transition: 'transform 0.2s, box-shadow 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(42,38,32,0.13)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
              >
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', marginBottom: '0.4rem' }}>{text.title}</h3>
                <p style={{ fontFamily: 'var(--font-body)', color: 'var(--ink-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                  {text.grade}-sinf • {text.quarter}-chorak
                </p>
                <button
                  onClick={() => setSelectedText(text)}
                  className="btn btn-primary"
                  style={{ fontSize: '0.9rem' }}
                >
                  O'qish
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedText && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(31,62,35,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }}>
          <div style={{ background: 'var(--paper-light)', borderRadius: '16px', width: '100%', maxWidth: '720px', maxHeight: '90vh', overflowY: 'auto', padding: '2.5rem', position: 'relative' }}>
            <button
              onClick={() => { speechSynthesis.cancel(); setIsPlaying(false); setSelectedText(null); }}
              style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--ink-muted)' }}
            >×</button>

            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', marginBottom: '1.5rem', paddingRight: '2rem' }}>
              {selectedText.title}
            </h2>

            <button
              onClick={() => speak(selectedText.content)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--forest)', color: 'white', border: 'none', padding: '10px 22px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.9rem', marginBottom: '1.75rem' }}
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />} Audio tinglash
            </button>

            <div style={{ fontFamily: 'var(--font-body)', fontSize: '1.05rem', lineHeight: 1.9, color: 'var(--ink)', whiteSpace: 'pre-line' }}>
              {selectedText.content}
            </div>

            {selectedText.questions?.length > 0 && (
              <>
                <h3 style={{ fontFamily: 'var(--font-display)', marginTop: '2.5rem', marginBottom: '1rem', fontSize: '1.2rem' }}>Savollar:</h3>
                <ul style={{ fontFamily: 'var(--font-body)', paddingLeft: '1.5rem', lineHeight: 2 }}>
                  {selectedText.questions.map((q, i) => (
                    <li key={i}>{q.question}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Texts;

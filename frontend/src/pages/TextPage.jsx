import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Play, Pause, Printer, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { useFavorites } from '../hooks/useFavorites';
import { useProgress } from '../hooks/useProgress';
import { useStreak } from '../hooks/useStreak';
import { useNotes } from '../hooks/useNotes';

function TextPage({ user }) {
  const lang = 'uz';
  const { grade, quarter, id } = useParams();
  const navigate = useNavigate();
  const [text, setText] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isRead, markRead } = useProgress();
  const { markStreakRead } = useStreak();
  const { getNote, saveNote } = useNotes();
  const [answers, setAnswers] = useState({});
  const [checked, setChecked] = useState({});
  const [fontSize, setFontSize] = useState(1.08);
  const [noteText, setNoteText] = useState('');
  const [noteSaved, setNoteSaved] = useState(false);
  const [readingMode, setReadingMode] = useState(false);
  const [readingTheme, setReadingTheme] = useState('light'); // light | sepia | dark
  const [readingFontSize, setReadingFontSize] = useState(1.15);
  const [scrollPct, setScrollPct] = useState(0);

  // Scroll progress for reading mode
  useEffect(() => {
    if (!readingMode) return;
    const el = document.getElementById('reading-scroll');
    if (!el) return;
    const onScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      setScrollPct(scrollHeight <= clientHeight ? 100 : Math.round((scrollTop / (scrollHeight - clientHeight)) * 100));
    };
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, [readingMode]);

  // Close reading mode on Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setReadingMode(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const themes = {
    light: { bg: '#fafaf7', text: '#2a2620', toolbar: '#fff', border: '#e8e0d0' },
    sepia: { bg: '#f4ede0', text: '#3d2b1f', toolbar: '#ede4d4', border: '#d5c4a8' },
    dark:  { bg: '#1a1a1a', text: '#e0d9cc', toolbar: '#242424', border: '#333' },
  };
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/texts/${id}`)
      .then(res => { setText(res.data); setLoading(false); markRead(id); markStreakRead(); setNoteText(getNote(id)); })
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

  const startEditing = () => {
    setEditForm({
      title: text.title,
      content: text.content,
      grade: text.grade,
      quarter: text.quarter,
      audioUrl: text.audioUrl || '',
      questions: text.questions?.length > 0 ? text.questions : [{ question: '', answer: '' }],
    });
    setEditing(true);
  };

  const handleAudioFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      alert('Fayl hajmi 8 MB dan oshmasligi kerak. Kattaroq faylni Google Drive yoki boshqa xostingga yuklang va URL ni joylashtiring.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setEditForm(f => ({ ...f, audioUrl: ev.target.result }));
    reader.readAsDataURL(file);
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const token = localStorage.getItem('token');
    try {
      const res = await axios.put(`${API_BASE_URL}/api/texts/${id}`, editForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setText(res.data);
      setEditing(false);
    } catch (err) {
      alert('Xatolik: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  const updateQuestion = (index, field, value) => {
    const updated = editForm.questions.map((q, i) => i === index ? { ...q, [field]: value } : q);
    setEditForm({ ...editForm, questions: updated });
  };

  const addQuestion = () => setEditForm({ ...editForm, questions: [...editForm.questions, { question: '', answer: '' }] });

  const removeQuestion = (index) => setEditForm({ ...editForm, questions: editForm.questions.filter((_, i) => i !== index) });

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

  if (editing && editForm) return (
    <div style={{ minHeight: '100vh', padding: '2rem 1.5rem' }}>
      <div className="container" style={{ maxWidth: '720px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: '2rem' }}>Matnni tahrirlash</h1>
        <form onSubmit={handleEditSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input
            type="text"
            placeholder="Sarlavha"
            value={editForm.title}
            onChange={e => setEditForm({ ...editForm, title: e.target.value })}
            required
            style={{ fontFamily: 'var(--font-body)', padding: '12px 16px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '1rem', background: 'var(--paper-light)' }}
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <select
              value={editForm.grade}
              onChange={e => setEditForm({ ...editForm, grade: Number(e.target.value) })}
              style={{ fontFamily: 'var(--font-body)', padding: '12px 16px', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--paper-light)' }}
            >
              {[1,2,3,4].map(g => <option key={g} value={g}>{g}-sinf</option>)}
            </select>
            <select
              value={editForm.quarter}
              onChange={e => setEditForm({ ...editForm, quarter: Number(e.target.value) })}
              style={{ fontFamily: 'var(--font-body)', padding: '12px 16px', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--paper-light)' }}
            >
              {[1,2,3,4].map(q => <option key={q} value={q}>{q}-chorak</option>)}
            </select>
          </div>
          <textarea
            placeholder="Matn mazmuni..."
            value={editForm.content}
            onChange={e => setEditForm({ ...editForm, content: e.target.value })}
            required
            rows={10}
            style={{ fontFamily: 'var(--font-body)', padding: '12px 16px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '1rem', lineHeight: 1.7, background: 'var(--paper-light)', resize: 'vertical' }}
          />

          {/* Audio section */}
          <div style={{ border: '1px solid var(--border)', borderRadius: '10px', padding: '1.25rem', background: 'var(--paper-light)' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🔊 Audio fayl
            </h3>

            {/* Current audio preview */}
            {editForm.audioUrl && (
              <div style={{ marginBottom: '1rem' }}>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--ink-muted)', marginBottom: '0.5rem' }}>Hozirgi audio:</p>
                <audio controls src={editForm.audioUrl} style={{ width: '100%', borderRadius: '6px' }} />
                <button
                  type="button"
                  onClick={() => setEditForm(f => ({ ...f, audioUrl: '' }))}
                  style={{ marginTop: '0.5rem', fontFamily: 'var(--font-body)', background: 'none', border: '1px solid #e8b4b4', color: '#c0392b', padding: '5px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}
                >✕ Audioni o'chirish</button>
              </div>
            )}

            {/* Upload file */}
            <div style={{ marginBottom: '0.75rem' }}>
              <label style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--ink-soft)', display: 'block', marginBottom: '0.4rem', fontWeight: 500 }}>
                📁 Fayl yuklash (MP3, WAV — max 8 MB)
              </label>
              <input
                type="file"
                accept="audio/*"
                onChange={handleAudioFile}
                style={{ fontFamily: 'var(--font-body)', fontSize: '0.88rem', width: '100%', padding: '8px', border: '1px solid var(--border)', borderRadius: '7px', background: 'white', cursor: 'pointer', boxSizing: 'border-box' }}
              />
            </div>

            {/* Or paste URL */}
            <div>
              <label style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--ink-soft)', display: 'block', marginBottom: '0.4rem', fontWeight: 500 }}>
                🔗 Yoki URL joylashtiring (Google Drive, Dropbox…)
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={editForm.audioUrl?.startsWith('data:') ? '' : (editForm.audioUrl || '')}
                onChange={e => setEditForm(f => ({ ...f, audioUrl: e.target.value }))}
                style={{ fontFamily: 'var(--font-body)', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: '7px', fontSize: '0.9rem', background: 'white', width: '100%', boxSizing: 'border-box', outline: 'none' }}
              />
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--ink-muted)', marginTop: '0.4rem' }}>
                Google Drive: faylni "Hammaga ochiq" qiling → "Ulashish" → to'g'ridan-to'g'ri link oling
              </p>
            </div>
          </div>

          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: '0.25rem' }}>Savollar</h3>
          {editForm.questions.map((q, i) => (
            <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <input
                type="text"
                placeholder={`${i + 1}-savol`}
                value={q.question}
                onChange={e => updateQuestion(i, 'question', e.target.value)}
                style={{ flex: 1, fontFamily: 'var(--font-body)', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--paper-light)' }}
              />
              <button
                type="button"
                onClick={() => removeQuestion(i)}
                style={{ padding: '10px 14px', background: 'none', border: '1px solid #e8b4b4', borderRadius: '8px', cursor: 'pointer', color: '#c0392b', fontSize: '0.9rem' }}
              >✕</button>
            </div>
          ))}
          <button
            type="button"
            onClick={addQuestion}
            style={{ alignSelf: 'flex-start', fontFamily: 'var(--font-body)', background: 'none', border: '1px solid var(--border)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--ink-soft)' }}
          >+ Savol qo'shish</button>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
            <button
              type="submit"
              disabled={saving}
              style={{ flex: 1, fontFamily: 'var(--font-body)', background: 'var(--forest)', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', cursor: saving ? 'not-allowed' : 'pointer', fontSize: '1rem', fontWeight: 500, opacity: saving ? 0.7 : 1 }}
            >{saving ? 'Saqlanmoqda...' : 'Saqlash'}</button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              style={{ fontFamily: 'var(--font-body)', background: 'none', border: '1px solid var(--border)', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem', color: 'var(--ink-soft)' }}
            >Bekor qilish</button>
          </div>
        </form>
      </div>
    </div>
  );

  // Split paragraphs
  const paragraphs = text.content.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);

  // ── Reading Mode ─────────────────────────────────────────────
  if (readingMode) {
    const t = themes[readingTheme];
    const mins = Math.ceil(text.content.split(/\s+/).length / 120);
    return (
      <div
        id="reading-scroll"
        style={{ position: 'fixed', inset: 0, zIndex: 1000, background: t.bg, overflowY: 'auto', transition: 'background 0.3s' }}
      >
        {/* Progress bar */}
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '3px', background: t.border, zIndex: 1001 }}>
          <div style={{ height: '100%', width: `${scrollPct}%`, background: '#2d5a27', transition: 'width 0.1s' }} />
        </div>

        {/* Toolbar */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 1000,
          background: t.toolbar, borderBottom: `1px solid ${t.border}`,
          padding: '10px 20px', display: 'flex', alignItems: 'center',
          gap: '0.75rem', flexWrap: 'wrap', backdropFilter: 'blur(6px)',
        }}>
          {/* Exit */}
          <button onClick={() => setReadingMode(false)} style={{ fontFamily: 'var(--font-body)', background: 'none', border: `1px solid ${t.border}`, color: t.text, padding: '6px 14px', borderRadius: '7px', cursor: 'pointer', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
            ← Chiqish
          </button>

          <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', fontWeight: 600, color: t.text, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {text.title}
          </span>

          <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: t.text, opacity: 0.55 }}>
            ~{mins} daqiqa · {scrollPct}%
          </span>

          {/* Font size */}
          <div style={{ display: 'flex', border: `1px solid ${t.border}`, borderRadius: '7px', overflow: 'hidden' }}>
            {[['A−', -0.1], ['↺', null], ['A+', 0.1]].map(([label, delta]) => (
              <button key={label} onClick={() => setReadingFontSize(s => delta === null ? 1.15 : Math.min(2, Math.max(0.9, s + delta)))}
                style={{ fontFamily: 'var(--font-body)', background: 'none', border: 'none', borderRight: label !== 'A+' ? `1px solid ${t.border}` : 'none', padding: '6px 10px', cursor: 'pointer', fontSize: '0.82rem', color: t.text }}>
                {label}
              </button>
            ))}
          </div>

          {/* Theme switcher */}
          <div style={{ display: 'flex', gap: '5px' }}>
            {[
              { key: 'light', bg: '#fafaf7', label: '☀' },
              { key: 'sepia', bg: '#f4ede0', label: '📜' },
              { key: 'dark',  bg: '#1a1a1a', label: '🌙' },
            ].map(th => (
              <button key={th.key} onClick={() => setReadingTheme(th.key)}
                title={th.key}
                style={{ width: '26px', height: '26px', borderRadius: '50%', border: readingTheme === th.key ? '2px solid #2d5a27' : `1px solid ${t.border}`, background: th.bg, cursor: 'pointer', fontSize: '0.7rem' }}>
                {readingTheme === th.key ? '' : ''}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{ maxWidth: '660px', margin: '0 auto', padding: '3rem 2rem 6rem' }}>
          {/* Meta */}
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: t.text, opacity: 0.45, textAlign: 'center', marginBottom: '0.5rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            {grade}-sinf · {quarter}-chorak
          </p>

          {/* Title */}
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', textAlign: 'center', color: t.text, marginBottom: '1rem', lineHeight: 1.2, fontWeight: 700 }}>
            {text.title}
          </h1>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', margin: '0 auto 2rem' }}>
            <span style={{ fontSize: '0.4rem', color: '#2d5a27' }}>●</span>
            <div style={{ width: '50px', height: '1px', background: '#2d5a27', opacity: 0.5 }} />
            <span style={{ fontSize: '0.4rem', color: '#2d5a27' }}>●</span>
          </div>

          {/* Audio (if any) */}
          {text.audioUrl && (
            <div style={{ marginBottom: '2rem' }}>
              <audio controls src={text.audioUrl} style={{ width: '100%', borderRadius: '8px' }} />
            </div>
          )}

          {/* Paragraphs */}
          <div style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: `${readingFontSize}rem`, lineHeight: 2, color: t.text, transition: 'font-size 0.2s, color 0.3s' }}>
            {paragraphs.map((para, i) => (
              <p key={i} style={{ marginBottom: '1.4rem', textIndent: i === 0 ? 0 : '2em', textAlign: 'justify' }}>
                {i === 0 ? (
                  <>
                    <span style={{ float: 'left', fontFamily: 'Georgia, serif', fontSize: `${readingFontSize * 3.2}rem`, lineHeight: '0.8', marginRight: '0.1em', marginTop: '0.08em', color: '#2d5a27', fontWeight: 700 }}>
                      {para[0]}
                    </span>
                    {para.slice(1)}
                  </>
                ) : para}
              </p>
            ))}
          </div>

          {/* Done button */}
          <div style={{ textAlign: 'center', marginTop: '3rem', paddingTop: '2rem', borderTop: `1px solid ${t.border}` }}>
            <button onClick={() => setReadingMode(false)}
              style={{ fontFamily: 'var(--font-body)', background: '#2d5a27', color: 'white', border: 'none', padding: '12px 36px', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem', fontWeight: 500 }}>
              ✓ O'qib bo'ldim
            </button>
          </div>
        </div>
      </div>
    );
  }

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
          <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: '7px', overflow: 'hidden' }}>
            <button onClick={() => setFontSize(s => Math.max(0.85, s - 0.1))} style={{ fontFamily: 'var(--font-body)', background: 'none', border: 'none', padding: '8px 12px', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--ink-soft)', borderRight: '1px solid var(--border)' }} title="Kichikroq">A−</button>
            <button onClick={() => setFontSize(1.08)} style={{ fontFamily: 'var(--font-body)', background: 'none', border: 'none', padding: '8px 10px', cursor: 'pointer', fontSize: '0.75rem', color: 'var(--ink-muted)', borderRight: '1px solid var(--border)' }} title="Asl o'lcham">↺</button>
            <button onClick={() => setFontSize(s => Math.min(1.6, s + 0.1))} style={{ fontFamily: 'var(--font-body)', background: 'none', border: 'none', padding: '8px 12px', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--ink-soft)' }} title="Kattalroq">A+</button>
          </div>
          <button
            onClick={() => toggleFavorite(text)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-body)', background: 'none', border: `1px solid ${isFavorite(id) ? '#e8b4b4' : 'var(--border)'}`, padding: '8px 16px', borderRadius: '7px', cursor: 'pointer', fontSize: '0.85rem', color: isFavorite(id) ? '#c0392b' : 'var(--ink-soft)' }}
          >
            {isFavorite(id) ? '♥' : '♡'} {isFavorite(id) ? 'Sevimli' : 'Sevimliga qo\'shish'}
          </button>
          <button
            onClick={() => { setScrollPct(0); setReadingMode(true); }}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-body)', background: 'var(--forest)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '7px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500 }}
            title="O'qish rejimi"
          >
            📖 O'qish rejimi
          </button>
          {user?.role === 'admin' && (
            <>
              <button onClick={startEditing} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-body)', background: 'none', border: '1px solid var(--border)', padding: '8px 16px', borderRadius: '7px', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--ink-soft)' }}>
                ✎ Tahrirlash
              </button>
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
            {text.content && (() => { const mins = Math.ceil(text.content.split(/\s+/).length / 120); return ` ◆ ~${mins} daqiqa`; })()}
            {text.difficulty && ` ◆ ${text.difficulty === 'easy' ? '🟢 Oson' : text.difficulty === 'hard' ? '🔴 Qiyin' : '🟡 O\'rta'}`}
          </span>
        </div>

        {/* Title */}
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 5vw, 2.8rem)', textAlign: 'center', marginBottom: '1.5rem', lineHeight: 1.2 }}>
          {text.title}
        </h1>

        {/* Audio section */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          {text.audioUrl ? (
            <div style={{ maxWidth: '480px', margin: '0 auto' }}>
              <audio
                controls
                src={text.audioUrl}
                style={{ width: '100%', borderRadius: '8px' }}
              />
            </div>
          ) : (
            <button
              onClick={speak}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: isPlaying ? 'var(--forest-deep)' : 'var(--forest)', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '50px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.9rem', fontWeight: 500 }}
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              {isPlaying ? 'To\'xtatish' : 'Tinglash'}
            </button>
          )}
        </div>

        {/* Divider */}
        <div style={{ width: '40px', height: '2px', background: 'var(--forest)', margin: '0 auto 2.5rem' }} />

        {/* Content with drop cap on first paragraph */}
        <div style={{ fontFamily: 'var(--font-body)', fontSize: `${fontSize}rem`, lineHeight: 1.9, color: 'var(--ink)', transition: 'font-size 0.2s' }}>
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
              Savollarga javob bering
            </h2>
            <ol style={{ fontFamily: 'var(--font-body)', paddingLeft: '0', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              {text.questions.map((q, i) => {
                const isMC = q.options?.length > 0;
                const userAnswer = answers[i] || '';
                const result = checked[i];
                const letters = ['A', 'B', 'C', 'D'];
                return (
                  <li key={i}>
                    {/* Question header */}
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <span style={{ background: result === true ? '#27ae60' : result === false ? '#c0392b' : 'var(--forest)', color: 'white', borderRadius: '50%', width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 600, flexShrink: 0, marginTop: '2px', transition: 'background 0.2s' }}>
                        {result === true ? '✓' : result === false ? '✕' : i + 1}
                      </span>
                      <span style={{ lineHeight: 1.7, fontWeight: 500 }}>{q.question}</span>
                    </div>

                    {isMC ? (
                      /* Multiple choice */
                      <div style={{ paddingLeft: '2.5rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem' }}>
                          {q.options.map((opt, oi) => {
                            const letter = letters[oi];
                            const isSelected = userAnswer === letter;
                            const isCorrect = q.answer === letter;
                            let bg = 'var(--paper-dark)';
                            let border = 'var(--border-soft)';
                            let color = 'var(--ink)';
                            if (result !== undefined) {
                              if (isCorrect) { bg = '#eafaf1'; border = '#27ae60'; color = '#155724'; }
                              else if (isSelected && !isCorrect) { bg = '#fdf3f2'; border = '#c0392b'; color = '#c0392b'; }
                            } else if (isSelected) { bg = 'var(--paper-light)'; border = 'var(--forest)'; }
                            return (
                              <label key={oi} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '9px 14px', borderRadius: '8px', border: `1px solid ${border}`, background: bg, cursor: result !== undefined ? 'default' : 'pointer', transition: 'background 0.15s' }}>
                                <input
                                  type="radio"
                                  name={`q-${i}`}
                                  value={letter}
                                  checked={isSelected}
                                  disabled={result !== undefined}
                                  onChange={() => setAnswers(prev => ({ ...prev, [i]: letter }))}
                                  style={{ accentColor: 'var(--forest)', width: '16px', height: '16px', flexShrink: 0 }}
                                />
                                <span style={{ fontFamily: 'var(--font-body)', fontWeight: 600, color: 'var(--forest-deep)', minWidth: '20px' }}>{letter}.</span>
                                <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.95rem', color }}>{opt}</span>
                                {result !== undefined && isCorrect && <span style={{ marginLeft: 'auto', fontSize: '0.82rem', color: '#27ae60', fontWeight: 600 }}>✓ To'g'ri</span>}
                              </label>
                            );
                          })}
                        </div>
                        {result === undefined ? (
                          <button
                            onClick={() => {
                              if (!userAnswer) return;
                              setChecked(prev => ({ ...prev, [i]: userAnswer === q.answer }));
                            }}
                            disabled={!userAnswer}
                            style={{ fontFamily: 'var(--font-body)', background: 'var(--forest)', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '7px', cursor: userAnswer ? 'pointer' : 'not-allowed', fontSize: '0.85rem', fontWeight: 500, opacity: userAnswer ? 1 : 0.5 }}
                          >Tekshirish</button>
                        ) : result === true ? (
                          <span style={{ fontFamily: 'var(--font-body)', color: '#27ae60', fontSize: '0.92rem', fontWeight: 600 }}>🎉 To'g'ri javob!</span>
                        ) : (
                          <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.88rem', color: '#c0392b' }}>
                            Noto'g'ri.
                            {q.answer && <button onClick={() => setChecked(prev => { const n = {...prev}; delete n[i]; return n; })} style={{ marginLeft: '10px', fontFamily: 'var(--font-body)', background: 'none', border: '1px solid #e8b4b4', padding: '3px 10px', borderRadius: '5px', cursor: 'pointer', color: '#c0392b', fontSize: '0.82rem' }}>Qayta urinish</button>}
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Free text */
                      <div style={{ paddingLeft: '2.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <input
                          type="text"
                          placeholder="Javobingizni yozing..."
                          value={userAnswer}
                          onChange={e => setAnswers(prev => ({ ...prev, [i]: e.target.value }))}
                          disabled={result === true}
                          style={{ flex: 1, minWidth: '180px', fontFamily: 'var(--font-body)', padding: '8px 12px', border: `1px solid ${result === true ? '#27ae60' : result === false ? '#c0392b' : 'var(--border)'}`, borderRadius: '7px', fontSize: '0.9rem', background: result === true ? '#eafaf1' : result === false ? '#fdf3f2' : 'white', outline: 'none', color: 'var(--ink)' }}
                        />
                        {result === undefined || result === false ? (
                          <button
                            onClick={() => {
                              if (!q.answer || !userAnswer.trim()) return;
                              const correct = userAnswer.trim().toLowerCase().includes(q.answer.trim().toLowerCase()) || q.answer.trim().toLowerCase().includes(userAnswer.trim().toLowerCase());
                              setChecked(prev => ({ ...prev, [i]: correct }));
                            }}
                            style={{ fontFamily: 'var(--font-body)', background: 'var(--forest)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '7px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500 }}
                          >Tekshirish</button>
                        ) : result === true ? (
                          <span style={{ fontFamily: 'var(--font-body)', color: '#27ae60', fontSize: '0.9rem', alignSelf: 'center', fontWeight: 600 }}>🎉 To'g'ri!</span>
                        ) : null}
                        {result === false && (
                          <span style={{ fontFamily: 'var(--font-body)', color: '#c0392b', fontSize: '0.85rem', alignSelf: 'center' }}>
                            Noto'g'ri. Qayta urinib ko'ring.
                          </span>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>
          </div>
        )}

        {/* Personal notes */}
        <div style={{ marginTop: '2.5rem', padding: '1.5rem', background: 'var(--paper-light)', border: '1px solid var(--border-soft)', borderRadius: '12px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--forest-deep)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            📝 Shaxsiy qaydlar
          </h3>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--ink-muted)', marginBottom: '0.75rem' }}>
            Bu qaydlar faqat siz uchun, qurilmangizda saqlanadi.
          </p>
          <textarea
            value={noteText}
            onChange={e => { setNoteText(e.target.value); setNoteSaved(false); }}
            placeholder="Bu matn haqida fikr, eslatma yoki savollaringizni yozing..."
            rows={4}
            style={{ width: '100%', boxSizing: 'border-box', fontFamily: 'var(--font-body)', fontSize: '0.92rem', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--paper-dark)', color: 'var(--ink)', resize: 'vertical', lineHeight: 1.6, outline: 'none' }}
          />
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.6rem', alignItems: 'center' }}>
            <button
              onClick={() => { saveNote(id, noteText); setNoteSaved(true); setTimeout(() => setNoteSaved(false), 2000); }}
              style={{ fontFamily: 'var(--font-body)', background: 'var(--forest)', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '7px', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 500 }}
            >
              Saqlash
            </button>
            {noteText && (
              <button
                onClick={() => { setNoteText(''); saveNote(id, ''); setNoteSaved(false); }}
                style={{ fontFamily: 'var(--font-body)', background: 'none', border: '1px solid var(--border)', padding: '8px 16px', borderRadius: '7px', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--ink-muted)' }}
              >
                O'chirish
              </button>
            )}
            {noteSaved && (
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: '#27ae60', fontWeight: 500 }}>✓ Saqlandi</span>
            )}
          </div>
        </div>

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

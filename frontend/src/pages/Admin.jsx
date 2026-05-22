import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import BackButton from '../components/BackButton';

const inputStyle = {
  fontFamily: 'var(--font-body)',
  padding: '10px 14px',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  fontSize: '0.95rem',
  background: 'var(--paper-light)',
  color: 'var(--ink)',
  width: '100%',
  boxSizing: 'border-box',
};

const emptyCreator = { name: '', role: '', bio: '', avatar: '', order: 0 };

function Admin({ user }) {
  const navigate = useNavigate();
  const [texts, setTexts] = useState([]);
  const [activeTab, setActiveTab] = useState('stats');
  const [form, setForm] = useState({ title: '', content: '', grade: 1, quarter: 1, language: 'uz', questions: [{ question: '', answer: '' }] });
  const [submitting, setSubmitting] = useState(false);
  const [importText, setImportText] = useState('');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  const [creators, setCreators] = useState([]);
  const [creatorForm, setCreatorForm] = useState(emptyCreator);
  const [editingCreator, setEditingCreator] = useState(null);
  const [savingCreator, setSavingCreator] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/login', { replace: true }); return; }
    fetchTexts();
    fetchCreators();
  }, [user, navigate]);

  const fetchCreators = async () => {
    try { const res = await axios.get(`${API_BASE_URL}/api/creators`); setCreators(res.data); }
    catch (err) { console.error(err); }
  };

  const handleCreatorSubmit = async (e) => {
    e.preventDefault();
    setSavingCreator(true);
    const token = localStorage.getItem('token');
    try {
      if (editingCreator) {
        await axios.put(`${API_BASE_URL}/api/creators/${editingCreator}`, creatorForm, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await axios.post(`${API_BASE_URL}/api/creators`, creatorForm, { headers: { Authorization: `Bearer ${token}` } });
      }
      setCreatorForm(emptyCreator);
      setEditingCreator(null);
      fetchCreators();
    } catch (err) {
      alert('Xatolik: ' + (err.response?.data?.message || err.message));
    } finally {
      setSavingCreator(false);
    }
  };

  const startEditCreator = (c) => {
    setCreatorForm({ name: c.name, role: c.role, bio: c.bio || '', avatar: c.avatar || '', order: c.order || 0 });
    setEditingCreator(c._id);
  };

  const deleteCreator = async (id) => {
    if (!confirm('O\'chirishni tasdiqlaysizmi?')) return;
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${API_BASE_URL}/api/creators/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchCreators();
    } catch (err) {
      alert('Xatolik: ' + err.message);
    }
  };

  const fetchTexts = async () => {
    try { const res = await axios.get(`${API_BASE_URL}/api/texts`); setTexts(res.data); }
    catch (err) { console.error(err); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const token = localStorage.getItem('token');
    try {
      await axios.post(`${API_BASE_URL}/api/texts`, form, { headers: { Authorization: `Bearer ${token}` } });
      fetchTexts();
      setForm({ title: '', content: '', grade: 1, quarter: 1, language: 'uz', questions: [{ question: '', answer: '' }] });
      setActiveTab('list');
    } catch (err) {
      alert('Xatolik: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const updateQ = (i, field, val) => setForm(f => ({ ...f, questions: f.questions.map((q, idx) => idx === i ? { ...q, [field]: val } : q) }));

  const handleImport = async () => {
    let data;
    try { data = JSON.parse(importText); } catch { alert('JSON formati noto\'g\'ri'); return; }
    if (!Array.isArray(data)) { alert('JSON array bo\'lishi kerak: [{ title, content, grade, quarter, ... }]'); return; }
    setImporting(true);
    setImportResult(null);
    const token = localStorage.getItem('token');
    let ok = 0, fail = 0;
    for (const item of data) {
      try {
        await axios.post(`${API_BASE_URL}/api/texts`, { language: 'uz', ...item }, { headers: { Authorization: `Bearer ${token}` } });
        ok++;
      } catch { fail++; }
    }
    setImportResult({ ok, fail });
    fetchTexts();
    setImporting(false);
  };

  const totalTexts = texts.length;
  const byGrade = [1, 2, 3, 4].map(g => ({ grade: g, count: texts.filter(t => t.grade === g).length }));
  const byQuarter = [1, 2, 3, 4].map(q => ({ quarter: q, count: texts.filter(t => t.quarter === q).length }));
  const withQuestions = texts.filter(t => t.questions?.length > 0).length;

  const tabs = [
    { id: 'stats', label: '📊 Statistika' },
    { id: 'add', label: '+ Matn qo\'shish' },
    { id: 'import', label: '⬆ Import' },
    { id: 'list', label: `📋 Ro'yxat (${totalTexts})` },
    { id: 'creators', label: `👤 Yaratuvchilar (${creators.length})` },
  ];

  return (
    <div style={{ minHeight: '100vh', padding: '2rem 1.5rem' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', marginBottom: '2rem' }}>Admin Panel</h1>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '2px solid var(--border)' }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ fontFamily: 'var(--font-body)', background: 'none', border: 'none', padding: '10px 20px', cursor: 'pointer', fontSize: '0.9rem', color: activeTab === tab.id ? 'var(--forest-deep)' : 'var(--ink-muted)', fontWeight: activeTab === tab.id ? 600 : 400, borderBottom: activeTab === tab.id ? '2px solid var(--forest-deep)' : '2px solid transparent', marginBottom: '-2px' }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Stats */}
        {activeTab === 'stats' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              {[
                { label: 'Jami matnlar', value: totalTexts, color: 'var(--forest)' },
                { label: 'Savoli bor', value: withQuestions, color: '#8e44ad' },
                { label: 'Savoli yo\'q', value: totalTexts - withQuestions, color: '#e67e22' },
              ].map(s => (
                <div key={s.label} style={{ background: 'var(--paper-light)', border: '1px solid var(--border-soft)', borderRadius: '12px', padding: '1.5rem', textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', color: s.color, fontWeight: 700 }}>{s.value}</div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--ink-muted)', marginTop: '0.25rem' }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div style={{ background: 'var(--paper-light)', border: '1px solid var(--border-soft)', borderRadius: '12px', padding: '1.5rem' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', marginBottom: '1rem', color: 'var(--forest-deep)' }}>Sinflar bo'yicha</h3>
                {byGrade.map(({ grade, count }) => (
                  <div key={grade} style={{ marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-body)', fontSize: '0.85rem', marginBottom: '4px' }}>
                      <span>{grade}-sinf</span><span style={{ color: 'var(--ink-muted)' }}>{count}</span>
                    </div>
                    <div style={{ height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${totalTexts ? (count / totalTexts) * 100 : 0}%`, background: 'var(--forest)', borderRadius: '3px' }} />
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ background: 'var(--paper-light)', border: '1px solid var(--border-soft)', borderRadius: '12px', padding: '1.5rem' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', marginBottom: '1rem', color: 'var(--forest-deep)' }}>Choraklar bo'yicha</h3>
                {byQuarter.map(({ quarter, count }) => (
                  <div key={quarter} style={{ marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-body)', fontSize: '0.85rem', marginBottom: '4px' }}>
                      <span>{quarter}-chorak</span><span style={{ color: 'var(--ink-muted)' }}>{count}</span>
                    </div>
                    <div style={{ height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${totalTexts ? (count / totalTexts) * 100 : 0}%`, background: '#8e44ad', borderRadius: '3px' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Add text */}
        {activeTab === 'add' && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input style={inputStyle} type="text" placeholder="Sarlavha" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <select style={inputStyle} value={form.grade} onChange={e => setForm({ ...form, grade: Number(e.target.value) })}>
                {[1,2,3,4].map(g => <option key={g} value={g}>{g}-sinf</option>)}
              </select>
              <select style={inputStyle} value={form.quarter} onChange={e => setForm({ ...form, quarter: Number(e.target.value) })}>
                {[1,2,3,4].map(q => <option key={q} value={q}>{q}-chorak</option>)}
              </select>
            </div>
            <textarea style={{ ...inputStyle, height: '200px', resize: 'vertical' }} placeholder="Matn mazmuni..." value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} required />

            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', marginBottom: '0', marginTop: '0.5rem' }}>Savollar</h3>
            {form.questions.map((q, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '0.5rem' }}>
                <input style={inputStyle} placeholder={`${i+1}-savol`} value={q.question} onChange={e => updateQ(i, 'question', e.target.value)} />
                <input style={inputStyle} placeholder="Javob (ixtiyoriy)" value={q.answer} onChange={e => updateQ(i, 'answer', e.target.value)} />
                <button type="button" onClick={() => setForm(f => ({ ...f, questions: f.questions.filter((_, idx) => idx !== i) }))} style={{ padding: '10px 12px', background: 'none', border: '1px solid #e8b4b4', borderRadius: '8px', cursor: 'pointer', color: '#c0392b' }}>✕</button>
              </div>
            ))}
            <button type="button" onClick={() => setForm(f => ({ ...f, questions: [...f.questions, { question: '', answer: '' }] }))} style={{ alignSelf: 'flex-start', fontFamily: 'var(--font-body)', background: 'none', border: '1px solid var(--border)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--ink-soft)' }}>
              + Savol qo'shish
            </button>
            <button type="submit" disabled={submitting} style={{ fontFamily: 'var(--font-body)', background: 'var(--forest)', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', cursor: submitting ? 'not-allowed' : 'pointer', fontSize: '1rem', fontWeight: 500, opacity: submitting ? 0.7 : 1, marginTop: '0.5rem' }}>
              {submitting ? 'Saqlanmoqda...' : 'Matnni saqlash'}
            </button>
          </form>
        )}

        {/* Import */}
        {activeTab === 'import' && (
          <div>
            <p style={{ fontFamily: 'var(--font-body)', color: 'var(--ink-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
              JSON formatida matnlar massivini kiriting. Misol:
            </p>
            <pre style={{ fontFamily: 'monospace', fontSize: '0.78rem', background: 'var(--paper-dark)', padding: '1rem', borderRadius: '8px', overflow: 'auto', marginBottom: '1rem', color: 'var(--ink-soft)' }}>{`[
  {
    "title": "Bahor",
    "content": "Bahor keldi...",
    "grade": 1,
    "quarter": 1,
    "questions": [
      { "question": "Fasl nomi nima?", "answer": "Bahor" }
    ]
  }
]`}</pre>
            <textarea
              style={{ ...inputStyle, height: '240px', resize: 'vertical', marginBottom: '1rem', fontFamily: 'monospace', fontSize: '0.85rem' }}
              placeholder='[{ "title": "...", "content": "...", "grade": 1, "quarter": 1 }]'
              value={importText}
              onChange={e => { setImportText(e.target.value); setImportResult(null); }}
            />
            {importResult && (
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', marginBottom: '1rem', padding: '0.75rem 1rem', borderRadius: '8px', background: importResult.fail === 0 ? '#eafaf1' : '#fdf3f2', border: `1px solid ${importResult.fail === 0 ? '#27ae60' : '#c0392b'}`, color: importResult.fail === 0 ? '#27ae60' : '#c0392b' }}>
                ✓ {importResult.ok} ta muvaffaqiyatli qo'shildi{importResult.fail > 0 ? `, ${importResult.fail} ta xatolik` : ''}
              </div>
            )}
            <button onClick={handleImport} disabled={importing || !importText.trim()} style={{ fontFamily: 'var(--font-body)', background: 'var(--forest)', color: 'white', border: 'none', padding: '12px 28px', borderRadius: '8px', cursor: importing ? 'not-allowed' : 'pointer', fontSize: '1rem', fontWeight: 500, opacity: importing ? 0.7 : 1 }}>
              {importing ? 'Yuklanmoqda...' : 'Import qilish'}
            </button>
          </div>
        )}

        {/* List */}
        {activeTab === 'list' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {texts.length === 0 && (
              <p style={{ fontFamily: 'var(--font-body)', color: 'var(--ink-muted)', textAlign: 'center', padding: '3rem 0', fontStyle: 'italic' }}>Hali matn yo'q</p>
            )}
            {texts.map(text => (
              <div key={text._id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--paper-light)', border: '1px solid var(--border-soft)', borderRadius: '10px', padding: '1rem 1.5rem' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--forest-deep)', marginBottom: '0.2rem' }}>{text.title}</div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--ink-muted)' }}>{text.grade}-sinf • {text.quarter}-chorak {text.questions?.length > 0 ? `• ${text.questions.length} ta savol` : ''}</div>
                </div>
                <Link to={`/sinf/${text.grade}/chorak/${text.quarter}/matn/${text._id}`} style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--forest)', textDecoration: 'none', border: '1px solid var(--border)', padding: '5px 12px', borderRadius: '6px' }}>Ko'rish</Link>
              </div>
            ))}
          </div>
        )}
        {/* Creators tab */}
        {activeTab === 'creators' && (
          <div>
            {/* Form */}
            <div style={{ background: 'var(--paper-light)', border: '1px solid var(--border-soft)', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--forest-deep)' }}>
                {editingCreator ? 'Yaratuvchini tahrirlash' : 'Yangi yaratuvchi qo\'shish'}
              </h3>
              <form onSubmit={handleCreatorSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <input style={inputStyle} placeholder="Ism Familiya *" value={creatorForm.name} onChange={e => setCreatorForm({ ...creatorForm, name: e.target.value })} required />
                  <input style={inputStyle} placeholder="Lavozim (masalan: Loyiha rahbari) *" value={creatorForm.role} onChange={e => setCreatorForm({ ...creatorForm, role: e.target.value })} required />
                </div>
                <input style={inputStyle} placeholder="Avatar URL yoki emoji (masalan: 👨‍💻)" value={creatorForm.avatar} onChange={e => setCreatorForm({ ...creatorForm, avatar: e.target.value })} />
                <textarea style={{ ...inputStyle, height: '80px', resize: 'vertical' }} placeholder="Qisqacha ma'lumot (ixtiyoriy)" value={creatorForm.bio} onChange={e => setCreatorForm({ ...creatorForm, bio: e.target.value })} />
                <input style={{ ...inputStyle, width: '120px' }} type="number" placeholder="Tartib raqami" value={creatorForm.order} onChange={e => setCreatorForm({ ...creatorForm, order: Number(e.target.value) })} min={0} />
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button type="submit" disabled={savingCreator} style={{ fontFamily: 'var(--font-body)', background: 'var(--forest)', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: savingCreator ? 'not-allowed' : 'pointer', fontWeight: 500, opacity: savingCreator ? 0.7 : 1 }}>
                    {savingCreator ? 'Saqlanmoqda...' : editingCreator ? 'Saqlash' : 'Qo\'shish'}
                  </button>
                  {editingCreator && (
                    <button type="button" onClick={() => { setEditingCreator(null); setCreatorForm(emptyCreator); }} style={{ fontFamily: 'var(--font-body)', background: 'none', border: '1px solid var(--border)', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', color: 'var(--ink-soft)' }}>
                      Bekor qilish
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {creators.length === 0 && (
                <p style={{ fontFamily: 'var(--font-body)', color: 'var(--ink-muted)', textAlign: 'center', padding: '2rem', fontStyle: 'italic' }}>Hali yaratuvchi qo'shilmagan</p>
              )}
              {creators.map(c => (
                <div key={c._id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--paper-light)', border: '1px solid var(--border-soft)', borderRadius: '10px', padding: '1rem 1.5rem' }}>
                  <div style={{ fontSize: '2rem', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--paper-dark)', borderRadius: '50%', flexShrink: 0 }}>
                    {c.avatar && c.avatar.startsWith('http') ? (
                      <img src={c.avatar} alt={c.name} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      c.avatar || '👤'
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--forest-deep)' }}>{c.name}</div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--ink-muted)' }}>{c.role}</div>
                    {c.bio && <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--ink-muted)', marginTop: '2px' }}>{c.bio}</div>}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => startEditCreator(c)} style={{ fontFamily: 'var(--font-body)', background: 'none', border: '1px solid var(--border)', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.82rem', color: 'var(--ink-soft)' }}>✎</button>
                    <button onClick={() => deleteCreator(c._id)} style={{ fontFamily: 'var(--font-body)', background: 'none', border: '1px solid #e8b4b4', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.82rem', color: '#c0392b' }}>✕</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <BackButton to="/" label="Bosh sahifaga qaytish" />
      </div>
    </div>
  );
}

export default Admin;

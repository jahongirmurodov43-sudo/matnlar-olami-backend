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
  const [form, setForm] = useState({ title: '', content: '', grade: 1, quarter: 1, language: 'uz', difficulty: 'medium', questions: [{ question: '', answer: '', options: [] }] });
  const [submitting, setSubmitting] = useState(false);
  const [importText, setImportText] = useState('');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  const [users, setUsers] = useState([]);
  const [topReaders, setTopReaders] = useState([]);

  const fetchTopReaders = async () => {
    const token = localStorage.getItem('token');
    try {
      // Fetch all users then get their progress counts
      const usersRes = await axios.get(`${API_BASE_URL}/api/users`, { headers: { Authorization: `Bearer ${token}` } });
      const counts = await Promise.all(
        usersRes.data.slice(0, 10).map(u =>
          axios.get(`${API_BASE_URL}/api/progress/user/${u._id}`, { headers: { Authorization: `Bearer ${token}` } })
            .then(r => ({ name: u.name, count: r.data.length }))
            .catch(() => ({ name: u.name, count: 0 }))
        )
      );
      setTopReaders(counts.sort((a, b) => b.count - a.count).filter(r => r.count > 0));
    } catch {}
  };

  const fetchUsers = async () => {
    const token = localStorage.getItem('token');
    try { const res = await axios.get(`${API_BASE_URL}/api/users`, { headers: { Authorization: `Bearer ${token}` } }); setUsers(res.data); }
    catch (err) { console.error(err); }
  };

  const changeRole = async (id, role) => {
    const token = localStorage.getItem('token');
    try {
      await axios.patch(`${API_BASE_URL}/api/users/${id}/role`, { role }, { headers: { Authorization: `Bearer ${token}` } });
      fetchUsers();
    } catch (err) { alert(err.response?.data?.message || err.message); }
  };

  const deleteUser = async (id) => {
    if (!confirm('Foydalanuvchini o\'chirishni tasdiqlaysizmi?')) return;
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${API_BASE_URL}/api/users/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchUsers();
    } catch (err) { alert(err.response?.data?.message || err.message); }
  };

  const [creators, setCreators] = useState([]);
  const [creatorForm, setCreatorForm] = useState(emptyCreator);
  const [editingCreator, setEditingCreator] = useState(null);
  const [savingCreator, setSavingCreator] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/login', { replace: true }); return; }
    fetchTexts();
    fetchCreators();
    fetchUsers();
    fetchTopReaders();
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
      setForm({ title: '', content: '', grade: 1, quarter: 1, language: 'uz', difficulty: 'medium', questions: [{ question: '', answer: '', options: [] }] });
      setActiveTab('list');
    } catch (err) {
      alert('Xatolik: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const updateQ = (i, field, val) => setForm(f => ({ ...f, questions: f.questions.map((q, idx) => idx === i ? { ...q, [field]: val } : q) }));
  const toggleMC = (i) => setForm(f => ({
    ...f,
    questions: f.questions.map((q, idx) => idx === i
      ? { ...q, options: q.options?.length > 0 ? [] : ['', '', '', ''] }
      : q)
  }));
  const updateOption = (qi, oi, val) => setForm(f => ({
    ...f,
    questions: f.questions.map((q, idx) => idx === qi
      ? { ...q, options: q.options.map((o, oidx) => oidx === oi ? val : o) }
      : q)
  }));

  const loadImportFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => { setImportText(ev.target.result); setImportResult(null); };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleImport = async () => {
    let data;
    try {
      data = JSON.parse(importText);
    } catch {
      setImportResult({ error: 'JSON formati noto\'g\'ri. Iltimos, to\'g\'ri JSON kiriting.' });
      return;
    }
    if (!Array.isArray(data)) {
      setImportResult({ error: 'JSON array bo\'lishi kerak: [ {...}, {...} ]' });
      return;
    }
    if (data.length === 0) {
      setImportResult({ error: 'Array bo\'sh.' });
      return;
    }

    setImporting(true);
    setImportResult(null);
    const token = localStorage.getItem('token');
    const errors = [];
    let ok = 0;

    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      if (!item.title) { errors.push(`#${i + 1}: "title" maydoni yo'q`); continue; }
      if (!item.content) { errors.push(`#${i + 1} "${item.title}": "content" maydoni yo'q`); continue; }
      if (!item.grade || item.grade < 1 || item.grade > 4) { errors.push(`#${i + 1} "${item.title}": "grade" 1-4 orasida bo'lishi kerak`); continue; }
      if (!item.quarter || item.quarter < 1 || item.quarter > 4) { errors.push(`#${i + 1} "${item.title}": "quarter" 1-4 orasida bo'lishi kerak`); continue; }
      try {
        await axios.post(`${API_BASE_URL}/api/texts`, { language: 'uz', ...item }, { headers: { Authorization: `Bearer ${token}` } });
        ok++;
      } catch (err) {
        errors.push(`#${i + 1} "${item.title}": ${err.response?.data?.message || err.message}`);
      }
    }

    setImportResult({ ok, errors });
    if (ok > 0) fetchTexts();
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
    { id: 'users', label: `👥 Foydalanuvchilar (${users.length})` },
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
            {/* Export buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => {
                  const dataStr = JSON.stringify(texts, null, 2);
                  const blob = new Blob([dataStr], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url; a.download = `matnlar-olami-${new Date().toISOString().slice(0,10)}.json`;
                  a.click(); URL.revokeObjectURL(url);
                }}
                style={{ fontFamily: 'var(--font-body)', background: 'var(--forest)', color: 'white', border: 'none', padding: '9px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 500 }}
              >
                ⬇ JSON export
              </button>
              <button
                onClick={() => {
                  const header = ['title','content','grade','quarter','language','difficulty','questions'];
                  const rows = texts.map(t => [
                    `"${(t.title||'').replace(/"/g,'""')}"`,
                    `"${(t.content||'').replace(/"/g,'""')}"`,
                    t.grade, t.quarter,
                    t.language || 'uz',
                    t.difficulty || 'medium',
                    `"${JSON.stringify(t.questions||[]).replace(/"/g,'""')}"`
                  ]);
                  const csv = [header.join(','), ...rows.map(r => r.join(','))].join('\n');
                  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url; a.download = `matnlar-olami-${new Date().toISOString().slice(0,10)}.csv`;
                  a.click(); URL.revokeObjectURL(url);
                }}
                style={{ fontFamily: 'var(--font-body)', background: 'none', border: '1px solid var(--forest)', color: 'var(--forest)', padding: '9px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 500 }}
              >
                ⬇ CSV export
              </button>
            </div>
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

            {/* Top readers */}
            {topReaders.length > 0 && (
              <div style={{ marginTop: '1.5rem', background: 'var(--paper-light)', border: '1px solid var(--border-soft)', borderRadius: '12px', padding: '1.5rem' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', marginBottom: '1rem', color: 'var(--forest-deep)' }}>🏆 Ko'p o'qiganlar (top 10)</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {topReaders.map((r, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--ink-muted)', width: '22px', textAlign: 'right' }}>{i + 1}.</span>
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', flex: 1 }}>{r.name}</span>
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--ink-muted)' }}>{r.count} ta</span>
                      <div style={{ width: '80px', height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${(r.count / (topReaders[0]?.count || 1)) * 100}%`, background: 'var(--forest)', borderRadius: '3px' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
            <select style={inputStyle} value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })}>
              <option value="easy">🟢 Oson</option>
              <option value="medium">🟡 O'rta</option>
              <option value="hard">🔴 Qiyin</option>
            </select>
            <textarea style={{ ...inputStyle, height: '200px', resize: 'vertical' }} placeholder="Matn mazmuni..." value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} required />

            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', marginBottom: '0', marginTop: '0.5rem' }}>Savollar</h3>
            {form.questions.map((q, i) => (
              <div key={i} style={{ background: 'var(--paper-dark)', border: '1px solid var(--border-soft)', borderRadius: '10px', padding: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input style={{ ...inputStyle, flex: 1 }} placeholder={`${i+1}-savol matni`} value={q.question} onChange={e => updateQ(i, 'question', e.target.value)} />
                  <button type="button" onClick={() => setForm(f => ({ ...f, questions: f.questions.filter((_, idx) => idx !== i) }))} style={{ padding: '10px 12px', background: 'none', border: '1px solid #e8b4b4', borderRadius: '8px', cursor: 'pointer', color: '#c0392b', flexShrink: 0 }}>✕</button>
                </div>
                {/* MC toggle */}
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--ink-soft)', cursor: 'pointer' }}>
                  <input type="checkbox" checked={q.options?.length > 0} onChange={() => toggleMC(i)} />
                  Test (A/B/C/D variantlar)
                </label>
                {q.options?.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {['A','B','C','D'].map((letter, oi) => (
                      <div key={oi} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.85rem', color: 'var(--forest-deep)', width: '18px' }}>{letter}</span>
                        <input style={{ ...inputStyle, flex: 1 }} placeholder={`${letter} variant`} value={q.options[oi] || ''} onChange={e => updateOption(i, oi, e.target.value)} />
                      </div>
                    ))}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '2px' }}>
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--ink-soft)' }}>To'g'ri javob:</span>
                      <select style={{ ...inputStyle, width: 'auto', padding: '6px 10px' }} value={q.answer} onChange={e => updateQ(i, 'answer', e.target.value)}>
                        <option value="">— tanlang —</option>
                        {['A','B','C','D'].map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </div>
                  </div>
                ) : (
                  <input style={inputStyle} placeholder="To'g'ri javob (ixtiyoriy)" value={q.answer} onChange={e => updateQ(i, 'answer', e.target.value)} />
                )}
              </div>
            ))}
            <button type="button" onClick={() => setForm(f => ({ ...f, questions: [...f.questions, { question: '', answer: '', options: [] }] }))} style={{ alignSelf: 'flex-start', fontFamily: 'var(--font-body)', background: 'none', border: '1px solid var(--border)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--ink-soft)' }}>
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
            {/* Format guide */}
            <div style={{ background: 'var(--paper-dark)', border: '1px solid var(--border-soft)', borderRadius: '10px', padding: '1.25rem', marginBottom: '1.25rem' }}>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--ink-muted)', marginBottom: '0.6rem', fontWeight: 600 }}>Majburiy maydonlar:</p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                {['"title"', '"content"', '"grade": 1–4', '"quarter": 1–4'].map(f => (
                  <span key={f} style={{ fontFamily: 'monospace', fontSize: '0.78rem', background: 'var(--forest)', color: 'white', padding: '2px 8px', borderRadius: '4px' }}>{f}</span>
                ))}
              </div>
              <details>
                <summary style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--forest)', cursor: 'pointer' }}>Namuna JSON ko'rish</summary>
                <pre style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--ink-soft)', marginTop: '0.75rem', overflow: 'auto', whiteSpace: 'pre-wrap' }}>{`[
  {
    "title": "Bahor",
    "content": "Bahor keldi. Quyosh chiqdi...",
    "grade": 1,
    "quarter": 1,
    "questions": [
      { "question": "Qaysi fasl haqida?", "answer": "Bahor" }
    ]
  },
  {
    "title": "Maktab",
    "content": "Maktab go'zal joy...",
    "grade": 2,
    "quarter": 3
  }
]`}</pre>
              </details>
            </div>

            {/* File upload */}
            <div style={{ marginBottom: '0.75rem' }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-body)', fontSize: '0.88rem', background: 'var(--paper-light)', border: '1px solid var(--border)', borderRadius: '8px', padding: '9px 18px', cursor: 'pointer', color: 'var(--ink-soft)' }}>
                📂 .json fayl yuklash
                <input type="file" accept=".json,application/json" style={{ display: 'none' }} onChange={loadImportFile} />
              </label>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--ink-muted)', marginLeft: '0.75rem' }}>yoki quyiga joylashtiring</span>
            </div>

            <textarea
              style={{ ...inputStyle, height: '220px', resize: 'vertical', marginBottom: '1rem', fontFamily: 'monospace', fontSize: '0.82rem' }}
              placeholder='[{ "title": "...", "content": "...", "grade": 1, "quarter": 1 }]'
              value={importText}
              onChange={e => { setImportText(e.target.value); setImportResult(null); }}
            />

            {/* Results */}
            {importResult && (
              <div style={{ marginBottom: '1rem' }}>
                {importResult.error ? (
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.88rem', padding: '0.75rem 1rem', borderRadius: '8px', background: '#fdf3f2', border: '1px solid #c0392b', color: '#c0392b' }}>
                    ✕ {importResult.error}
                  </div>
                ) : (
                  <div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', padding: '0.75rem 1rem', borderRadius: '8px', background: importResult.errors.length === 0 ? '#eafaf1' : '#fffbeb', border: `1px solid ${importResult.errors.length === 0 ? '#27ae60' : '#f39c12'}`, color: importResult.errors.length === 0 ? '#27ae60' : '#b7791f', marginBottom: importResult.errors.length > 0 ? '0.5rem' : 0 }}>
                      ✓ {importResult.ok} ta muvaffaqiyatli qo'shildi{importResult.errors.length > 0 ? `, ${importResult.errors.length} ta xatolik` : ''}
                    </div>
                    {importResult.errors.length > 0 && (
                      <div style={{ background: '#fdf3f2', border: '1px solid #e8b4b4', borderRadius: '8px', padding: '0.75rem 1rem' }}>
                        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: '#c0392b', fontWeight: 600, marginBottom: '0.5rem' }}>Xatoliklar:</p>
                        <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
                          {importResult.errors.map((e, i) => (
                            <li key={i} style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: '#c0392b', marginBottom: '3px' }}>{e}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={handleImport} disabled={importing || !importText.trim()} style={{ fontFamily: 'var(--font-body)', background: 'var(--forest)', color: 'white', border: 'none', padding: '12px 28px', borderRadius: '8px', cursor: importing || !importText.trim() ? 'not-allowed' : 'pointer', fontSize: '1rem', fontWeight: 500, opacity: importing || !importText.trim() ? 0.6 : 1 }}>
                {importing ? `Yuklanmoqda...` : 'Import qilish'}
              </button>
              {importText && (
                <button onClick={() => { setImportText(''); setImportResult(null); }} style={{ fontFamily: 'var(--font-body)', background: 'none', border: '1px solid var(--border)', padding: '12px 20px', borderRadius: '8px', cursor: 'pointer', color: 'var(--ink-muted)', fontSize: '0.9rem' }}>
                  Tozalash
                </button>
              )}
            </div>
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
                {/* Avatar upload */}
                <div>
                  <label style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--ink-muted)', display: 'block', marginBottom: '6px' }}>Avatar</label>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    {/* Preview */}
                    <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--paper-dark)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', overflow: 'hidden', flexShrink: 0 }}>
                      {creatorForm.avatar ? (
                        creatorForm.avatar.startsWith('data:') || creatorForm.avatar.startsWith('http') ? (
                          <img src={creatorForm.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : creatorForm.avatar
                      ) : '👤'}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                      {/* File upload button */}
                      <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-body)', fontSize: '0.85rem', background: 'var(--paper-light)', border: '1px solid var(--border)', borderRadius: '7px', padding: '7px 14px', cursor: 'pointer', color: 'var(--ink-soft)', width: 'fit-content' }}>
                        📁 Rasm yuklash
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={e => {
                            const file = e.target.files[0];
                            if (!file) return;
                            if (file.size > 2 * 1024 * 1024) { alert('Rasm 2MB dan kichik bo\'lishi kerak'); return; }
                            const reader = new FileReader();
                            reader.onload = ev => setCreatorForm(f => ({ ...f, avatar: ev.target.result }));
                            reader.readAsDataURL(file);
                          }}
                        />
                      </label>
                      {/* Emoji / URL fallback */}
                      <input
                        style={{ ...inputStyle, fontSize: '0.85rem', padding: '7px 12px' }}
                        placeholder="Yoki emoji kiriting: 👨‍💻"
                        value={creatorForm.avatar.startsWith('data:') ? '' : creatorForm.avatar}
                        onChange={e => setCreatorForm({ ...creatorForm, avatar: e.target.value })}
                      />
                    </div>
                    {creatorForm.avatar && (
                      <button type="button" onClick={() => setCreatorForm(f => ({ ...f, avatar: '' }))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-muted)', fontSize: '1.1rem', padding: '4px' }} title="O'chirish">✕</button>
                    )}
                  </div>
                </div>
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
                    {c.avatar && (c.avatar.startsWith('http') || c.avatar.startsWith('data:')) ? (
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

        {/* Users tab */}
        {activeTab === 'users' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.88rem', color: 'var(--ink-muted)' }}>
                Jami: <strong>{users.length}</strong> ta foydalanuvchi
              </p>
              <button
                onClick={fetchUsers}
                style={{ fontFamily: 'var(--font-body)', background: 'none', border: '1px solid var(--border)', padding: '6px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--ink-soft)' }}
              >
                ↻ Yangilash
              </button>
            </div>

            {users.length === 0 ? (
              <p style={{ fontFamily: 'var(--font-body)', color: 'var(--ink-muted)', textAlign: 'center', padding: '3rem 0', fontStyle: 'italic' }}>Foydalanuvchilar yo'q</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {users.map(u => (
                  <div key={u._id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--paper-light)', border: '1px solid var(--border-soft)', borderRadius: '10px', padding: '0.9rem 1.25rem', flexWrap: 'wrap' }}>
                    {/* Avatar / initials */}
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: u.role === 'admin' ? 'var(--forest)' : u.role === 'teacher' ? '#f0a500' : 'var(--paper-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', color: u.role === 'student' ? 'var(--ink-muted)' : 'white', fontWeight: 700, flexShrink: 0, fontFamily: 'var(--font-display)' }}>
                      {u.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    {/* Info */}
                    <div style={{ flex: 1, minWidth: '160px' }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', color: 'var(--forest-deep)' }}>{u.name}</div>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--ink-muted)' }}>{u.email}</div>
                    </div>
                    {/* Role badge */}
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', padding: '3px 10px', borderRadius: '20px', fontWeight: 600,
                      background: u.role === 'admin' ? '#d4edda' : u.role === 'teacher' ? '#fff3cd' : '#e8eaf6',
                      color: u.role === 'admin' ? '#155724' : u.role === 'teacher' ? '#856404' : '#3949ab'
                    }}>
                      {u.role === 'admin' ? '🛡 Admin' : u.role === 'teacher' ? '👩‍🏫 O\'qituvchi' : '🎓 O\'quvchi'}
                    </span>
                    {/* Joined date */}
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--ink-muted)', minWidth: '80px', textAlign: 'right' }}>
                      {new Date(u.createdAt).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      {u.role !== 'teacher' && (
                        <button onClick={() => changeRole(u._id, 'teacher')} title="O'qituvchiga o'tkazish"
                          style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', background: 'none', border: '1px solid #856404', color: '#856404', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer' }}>
                          👩‍🏫
                        </button>
                      )}
                      {u.role !== 'student' && (
                        <button onClick={() => changeRole(u._id, 'student')} title="O'quvchiga tushirish"
                          style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', background: 'none', border: '1px solid #3949ab', color: '#3949ab', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer' }}>
                          🎓
                        </button>
                      )}
                      {u.role !== 'admin' && (
                        <button onClick={() => changeRole(u._id, 'admin')} title="Adminga ko'tarish"
                          style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', background: 'none', border: '1px solid var(--forest)', color: 'var(--forest)', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer' }}>
                          🛡
                        </button>
                      )}
                      <button
                        onClick={() => deleteUser(u._id)}
                        title="O'chirish"
                        style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', background: 'none', border: '1px solid #e8b4b4', color: '#c0392b', padding: '5px 12px', borderRadius: '6px', cursor: 'pointer' }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <BackButton to="/" label="Bosh sahifaga qaytish" />
      </div>
    </div>
  );
}

export default Admin;

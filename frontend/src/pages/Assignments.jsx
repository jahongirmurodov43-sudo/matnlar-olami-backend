import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useProgress } from '../hooks/useProgress';

const API = import.meta.env.VITE_API_BASE_URL;
const hdrs = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

function Assignments({ user }) {
  const navigate = useNavigate();
  const { isRead } = useProgress();
  const [tab, setTab] = useState('mine');
  const [mine, setMine] = useState([]);
  const [teaching, setTeaching] = useState([]);
  const [classes, setClasses] = useState([]);
  const [texts, setTexts] = useState([]);
  const [loading, setLoading] = useState(true);
  // Create form
  const [form, setForm] = useState({ title: '', classId: '', textIds: [], deadline: '', note: '' });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchAll();
  }, [user]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [mineRes, teachRes, classRes, textRes] = await Promise.all([
        axios.get(`${API}/api/assignments/mine`, { headers: hdrs() }),
        axios.get(`${API}/api/assignments/teaching`, { headers: hdrs() }),
        axios.get(`${API}/api/classes/mine`, { headers: hdrs() }),
        axios.get(`${API}/api/texts`),
      ]);
      setMine(mineRes.data);
      setTeaching(teachRes.data);
      setClasses(classRes.data.teaching || []);
      setTexts(textRes.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const createAssignment = async (e) => {
    e.preventDefault();
    if (!form.title || !form.classId || form.textIds.length === 0) {
      alert('Sarlavha, sinf va kamida 1 ta matn tanlang');
      return;
    }
    setCreating(true);
    try {
      await axios.post(`${API}/api/assignments`, {
        title: form.title, classId: form.classId,
        texts: form.textIds, deadline: form.deadline || undefined, note: form.note,
      }, { headers: hdrs() });
      setForm({ title: '', classId: '', textIds: [], deadline: '', note: '' });
      fetchAll();
      setTab('teaching');
    } catch (err) { alert(err.response?.data?.message || err.message); }
    finally { setCreating(false); }
  };

  const deleteAssignment = async (id) => {
    if (!confirm('Topshiriqni o\'chirmoqchimisiz?')) return;
    try { await axios.delete(`${API}/api/assignments/${id}`, { headers: hdrs() }); fetchAll(); }
    catch (err) { alert(err.response?.data?.message || err.message); }
  };

  const toggleText = (id) => {
    setForm(f => ({
      ...f,
      textIds: f.textIds.includes(id) ? f.textIds.filter(x => x !== id) : [...f.textIds, id]
    }));
  };

  const inputStyle = { fontFamily: 'var(--font-body)', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.95rem', background: 'var(--paper-light)', color: 'var(--ink)', width: '100%', boxSizing: 'border-box', outline: 'none' };

  const isOverdue = (dl) => dl && new Date(dl) < new Date();
  const daysLeft = (dl) => {
    if (!dl) return null;
    const diff = Math.ceil((new Date(dl) - new Date()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '5rem', fontFamily: 'var(--font-body)', color: 'var(--ink-muted)' }}>Yuklanmoqda...</div>;

  return (
    <div style={{ minHeight: '100vh', padding: '2rem 1.5rem' }}>
      <div className="container" style={{ maxWidth: '780px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: '0.5rem' }}>📚 Topshiriqlar</h1>
        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--ink-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>O'qituvchilar matn o'qish topshiriqlari beradi, o'quvchilar bajaradi.</p>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '2px solid var(--border)', marginBottom: '2rem' }}>
          {[
            { id: 'mine', label: `📋 Mening topshiriqlarim (${mine.length})` },
            { id: 'teaching', label: `👩‍🏫 Bergan topshiriqlarim (${teaching.length})` },
            ...(classes.length > 0 ? [{ id: 'create', label: '+ Topshiriq berish' }] : []),
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ fontFamily: 'var(--font-body)', background: 'none', border: 'none', padding: '10px 16px', cursor: 'pointer', fontSize: '0.85rem', color: tab === t.id ? 'var(--forest-deep)' : 'var(--ink-muted)', fontWeight: tab === t.id ? 600 : 400, borderBottom: tab === t.id ? '2px solid var(--forest-deep)' : '2px solid transparent', marginBottom: '-2px', whiteSpace: 'nowrap' }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* My assignments (as student) */}
        {tab === 'mine' && (
          <div>
            {mine.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', fontFamily: 'var(--font-body)', color: 'var(--ink-muted)' }}>
                <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</p>
                <p>Hozircha topshiriq yo'q. Sinfga qo'shiling yoki o'qituvchingiz topshiriq beradi.</p>
                <Link to="/sinflar" style={{ display: 'inline-block', marginTop: '1rem', fontFamily: 'var(--font-body)', background: 'var(--forest)', color: 'white', textDecoration: 'none', padding: '10px 24px', borderRadius: '8px' }}>Sinfga qo'shilish</Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {mine.map(a => {
                  const dl = daysLeft(a.deadline);
                  const over = isOverdue(a.deadline);
                  const completedCount = a.texts?.filter(t => isRead(t._id)).length || 0;
                  const total = a.texts?.length || 0;
                  const pct = total ? Math.round((completedCount / total) * 100) : 0;
                  return (
                    <div key={a._id} style={{ background: 'var(--paper-light)', border: `1px solid ${over ? '#e8b4b4' : 'var(--border-soft)'}`, borderRadius: '12px', padding: '1.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <div>
                          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--forest-deep)', marginBottom: '0.2rem' }}>{a.title}</h3>
                          <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--ink-muted)' }}>
                            Sinf: {a.classId?.name}
                            {a.deadline && (
                              <span style={{ marginLeft: '0.75rem', color: over ? '#c0392b' : dl <= 2 ? '#e67e22' : 'var(--ink-muted)', fontWeight: over || dl <= 2 ? 600 : 400 }}>
                                {over ? '⚠ Muddat o\'tdi' : dl === 0 ? '⚡ Bugun' : `${dl} kun qoldi`}
                              </span>
                            )}
                          </div>
                        </div>
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', padding: '4px 12px', borderRadius: '20px', background: pct === 100 ? '#eafaf1' : '#fff9e6', color: pct === 100 ? '#155724' : '#856404', fontWeight: 600 }}>
                          {pct === 100 ? '✓ Bajarildi' : `${completedCount}/${total} bajarildi`}
                        </span>
                      </div>
                      {/* Progress bar */}
                      <div style={{ height: '6px', background: 'var(--border)', borderRadius: '3px', marginBottom: '0.75rem', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: pct === 100 ? '#27ae60' : 'var(--forest)', borderRadius: '3px', transition: 'width 0.4s' }} />
                      </div>
                      {a.note && <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--ink-soft)', marginBottom: '0.75rem', fontStyle: 'italic' }}>📝 {a.note}</p>}
                      {/* Texts */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {a.texts?.map(t => (
                          <Link key={t._id} to={`/sinf/${t.grade}/chorak/${t.quarter}/matn/${t._id}`} style={{ textDecoration: 'none' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '8px 12px', background: isRead(t._id) ? '#eafaf1' : 'var(--paper-dark)', borderRadius: '7px', border: `1px solid ${isRead(t._id) ? '#b7dfcb' : 'var(--border-soft)'}` }}>
                              <span style={{ color: isRead(t._id) ? '#27ae60' : 'var(--ink-muted)', fontSize: '1rem' }}>{isRead(t._id) ? '✓' : '○'}</span>
                              <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.88rem', color: 'var(--forest-deep)', flex: 1 }}>{t.title}</span>
                              <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--ink-muted)' }}>{t.grade}-sinf</span>
                              {!isRead(t._id) && <span style={{ fontSize: '0.75rem', color: 'var(--forest)' }}>O'qish →</span>}
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Teaching assignments */}
        {tab === 'teaching' && (
          <div>
            {teaching.length === 0 ? (
              <p style={{ fontFamily: 'var(--font-body)', color: 'var(--ink-muted)', textAlign: 'center', padding: '3rem 0', fontStyle: 'italic' }}>Hali topshiriq bermadingiz.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {teaching.map(a => (
                  <div key={a._id} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', background: 'var(--paper-light)', border: '1px solid var(--border-soft)', borderRadius: '10px', padding: '1rem 1.5rem', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--forest-deep)', marginBottom: '0.2rem' }}>{a.title}</div>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--ink-muted)' }}>
                        {a.classId?.name} • {a.texts?.length} ta matn
                        {a.deadline && ` • ${new Date(a.deadline).toLocaleDateString('uz-UZ')}`}
                      </div>
                    </div>
                    <button onClick={() => deleteAssignment(a._id)} style={{ fontFamily: 'var(--font-body)', background: 'none', border: '1px solid #e8b4b4', padding: '5px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.78rem', color: '#c0392b' }}>O'chirish</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Create assignment */}
        {tab === 'create' && (
          <div>
            <form onSubmit={createAssignment} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '600px' }}>
              <input style={inputStyle} placeholder="Topshiriq sarlavhasi *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
              <select style={inputStyle} value={form.classId} onChange={e => setForm({ ...form, classId: e.target.value })} required>
                <option value="">— Sinf tanlang *</option>
                {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
              <input style={inputStyle} type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} placeholder="Muddat (ixtiyoriy)" />
              <textarea style={{ ...inputStyle, height: '70px', resize: 'vertical' }} placeholder="Izoh (ixtiyoriy)" value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} />

              {/* Text picker */}
              <div>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.88rem', color: 'var(--ink-soft)', marginBottom: '0.5rem', fontWeight: 600 }}>
                  Matnlar tanlang ({form.textIds.length} tanlandi) *
                </p>
                <div style={{ maxHeight: '240px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.5rem' }}>
                  {[1,2,3,4].map(g => {
                    const gradeTexts = texts.filter(t => t.grade === g);
                    if (!gradeTexts.length) return null;
                    return (
                      <div key={g}>
                        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--ink-muted)', fontWeight: 600, padding: '4px 8px', marginBottom: '2px' }}>{g}-sinf</p>
                        {gradeTexts.map(t => (
                          <label key={t._id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', borderRadius: '6px', cursor: 'pointer', background: form.textIds.includes(t._id) ? '#eafaf1' : 'transparent' }}>
                            <input type="checkbox" checked={form.textIds.includes(t._id)} onChange={() => toggleText(t._id)} style={{ accentColor: 'var(--forest)' }} />
                            <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.88rem', color: 'var(--ink)' }}>{t.title}</span>
                            <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.74rem', color: 'var(--ink-muted)', marginLeft: 'auto' }}>{t.quarter}-chorak</span>
                          </label>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>

              <button type="submit" disabled={creating} style={{ fontFamily: 'var(--font-body)', background: 'var(--forest)', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', cursor: creating ? 'not-allowed' : 'pointer', fontSize: '1rem', fontWeight: 500, opacity: creating ? 0.7 : 1 }}>
                {creating ? 'Saqlanmoqda...' : 'Topshiriq berish'}
              </button>
            </form>
          </div>
        )}

        <div style={{ marginTop: '3rem' }}>
          <button onClick={() => navigate('/')} style={{ fontFamily: 'var(--font-body)', background: 'none', border: '1px solid var(--border)', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', color: 'var(--ink-soft)', fontSize: '0.9rem' }}>← Bosh sahifaga qaytish</button>
        </div>
      </div>
    </div>
  );
}

export default Assignments;

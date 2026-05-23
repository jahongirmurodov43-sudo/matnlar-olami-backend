import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = import.meta.env.VITE_API_BASE_URL;
const hdrs = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

function Classes({ user }) {
  const navigate = useNavigate();
  const isTeacher = user?.role === 'teacher' || user?.role === 'admin';

  const [teaching, setTeaching] = useState([]);
  const [enrolled, setEnrolled] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(isTeacher ? 'my' : 'enrolled');

  // Create class form (teacher)
  const [newName, setNewName] = useState('');
  const [newGrade, setNewGrade] = useState('');
  const [creating, setCreating] = useState(false);

  // Join class (student)
  const [joinCode, setJoinCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [joinErr, setJoinErr] = useState('');
  const [joinOk, setJoinOk] = useState('');

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchClasses();
  }, [user]);

  const fetchClasses = async () => {
    try {
      const res = await axios.get(`${API}/api/classes/mine`, { headers: hdrs() });
      setTeaching(res.data.teaching || []);
      setEnrolled(res.data.enrolled || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const createClass = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      await axios.post(`${API}/api/classes`, { name: newName, grade: newGrade ? Number(newGrade) : undefined }, { headers: hdrs() });
      setNewName(''); setNewGrade('');
      fetchClasses();
      setTab('my');
    } catch (err) { alert(err.response?.data?.message || err.message); }
    finally { setCreating(false); }
  };

  const deleteClass = async (id) => {
    if (!confirm('Sinfni o\'chirishni tasdiqlaysizmi?')) return;
    try { await axios.delete(`${API}/api/classes/${id}`, { headers: hdrs() }); fetchClasses(); }
    catch (err) { alert(err.response?.data?.message || err.message); }
  };

  const removeStudent = async (classId, studentId) => {
    try { await axios.delete(`${API}/api/classes/${classId}/students/${studentId}`, { headers: hdrs() }); fetchClasses(); }
    catch (err) { alert(err.response?.data?.message || err.message); }
  };

  const leaveClass = async (id) => {
    if (!confirm('Sinfdan chiqmoqchimisiz?')) return;
    try { await axios.delete(`${API}/api/classes/${id}/leave`, { headers: hdrs() }); fetchClasses(); }
    catch (err) { alert(err.response?.data?.message || err.message); }
  };

  const joinClass = async (e) => {
    e.preventDefault();
    setJoinErr(''); setJoinOk(''); setJoining(true);
    try {
      const res = await axios.post(`${API}/api/classes/join`, { code: joinCode }, { headers: hdrs() });
      setJoinOk(`"${res.data.name}" sinfiga muvaffaqiyatli qo'shildingiz!`);
      setJoinCode('');
      fetchClasses();
      setTab('enrolled');
    } catch (err) { setJoinErr(err.response?.data?.message || err.message); }
    finally { setJoining(false); }
  };

  const inp = { fontFamily: 'var(--font-body)', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.95rem', background: 'var(--paper-light)', color: 'var(--ink)', outline: 'none', width: '100%', boxSizing: 'border-box' };

  if (loading) return <div style={{ textAlign: 'center', padding: '5rem', fontFamily: 'var(--font-body)', color: 'var(--ink-muted)' }}>Yuklanmoqda...</div>;

  // ---------- TEACHER VIEW ----------
  if (isTeacher) return (
    <div style={{ minHeight: '100vh', padding: '2rem 1.5rem' }}>
      <div className="container" style={{ maxWidth: '760px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: '0.3rem' }}>🏫 Mening sinflarim</h1>
        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--ink-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
          Sinf yarating, o'quvchilarga kod ulashing.
        </p>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '2px solid var(--border)', marginBottom: '2rem' }}>
          {[
            { id: 'my', label: `📋 Sinflarim (${teaching.length})` },
            { id: 'create', label: '+ Yangi sinf' },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ fontFamily: 'var(--font-body)', background: 'none', border: 'none', padding: '10px 20px', cursor: 'pointer', fontSize: '0.9rem', color: tab === t.id ? 'var(--forest-deep)' : 'var(--ink-muted)', fontWeight: tab === t.id ? 600 : 400, borderBottom: tab === t.id ? '2px solid var(--forest-deep)' : '2px solid transparent', marginBottom: '-2px' }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* My classes */}
        {tab === 'my' && (
          teaching.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', fontFamily: 'var(--font-body)', color: 'var(--ink-muted)' }}>
              <p style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>📭</p>
              <p style={{ marginBottom: '1.25rem' }}>Hali sinf yaratmadingiz.</p>
              <button onClick={() => setTab('create')} style={{ fontFamily: 'var(--font-body)', background: 'var(--forest)', color: 'white', border: 'none', padding: '11px 28px', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>
                + Sinf yaratish
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {teaching.map(cls => (
                <div key={cls._id} style={{ background: 'var(--paper-light)', border: '1px solid var(--border-soft)', borderRadius: '12px', padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--forest-deep)', marginBottom: '0.2rem' }}>{cls.name}</h3>
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--ink-muted)' }}>
                        {cls.grade ? `${cls.grade}-sinf • ` : ''}{cls.students?.length || 0} ta o'quvchi
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      <div
                        title="O'quvchilarga shu kodni bering"
                        style={{ fontFamily: 'monospace', fontSize: '1.05rem', fontWeight: 700, background: 'var(--forest)', color: 'white', padding: '6px 16px', borderRadius: '8px', letterSpacing: '0.12em', cursor: 'pointer' }}
                        onClick={() => { navigator.clipboard?.writeText(cls.joinCode); }}
                      >
                        🔑 {cls.joinCode}
                      </div>
                      <button onClick={() => deleteClass(cls._id)} style={{ fontFamily: 'var(--font-body)', background: 'none', border: '1px solid #e8b4b4', padding: '6px 12px', borderRadius: '7px', cursor: 'pointer', fontSize: '0.8rem', color: '#c0392b' }}>O'chirish</button>
                    </div>
                  </div>
                  {cls.students?.length > 0 ? (
                    <div>
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--ink-muted)', marginBottom: '0.6rem', fontWeight: 600 }}>O'quvchilar:</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {cls.students.map(s => (
                          <div key={s._id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '7px 10px', background: 'var(--paper-dark)', borderRadius: '7px' }}>
                            <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--forest)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>
                              {s.name?.[0]?.toUpperCase()}
                            </span>
                            <span style={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: '0.88rem' }}>{s.name}</span>
                            <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--ink-muted)' }}>{s.email}</span>
                            <button onClick={() => removeStudent(cls._id, s._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-muted)', fontSize: '0.9rem', padding: '2px 6px' }} title="Chiqarish">✕</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--ink-muted)', fontStyle: 'italic' }}>
                      Hali o'quvchi yo'q. Kodni ulashing: <strong>{cls.joinCode}</strong>
                    </p>
                  )}
                </div>
              ))}
            </div>
          )
        )}

        {/* Create class */}
        {tab === 'create' && (
          <div style={{ maxWidth: '480px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', marginBottom: '1.25rem' }}>Yangi sinf yaratish</h2>
            <form onSubmit={createClass} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input style={inp} placeholder="Sinf nomi (masalan: 2A)" value={newName} onChange={e => setNewName(e.target.value)} required />
              <select style={inp} value={newGrade} onChange={e => setNewGrade(e.target.value)}>
                <option value="">— Sinf darajasi (ixtiyoriy) —</option>
                {[1,2,3,4].map(g => <option key={g} value={g}>{g}-sinf</option>)}
              </select>
              <button type="submit" disabled={creating} style={{ fontFamily: 'var(--font-body)', background: 'var(--forest)', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', cursor: creating ? 'not-allowed' : 'pointer', fontSize: '1rem', fontWeight: 500, opacity: creating ? 0.7 : 1 }}>
                {creating ? 'Yaratilmoqda...' : 'Sinf yaratish'}
              </button>
            </form>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--ink-muted)', marginTop: '1rem' }}>
              Sinf yaratilganda avtomatik <strong>6 ta belgili kod</strong> beriladi. O'quvchilar shu kod orqali qo'shiladi.
            </p>
          </div>
        )}

        <div style={{ marginTop: '3rem' }}>
          <button onClick={() => navigate('/')} style={{ fontFamily: 'var(--font-body)', background: 'none', border: '1px solid var(--border)', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', color: 'var(--ink-soft)', fontSize: '0.9rem' }}>← Bosh sahifaga qaytish</button>
        </div>
      </div>
    </div>
  );

  // ---------- STUDENT VIEW ----------
  return (
    <div style={{ minHeight: '100vh', padding: '2rem 1.5rem' }}>
      <div className="container" style={{ maxWidth: '680px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: '0.3rem' }}>🎒 Sinfim</h1>
        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--ink-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
          O'qituvchidan kod oling va sinfga qo'shiling.
        </p>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '2px solid var(--border)', marginBottom: '2rem' }}>
          {[
            { id: 'enrolled', label: `📋 Sinflarim (${enrolled.length})` },
            { id: 'join', label: '🔑 Sinfga qo\'shilish' },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ fontFamily: 'var(--font-body)', background: 'none', border: 'none', padding: '10px 20px', cursor: 'pointer', fontSize: '0.9rem', color: tab === t.id ? 'var(--forest-deep)' : 'var(--ink-muted)', fontWeight: tab === t.id ? 600 : 400, borderBottom: tab === t.id ? '2px solid var(--forest-deep)' : '2px solid transparent', marginBottom: '-2px' }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Enrolled */}
        {tab === 'enrolled' && (
          enrolled.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', fontFamily: 'var(--font-body)', color: 'var(--ink-muted)' }}>
              <p style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🔑</p>
              <p style={{ marginBottom: '1.25rem' }}>Hali hech qaysi sinfga qo'shilmadingiz.</p>
              <button onClick={() => setTab('join')} style={{ fontFamily: 'var(--font-body)', background: 'var(--forest)', color: 'white', border: 'none', padding: '11px 28px', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>
                Sinfga qo'shilish
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {enrolled.map(cls => (
                <div key={cls._id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--paper-light)', border: '1px solid var(--border-soft)', borderRadius: '10px', padding: '1rem 1.5rem', flexWrap: 'wrap' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'var(--forest)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>🏫</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', color: 'var(--forest-deep)' }}>{cls.name}</div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--ink-muted)' }}>
                      O'qituvchi: {cls.teacher?.name}{cls.grade ? ` • ${cls.grade}-sinf` : ''}
                    </div>
                  </div>
                  <button onClick={() => leaveClass(cls._id)} style={{ fontFamily: 'var(--font-body)', background: 'none', border: '1px solid var(--border)', padding: '6px 14px', borderRadius: '7px', cursor: 'pointer', fontSize: '0.82rem', color: 'var(--ink-muted)' }}>Chiqish</button>
                </div>
              ))}
            </div>
          )
        )}

        {/* Join */}
        {tab === 'join' && (
          <div style={{ maxWidth: '380px', margin: '0 auto', textAlign: 'center' }}>
            <p style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🔑</p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', marginBottom: '0.5rem' }}>Sinfga qo'shilish</h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.88rem', color: 'var(--ink-muted)', marginBottom: '1.5rem' }}>
              O'qituvchingizdan 6 ta belgili kodni oling
            </p>
            <form onSubmit={joinClass} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <input
                style={{ ...inp, textTransform: 'uppercase', letterSpacing: '0.2em', fontSize: '1.4rem', fontFamily: 'monospace', textAlign: 'center', padding: '14px' }}
                placeholder="AB3F7K"
                value={joinCode}
                onChange={e => { setJoinCode(e.target.value.toUpperCase()); setJoinErr(''); setJoinOk(''); }}
                maxLength={6}
                required
              />
              {joinErr && <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.88rem', padding: '10px 14px', borderRadius: '8px', background: '#fdf3f2', border: '1px solid #c0392b', color: '#c0392b' }}>{joinErr}</div>}
              {joinOk && <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.88rem', padding: '10px 14px', borderRadius: '8px', background: '#eafaf1', border: '1px solid #27ae60', color: '#155724' }}>✓ {joinOk}</div>}
              <button type="submit" disabled={joining || joinCode.length < 6} style={{ fontFamily: 'var(--font-body)', background: 'var(--forest)', color: 'white', border: 'none', padding: '13px', borderRadius: '8px', cursor: (joining || joinCode.length < 6) ? 'not-allowed' : 'pointer', fontSize: '1rem', fontWeight: 500, opacity: (joining || joinCode.length < 6) ? 0.6 : 1 }}>
                {joining ? 'Qo\'shilmoqda...' : 'Sinfga qo\'shilish'}
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

export default Classes;

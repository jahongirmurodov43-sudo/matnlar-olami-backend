import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) { setErr('Parollar mos kelmadi'); return; }
    if (password.length < 6) { setErr('Parol kamida 6 ta belgi bo\'lishi kerak'); return; }
    setLoading(true); setMsg(''); setErr('');
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/reset-password`, { token, password });
      setMsg(res.data.message);
      setTimeout(() => navigate('/login'), 2500);
    } catch (error) {
      setErr(error.response?.data?.message || 'Xatolik yuz berdi.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', fontFamily: 'var(--font-body)', color: 'var(--ink-muted)' }}>
        <p>Havola noto'g'ri.</p>
        <Link to="/login" style={{ color: 'var(--forest)' }}>Kirish sahifasiga qaytish</Link>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔒</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', marginBottom: '0.4rem' }}>Yangi parol o'rnatish</h1>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <input
              type={showPass ? 'text' : 'password'}
              placeholder="Yangi parol (kamida 6 ta belgi)"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{ width: '100%', boxSizing: 'border-box', fontFamily: 'var(--font-body)', padding: '12px 44px 12px 16px', border: '1px solid var(--border)', borderRadius: '10px', fontSize: '1rem', background: 'var(--paper-light)', color: 'var(--ink)', outline: 'none' }}
            />
            <button type="button" onClick={() => setShowPass(v => !v)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: 'var(--ink-muted)' }}>
              {showPass ? '🙈' : '👁'}
            </button>
          </div>
          <input
            type={showPass ? 'text' : 'password'}
            placeholder="Parolni tasdiqlang"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            required
            style={{ fontFamily: 'var(--font-body)', padding: '12px 16px', border: '1px solid var(--border)', borderRadius: '10px', fontSize: '1rem', background: 'var(--paper-light)', color: 'var(--ink)', outline: 'none' }}
          />

          {err && (
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.88rem', padding: '10px 14px', borderRadius: '8px', background: '#fdf3f2', border: '1px solid #c0392b', color: '#c0392b' }}>
              {err}
            </div>
          )}
          {msg && (
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.88rem', padding: '10px 14px', borderRadius: '8px', background: '#eafaf1', border: '1px solid #27ae60', color: '#155724' }}>
              ✓ {msg} Kirish sahifasiga yo'naltirilmoqda...
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !!msg}
            style={{ fontFamily: 'var(--font-body)', background: 'var(--forest)', color: 'white', border: 'none', padding: '13px', borderRadius: '10px', cursor: (loading || !!msg) ? 'not-allowed' : 'pointer', fontSize: '1rem', fontWeight: 600, opacity: (loading || !!msg) ? 0.7 : 1 }}
          >
            {loading ? 'Saqlanmoqda...' : 'Parolni o\'zgartirish'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;

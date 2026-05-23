import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setMsg(''); setErr('');
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/forgot-password`, { email });
      setMsg(res.data.message);
    } catch (error) {
      setErr(error.response?.data?.message || 'Xatolik yuz berdi. Qayta urinib ko\'ring.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔑</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', marginBottom: '0.4rem' }}>Parolni unutdingizmi?</h1>
          <p style={{ fontFamily: 'var(--font-body)', color: 'var(--ink-muted)', fontSize: '0.9rem' }}>
            Email manzilingizni kiriting. Parolni tiklash havolasini yuboramiz.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input
            type="email"
            placeholder="Email manzilingiz"
            value={email}
            onChange={e => setEmail(e.target.value)}
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
              ✓ {msg}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ fontFamily: 'var(--font-body)', background: 'var(--forest)', color: 'white', border: 'none', padding: '13px', borderRadius: '10px', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '1rem', fontWeight: 600, opacity: loading ? 0.7 : 1, transition: 'opacity 0.2s' }}
          >
            {loading ? 'Yuborilmoqda...' : 'Havola yuborish'}
          </button>
        </form>

        <p style={{ fontFamily: 'var(--font-body)', textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--ink-muted)' }}>
          <Link to="/login" style={{ color: 'var(--forest)', textDecoration: 'none', fontWeight: 500 }}>← Kirish sahifasiga qaytish</Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;

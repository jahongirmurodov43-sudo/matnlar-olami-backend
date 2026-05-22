import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useProgress } from '../hooks/useProgress';
import { useFavorites } from '../hooks/useFavorites';

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

function Profile({ user, setUser }) {
  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const { read } = useProgress();
  const { favorites } = useFavorites();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    const token = localStorage.getItem('token');
    try {
      const body = { name };
      if (newPassword) { body.currentPassword = currentPassword; body.newPassword = newPassword; }
      const res = await axios.put(`${API_BASE_URL}/api/auth/profile`, body, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const updated = { ...user, name: res.data.user.name };
      setUser(updated);
      localStorage.setItem('user', JSON.stringify(updated));
      setMessage({ ok: true, text: 'Muvaffaqiyatli saqlandi' });
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setMessage({ ok: false, text: err.response?.data?.message || err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', padding: '2rem 1.5rem' }}>
      <div className="container" style={{ maxWidth: '560px' }}>

        <nav style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--ink-muted)', marginBottom: '1.5rem' }}>
          <Link to="/" style={{ color: 'var(--ink-muted)', textDecoration: 'none' }}>Bosh sahifa</Link>
          <span style={{ margin: '0 0.5rem' }}>/</span>
          <span>Profil</span>
        </nav>

        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', marginBottom: '2rem' }}>Profil</h1>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2.5rem' }}>
          {[
            { label: 'O\'qilgan matnlar', value: read.length, icon: '✓', color: 'var(--forest)' },
            { label: 'Sevimlilar', value: favorites.length, icon: '♥', color: '#c0392b' },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--paper-light)', border: '1px solid var(--border-soft)', borderRadius: '12px', padding: '1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{s.icon}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: s.color, fontWeight: 700 }}>{s.value}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--ink-muted)', marginTop: '0.2rem' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Edit form */}
        <div style={{ background: 'var(--paper-light)', border: '1px solid var(--border-soft)', borderRadius: '12px', padding: '1.75rem' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginBottom: '1.25rem', color: 'var(--forest-deep)' }}>Ma'lumotlarni tahrirlash</h2>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            <div>
              <label style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--ink-muted)', display: 'block', marginBottom: '4px' }}>Ism</label>
              <input style={inputStyle} type="text" value={name} onChange={e => setName(e.target.value)} required />
            </div>

            <div>
              <label style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--ink-muted)', display: 'block', marginBottom: '4px' }}>Email</label>
              <input style={{ ...inputStyle, opacity: 0.6, cursor: 'not-allowed' }} type="email" value={user?.email || ''} disabled />
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '0.25rem 0' }} />
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--ink-muted)', margin: 0 }}>Parolni o'zgartirish (ixtiyoriy)</p>

            <div>
              <label style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--ink-muted)', display: 'block', marginBottom: '4px' }}>Joriy parol</label>
              <input style={inputStyle} type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Hozirgi parol" />
            </div>
            <div>
              <label style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--ink-muted)', display: 'block', marginBottom: '4px' }}>Yangi parol</label>
              <input style={inputStyle} type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Kamida 6 ta belgi" minLength={newPassword ? 6 : undefined} />
            </div>

            {message && (
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.875rem', padding: '10px 14px', borderRadius: '8px', background: message.ok ? '#eafaf1' : '#fdf3f2', border: `1px solid ${message.ok ? '#27ae60' : '#c0392b'}`, color: message.ok ? '#27ae60' : '#c0392b' }}>
                {message.text}
              </div>
            )}

            <button type="submit" disabled={saving} style={{ fontFamily: 'var(--font-body)', background: 'var(--forest)', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', cursor: saving ? 'not-allowed' : 'pointer', fontSize: '0.95rem', fontWeight: 500, opacity: saving ? 0.7 : 1, marginTop: '0.25rem' }}>
              {saving ? 'Saqlanmoqda...' : 'Saqlash'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Profile;

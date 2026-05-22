import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post(`${API_BASE_URL}/api/auth/register`, form);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Ro\'yxatdan o\'tishda xatolik.');
    } finally {
      setLoading(false);
    }
  };

  const field = (label, type, key, placeholder) => (
    <div>
      <label style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--ink-soft)', display: 'block', marginBottom: '0.4rem' }}>
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        required
        value={form[key]}
        onChange={e => setForm({ ...form, [key]: e.target.value })}
        style={{ width: '100%', padding: '12px 14px', border: '1px solid var(--border)', borderRadius: '8px', fontFamily: 'var(--font-body)', fontSize: '0.95rem', background: 'white', boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.2s' }}
        onFocus={e => e.target.style.borderColor = 'var(--forest)'}
        onBlur={e => e.target.style.borderColor = 'var(--border)'}
      />
    </div>
  );

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>

        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📖</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: '0.4rem' }}>Ro'yxatdan o'tish</h1>
          <p style={{ fontFamily: 'var(--font-body)', color: 'var(--ink-muted)', fontSize: '0.95rem' }}>
            Yangi hisob yaratish
          </p>
        </div>

        <div className="card" style={{ padding: '2.5rem' }}>
          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '12px 16px', marginBottom: '1.5rem', fontFamily: 'var(--font-body)', color: '#b91c1c', fontSize: '0.9rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {field('Ism Familiya', 'text', 'name', 'Jahongir Murodov')}
            {field('Email', 'email', 'email', 'misol@email.com')}
            {field('Parol', 'password', 'password', '••••••••')}

            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', padding: '13px', background: loading ? 'var(--ink-muted)' : 'var(--forest)', color: 'white', border: 'none', borderRadius: '8px', fontFamily: 'var(--font-body)', fontSize: '1rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', marginTop: '0.5rem', transition: 'background 0.2s' }}
            >
              {loading ? 'Saqlanmoqda...' : 'Ro\'yxatdan o\'tish'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', fontFamily: 'var(--font-body)', color: 'var(--ink-muted)', fontSize: '0.9rem', marginTop: '1.5rem' }}>
          Allaqachon ro'yxatdanmisiz?{' '}
          <Link to="/login" style={{ color: 'var(--forest)', fontWeight: 600, textDecoration: 'none' }}>
            Kirish
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const [showPassword, setShowPassword] = useState(false);
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

        <button onClick={() => navigate(-1)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-body)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-muted)', fontSize: '0.88rem', marginBottom: '1.5rem', padding: 0 }}>
          ← Orqaga
        </button>

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
            <div>
              <label style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--ink-soft)', display: 'block', marginBottom: '0.4rem' }}>
                Parol
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  required
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  style={{ width: '100%', padding: '12px 44px 12px 14px', border: '1px solid var(--border)', borderRadius: '8px', fontFamily: 'var(--font-body)', fontSize: '0.95rem', background: 'white', boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.2s' }}
                  onFocus={e => e.target.style.borderColor = 'var(--forest)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-muted)', fontSize: '1rem', padding: '2px', lineHeight: 1 }}
                  tabIndex={-1}
                >
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            {/* Role selector */}
            <div>
              <label style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--ink-soft)', display: 'block', marginBottom: '0.6rem' }}>
                Men kim sifatida ro'yxatdan o'taman?
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {[
                  { value: 'student', icon: '🎓', title: 'O\'quvchi', desc: 'Matn o\'qiyman va topshiriq bajaraman' },
                  { value: 'teacher', icon: '👩‍🏫', title: 'O\'qituvchi', desc: 'Sinf yarataman va topshiriq beraman' },
                ].map(r => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, role: r.value }))}
                    style={{
                      padding: '1rem 0.75rem',
                      border: `2px solid ${form.role === r.value ? 'var(--forest)' : 'var(--border)'}`,
                      borderRadius: '10px',
                      background: form.role === r.value ? '#eaf4e8' : 'white',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ fontSize: '1.8rem', marginBottom: '0.35rem' }}>{r.icon}</div>
                    <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.9rem', color: form.role === r.value ? 'var(--forest-deep)' : 'var(--ink)', marginBottom: '0.2rem' }}>{r.title}</div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--ink-muted)', lineHeight: 1.4 }}>{r.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', padding: '13px', background: loading ? 'var(--ink-muted)' : 'var(--forest)', color: 'white', border: 'none', borderRadius: '8px', fontFamily: 'var(--font-body)', fontSize: '1rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', marginTop: '0.5rem', transition: 'background 0.2s' }}
            >
              {loading ? 'Saqlanmoqda...' : `${form.role === 'teacher' ? '👩‍🏫' : '🎓'} Ro'yxatdan o'tish`}
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

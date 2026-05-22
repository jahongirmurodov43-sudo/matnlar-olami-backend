import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';

function Home({ user }) {
  const [counts, setCounts] = useState({ 1: 0, 2: 0, 3: 0, 4: 0 });
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    if (!user) return;
    axios.get(`${API_BASE_URL}/api/texts`)
      .then(res => {
        const c = { 1: 0, 2: 0, 3: 0, 4: 0 };
        res.data.forEach(t => { if (c[t.grade] !== undefined) c[t.grade]++; });
        setCounts(c);
      })
      .catch(() => {});
  }, [user, API_BASE_URL]);
  // ── Logged-in view ──────────────────────────────────────────
  if (user) {
    return (
      <div style={{ minHeight: '100vh' }}>
        <section className="fade-in" style={{ textAlign: 'center', padding: '4rem 1.5rem 3rem' }}>
          <p style={{ fontFamily: 'var(--font-body)', color: 'var(--ink-muted)', letterSpacing: '0.12em', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
            ✦ O'qish darslari uchun ✦
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 7vw, 4.5rem)', fontWeight: 700, lineHeight: 1.1, marginBottom: '0.75rem' }}>
            Matnlar <em style={{ fontStyle: 'italic', fontWeight: 400 }}>Olami</em>
          </h1>
          <div style={{ width: '50px', height: '2px', background: 'var(--forest)', margin: '0 auto 1.25rem' }} />
          <p style={{ fontFamily: 'var(--font-body)', color: 'var(--ink-soft)', maxWidth: '520px', margin: '0 auto', fontSize: '1rem', lineHeight: 1.8 }}>
            Xush kelibsiz, <strong>{user.name}</strong>. Quyidagi sinflardan birini tanlang.
          </p>
        </section>

        <section style={{ padding: '0 1.5rem 5rem' }}>
          <div className="container">
            <h2 style={{ textAlign: 'center', fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: '0.4rem' }}>
              Sinfni tanlang
            </h2>
            <p style={{ textAlign: 'center', fontFamily: 'var(--font-body)', color: 'var(--ink-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>
              Choraklar va matnlar ichkariga keltiradi
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem' }}>
              {[1, 2, 3, 4].map(grade => (
                <Link key={grade} to={`/sinf/${grade}`} style={{ textDecoration: 'none' }}>
                  <div className="card" style={{ textAlign: 'center', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(42,38,32,0.13)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
                  >
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 700, color: 'var(--forest-deep)', lineHeight: 1 }}>{grade}</div>
                    <div style={{ fontFamily: 'var(--font-body)', color: 'var(--ink-muted)', fontSize: '0.82rem', marginTop: '0.2rem' }}>{grade}-sinf</div>
                    <div style={{ fontFamily: 'var(--font-body)', color: 'var(--forest)', fontSize: '0.88rem', marginTop: '0.6rem', fontWeight: 500 }}>{counts[grade]} ta matn</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  // ── Landing page for guests ──────────────────────────────────
  return (
    <div style={{ minHeight: '100vh' }}>

      {/* Hero */}
      <section className="fade-in" style={{ textAlign: 'center', padding: '6rem 1.5rem 5rem' }}>
        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--ink-muted)', letterSpacing: '0.15em', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
          ✦ Boshlang'ich sinflar uchun ✦
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(3rem, 8vw, 5rem)', fontWeight: 700, lineHeight: 1.1, marginBottom: '1rem' }}>
          Matnlar <em style={{ fontStyle: 'italic', fontWeight: 400 }}>Olami</em>
        </h1>
        <div style={{ width: '60px', height: '2px', background: 'var(--forest)', margin: '0 auto 1.75rem' }} />
        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--ink-soft)', maxWidth: '540px', margin: '0 auto 3rem', fontSize: '1.05rem', lineHeight: 1.9 }}>
          Boshlang'ich sinflar o'qish darsligi bo'yicha matnlar va namunaviy savollar to'plami. O'qituvchilar uchun qulay, sinflar va choraklar bo'yicha tartiblangan kutubxona.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/login" style={{ fontFamily: 'var(--font-body)', background: 'var(--forest)', color: 'white', padding: '14px 36px', borderRadius: '8px', textDecoration: 'none', fontSize: '1rem', fontWeight: 600 }}>
            Kirish
          </Link>
          <Link to="/register" style={{ fontFamily: 'var(--font-body)', background: 'transparent', color: 'var(--forest)', padding: '14px 36px', borderRadius: '8px', textDecoration: 'none', fontSize: '1rem', fontWeight: 600, border: '2px solid var(--forest)' }}>
            Ro'yxatdan o'tish
          </Link>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '0 1.5rem 5rem' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
            {[
              { icon: '📚', title: '4 ta sinf', desc: '1-sinfdan 4-sinfgacha barcha matnlar bir joyda' },
              { icon: '📅', title: '4 ta chorak', desc: 'Har bir sinf choraklar bo\'yicha tartiblab berilgan' },
              { icon: '❓', title: 'Namunaviy savollar', desc: 'Har bir matnga o\'qishni tekshirish uchun savollar' },
              { icon: '🔊', title: 'Audio tinglash', desc: 'Matnlarni ovoz chiqarib tinglash imkoniyati' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{icon}</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>{title}</h3>
                <p style={{ fontFamily: 'var(--font-body)', color: 'var(--ink-muted)', fontSize: '0.88rem', lineHeight: 1.7 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'var(--forest)', color: 'white', padding: '4rem 1.5rem', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '560px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', color: 'white', fontSize: '1.8rem', marginBottom: '1rem' }}>
            Boshlashga tayyormisiz?
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', color: 'rgba(255,255,255,0.85)', lineHeight: 1.8, marginBottom: '2rem' }}>
            Bepul ro'yxatdan o'ting va barcha sinf matnlariga kirish imkoniyatiga ega bo'ling.
          </p>
          <Link to="/register" style={{ display: 'inline-block', background: 'white', color: 'var(--forest-deep)', fontFamily: 'var(--font-body)', fontWeight: 700, padding: '13px 36px', borderRadius: '8px', textDecoration: 'none', fontSize: '1rem' }}>
            Bepul ro'yxatdan o'tish
          </Link>
        </div>
      </section>

    </div>
  );
}

export default Home;

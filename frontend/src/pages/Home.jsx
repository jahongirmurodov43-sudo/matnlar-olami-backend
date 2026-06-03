import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useStreak } from '../hooks/useStreak';
import { useProgress } from '../hooks/useProgress';
import { useFavorites } from '../hooks/useFavorites';
import { useBadges } from '../hooks/useBadges';

function CreatorsSection({ apiBase }) {
  const [creators, setCreators] = useState([]);

  useEffect(() => {
    axios.get(`${apiBase}/api/creators`).then(res => setCreators(res.data)).catch(() => {});
  }, [apiBase]);

  if (creators.length === 0) return null;

  return (
    <section style={{ padding: '4rem 1.5rem 5rem', borderTop: '1px solid var(--border-soft)' }}>
      <div className="container" style={{ maxWidth: '900px' }}>
        <p style={{ textAlign: 'center', fontFamily: 'var(--font-body)', color: 'var(--ink-muted)', letterSpacing: '0.12em', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.75rem' }}>✦ Jamoa ✦</p>
        <h2 style={{ textAlign: 'center', fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: '0.5rem' }}>Yaratuvchilar</h2>
        <div style={{ width: '40px', height: '2px', background: 'var(--forest)', margin: '0 auto 3rem' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
          {creators.map(c => (
            <div key={c._id} className="card" style={{ textAlign: 'center' }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'var(--paper-dark)', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', overflow: 'hidden' }}>
                {c.avatar && (c.avatar.startsWith('http') || c.avatar.startsWith('data:')) ? (
                  <img src={c.avatar} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  c.avatar || '👤'
                )}
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: '0.25rem', color: 'var(--forest-deep)' }}>{c.name}</h3>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--forest)', fontWeight: 600, marginBottom: c.bio ? '0.6rem' : 0 }}>{c.role}</p>
              {c.bio && <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--ink-muted)', lineHeight: 1.7 }}>{c.bio}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Home({ user }) {
  const [counts, setCounts] = useState({ 1: 0, 2: 0, 3: 0, 4: 0 });
  const { streak, todayRead } = useStreak();
  const { read } = useProgress();
  const { favorites } = useFavorites();
  const { earned } = useBadges(read, streak, favorites.length);
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
          <p style={{ fontFamily: 'var(--font-body)', color: 'var(--forest)', letterSpacing: '0.12em', fontSize: '0.78rem', textTransform: 'uppercase', marginBottom: '1.25rem', fontWeight: 500 }}>
            ✦ O'qish savodxonligi darslarida matn ustida ishlash ✦
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 800, lineHeight: 1.15, marginBottom: '0.75rem', maxWidth: '640px', margin: '0 auto 0.75rem' }}>
            O'qish savodxonligi darslarida matn ustida ishlash
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', margin: '0 auto 1.25rem' }}>
            <span style={{ fontSize: '0.5rem', color: 'var(--forest)' }}>●</span>
            <div style={{ width: '40px', height: '2px', background: 'var(--forest)' }} />
            <span style={{ fontSize: '0.5rem', color: 'var(--forest)' }}>●</span>
          </div>
          <p style={{ fontFamily: 'var(--font-body)', color: 'var(--ink-soft)', maxWidth: '520px', margin: '0 auto', fontSize: '1rem', lineHeight: 1.8 }}>
            Xush kelibsiz, <strong>{user.name}</strong>. Quyidagi sinflardan birini tanlang.
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '1.5rem' }}>
            {streak > 0 && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: todayRead ? '#fff8e1' : 'var(--paper-light)', border: `1px solid ${todayRead ? '#f59e0b' : 'var(--border)'}`, borderRadius: '50px', padding: '8px 20px' }}>
                <span style={{ fontSize: '1.1rem' }}>🔥</span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: todayRead ? '#b45309' : 'var(--ink-muted)', fontWeight: 600 }}>
                  {streak} kunlik streak
                </span>
                {!todayRead && <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--ink-muted)' }}>— bugun o'qing!</span>}
              </div>
            )}
            {earned.length > 0 && (
              <Link to="/yutuqlar" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--paper-light)', border: '1px solid var(--border)', borderRadius: '50px', padding: '8px 20px', textDecoration: 'none' }}>
                <span style={{ fontSize: '1.1rem' }}>{earned[earned.length - 1].icon}</span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'var(--forest)', fontWeight: 600 }}>{earned.length} ta yutuq</span>
              </Link>
            )}
          </div>
        </section>

        <section style={{ padding: '0 1.5rem 4rem' }}>
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

        <CreatorsSection apiBase={API_BASE_URL} />
      </div>
    );
  }

  // ── Landing page for guests ──────────────────────────────────
  return (
    <div style={{ minHeight: '100vh' }}>

      {/* Hero */}
      <section className="fade-in" style={{ textAlign: 'center', padding: '6rem 1.5rem 5rem' }}>
        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--forest)', letterSpacing: '0.15em', fontSize: '0.78rem', textTransform: 'uppercase', marginBottom: '1.5rem', fontWeight: 500 }}>
          ✦ O'qish savodxonligi darslarida matn ustida ishlash ✦
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.2rem, 6vw, 4rem)', fontWeight: 800, lineHeight: 1.15, marginBottom: '1.25rem', maxWidth: '720px', margin: '0 auto 1.25rem' }}>
          O'qish savodxonligi darslarida matn ustida ishlash
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', margin: '0 auto 1.75rem' }}>
          <span style={{ fontSize: '0.5rem', color: 'var(--forest)' }}>●</span>
          <div style={{ width: '60px', height: '2px', background: 'var(--forest)' }} />
          <span style={{ fontSize: '0.5rem', color: 'var(--forest)' }}>●</span>
        </div>
        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--ink-soft)', maxWidth: '580px', margin: '0 auto 3rem', fontSize: '1.05rem', lineHeight: 1.9 }}>
          Boshlang'ich sinf o'qish savodxonligi darslarida matn ustida ishlash va tanqidiy fikrlashga yo'naltiruvchi savollar to'plami. O'qituvchilar uchun qulay, sinflar va choraklar bo'yicha tartiblangan kutubxona.
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

      {/* Creators */}
      <CreatorsSection apiBase={API_BASE_URL} />

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

import { Link } from 'react-router-dom';

const grades = [
  { grade: 1, texts: 7 },
  { grade: 2, texts: 8 },
  { grade: 3, texts: 7 },
  { grade: 4, texts: 9 },
];

function Home() {
  return (
    <div style={{ minHeight: '100vh' }}>

      {/* Hero */}
      <section className="fade-in" style={{ textAlign: 'center', padding: '5rem 1.5rem 4rem' }}>
        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--ink-muted)', letterSpacing: '0.12em', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
          ✦ O'qish darslari uchun ✦
        </p>

        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(3rem, 8vw, 5rem)', fontWeight: 700, lineHeight: 1.1, marginBottom: '1rem' }}>
          Matnlar <em style={{ fontStyle: 'italic', fontWeight: 400 }}>Olami</em>
        </h1>

        <div style={{ width: '60px', height: '2px', background: 'var(--forest)', margin: '0 auto 1.5rem' }} />

        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--ink-soft)', maxWidth: '560px', margin: '0 auto 2.5rem', fontSize: '1.05rem', lineHeight: 1.8 }}>
          Boshlang'ich sinflar o'qish darsligi bo'yicha matnlar va ularga oid namunaviy savollar to'plami. O'qituvchilar uchun qulay, sinflar va choraklar bo'yicha tartiblangan kutubxona.
        </p>
      </section>

      {/* Grade cards */}
      <section style={{ padding: '0 1.5rem 5rem' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', fontFamily: 'var(--font-display)', fontSize: '1.6rem', marginBottom: '0.5rem' }}>
            Sinfni tanlang
          </h2>
          <p style={{ textAlign: 'center', fontFamily: 'var(--font-body)', color: 'var(--ink-muted)', marginBottom: '2.5rem', fontSize: '0.95rem' }}>
            Quyidagi sinflardan birini bosing — choraklar va matnlar ichkariga keltiradi
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem' }}>
            {grades.map(({ grade, texts }) => (
              <Link
                key={grade}
                to={`/sinf/${grade}`}
                style={{ textDecoration: 'none' }}
              >
                <div className="card" style={{ textAlign: 'center', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(42,38,32,0.14)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
                >
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 700, color: 'var(--forest-deep)', lineHeight: 1 }}>
                    {grade}
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', color: 'var(--ink-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                    {grade}-sinf
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', color: 'var(--forest)', fontSize: '0.9rem', marginTop: '0.75rem', fontWeight: 500 }}>
                    {texts} ta matn
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Teacher section */}
      <section style={{ background: 'var(--forest)', color: 'white', padding: '4rem 1.5rem', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '600px' }}>
          <p style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>📌</p>
          <h2 style={{ fontFamily: 'var(--font-display)', color: 'white', fontSize: '1.6rem', marginBottom: '1rem' }}>
            O'qituvchilar uchun
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', color: 'rgba(255,255,255,0.85)', lineHeight: 1.8, marginBottom: '2rem' }}>
            Har bir sinf-chorakka yangi matn qo'shishingiz, mavjud matnlarni tahrirlashingiz va savollarni o'zgartirishingiz mumkin.
          </p>
          <Link to="/register" style={{
            display: 'inline-block',
            background: 'white',
            color: 'var(--forest-deep)',
            fontFamily: 'var(--font-body)',
            fontWeight: 600,
            padding: '12px 32px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontSize: '0.95rem',
          }}>
            Ro'yxatdan o'tish
          </Link>
        </div>
      </section>

    </div>
  );
}

export default Home;

import BackButton from '../components/BackButton';

function Settings() {
  return (
    <div style={{ minHeight: '100vh', padding: '3rem 1.5rem' }}>
      <div className="container" style={{ maxWidth: '560px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', marginBottom: '0.5rem' }}>
          Sozlamalar
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--ink-muted)', marginBottom: '2.5rem' }}>
          Ilova haqida ma'lumot
        </p>

        <div className="card">
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: '0.75rem' }}>
            Haqida
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', color: 'var(--ink-soft)', fontSize: '0.95rem', lineHeight: 1.8 }}>
            <strong>O'qish savodxonligi darslarida matn ustida ishlash</strong> — boshlang'ich sinf o'qish savodxonligi darslarida matn ustida ishlash va tanqidiy fikrlashga yo'naltiruvchi savollar to'plami. O'qituvchilar uchun qulay, sinflar va choraklar bo'yicha tartiblangan kutubxona.
          </p>
          <p style={{ fontFamily: 'var(--font-body)', color: 'var(--ink-muted)', fontSize: '0.82rem', marginTop: '1rem' }}>
            © 2026 O'qish savodxonligi darslarida matn ustida ishlash
          </p>
        </div>
        <BackButton to="/" label="Bosh sahifaga qaytish" />
      </div>
    </div>
  );
}

export default Settings;

import { useTranslation } from 'react-i18next';

function Settings({ lang, setLang }) {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setLang(lng);
  };

  return (
    <div style={{ minHeight: '100vh', padding: '3rem 1.5rem' }}>
      <div className="container" style={{ maxWidth: '560px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', marginBottom: '0.5rem' }}>
          Sozlamalar
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--ink-muted)', marginBottom: '2.5rem' }}>
          Ilova sozlamalari
        </p>

        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: '1rem' }}>
            Interfeys tili
          </h2>
          <div style={{ display: 'flex', gap: '1rem' }}>
            {[{ code: 'uz', label: "🇺🇿 O'zbek" }, { code: 'ru', label: '🇷🇺 Русский' }].map(({ code, label }) => (
              <button
                key={code}
                onClick={() => changeLanguage(code)}
                style={{
                  fontFamily: 'var(--font-body)',
                  padding: '10px 24px',
                  borderRadius: '8px',
                  border: lang === code ? '2px solid var(--forest)' : '2px solid var(--border)',
                  background: lang === code ? 'var(--forest)' : 'transparent',
                  color: lang === code ? 'white' : 'var(--ink)',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  fontWeight: lang === code ? 600 : 400,
                  transition: 'all 0.2s',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: '0.75rem' }}>
            Haqida
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', color: 'var(--ink-soft)', fontSize: '0.95rem', lineHeight: 1.8 }}>
            <strong>Matnlar Olami</strong> — boshlang'ich sinflar o'qish darsligi bo'yicha matnlar va namunaviy savollar to'plami. O'qituvchilar uchun qulay kutubxona.
          </p>
          <p style={{ fontFamily: 'var(--font-body)', color: 'var(--ink-muted)', fontSize: '0.82rem', marginTop: '1rem' }}>
            © 2026 Matnlar Olami
          </p>
        </div>
      </div>
    </div>
  );
}

export default Settings;

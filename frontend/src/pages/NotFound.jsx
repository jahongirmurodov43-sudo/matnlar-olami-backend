import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem' }}>
      <div style={{ textAlign: 'center', maxWidth: '480px' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1.25rem' }}>📖</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 6vw, 3.5rem)', fontWeight: 800, color: 'var(--forest-deep)', marginBottom: '0.5rem' }}>
          404
        </h1>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: 'var(--ink-soft)', marginBottom: '1rem' }}>
          Sahifa topilmadi
        </p>
        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--ink-muted)', lineHeight: 1.8, marginBottom: '2.5rem', fontSize: '0.95rem' }}>
          Siz izlagan sahifa mavjud emas yoki o'chirilgan bo'lishi mumkin.
        </p>
        <Link
          to="/"
          style={{ display: 'inline-block', background: 'var(--forest)', color: 'white', fontFamily: 'var(--font-body)', fontWeight: 600, padding: '13px 32px', borderRadius: '8px', textDecoration: 'none', fontSize: '1rem' }}
        >
          ← Bosh sahifaga qaytish
        </Link>
      </div>
    </div>
  );
}

export default NotFound;

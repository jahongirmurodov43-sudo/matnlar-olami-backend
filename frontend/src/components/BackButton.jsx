import { useNavigate } from 'react-router-dom';

function BackButton({ to, label }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (to) navigate(to);
    else navigate(-1);
  };

  return (
    <button
      onClick={handleClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        fontFamily: 'var(--font-body)',
        background: 'none',
        border: '1px solid var(--border)',
        padding: '8px 20px',
        borderRadius: '8px',
        cursor: 'pointer',
        color: 'var(--ink-soft)',
        fontSize: '0.9rem',
        marginTop: '2.5rem',
        marginBottom: '1rem',
      }}
    >
      ← {label || 'Orqaga'}
    </button>
  );
}

export default BackButton;

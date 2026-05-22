function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--border)',
      padding: '2.5rem 1.5rem',
      textAlign: 'center',
      background: 'var(--paper-dark)',
    }}>
      <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', color: 'var(--ink-soft)', marginBottom: '0.75rem', fontSize: '1rem' }}>
        "Kitob — bu eng yaxshi do'st, eng zo'r ustoz."
      </p>
      <p style={{ fontFamily: 'var(--font-body)', color: 'var(--ink-muted)', fontSize: '0.8rem' }}>
        © {new Date().getFullYear()} Matnlar Olami — boshlang'ich sinf o'qituvchilari uchun
      </p>
    </footer>
  );
}

export default Footer;

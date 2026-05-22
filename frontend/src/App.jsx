import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './i18n';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Texts from './pages/Texts';
import Admin from './pages/Admin';
import GradePage from './pages/GradePage';
import TextPage from './pages/TextPage';
import Settings from './pages/Settings';

// Redirects to /login if not authenticated
function PrivateRoute({ user, children }) {
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  const [user, setUser] = useState(null);
  const [lang, setLang] = useState('uz');
  const [ready, setReady] = useState(false);

  // Restore session from localStorage on first load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const saved = localStorage.getItem('user');
    if (token && saved) {
      try { setUser(JSON.parse(saved)); } catch {}
    }
    setReady(true);
  }, []);

  const handleSetUser = (u) => {
    setUser(u);
    if (u) localStorage.setItem('user', JSON.stringify(u));
    else { localStorage.removeItem('user'); localStorage.removeItem('token'); }
  };

  if (!ready) return null;

  return (
    <Router>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar user={user} setUser={handleSetUser} setLang={setLang} lang={lang} />

        <main style={{ flex: 1 }}>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home user={user} />} />
            <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login setUser={handleSetUser} />} />
            <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />

            {/* Protected routes */}
            <Route path="/admin" element={<PrivateRoute user={user}><Admin user={user} /></PrivateRoute>} />
            <Route path="/sinf/:grade" element={<PrivateRoute user={user}><GradePage user={user} lang={lang} /></PrivateRoute>} />
            <Route path="/sinf/:grade/chorak/:quarter/matn/:id" element={<PrivateRoute user={user}><TextPage user={user} lang={lang} /></PrivateRoute>} />
            <Route path="/sozlamalar" element={<PrivateRoute user={user}><Settings lang={lang} setLang={setLang} /></PrivateRoute>} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Admin from './pages/Admin';
import GradePage from './pages/GradePage';
import TextPage from './pages/TextPage';
import Settings from './pages/Settings';
import Search from './pages/Search';
import Favorites from './pages/Favorites';
import Profile from './pages/Profile';
import Badges from './pages/Badges';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Classes from './pages/Classes';
import Assignments from './pages/Assignments';

function PrivateRoute({ user, children }) {
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const saved = localStorage.getItem('user');
    if (token && saved) {
      try { setUser(JSON.parse(saved)); } catch {}
    }
    setReady(true);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const handleSetUser = (u) => {
    setUser(u);
    if (u) localStorage.setItem('user', JSON.stringify(u));
    else { localStorage.removeItem('user'); localStorage.removeItem('token'); }
  };

  if (!ready) return null;

  return (
    <Router>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar user={user} setUser={handleSetUser} darkMode={darkMode} setDarkMode={setDarkMode} />

        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home user={user} />} />
            <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login setUser={handleSetUser} />} />
            <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />
            <Route path="/admin" element={<PrivateRoute user={user}><Admin user={user} /></PrivateRoute>} />
            <Route path="/sinf/:grade" element={<PrivateRoute user={user}><GradePage user={user} /></PrivateRoute>} />
            <Route path="/sinf/:grade/chorak/:quarter/matn/:id" element={<PrivateRoute user={user}><TextPage user={user} /></PrivateRoute>} />
            <Route path="/sozlamalar" element={<PrivateRoute user={user}><Settings /></PrivateRoute>} />
            <Route path="/qidiruv" element={<PrivateRoute user={user}><Search /></PrivateRoute>} />
            <Route path="/sevimlilar" element={<PrivateRoute user={user}><Favorites /></PrivateRoute>} />
            <Route path="/profil" element={<PrivateRoute user={user}><Profile user={user} setUser={handleSetUser} /></PrivateRoute>} />
            <Route path="/yutuqlar" element={<PrivateRoute user={user}><Badges /></PrivateRoute>} />
            <Route path="/parolni-unutdim" element={<ForgotPassword />} />
            <Route path="/parolni-tiklash" element={<ResetPassword />} />
            <Route path="/sinflar" element={<PrivateRoute user={user}><Classes user={user} /></PrivateRoute>} />
            <Route path="/topshiriqlar" element={<PrivateRoute user={user}><Assignments user={user} /></PrivateRoute>} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;

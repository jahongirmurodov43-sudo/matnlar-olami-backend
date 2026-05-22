import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
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

function App() {
  const [user, setUser] = useState(null);
  const [lang, setLang] = useState('uz');

  return (
    <Router>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar user={user} setLang={setLang} lang={lang} />

        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login setUser={setUser} />} />
            <Route path="/register" element={<Register />} />
            <Route path="/texts" element={<Texts user={user} lang={lang} />} />
            <Route path="/admin" element={<Admin user={user} />} />
            <Route path="/sinf/:grade" element={<GradePage user={user} lang={lang} />} />
            <Route path="/sinf/:grade/chorak/:quarter/matn/:id" element={<TextPage user={user} lang={lang} />} />
            <Route path="/sozlamalar" element={<Settings lang={lang} setLang={setLang} />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;

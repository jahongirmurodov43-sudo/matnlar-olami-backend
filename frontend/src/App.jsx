import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import './i18n';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Texts from './pages/Texts';
import Admin from './pages/Admin';
import Footer from './components/Footer';   // ← New

function App() {
  const [user, setUser] = useState(null);
  const [lang, setLang] = useState('uz');

  return (
    <Router>
      <div className="min-h-screen bg-paper flex flex-col">
        <Navbar user={user} setLang={setLang} />
        
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login setUser={setUser} />} />
            <Route path="/register" element={<Register />} />
            <Route path="/texts" element={<Texts user={user} lang={lang} />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
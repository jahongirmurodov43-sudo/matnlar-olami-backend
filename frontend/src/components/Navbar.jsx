import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function Navbar({ user, setLang }) {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setLang(lng);
  };

  return (
    <nav className="bg-emerald-600 text-white p-4 shadow-md">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">📖 Matnlar Olami</Link>
        
        <div className="flex items-center gap-6">
          <Link to="/texts" className="hover:underline">Matnlar</Link>
          {user?.role === 'admin' && <Link to="/admin" className="hover:underline">Admin</Link>}
          
          <select 
            onChange={(e) => changeLanguage(e.target.value)}
            className="bg-emerald-700 px-3 py-1 rounded-lg text-sm"
          >
            <option value="uz">🇺🇿 O'zbek</option>
            <option value="ru">🇷🇺 Русский</option>
          </select>

          {user ? (
            <div className="flex items-center gap-2">
              👤 {user.name}
            </div>
          ) : (
            <Link 
              to="/login" 
              className="bg-white text-emerald-600 px-6 py-2 rounded-full font-medium hover:bg-emerald-50"
            >
              Kirish
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
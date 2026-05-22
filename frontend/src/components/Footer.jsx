import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-emerald-700 text-white mt-auto py-6">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="font-semibold text-lg">📖 Matnlar Olami</p>

        <div className="flex gap-6 text-sm">
          <Link to="/" className="hover:underline">Bosh sahifa</Link>
          <Link to="/texts" className="hover:underline">Matnlar</Link>
          <Link to="/login" className="hover:underline">Kirish</Link>
          <Link to="/register" className="hover:underline">Ro'yxatdan o'tish</Link>
        </div>

        <p className="text-sm text-emerald-200">
          © {new Date().getFullYear()} Matnlar Olami. Barcha huquqlar himoyalangan.
        </p>
      </div>
    </footer>
  );
}

export default Footer;

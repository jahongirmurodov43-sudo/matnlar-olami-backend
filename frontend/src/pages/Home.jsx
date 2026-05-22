import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-gray-900 dark:to-emerald-950">
      <div className="max-w-5xl mx-auto px-6 py-20 text-center">
        <h1 className="text-6xl font-bold mb-6 text-emerald-700">
          Matnlar Olami
        </h1>
        <p className="text-2xl mb-10 text-gray-600 dark:text-gray-300">
          Boshlang'ich sinf o'quvchilari uchun eng yaxshi matnlar kutubxonasi
        </p>
        
        <div className="flex gap-6 justify-center">
          <Link 
            to="/texts" 
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xl px-10 py-4 rounded-2xl font-medium transition"
          >
            Matnlarni ko'rish
          </Link>
          <Link 
            to="/register" 
            className="border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 text-xl px-10 py-4 rounded-2xl font-medium transition"
          >
            Ro'yxatdan o'tish
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home;
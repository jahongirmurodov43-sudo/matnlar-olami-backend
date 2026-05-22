import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login({ setUser }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Use environment variable for API URL
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, form);
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      navigate('/texts');
    } catch (err) {
      setError('Login failed. Check your credentials.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-8">Kirish</h2>
        
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="email"
            placeholder="Email"
            className="w-full p-4 border rounded-2xl"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Parol"
            className="w-full p-4 border rounded-2xl"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <button type="submit" className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-medium hover:bg-emerald-700">
            Kirish
          </button>
        </form>

        <p className="text-center mt-6">
          Akkount yo'qmi? <a href="/register" className="text-emerald-600">Ro'yxatdan o'tish</a>
        </p>
      </div>
    </div>
  );
}

export default Login;

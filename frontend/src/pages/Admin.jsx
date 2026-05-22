import { useState, useEffect } from 'react';
import axios from 'axios';

function Admin() {
  const [texts, setTexts] = useState([]);
  const [form, setForm] = useState({
    title: '',
    content: '',
    grade: 1,
    quarter: 1,
    language: 'uz',
    questions: [{ question: '', answer: '' }]
  });

  const API_URL = 'https://matnlar-olami-backend.onrender.com';

  useEffect(() => {
    fetchTexts();
  }, []);

  const fetchTexts = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/texts`);
      setTexts(res.data);
    } catch (err) {
      console.error("Error fetching texts:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/texts`, form);
      alert('Matn muvaffaqiyatli qo\'shildi!');
      fetchTexts(); // Refresh the list
      setForm({ 
        title: '', 
        content: '', 
        grade: 1, 
        quarter: 1, 
        language: 'uz', 
        questions: [{ question: '', answer: '' }] 
      });
    } catch (err) {
      alert('Xatolik yuz berdi: ' + err.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-8 text-center">Admin Panel - Matn Qo'shish</h1>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl mb-12">
        <div className="grid grid-cols-2 gap-6">
          <input
            type="text"
            placeholder="Matn Sarlavhasi"
            className="p-4 border rounded-2xl"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <select
            className="p-4 border rounded-2xl"
            value={form.grade}
            onChange={(e) => setForm({ ...form, grade: Number(e.target.value) })}
          >
            <option value={1}>1-sinf</option>
            <option value={2}>2-sinf</option>
            <option value={3}>3-sinf</option>
            <option value={4}>4-sinf</option>
          </select>
        </div>

        <textarea
          placeholder="Matn mazmuni..."
          className="w-full mt-6 p-4 border rounded-3xl h-48"
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          required
        />

        <div className="grid grid-cols-3 gap-4 mt-6">
          <select
            className="p-4 border rounded-2xl"
            value={form.quarter}
            onChange={(e) => setForm({ ...form, quarter: Number(e.target.value) })}
          >
            <option value={1}>1-chorak</option>
            <option value={2}>2-chorak</option>
            <option value={3}>3-chorak</option>
            <option value={4}>4-chorak</option>
          </select>

          <select
            className="p-4 border rounded-2xl"
            value={form.language}
            onChange={(e) => setForm({ ...form, language: e.target.value })}
          >
            <option value="uz">Uzbek</option>
            <option value="ru">Russian</option>
          </select>
        </div>

        <button
          type="submit"
          className="mt-8 w-full bg-emerald-600 text-white py-4 rounded-2xl text-xl font-medium hover:bg-emerald-700"
        >
          Matnni Saqlash
        </button>
      </form>

      <h2 className="text-2xl font-bold mb-6">Mavjud Matnlar</h2>
      <div className="grid gap-4">
        {texts.map(text => (
          <div key={text._id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl">
            <h3 className="font-bold">{text.title}</h3>
            <p className="text-sm text-gray-500">{text.grade}-sinf • {text.quarter}-chorak</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Admin;

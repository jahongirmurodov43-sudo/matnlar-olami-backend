import { useEffect, useState } from 'react';
import axios from 'axios';
import { Play, Pause } from 'lucide-react';

function Texts({ user, lang }) {
  const [texts, setTexts] = useState([]);
  const [selectedText, setSelectedText] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

useEffect(() => {
  axios
    .get(`https://matnlar-olami-backend.onrender.com/api/texts?language=${lang}`)
    .then(res => setTexts(res.data))
    .catch(err => console.error(err));
}, [lang]);

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'uz' ? 'uz-UZ' : 'ru-RU';
    speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-4xl font-bold text-center mb-10 text-emerald-600">
        {lang === 'uz' ? "Matnlar Olami" : "Мир Текстов"}
      </h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {texts.map(text => (
          <div key={text._id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow hover:shadow-xl transition">
            <h3 className="font-bold text-xl mb-2">{text.title}</h3>
            <p className="text-sm text-gray-500 mb-4">
              {text.grade}-sinf • {text.quarter}-chorak
            </p>
            <button
              onClick={() => setSelectedText(text)}
              className="bg-emerald-600 text-white px-5 py-2 rounded-full hover:bg-emerald-700"
            >
              O'qish
            </button>
          </div>
        ))}
      </div>

      {selectedText && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 w-full max-w-3xl max-h-[90vh] overflow-auto p-8 rounded-3xl">
            <button onClick={() => setSelectedText(null)} className="float-right text-3xl">×</button>
            
            <h2 className="text-3xl font-bold mb-6">{selectedText.title}</h2>
            
            <button
              onClick={() => speak(selectedText.content)}
              className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-full mb-6"
            >
              {isPlaying ? <Pause /> : <Play />} Audio tinglash
            </button>

            <div className="prose text-lg leading-relaxed whitespace-pre-line">
              {selectedText.content}
            </div>

            <h3 className="mt-10 text-xl font-semibold">Savollar:</h3>
            <ul className="list-disc pl-6 mt-4 space-y-3">
              {selectedText.questions?.map((q, i) => (
                <li key={i}>{q.question}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default Texts;

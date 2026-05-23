import { useState, useCallback } from 'react';

const STORAGE_KEY = 'text_notes';

function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
  catch { return {}; }
}

export function useNotes() {
  const [notes, setNotes] = useState(load);

  const getNote = useCallback((textId) => notes[textId] || '', [notes]);

  const saveNote = useCallback((textId, text) => {
    setNotes(prev => {
      const updated = { ...prev };
      if (text.trim()) updated[textId] = text;
      else delete updated[textId];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const deleteNote = useCallback((textId) => {
    setNotes(prev => {
      const updated = { ...prev };
      delete updated[textId];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return { getNote, saveNote, deleteNote, allNotes: notes };
}

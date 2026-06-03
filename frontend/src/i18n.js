import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n.use(initReactI18next).init({
  resources: {
    uz: { translation: { welcome: "O'qish savodxonligi darslarida matn ustida ishlash", login: "Kirish" } },
    ru: { translation: { welcome: "Работа с текстом на уроках чтения", login: "Войти" } }
  },
  lng: 'uz',
  fallbackLng: 'uz'
});

export default i18n;

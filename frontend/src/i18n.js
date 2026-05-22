import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n.use(initReactI18next).init({
  resources: {
    uz: { translation: { welcome: "Matnlar Olami'ga xush kelibsiz", login: "Kirish" } },
    ru: { translation: { welcome: "Добро пожаловать в Мир Текстов", login: "Войти" } }
  },
  lng: 'uz',
  fallbackLng: 'uz'
});

export default i18n;

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './locales/en.json';
import sr from './locales/sr.json';
import rsn from './locales/rsn.json';

const LANGUAGE_STORAGE_KEY = 'app_language';

// Function to get stored language
const getStoredLanguage = async () => {
  try {
    const lang = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    return lang || 'en';
  } catch (e) {
    return 'en';
  }
};

// Function to save language
export const saveLanguage = async (language) => {
  try {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch (e) {
    console.error('Failed to save language:', e);
  }
};

// Initialize i18n
const initI18n = async () => {
  const savedLanguage = await getStoredLanguage();

  i18n
    .use(initReactI18next)
    .init({
      resources: {
        en: { translation: en },
        sr: { translation: sr },
        rsn: { translation: rsn },
      },
      lng: savedLanguage,
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false,
      },
      compatibilityJSON: 'v3',
    });
};

initI18n();

export default i18n;

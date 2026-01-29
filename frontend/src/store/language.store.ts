import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { translations, Language, TranslationKeys } from '@/lib/i18n';

interface LanguageState {
  language: Language;
  t: TranslationKeys;
  setLanguage: (lang: Language) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'vi',
      t: translations.vi,
      setLanguage: (lang: Language) =>
        set({
          language: lang,
          t: translations[lang],
        }),
    }),
    {
      name: 'language-storage',
    }
  )
);

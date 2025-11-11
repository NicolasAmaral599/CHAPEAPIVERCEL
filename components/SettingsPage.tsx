import React from 'react';
import { useTranslations } from '../context/LanguageContext';

interface SettingsPageProps {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ theme, setTheme }) => {
  const { t, language, setLanguage } = useTranslations();

  const handleThemeToggle = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as 'pt' | 'en');
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-sm max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-8 text-slate-800 dark:text-slate-200">{t('settings.title')}</h2>

      <div className="space-y-8">
        {/* Appearance Settings */}
        <div className="border-b border-slate-200 dark:border-slate-700 pb-8">
          <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('settings.appearance')}</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-4 text-sm">{t('settings.contrastDescription')}</p>
          <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
            <label htmlFor="theme-toggle" className="font-medium text-slate-800 dark:text-slate-200">{t('settings.contrast')}</label>
            <button
              id="theme-toggle"
              onClick={handleThemeToggle}
              className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${
                theme === 'dark' ? 'bg-indigo-600' : 'bg-slate-300'
              }`}
              aria-pressed={theme === 'dark'}
            >
              <span
                className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                  theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Language Settings */}
        <div>
          <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('settings.language')}</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-4 text-sm">{t('settings.languageDescription')}</p>
          <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
             <label htmlFor="language-select" className="font-medium text-slate-800 dark:text-slate-200">{t('settings.language')}</label>
            <div>
              <select
                id="language-select"
                value={language}
                onChange={handleLanguageChange}
                className="px-3 py-2 text-sm font-medium rounded-md bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="pt">Português (BR)</option>
                <option value="en">English (US)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
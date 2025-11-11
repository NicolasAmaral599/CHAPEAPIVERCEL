import React from 'react';
import { useTranslations } from '../context/LanguageContext';

const EmailConfirmedPage: React.FC = () => {
  const { t } = useTranslations();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-900 text-center px-6">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl max-w-md w-full">
        <div className="text-5xl mb-4">✅</div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          {t('emailConfirm.title')}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mb-6">
          {t('emailConfirm.subtitle')}
        </p>
        <a
          href="https://autentica-o-nf.vercel.app/"
          className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium px-6 py-3 rounded-xl transition"
        >
          {t('emailConfirm.button')}
        </a>
      </div>
    </div>
  );
};

export default EmailConfirmedPage;

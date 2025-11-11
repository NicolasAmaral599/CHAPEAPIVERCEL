import React from 'react';
import { useTranslations } from '../context/LanguageContext';

const About: React.FC = () => {
  const { t } = useTranslations();

  return (
    <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-sm max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-4 text-slate-800 dark:text-slate-200">{t('about.title')}</h2>
      <div className="space-y-4 text-slate-600 dark:text-slate-300">
        <p>
          {t('about.p1')}
        </p>
        <p>
          {t('about.p2')}
        </p>
        <div className="pt-4">
          <h3 className="text-xl font-semibold mb-2 text-slate-700 dark:text-slate-200">{t('about.featuresTitle')}</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>{t('about.feature1')}</li>
            <li>{t('about.feature2')}</li>
            <li>{t('about.feature3')}</li>
            <li>{t('about.feature4')}</li>
            <li>{t('about.feature5')}</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default About;
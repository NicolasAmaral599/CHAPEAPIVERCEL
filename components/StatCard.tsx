import React from 'react';
import { useTranslations } from '../context/LanguageContext';

interface StatCardProps {
  title: string;
  value: string;
  color: 'blue' | 'green' | 'yellow' | 'red';
  count?: number;
}

const colorClasses = {
  blue: 'bg-blue-100 dark:bg-blue-900/50 border-blue-500',
  green: 'bg-green-100 dark:bg-green-900/50 border-green-500',
  yellow: 'bg-yellow-100 dark:bg-yellow-900/50 border-yellow-500',
  red: 'bg-red-100 dark:bg-red-900/50 border-red-500',
};

const textClasses = {
  blue: 'text-blue-800 dark:text-blue-200',
  green: 'text-green-800 dark:text-green-200',
  yellow: 'text-yellow-800 dark:text-yellow-200',
  red: 'text-red-800 dark:text-red-200',
};

const StatCard: React.FC<StatCardProps> = ({ title, value, color, count }) => {
  const { t } = useTranslations();
  return (
    <div className={`p-6 rounded-lg shadow-sm border-l-4 ${colorClasses[color]}`}>
      <p className={`text-sm font-medium text-slate-500 dark:text-slate-400`}>{title}</p>
      <div className="flex justify-between items-baseline mt-1">
        <p className={`text-3xl font-bold ${textClasses[color]}`}>{value}</p>
        {count !== undefined && (
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {count} {count === 1 ? t('statcard.invoice_one') : t('statcard.invoice_other')}
          </p>
        )}
      </div>
    </div>
  );
};

export default StatCard;
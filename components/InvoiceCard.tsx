import React from 'react';
import { Invoice, InvoiceStatus } from '../types';
import { useTranslations } from '../context/LanguageContext';

interface InvoiceCardProps {
  invoice: Invoice;
}

const statusClasses = {
  [InvoiceStatus.Pago]: 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300',
  [InvoiceStatus.Pendente]: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300',
  [InvoiceStatus.Vencido]: 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300',
};

const InvoiceCard: React.FC<InvoiceCardProps> = ({ invoice }) => {
  const { id, clientName, amount, dueDate, status } = invoice;
  const { t, formatDate } = useTranslations();

  return (
    <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg flex items-center justify-between hover:shadow-md transition-shadow">
      <div className="flex items-center">
        <div className="mr-4">
          <p className="font-bold text-slate-800 dark:text-slate-200">{id}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">{clientName}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-semibold text-lg text-slate-800 dark:text-slate-200">
            R$ {amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </p>
        <div className="flex items-center justify-end mt-1">
            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusClasses[status]}`}>
            {t(`common.status.${status}`)}
            </span>
            <p className="text-sm text-slate-500 dark:text-slate-400 ml-3">{t('invoiceCard.dueDate')}: {formatDate(dueDate)}</p>
        </div>
      </div>
    </div>
  );
};

export default InvoiceCard;
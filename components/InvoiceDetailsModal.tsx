import React from 'react';
import { Invoice, InvoiceStatus } from '../types';
import { useTranslations } from '../context/LanguageContext';

interface InvoiceDetailsModalProps {
  invoice: Invoice;
  onClose: () => void;
}

const statusClasses = {
  [InvoiceStatus.Pago]: 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300',
  [InvoiceStatus.Pendente]: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300',
  [InvoiceStatus.Vencido]: 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300',
};

const InvoiceDetailsModal: React.FC<InvoiceDetailsModalProps> = ({ invoice, onClose }) => {
    const { t, formatDate } = useTranslations();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl p-8 m-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">{t('detailsModal.title')}: {invoice.id}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
            <div>
                <p className="font-semibold text-slate-500 dark:text-slate-400">{t('common.client')}</p>
                <p className="text-slate-800 dark:text-slate-200">{invoice.clientName}</p>
            </div>
            <div>
                <p className="font-semibold text-slate-500 dark:text-slate-400">{t('common.amount')}</p>
                <p className="text-slate-800 dark:text-slate-200 font-mono">R$ {invoice.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
            <div>
                <p className="font-semibold text-slate-500 dark:text-slate-400">{t('common.issueDate')}</p>
                <p className="text-slate-800 dark:text-slate-200">{formatDate(invoice.issueDate)}</p>
            </div>
            <div>
                <p className="font-semibold text-slate-500 dark:text-slate-400">{t('common.dueDate')}</p>
                <p className="text-slate-800 dark:text-slate-200">{formatDate(invoice.dueDate)}</p>
            </div>
            <div className="md:col-span-2">
                <p className="font-semibold text-slate-500 dark:text-slate-400">{t('common.status.title')}</p>
                <p>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusClasses[invoice.status]}`}>
                        {t(`common.status.${invoice.status}`)}
                    </span>
                </p>
            </div>
            <div className="md:col-span-2">
                <p className="font-semibold text-slate-500 dark:text-slate-400">{t('common.observations')}</p>
                <p className="text-slate-800 dark:text-slate-200 whitespace-pre-wrap">{invoice.observations || t('detailsModal.noObservations')}</p>
            </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button onClick={onClose} className="px-6 py-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-md hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetailsModal;
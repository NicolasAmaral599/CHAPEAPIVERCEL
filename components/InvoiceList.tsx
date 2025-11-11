import React, { useState, useMemo } from 'react';
import { Invoice, InvoiceStatus } from '../types';
import InvoiceCard from './InvoiceCard';
import { useTranslations } from '../context/LanguageContext';

interface InvoiceListProps {
  invoices: Invoice[];
}

type FilterType = 'all' | InvoiceStatus;
type SortType = 'recent' | 'highest' | 'lowest';

// Helper function to parse date string as local date to avoid timezone issues.
const parseDateAsLocal = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
};

const InvoiceList: React.FC<InvoiceListProps> = ({ invoices }) => {
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('recent');
  const { t } = useTranslations();

  const processedInvoices = useMemo(() => {
    const filtered = filter === 'all'
      ? invoices
      : invoices.filter(invoice => invoice.status === filter);

    const sorted = [...filtered];
    switch (sortBy) {
      case 'highest':
        sorted.sort((a, b) => b.amount - a.amount);
        break;
      case 'lowest':
        sorted.sort((a, b) => a.amount - b.amount);
        break;
      case 'recent':
      default:
        sorted.sort((a, b) => parseDateAsLocal(b.issueDate).getTime() - parseDateAsLocal(a.issueDate).getTime());
        break;
    }
    return sorted;
  }, [invoices, filter, sortBy]);
  
  const filters: { id: FilterType, label: string }[] = [
      { id: 'all', label: t('invoiceList.filterAll') },
      { id: InvoiceStatus.Pago, label: t('common.status.Pago') },
      { id: InvoiceStatus.Pendente, label: t('common.status.Pendente') },
      { id: InvoiceStatus.Vencido, label: t('common.status.Vencido') },
  ];

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <h3 className="text-xl font-semibold">{t('invoiceList.title')}</h3>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex flex-wrap gap-2">
              {filters.map(f => (
                   <button
                   key={f.id}
                   onClick={() => setFilter(f.id)}
                   className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                     filter === f.id
                       ? 'bg-indigo-600 text-white'
                       : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                   }`}
                 >
                   {f.label}
                 </button>
              ))}
          </div>
          <div>
            <label htmlFor="sort" className="sr-only">{t('invoiceList.sortBy')}</label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortType)}
              className="px-3 py-2 text-sm font-medium rounded-md bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label={t('invoiceList.sortByAria')}
            >
              <option value="recent">{t('invoiceList.sortRecent')}</option>
              <option value="highest">{t('invoiceList.sortHighest')}</option>
              <option value="lowest">{t('invoiceList.sortLowest')}</option>
            </select>
          </div>
        </div>
      </div>
      <div className="space-y-4">
        {processedInvoices.length > 0 ? (
          processedInvoices.map(invoice => (
            <InvoiceCard key={invoice.id} invoice={invoice} />
          ))
        ) : (
          <p className="text-center text-slate-500 dark:text-slate-400 py-8">{t('invoiceList.noInvoices')}</p>
        )}
      </div>
    </div>
  );
};

export default InvoiceList;
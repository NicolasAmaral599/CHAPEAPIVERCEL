import React, { useState, useMemo } from 'react';
import { Invoice, InvoiceStatus } from '../types';
import { useTranslations } from '../context/LanguageContext';

interface InvoicesPageProps {
  invoices: Invoice[];
  onEdit: (invoice: Invoice) => void;
  onDelete: (invoiceId: string) => void;
  onViewDetails: (invoice: Invoice) => void;
}

const statusClasses = {
  [InvoiceStatus.Pago]: 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300',
  [InvoiceStatus.Pendente]: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300',
  [InvoiceStatus.Vencido]: 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300',
};

type SortByType = 'dateDesc' | 'dateAsc' | 'clientAZ' | 'clientZA' | 'amountDesc' | 'amountAsc' | 'idAsc' | 'idDesc';

// Helper function to parse date string as local date to avoid timezone issues.
const parseDateAsLocal = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
};

const InvoicesPage: React.FC<InvoicesPageProps> = ({ invoices, onEdit, onDelete, onViewDetails }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | InvoiceStatus>('all');
    const [sortBy, setSortBy] = useState<SortByType>('dateDesc');
    const { t, formatDate } = useTranslations();

    const processedInvoices = useMemo(() => {
        let processed = invoices
            .filter(invoice =>
                invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                invoice.id.toLowerCase().includes(searchTerm.toLowerCase())
            );

        if (statusFilter !== 'all') {
            processed = processed.filter(invoice => invoice.status === statusFilter);
        }

        switch (sortBy) {
            case 'dateAsc':
                processed.sort((a, b) => parseDateAsLocal(a.issueDate).getTime() - parseDateAsLocal(b.issueDate).getTime());
                break;
            case 'clientAZ':
                processed.sort((a, b) => a.clientName.localeCompare(b.clientName));
                break;
            case 'clientZA':
                processed.sort((a, b) => b.clientName.localeCompare(a.clientName));
                break;
            case 'amountDesc':
                processed.sort((a, b) => b.amount - a.amount);
                break;
            case 'amountAsc':
                processed.sort((a, b) => a.amount - b.amount);
                break;
            case 'idAsc':
                processed.sort((a, b) => a.id.localeCompare(b.id));
                break;
            case 'idDesc':
                processed.sort((a, b) => b.id.localeCompare(a.id));
                break;
            case 'dateDesc':
            default:
                processed.sort((a, b) => parseDateAsLocal(b.issueDate).getTime() - parseDateAsLocal(a.issueDate).getTime());
                break;
        }

        return processed;
    }, [invoices, searchTerm, statusFilter, sortBy]);
    
    const sortOptions: { value: SortByType, label: string }[] = [
        { value: 'dateDesc', label: t('invoicesPage.sortOptions.dateDesc') },
        { value: 'dateAsc', label: t('invoicesPage.sortOptions.dateAsc') },
        { value: 'clientAZ', label: t('invoicesPage.sortOptions.clientAZ') },
        { value: 'clientZA', label: t('invoicesPage.sortOptions.clientZA') },
        { value: 'amountDesc', label: t('invoicesPage.sortOptions.amountDesc') },
        { value: 'amountAsc', label: t('invoicesPage.sortOptions.amountAsc') },
        { value: 'idAsc', label: t('invoicesPage.sortOptions.idAsc') },
        { value: 'idDesc', label: t('invoicesPage.sortOptions.idDesc') },
    ];

    const statusOptions = [
        { value: 'all', label: t('invoicesPage.statusAll') },
        { value: InvoiceStatus.Pago, label: t('common.status.Pago') },
        { value: InvoiceStatus.Pendente, label: t('common.status.Pendente') },
        { value: InvoiceStatus.Vencido, label: t('common.status.Vencido') },
    ];


    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200">{t('invoicesPage.title')}</h2>
                <div className="w-full md:w-auto flex flex-col sm:flex-row gap-4">
                    <input
                        type="text"
                        placeholder={t('invoicesPage.searchPlaceholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full sm:w-48 px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                     <select
                        id="status-filter"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as 'all' | InvoiceStatus)}
                        className="w-full sm:w-auto px-3 py-2 text-sm font-medium rounded-md bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        aria-label={t('invoicesPage.filterByStatus')}
                    >
                        {statusOptions.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                    <select
                        id="sort-by"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortByType)}
                        className="w-full sm:w-auto px-3 py-2 text-sm font-medium rounded-md bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        aria-label={t('invoicesPage.sortBy')}
                    >
                        {sortOptions.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left table-auto">
                    <thead className="bg-slate-50 dark:bg-slate-700/50">
                        <tr>
                            <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">{t('invoicesPage.tableId')}</th>
                            <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">{t('invoicesPage.tableClient')}</th>
                            <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">{t('invoicesPage.tableAmount')}</th>
                            <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">{t('invoicesPage.tableDue')}</th>
                            <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">{t('invoicesPage.tableStatus')}</th>
                            <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">{t('invoicesPage.tableActions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {processedInvoices.map(invoice => (
                            <tr key={invoice.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                <td className="p-4 text-slate-800 dark:text-slate-200 font-medium">{invoice.id}</td>
                                <td className="p-4 text-slate-600 dark:text-slate-300">{invoice.clientName}</td>
                                <td className="p-4 text-slate-600 dark:text-slate-300">R$ {invoice.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                <td className="p-4 text-slate-600 dark:text-slate-300">{formatDate(invoice.dueDate)}</td>
                                <td className="p-4">
                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusClasses[invoice.status]}`}>
                                        {t(`common.status.${invoice.status}`)}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => onViewDetails(invoice)} title={t('invoicesPage.viewAction')} className="text-slate-500 hover:text-blue-500 dark:hover:text-blue-400 p-1 rounded-full transition-colors"><ViewIcon /></button>
                                        <button onClick={() => onEdit(invoice)} title={t('invoicesPage.editAction')} className="text-slate-500 hover:text-green-500 dark:hover:text-green-400 p-1 rounded-full transition-colors"><EditIcon /></button>
                                        <button onClick={() => onDelete(invoice.id)} title={t('invoicesPage.deleteAction')} className="text-slate-500 hover:text-red-500 dark:hover:text-red-400 p-1 rounded-full transition-colors"><DeleteIcon /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {processedInvoices.length === 0 && (
                <p className="text-center text-slate-500 dark:text-slate-400 py-12">{t('invoicesPage.noInvoicesFound')}</p>
            )}
        </div>
    );
};

// Action Icons
const ViewIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>;
const DeleteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;

export default InvoicesPage;
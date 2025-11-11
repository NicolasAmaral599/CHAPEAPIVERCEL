import React, { useState, useEffect } from 'react';
import { Invoice, InvoiceStatus } from '../types';
import { useTranslations } from '../context/LanguageContext';

interface EditInvoiceModalProps {
  invoice: Invoice;
  onSave: (invoice: Invoice) => void;
  onClose: () => void;
}

const EditInvoiceModal: React.FC<EditInvoiceModalProps> = ({ invoice, onSave, onClose }) => {
    const [formData, setFormData] = useState<Invoice>(invoice);
    const { t } = useTranslations();

    useEffect(() => {
        setFormData(invoice);
    }, [invoice]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        setFormData(prev => ({ ...prev, amount: parseFloat(value) || 0 }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-3xl p-8 m-4 overflow-y-auto max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">{t('editModal.title')}: {invoice.id}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="clientName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('common.client')}</label>
                            <input type="text" id="clientName" name="clientName" value={formData.clientName} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        <div>
                            <label htmlFor="amount" className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('common.amount')}</label>
                            <input type="number" id="amount" name="amount" value={formData.amount} onChange={handleAmountChange} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        <div>
                            <label htmlFor="issueDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('common.issueDate')}</label>
                            <input type="date" id="issueDate" name="issueDate" value={formData.issueDate} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        <div>
                            <label htmlFor="dueDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('common.dueDate')}</label>
                            <input type="date" id="dueDate" name="dueDate" value={formData.dueDate} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('common.status.title')}</label>
                             <select id="status" name="status" value={formData.status} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                                <option value={InvoiceStatus.Pendente}>{t('common.status.Pendente')}</option>
                                <option value={InvoiceStatus.Pago}>{t('common.status.Pago')}</option>
                                <option value={InvoiceStatus.Vencido}>{t('common.status.Vencido')}</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="observations" className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('common.observations')}</label>
                        <textarea id="observations" name="observations" value={formData.observations} onChange={handleChange} rows={4} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"></textarea>
                    </div>
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-6 py-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-md hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
                            {t('common.cancel')}
                        </button>
                        <button type="submit" className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            {t('editModal.saveButton')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditInvoiceModal;
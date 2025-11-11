import React, { useState } from 'react';
import { Invoice, InvoiceStatus } from '../types';
import { generateInvoiceObservation } from '../services/geminiService';
import { useTranslations } from '../context/LanguageContext';

interface CreateInvoiceProps {
  addInvoice: (invoice: Omit<Invoice, 'id'>) => Promise<void>;
}

const CreateInvoice: React.FC<CreateInvoiceProps> = ({ addInvoice }) => {
  const { t, language } = useTranslations();
  const [clientName, setClientName] = useState('');
  const [service, setService] = useState('');
  const [amount, setAmount] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [observations, setObservations] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // FIX: To avoid timezone issues where a 'YYYY-MM-DD' string is interpreted as UTC midnight,
    // parse the string manually to create a Date object in the local timezone at midnight.
    const [year, month, day] = dueDate.split('-').map(Number);
    const dueDateObj = new Date(year, month - 1, day);

    const newInvoice: Omit<Invoice, 'id'> = {
      clientName,
      amount: parseFloat(amount),
      issueDate,
      dueDate,
      status: dueDateObj < today ? InvoiceStatus.Vencido : InvoiceStatus.Pendente,
      observations,
    };
    await addInvoice(newInvoice);
  };
  
  const handleGenerateObservation = async () => {
    if (!clientName || !amount || !service) {
      alert(t('createInvoice.generateError'));
      return;
    }
    setIsGenerating(true);
    const generatedText = await generateInvoiceObservation(clientName, parseFloat(amount), service, language);
    setObservations(generatedText);
    setIsGenerating(false);
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-sm max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-slate-800 dark:text-slate-200">{t('createInvoice.title')}</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="clientName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('createInvoice.clientName')}</label>
            <input type="text" id="clientName" value={clientName} onChange={(e) => setClientName(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('createInvoice.amount')}</label>
            <input type="number" id="amount" value={amount} onChange={(e) => setAmount(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <div>
            <label htmlFor="issueDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('createInvoice.issueDate')}</label>
            <input type="date" id="issueDate" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('createInvoice.dueDate')}</label>
            <input type="date" id="dueDate" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
        </div>
         <div>
            <label htmlFor="service" className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('createInvoice.service')}</label>
            <input type="text" id="service" value={service} onChange={(e) => setService(e.target.value)} placeholder={t('createInvoice.servicePlaceholder')} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
        <div>
          <label htmlFor="observations" className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('createInvoice.observations')}</label>
          <textarea id="observations" value={observations} onChange={(e) => setObservations(e.target.value)} rows={4} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"></textarea>
           <button type="button" onClick={handleGenerateObservation} disabled={isGenerating} className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-slate-600 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 disabled:opacity-50">
            {isGenerating ? t('createInvoice.generating') : t('createInvoice.generateWithAI')}
            <SparklesIcon className="ml-2 h-4 w-4" />
          </button>
        </div>
        <div className="flex justify-end">
          <button type="submit" className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            {t('createInvoice.saveButton')}
          </button>
        </div>
      </form>
    </div>
  );
};

const SparklesIcon: React.FC<{className: string}> = ({className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.562L16.25 22.5l-.648-1.938a3.375 3.375 0 00-2.672-2.672L11.25 18l1.938-.648a3.375 3.375 0 002.672-2.672L16.25 13.5l.648 1.938a3.375 3.375 0 002.672 2.672L21 18l-1.938.648a3.375 3.375 0 00-2.672 2.672z" />
  </svg>
);


export default CreateInvoice;
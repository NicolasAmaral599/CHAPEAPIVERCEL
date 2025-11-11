import React from 'react';
import Chatbot from './Chatbot';
import { useTranslations } from '../context/LanguageContext';
import { Invoice, Message } from '../types';

interface ChatbotPageProps {
    invoices: Invoice[];
    messages: Message[];
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
    addInvoice: (invoice: Omit<Invoice, 'id'>) => Promise<void>;
    updateInvoice: (invoice: Invoice) => Promise<void>;
    deleteInvoice: (invoiceId: string) => Promise<void>;
}

const ChatbotPage: React.FC<ChatbotPageProps> = (props) => {
    const { t } = useTranslations();
    const { setMessages } = props;

    const handleNewChat = () => {
        setMessages([]);
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm h-[calc(100vh-8rem)] flex flex-col">
            <header className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                 <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">{t('chatbot.pageTitle')}</h2>
                 <button 
                    onClick={handleNewChat} 
                    className="px-4 py-2 text-sm font-medium rounded-md transition-colors bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600"
                >
                    {t('chatbot.newChat')}
                 </button>
            </header>
            <div className="flex-1 min-h-0">
                 <Chatbot {...props} />
            </div>
        </div>
    );
}

export default ChatbotPage;
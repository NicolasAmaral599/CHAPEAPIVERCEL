import React, { useState } from 'react';
import Chatbot from './Chatbot';
import { useTranslations } from '../context/LanguageContext';
import { Invoice, Message } from '../types';

interface ChatbotPopupProps {
    invoices: Invoice[];
    messages: Message[];
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
    addInvoice: (invoice: Omit<Invoice, 'id'>) => Promise<void>;
    updateInvoice: (invoice: Invoice) => Promise<void>;
    deleteInvoice: (invoiceId: string) => Promise<void>;
}

const ChatbotPopup: React.FC<ChatbotPopupProps> = (props) => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslations();
  const { setMessages } = props;

  const toggleChat = () => setIsOpen(!isOpen);

  const handleNewChat = () => {
    setMessages([]);
  };

  return (
    <>
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 bg-indigo-600 text-white rounded-full p-4 shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 z-50 transition-transform hover:scale-110"
        aria-label="Toggle chatbot"
      >
        {isOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
        ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.902L3 21l1.402-4.256A9.863 9.863 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
        )}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[calc(100vw-3rem)] max-w-sm h-[60vh] max-h-[600px] bg-white dark:bg-slate-800 rounded-lg shadow-2xl z-50 flex flex-col overflow-hidden">
          <header className="flex items-center justify-between p-4 bg-indigo-600 text-white">
            <h3 className="font-semibold">{t('chatbot.popupTitle')}</h3>
             <div className="flex items-center gap-2">
                <button onClick={handleNewChat} title={t('chatbot.newChat')} className="p-1.5 hover:bg-white/20 rounded-full transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.664 0l3.181-3.183m-4.991-2.695v-2.695A8.25 8.25 0 005.182 8.25v2.695m7.553 1.253v-2.695a8.25 8.25 0 00-14.156 0v2.695" />
                    </svg>
                </button>
                <button onClick={toggleChat} aria-label="Close chatbot" className="p-1.5 hover:bg-white/20 rounded-full transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
            </div>
          </header>
          <div className="flex-1 min-h-0">
             <Chatbot {...props} />
          </div>
        </div>
      )}
    </>
  );
};

export default ChatbotPopup;
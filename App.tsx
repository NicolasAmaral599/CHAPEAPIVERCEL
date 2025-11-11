import React, { useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from './lib/supabaseClient';
import Dashboard from './components/Dashboard';
import CreateInvoice from './components/CreateInvoice';
import About from './components/About';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import InvoicesPage from './components/InvoicesPage';
import EditInvoiceModal from './components/EditInvoiceModal';
import InvoiceDetailsModal from './components/InvoiceDetailsModal';
import CalendarPage from './components/CalendarPage';
import SettingsPage from './components/SettingsPage';
import ProfilePage from './components/ProfilePage';
import ChatbotPage from './components/ChatbotPage';
import ChatbotPopup from './components/ChatbotPopup';
import { Invoice, Page, Message } from './types';
import { LanguageProvider } from './context/LanguageContext';
import { useInvoicesRealtime } from './hooks/useInvoicesRealtime';
import { createInvoiceSupabase, updateInvoiceSupabase, deleteInvoiceSupabase, generateUUID } from './services/supabaseService';
import Login from './components/Login';
import AuthConfirmedPage from './components/AuthConfirmedPage';
import EmailConfirmedPage from './components/EmailConfirmedPage';


const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthConfirmPage, setIsAuthConfirmPage] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('theme') as 'light' | 'dark') || 'light');
  
  const { invoices, setInvoices } = useInvoicesRealtime();
  const [chatbotMessages, setChatbotMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (window.location.pathname === '/auth-confirm') {
      setIsAuthConfirmPage(true);
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
    });

    const {
        data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        // If a session is established and we were on the auth confirm page,
        // it means the user has successfully confirmed their email.
        // We can now clean up the URL and show the main app.
        if (session && window.location.pathname === '/auth-confirm') {
          window.history.replaceState({}, document.title, '/');
          setIsAuthConfirmPage(false);
        }
    });

    return () => subscription.unsubscribe();
  }, []);


  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
  
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Error logging out:', error);
  };
  
  const handleSetCurrentPage = (page: Page) => {
    setCurrentPage(page);
    setIsSidebarOpen(false); // Close sidebar on navigation
  };

  const addInvoice = async (invoice: Omit<Invoice, 'id'>) => {
    const newInvoice: Invoice = {
      id: generateUUID(),
      ...invoice,
    };

    const originalInvoices = [...invoices];
    // Optimistic update
    setInvoices(prev => [newInvoice, ...prev]);
    
    // Do not navigate away, user might be in the chatbot
    // setCurrentPage('dashboard');

    try {
        await createInvoiceSupabase(newInvoice);
    } catch (error) {
        console.error("Failed to create invoice:", error);
        // Rollback
        setInvoices(originalInvoices);
        alert('Failed to create invoice. Please try again.');
    }
  };
  
  const updateInvoice = async (updatedInvoice: Invoice) => {
    const originalInvoices = [...invoices];
    // Optimistic update
    setInvoices(prev => prev.map(inv => inv.id === updatedInvoice.id ? updatedInvoice : inv));
    setEditingInvoice(null);
    try {
        await updateInvoiceSupabase(updatedInvoice);
    } catch (error) {
        console.error("Failed to update invoice:", error);
        // Rollback
        setInvoices(originalInvoices);
        alert('Failed to update invoice. Please try again.');
    }
  };

  const deleteInvoice = async (invoiceId: string) => {
    // Confirmation should be handled by the caller (e.g., chatbot)
    const originalInvoices = [...invoices];
    // Optimistic update
    setInvoices(prev => prev.filter(inv => inv.id !== invoiceId));
    try {
        await deleteInvoiceSupabase(invoiceId);
    } catch (error) {
        console.error("Failed to delete invoice:", error);
        setInvoices(originalInvoices);
        alert('Failed to delete invoice. Please try again.');
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard invoices={invoices} />;
      case 'profile':
        return <ProfilePage session={session} invoices={invoices} />;
      case 'create-invoice':
        return <CreateInvoice addInvoice={addInvoice} />;
      case 'invoices':
        return <InvoicesPage 
          invoices={invoices}
          onEdit={setEditingInvoice}
          onDelete={(id) => {
            if (window.confirm('Tem certeza que deseja excluir esta nota fiscal? Esta ação não pode ser desfeita.')) {
                deleteInvoice(id);
            }
          }}
          onViewDetails={setViewingInvoice}
        />;
      case 'calendar':
        return <CalendarPage invoices={invoices} />;
      case 'settings':
        return <SettingsPage theme={theme} setTheme={setTheme} />;
      case 'about':
        return <About />;
      case 'chatbot':
        return <ChatbotPage 
            invoices={invoices} 
            messages={chatbotMessages} 
            setMessages={setChatbotMessages}
            addInvoice={addInvoice}
            updateInvoice={updateInvoice}
            deleteInvoice={deleteInvoice}
        />;
      default:
        return <Dashboard invoices={invoices} />;
    }
  };
  
  if (window.location.pathname === '/email-confirmed') {
    return (
      <LanguageProvider>
        <EmailConfirmedPage />
      </LanguageProvider>
    );
  }

  if (isAuthConfirmPage && !session) {
    return (
      <LanguageProvider>
        <AuthConfirmedPage />
      </LanguageProvider>
    );
  }

  if (!session) {
    return (
      <LanguageProvider>
        <Login />
      </LanguageProvider>
    );
  }

  return (
    <LanguageProvider>
      <div className="relative min-h-screen lg:flex bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
        <Sidebar 
          currentPage={currentPage} 
          setCurrentPage={handleSetCurrentPage}
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
        />
        <div className="flex-1 flex flex-col min-w-0">
          <Header 
            userName={session?.user?.user_metadata?.full_name || session?.user?.email || "Usuário"} 
            userAvatarUrl={session?.user?.user_metadata?.avatar_url}
            onLogout={handleLogout}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
          />
          <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6">
            {renderPage()}
          </main>
        </div>
        {editingInvoice && (
          <EditInvoiceModal
            invoice={editingInvoice}
            onSave={updateInvoice}
            onClose={() => setEditingInvoice(null)}
          />
        )}
        {viewingInvoice && (
          <InvoiceDetailsModal
            invoice={viewingInvoice}
            onClose={() => setViewingInvoice(null)}
          />
        )}
        <ChatbotPopup 
            invoices={invoices} 
            messages={chatbotMessages} 
            setMessages={setChatbotMessages}
            addInvoice={addInvoice}
            updateInvoice={updateInvoice}
            deleteInvoice={deleteInvoice}
        />
      </div>
    </LanguageProvider>
  );
};

export default App;
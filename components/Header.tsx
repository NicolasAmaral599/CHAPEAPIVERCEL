import React from 'react';
import { useTranslations } from '../context/LanguageContext';

interface HeaderProps {
  userName: string;
  userAvatarUrl?: string | null;
  onLogout: () => void;
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ userName, userAvatarUrl, onLogout, onToggleSidebar }) => {
  const { t } = useTranslations();
  return (
    <header className="h-20 bg-white dark:bg-slate-800 shadow-sm flex items-center justify-between px-4 sm:px-6 border-b border-slate-200 dark:border-slate-700">
      {/* Hamburger Menu - visible on mobile */}
      <button 
        onClick={onToggleSidebar}
        className="lg:hidden text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
        aria-label="Open sidebar"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Spacer for desktop to push user info to the right */}
      <div className="hidden lg:block"></div>
      
      <div className="flex items-center">
        <div className="text-right mr-4">
          <p className="font-semibold text-slate-800 dark:text-slate-200">{userName}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t('header.admin')}</p>
        </div>
        <img className="h-12 w-12 rounded-full object-cover" src={userAvatarUrl || "https://picsum.photos/100"} alt={t('profilePage.avatarAlt')} />
        <button onClick={onLogout} className="ml-6 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400" title={t('header.logout')}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </header>
  );
};

export default Header;
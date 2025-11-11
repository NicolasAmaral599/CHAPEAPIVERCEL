import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useTranslations } from '../context/LanguageContext';

const Login: React.FC = () => {
  const { t } = useTranslations();
  const [isRegisterView, setIsRegisterView] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [magicLinkLoading, setMagicLinkLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(t('login.invalidCredentials'));
    }
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError(t('login.passwordMismatch'));
      return;
    }
    setLoading(true);
    setError(null);
    setMessage(null);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: 'https://autentica-o-nf.vercel.app/email-confirmed',
      },
    });
    if (error) {
      setError(error.message);
    } else {
      setMessage(t('login.registerSuccessCheckEmail'));
      setIsRegisterView(false); // Switch to login view after successful registration
    }
    setLoading(false);
  };
  
  const handleMagicLinkLogin = async () => {
    if (!email) {
      setError(t('login.emailRequired'));
      return;
    }
    setMagicLinkLoading(true);
    setError(null);
    setMessage(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth-confirm`,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage(t('login.magicLinkSuccess'));
    }
    setMagicLinkLoading(false);
  };

  const LogoIcon = () => (
    <svg className="w-12 h-12 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-lg dark:bg-slate-800">
        <div className="flex justify-center mb-4"><LogoIcon /></div>
        <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            {isRegisterView ? t('login.createAccountTitle') : 'NotaFácil'}
            </h1>
            <p className="mt-2 text-slate-500 dark:text-slate-400">
            {isRegisterView ? t('login.createAccountSubtitle') : t('login.welcomeBack')}
            </p>
        </div>

        <form className="space-y-4" onSubmit={isRegisterView ? handleRegister : handleLogin}>
            {isRegisterView && (
                <div>
                    <label htmlFor="full-name" className="sr-only">{t('login.fullNamePlaceholder')}</label>
                    <input id="full-name" name="full-name" type="text" required value={fullName} onChange={e => setFullName(e.target.value)}
                        className="appearance-none rounded-md relative block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 placeholder-slate-500 text-slate-900 dark:text-white dark:bg-slate-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                        placeholder={t('login.fullNamePlaceholder')} />
                </div>
            )}
            <div>
                <label htmlFor="email-address" className="sr-only">{t('login.emailPlaceholder')}</label>
                <input id="email-address" name="email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)}
                    className="appearance-none rounded-md relative block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 placeholder-slate-500 text-slate-900 dark:text-white dark:bg-slate-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder={t('login.emailPlaceholder')} />
            </div>
           {!isRegisterView && (
             <div>
                <label htmlFor="password" className="sr-only">{t('login.passwordPlaceholder')}</label>
                <input id="password" name="password" type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)}
                    className="appearance-none rounded-md relative block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 placeholder-slate-500 text-slate-900 dark:text-white dark:bg-slate-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder={t('login.passwordPlaceholder')} />
            </div>
           )}

            {isRegisterView && (
              <>
                 <div>
                    <label htmlFor="password" className="sr-only">{t('login.passwordPlaceholder')}</label>
                    <input id="password" name="password" type="password" autoComplete="new-password" required value={password} onChange={e => setPassword(e.target.value)}
                        className="appearance-none rounded-md relative block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 placeholder-slate-500 text-slate-900 dark:text-white dark:bg-slate-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                        placeholder={t('login.passwordPlaceholder')} />
                </div>
                <div>
                    <label htmlFor="confirm-password" className="sr-only">{t('login.confirmPasswordPlaceholder')}</label>
                    <input id="confirm-password" name="confirm-password" type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                        className="appearance-none rounded-md relative block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 placeholder-slate-500 text-slate-900 dark:text-white dark:bg-slate-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                        placeholder={t('login.confirmPasswordPlaceholder')} />
                </div>
              </>
            )}
            {error && <p className="text-sm text-red-500 text-center">{error}</p>}
            {message && <p className="text-sm text-green-500 text-center">{message}</p>}
            <div>
                <button type="submit" disabled={loading}
                    className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
                    {loading ? '...' : (isRegisterView ? t('login.registerButton') : t('login.loginButton'))}
                </button>
            </div>
        </form>

        {!isRegisterView && (
            <>
                <div className="relative flex pt-4 items-center">
                    <div className="flex-grow border-t border-slate-300 dark:border-slate-600"></div>
                    <span className="flex-shrink mx-4 text-slate-400 text-xs uppercase">{t('login.or')}</span>
                    <div className="flex-grow border-t border-slate-300 dark:border-slate-600"></div>
                </div>
                <div>
                    <button
                        type="button"
                        onClick={handleMagicLinkLogin}
                        disabled={magicLinkLoading || !email}
                        className="group relative w-full flex justify-center py-2 px-4 border border-slate-300 dark:border-slate-500 text-sm font-medium rounded-md text-slate-700 dark:text-slate-300 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                        {magicLinkLoading ? '...' : t('login.magicLinkButton')}
                    </button>
                </div>
            </>
        )}

        <div className="text-sm text-center pt-2">
            <button onClick={() => { setIsRegisterView(!isRegisterView); setError(null); setMessage(null); }}
                className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
                {isRegisterView ? t('login.toggleToLogin') : t('login.toggleToRegister')}
            </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
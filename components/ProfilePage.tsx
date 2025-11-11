import React, { useMemo, useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { Invoice, Profile } from '../types';
import { useTranslations } from '../context/LanguageContext';
import EditProfileModal from './EditProfileModal';
import { getProfile } from '../services/supabaseService';

interface ProfilePageProps {
  session: Session | null;
  invoices: Invoice[];
}

const ProfilePage: React.FC<ProfilePageProps> = ({ session, invoices }) => {
    const { t } = useTranslations();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [profile, setProfile] = useState<Profile | null>(null);

    const user = session?.user;

    useEffect(() => {
        let isMounted = true;
        const fetchProfile = async () => {
            if (user) {
                try {
                    const data = await getProfile(user.id);
                    if (isMounted) {
                        setProfile(data);
                    }
                } catch (error) {
                    console.error("Failed to fetch profile", error);
                }
            }
        };

        fetchProfile();
        return () => { isMounted = false; };
    }, [user]);
    
    const userName = profile?.full_name || user?.user_metadata?.full_name || user?.email || "Usuário";
    const userEmail = user?.email;
    const userAvatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url;

    const stats = useMemo(() => {
        const totalInvoices = invoices.length;
        const uniqueClients = new Set(invoices.map(inv => inv.clientName)).size;
        const totalBilled = invoices.reduce((acc, inv) => acc + inv.amount, 0);
        const avgAmount = totalInvoices > 0 ? totalBilled / totalInvoices : 0;
        return { totalInvoices, uniqueClients, avgAmount, totalBilled };
    }, [invoices]);

    const handleUpdateSuccess = () => {
        if (user) {
            // After an update, re-fetch the profile data to update the UI on this page.
            getProfile(user.id).then(setProfile).catch(console.error);
        }
    };

    const memberSince = user?.created_at 
        ? new Date(user.created_at).toLocaleDateString(t('common.locale'), { year: 'numeric', month: 'long' }) 
        : '...';

    return (
        <>
            <div className="space-y-6">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200">{t('profilePage.title')}</h2>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Profile Card */}
                    <div className="lg:col-span-1 bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm flex flex-col items-center text-center">
                        <img className="h-32 w-32 rounded-full object-cover mb-4 ring-4 ring-indigo-200 dark:ring-indigo-700" src={userAvatarUrl || "https://picsum.photos/100"} alt={t('profilePage.avatarAlt')} />
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white truncate w-full">{userName}</h3>
                        <p className="text-slate-500 dark:text-slate-400 truncate w-full">{userEmail}</p>
                        <button 
                            onClick={() => setIsEditModalOpen(true)}
                            className="mt-6 w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            {t('profilePage.editProfile')}
                        </button>
                        <div className="mt-6 text-left space-y-4 w-full border-t border-slate-200 dark:border-slate-700 pt-6">
                            <div className="flex justify-between text-sm">
                                <span className="font-semibold text-slate-500 dark:text-slate-400">{t('profilePage.memberSince')}:</span>
                                <span className="text-slate-800 dark:text-slate-200">{memberSince}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="font-semibold text-slate-500 dark:text-slate-400">{t('profilePage.companyName')}:</span>
                                <span className="text-slate-800 dark:text-slate-200">{profile?.company || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="font-semibold text-slate-500 dark:text-slate-400">{t('profilePage.jobTitle')}:</span>
                                <span className="text-slate-800 dark:text-slate-200">{profile?.job_title || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Info & Stats */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Stats */}
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm">
                            <h3 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">{t('profilePage.statsTitle')}</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                <StatItem title={t('profilePage.totalInvoices')} value={stats.totalInvoices} />
                                <StatItem title={t('profilePage.uniqueClients')} value={stats.uniqueClients} />
                                <StatItem title={`R$ ${stats.avgAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} subtitle={t('profilePage.avgAmount')} />
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm">
                            <h3 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">{t('profilePage.activityTitle')}</h3>
                            <ul className="space-y-4">
                                <ActivityItem icon={<DocIcon/>} text={t('profilePage.activityItem1')} time="2 dias atrás" />
                                <ActivityItem icon={<CheckIcon/>} text={t('profilePage.activityItem2')} time="5 dias atrás" />
                                <ActivityItem icon={<AlertIcon/>} text={t('profilePage.activityItem3')} time="1 semana atrás" />
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {isEditModalOpen && user && (
                <EditProfileModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    user={user}
                    onUpdate={handleUpdateSuccess}
                />
            )}
        </>
    );
}

interface StatItemProps {
    title: string;
    value?: number | string;
    subtitle?: string;
}

const StatItem: React.FC<StatItemProps> = ({ title, value, subtitle }) => (
    <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{subtitle || title}</p>
        <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{value ?? title}</p>
    </div>
);

interface ActivityItemProps {
    icon: React.ReactNode;
    text: string;
    time: string;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ icon, text, time }) => (
    <li className="flex items-start space-x-3">
        <div className="flex-shrink-0">{icon}</div>
        <div className="flex-1">
            <p className="text-sm text-slate-700 dark:text-slate-300">{text}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{time}</p>
        </div>
    </li>
);

// Icons for Activity
const DocIcon = () => <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg></div>;
const CheckIcon = () => <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></div>;
const AlertIcon = () => <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg></div>;


export default ProfilePage;
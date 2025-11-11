import React, { useState, useEffect, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import { useTranslations } from '../context/LanguageContext';
import { uploadProfilePicture, updateUserProfileData, getProfile, updateProfile } from '../services/supabaseService';
import { Profile } from '../types';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onUpdate: () => void;
}

const sqlPolicies = `
-- 1. ${'Permite que usuários visualizem suas próprias imagens.'}
CREATE POLICY "Allow authenticated selects on own folder"
ON storage.objects FOR SELECT
TO authenticated
USING ( bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1] );

-- 2. ${'Permite que usuários enviem novas imagens.'}
CREATE POLICY "Allow authenticated inserts on own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1] );

-- 3. ${'Permite que usuários atualizem suas próprias imagens.'}
CREATE POLICY "Allow authenticated updates on own folder"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1] );

-- 4. ${'Permite que usuários excluam suas próprias imagens.'}
CREATE POLICY "Allow authenticated deletes on own folder"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1] );
`.trim();


const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, user, onUpdate }) => {
  const { t } = useTranslations();
  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [bio, setBio] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      getProfile(user.id)
        .then(profileData => {
          setFullName(profileData?.full_name || user.user_metadata.full_name || '');
          setCompany(profileData?.company || '');
          setJobTitle(profileData?.job_title || '');
          setBio(profileData?.bio || '');
          setAvatarPreview(profileData?.avatar_url || user.user_metadata.avatar_url || null);
        })
        .catch(console.error)
        .finally(() => setIsLoading(false));
      
      setAvatarFile(null);
      setError('');
    }
  }, [user, isOpen]);
  
  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      let finalAvatarUrl = user.user_metadata.avatar_url;
      if (avatarFile) {
        finalAvatarUrl = await uploadProfilePicture(user.id, avatarFile);
      }

      const profileUpdates: Partial<Omit<Profile, 'id'>> = {
        full_name: fullName,
        company: company,
        job_title: jobTitle,
        bio: bio,
        avatar_url: finalAvatarUrl,
      };
      
      const authUpdates = {
        full_name: fullName,
        avatar_url: finalAvatarUrl,
      };

      await Promise.all([
        updateProfile(user.id, profileUpdates),
        updateUserProfileData(authUpdates)
      ]);
      
      onUpdate();
      onClose();
    } catch (err: any) {
      console.error(err);
      if (err.message && err.message.toLowerCase().includes('bucket not found')) {
        setError('BUCKET_NOT_FOUND');
      } else if (err.message && err.message.toLowerCase().includes('violates row-level security policy')) {
        setError('RLS_POLICY_ERROR');
      } else {
        setError(t('editProfileModal.error'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderError = () => {
    if (!error) return null;

    if (error === 'BUCKET_NOT_FOUND') {
      return (
        <div className="bg-orange-100 dark:bg-orange-900/20 border-l-4 border-orange-500 text-orange-700 dark:text-orange-300 p-4 rounded-md text-left" role="alert">
            <div className="flex">
                <div className="flex-shrink-0">
                    <InformationCircleIcon className="h-5 w-5 text-orange-400" />
                </div>
                <div className="ml-3">
                    <p className="font-bold">{t('editProfileModal.bucketErrorTitle')}</p>
                    <div className="mt-2 text-sm text-orange-700 dark:text-orange-200">
                        <p>{t('editProfileModal.bucketErrorBody1')}</p>
                        <p className="mt-3 font-semibold">{t('editProfileModal.bucketErrorBody2')}</p>
                        <ul className="list-disc list-inside space-y-1 pl-5 mt-2">
                            <li>{t('editProfileModal.bucketErrorStep1')}</li>
                            <li>{t('editProfileModal.bucketErrorStep2')}</li>
                            <li>{t('editProfileModal.bucketErrorStep3')}</li>
                        </ul>
                        <p className="mt-3">{t('editProfileModal.bucketErrorBody3')}</p>
                        <a href="https://supabase.com/docs/guides/storage/security/access-control" target="_blank" rel="noopener noreferrer" className="font-semibold hover:underline mt-2 inline-block">
                            {t('editProfileModal.bucketErrorLink')}
                        </a>
                    </div>
                </div>
            </div>
        </div>
      );
    }
    
    if (error === 'RLS_POLICY_ERROR') {
         return (
            <div className="bg-red-100 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 rounded-md text-left" role="alert">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <ShieldExclamationIcon className="h-5 w-5 text-red-400" />
                    </div>
                    <div className="ml-3">
                        <p className="font-bold">{t('editProfileModal.rlsErrorTitle')}</p>
                        <div className="mt-2 text-sm text-red-700 dark:text-red-200">
                            <p>{t('editProfileModal.rlsErrorBody1')}</p>
                            <p className="mt-3">{t('editProfileModal.rlsErrorBody2')}</p>
                            <p className="mt-3 font-semibold">{t('editProfileModal.rlsErrorBody3')}</p>
                            <pre className="mt-2 bg-slate-900 text-white p-3 rounded-md text-xs overflow-x-auto">
                                <code>{sqlPolicies}</code>
                            </pre>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return <p className="text-sm text-red-500 text-center">{error}</p>;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={onClose}>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg p-8 m-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">{t('editProfileModal.title')}</h2>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
            <form onSubmit={handleSave} className="space-y-6">
                 <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('editProfileModal.nameLabel')}</label>
                    <input type="text" id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
                <div>
                    <label htmlFor="company" className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('profilePage.companyName')}</label>
                    <input type="text" id="company" value={company} onChange={(e) => setCompany(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
                 <div>
                    <label htmlFor="jobTitle" className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('profilePage.jobTitle')}</label>
                    <input type="text" id="jobTitle" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
                <div>
                    <label htmlFor="bio" className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('profilePage.bio')}</label>
                    <textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"></textarea>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('editProfileModal.photoLabel')}</label>
                    <div className="mt-2 flex items-center space-x-4">
                        <img className="h-20 w-20 rounded-full object-cover" src={avatarPreview || 'https://picsum.photos/100'} alt={t('profilePage.avatarAlt')} />
                        <input type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} className="hidden" />
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 text-sm font-medium">
                            {t('editProfileModal.changePhoto')}
                        </button>
                    </div>
                </div>
                
                {renderError()}

                <div className="flex justify-end gap-4 pt-4">
                    <button type="button" onClick={onClose} disabled={isLoading} className="px-6 py-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-md hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors disabled:opacity-50">
                        {t('common.cancel')}
                    </button>
                    <button type="submit" disabled={isLoading} className="inline-flex items-center justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
                        {isLoading ? t('editProfileModal.uploading') : t('editProfileModal.saveButton')}
                    </button>
                </div>
            </form>
        </div>
    </div>
  );
};

const InformationCircleIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
    </svg>
);

const ShieldExclamationIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5.023L2.5 5.051A12.001 12.001 0 0110 18.451 12.001 12.001 0 0117.5 5.051l.334-.028A11.955 11.955 0 0110 1.944zM8 10a1 1 0 112 0v2a1 1 0 11-2 0v-2zm2-3a1 1 0 00-1 1v.01a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
);


export default EditProfileModal;
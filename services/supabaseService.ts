import { supabase } from '../lib/supabaseClient';
import { Invoice, Profile } from '../types';
import { User } from '@supabase/supabase-js';

// Simple UUID v4 generator for broader browser compatibility.
export const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};

export async function createInvoiceSupabase(invoice: Invoice) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    const errorMsg = 'User is not authenticated. Cannot create invoice.';
    console.error(errorMsg);
    throw new Error(errorMsg);
  }
  
  const { error } = await supabase.from('invoices').insert([
    {
      id: invoice.id,
      user_id: user.id,
      client_name: invoice.clientName,
      amount: invoice.amount,
      issue_date: invoice.issueDate,
      due_date: invoice.dueDate,
      status: invoice.status,
      observations: invoice.observations,
    },
  ]);
  if (error) {
    console.error('Error creating invoice in Supabase:', error);
    throw error;
  }
}

export async function updateInvoiceSupabase(invoice: Invoice) {
  const { error } = await supabase.from('invoices').update({
    client_name: invoice.clientName,
    amount: invoice.amount,
    issue_date: invoice.issueDate,
    due_date: invoice.dueDate,
    status: invoice.status,
    observations: invoice.observations,
  }).eq('id', invoice.id);
  if (error) {
    console.error('Error updating invoice in Supabase:', error);
    throw error;
  }
}

export async function deleteInvoiceSupabase(id: string) {
  const { error } = await supabase.from('invoices').delete().eq('id', id);
  if (error) {
    console.error('Error deleting invoice in Supabase:', error);
    throw error;
  }
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
    console.error('Error fetching profile:', error);
    throw error;
  }
  return data;
}

export async function updateProfile(userId: string, updates: Partial<Omit<Profile, 'id'>>) {
  const { error } = await supabase.from('profiles').upsert({
    id: userId,
    ...updates,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
}


export async function uploadProfilePicture(userId: string, file: File) {
  const fileExt = file.name.split('.').pop();
  const filePath = `${userId}/${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('profile-images')
    .upload(filePath, file);

  if (uploadError) {
    console.error('Error uploading profile image:', uploadError);
    throw uploadError;
  }
  
  const { data } = supabase.storage
    .from('profile-images')
    .getPublicUrl(filePath);

  if (!data || !data.publicUrl) {
      const urlError = new Error('Could not get public URL for profile image.');
      console.error(urlError);
      throw urlError;
  }

  return data.publicUrl;
}


export async function updateUserProfileData(updates: { full_name?: string; avatar_url?: string }): Promise<User | null> {
    const { data, error } = await supabase.auth.updateUser({
        data: updates
    });

    if (error) {
        console.error('Error updating user profile:', error);
        throw error;
    }

    return data.user;
}
export enum InvoiceStatus {
  Pago = 'Pago',
  Pendente = 'Pendente',
  Vencido = 'Vencido',
}

export interface Invoice {
  id: string;
  clientName: string;
  amount: number;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  observations: string;
}

export interface Message {
  role: 'user' | 'model';
  text: string;
}

export type Page = 'dashboard' | 'profile' | 'create-invoice' | 'invoices' | 'about' | 'calendar' | 'settings' | 'chatbot';

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  company: string | null;
  job_title: string | null;
  bio: string | null;
}

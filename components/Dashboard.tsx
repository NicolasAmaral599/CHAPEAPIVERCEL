import React from 'react';
import { Invoice, InvoiceStatus } from '../types';
import StatCard from './StatCard';
import DashboardChart from './DashboardChart';
import InvoiceList from './InvoiceList';
import { useTranslations } from '../context/LanguageContext';
import DashboardPieChart from './DashboardPieChart';

interface DashboardProps {
  invoices: Invoice[];
}

const Dashboard: React.FC<DashboardProps> = ({ invoices }) => {
  const { t } = useTranslations();

  const stats = React.useMemo(() => {
    const initialStats = {
      total: 0,
      paid: 0,
      paidCount: 0,
      pending: 0,
      pendingCount: 0,
      overdue: 0,
      overdueCount: 0,
    };

    return invoices.reduce((acc, inv) => {
      acc.total += inv.amount;
      if (inv.status === InvoiceStatus.Pago) {
        acc.paid += inv.amount;
        acc.paidCount++;
      } else if (inv.status === InvoiceStatus.Pendente) {
        acc.pending += inv.amount;
        acc.pendingCount++;
      } else if (inv.status === InvoiceStatus.Vencido) {
        acc.overdue += inv.amount;
        acc.overdueCount++;
      }
      return acc;
    }, initialStats);
  }, [invoices]);

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200">{t('dashboard.title')}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title={t('dashboard.totalBilled')} value={`R$ ${stats.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} color="blue" />
        <StatCard title={t('dashboard.paidInvoices')} value={`R$ ${stats.paid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} count={stats.paidCount} color="green" />
        <StatCard title={t('dashboard.pendingInvoices')} value={`R$ ${stats.pending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} count={stats.pendingCount} color="yellow" />
        <StatCard title={t('dashboard.overdueInvoices')} value={`R$ ${stats.overdue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} count={stats.overdueCount} color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold mb-4">{t('dashboard.chartTitle')}</h3>
          <DashboardChart invoices={invoices} />
        </div>
        <div className="lg:col-span-1 bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm flex flex-col">
            <h3 className="text-xl font-semibold mb-4">{t('dashboard.revenueByStatus')}</h3>
            <DashboardPieChart invoices={invoices} />
        </div>
      </div>

      <div>
        <InvoiceList invoices={invoices} />
      </div>
    </div>
  );
};

export default Dashboard;
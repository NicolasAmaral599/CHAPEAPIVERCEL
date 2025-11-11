import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Invoice, InvoiceStatus } from '../types';
import { useTranslations } from '../context/LanguageContext';

interface DashboardChartProps {
    invoices: Invoice[];
}

const DashboardChart: React.FC<DashboardChartProps> = ({ invoices }) => {
    const { t } = useTranslations();

    const data = useMemo(() => {
        const counts = {
            [InvoiceStatus.Pago]: 0,
            [InvoiceStatus.Pendente]: 0,
            [InvoiceStatus.Vencido]: 0,
        };

        invoices.forEach(invoice => {
            counts[invoice.status]++;
        });

        return [
            { name: t('common.status.Pago'), value: counts[InvoiceStatus.Pago], fill: '#22c55e' },
            { name: t('common.status.Pendente'), value: counts[InvoiceStatus.Pendente], fill: '#f59e0b' },
            { name: t('common.status.Vencido'), value: counts[InvoiceStatus.Vencido], fill: '#ef4444' },
        ];
    }, [invoices, t]);

    return (
        <div style={{ width: '100%', height: 300 }} className="text-slate-500 dark:text-slate-400 text-xs">
            <ResponsiveContainer>
                <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: 'currentColor' }} />
                    <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: 'currentColor' }} />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'rgba(30, 41, 59, 0.9)',
                            borderColor: '#4a5568',
                            borderRadius: '0.5rem',
                            color: '#fff',
                        }}
                        cursor={{ fill: 'rgba(100, 116, 139, 0.1)', radius: 4 }}
                    />
                    <Bar dataKey="value" name={t('dashboard.chartTooltip')} barSize={80} radius={[8, 8, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default DashboardChart;
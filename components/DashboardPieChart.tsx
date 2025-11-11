import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Invoice, InvoiceStatus } from '../types';
import { useTranslations } from '../context/LanguageContext';

interface DashboardPieChartProps {
    invoices: Invoice[];
}

const COLORS = {
    [InvoiceStatus.Pago]: '#22c55e',
    [InvoiceStatus.Pendente]: '#f59e0b',
    [InvoiceStatus.Vencido]: '#ef4444',
};

const DashboardPieChart: React.FC<DashboardPieChartProps> = ({ invoices }) => {
    const { t } = useTranslations();

    const data = useMemo(() => {
        const amounts = {
            [InvoiceStatus.Pago]: 0,
            [InvoiceStatus.Pendente]: 0,
            [InvoiceStatus.Vencido]: 0,
        };

        invoices.forEach(invoice => {
            amounts[invoice.status] += invoice.amount;
        });

        return [
            { name: t('common.status.Pago'), value: amounts[InvoiceStatus.Pago], color: COLORS[InvoiceStatus.Pago] },
            { name: t('common.status.Pendente'), value: amounts[InvoiceStatus.Pendente], color: COLORS[InvoiceStatus.Pendente] },
            { name: t('common.status.Vencido'), value: amounts[InvoiceStatus.Vencido], color: COLORS[InvoiceStatus.Vencido] },
        ].filter(item => item.value > 0);
    }, [invoices, t]);

    if (data.length === 0) {
        return <div className="flex items-center justify-center h-full text-slate-500 dark:text-slate-400"><p>{t('dashboard.noData')}</p></div>
    }

    const RADIAN = Math.PI / 180;
    // Fix: Add explicit `any` type to the props of the custom label renderer to resolve TypeScript error with recharts.
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        if (percent < 0.05) return null; // Don't render label for very small slices

        return (
            <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="font-bold text-xs pointer-events-none">
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };


    return (
        <ResponsiveContainer width="100%" height={250}>
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={100}
                    innerRadius={40}
                    paddingAngle={5}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    cornerRadius={8}
                >
                    {data.map((entry) => (
                        <Cell key={`cell-${entry.name}`} fill={entry.color} stroke={entry.color} />
                    ))}
                </Pie>
                <Tooltip
                    formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, undefined]}
                    contentStyle={{
                        backgroundColor: 'rgba(30, 41, 59, 0.9)',
                        borderColor: '#4a5568',
                        borderRadius: '0.5rem',
                        color: '#fff',
                    }}
                />
                <Legend 
                    iconSize={10} 
                    layout="vertical" 
                    verticalAlign="middle" 
                    align="right" 
                    formatter={(value) => <span className="text-slate-600 dark:text-slate-300 text-sm">{value}</span>}
                />
            </PieChart>
        </ResponsiveContainer>
    );
};

export default DashboardPieChart;
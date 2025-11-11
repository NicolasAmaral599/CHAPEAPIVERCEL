import React, { useState, useMemo } from 'react';
import { Invoice, InvoiceStatus } from '../types';
import { useTranslations } from '../context/LanguageContext';

interface CalendarPageProps {
  invoices: Invoice[];
}

const statusClasses = {
  [InvoiceStatus.Pago]: 'bg-green-500',
  [InvoiceStatus.Pendente]: 'bg-yellow-500',
  [InvoiceStatus.Vencido]: 'bg-red-500',
};

const statusBadgeClasses = {
  [InvoiceStatus.Pago]: 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300',
  [InvoiceStatus.Pendente]: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300',
  [InvoiceStatus.Vencido]: 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300',
};

// Helper function to parse date string as local date to avoid timezone issues.
const parseDateAsLocal = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
};

const CalendarPage: React.FC<CalendarPageProps> = ({ invoices }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { t, language, formatDate } = useTranslations();

  const locale = language === 'pt' ? 'pt-BR' : 'en-US';

  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

  const invoicesByDueDate = useMemo(() => {
    const map = new Map<string, Invoice[]>();
    invoices.forEach(invoice => {
      const dateKey = parseDateAsLocal(invoice.dueDate).toDateString();
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)!.push(invoice);
    });
    return map;
  }, [invoices]);

  const selectedDayInvoices = useMemo(() => {
    if (!selectedDate) return [];
    return invoicesByDueDate.get(selectedDate.toDateString()) || [];
  }, [selectedDate, invoicesByDueDate]);


  const renderHeader = () => {
    const months = Array.from({length: 12}, (_, i) => new Date(0, i).toLocaleString(locale, { month: 'long' }));
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: currentYear - 2019 + 5 }, (_, i) => 2020 + i);

    const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newMonth = parseInt(e.target.value, 10);
      setCurrentDate(new Date(currentDate.getFullYear(), newMonth, 1));
    };

    const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newYear = parseInt(e.target.value, 10);
      setCurrentDate(new Date(newYear, currentDate.getMonth(), 1));
    };

    return (
      <div className="flex items-center justify-between py-2 px-6">
        <button
          onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
          className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          aria-label={t('calendar.prevMonth')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div className="flex items-center gap-4">
            <select
                value={currentDate.getMonth()}
                onChange={handleMonthChange}
                className="px-3 py-2 text-sm font-medium rounded-md bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label={t('calendar.selectMonth')}
            >
                {months.map((month, index) => (
                    <option key={month} value={index}>{month}</option>
                ))}
            </select>
            <select
                value={currentDate.getFullYear()}
                onChange={handleYearChange}
                className="px-3 py-2 text-sm font-medium rounded-md bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label={t('calendar.selectYear')}
            >
                {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                ))}
            </select>
        </div>
        <button
          onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
          className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          aria-label={t('calendar.nextMonth')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
    );
  };

  const renderDays = () => {
    const days = Array.from({length: 7}, (_, i) => new Date(0, 0, i).toLocaleString(locale, { weekday: 'short' }));
    return (
      <div className="grid grid-cols-7 text-center font-medium text-slate-500 dark:text-slate-400 text-sm">
        {days.map(day => <div key={day} className="py-2">{day}</div>)}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = firstDayOfMonth;
    const monthEnd = lastDayOfMonth;
    const startDate = new Date(monthStart);
    startDate.setDate(startDate.getDate() - monthStart.getDay());
    
    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= monthEnd || day.getDay() !== 0) {
        for (let i = 0; i < 7; i++) {
            const cloneDay = new Date(day);
            const isCurrentMonth = day.getMonth() === currentDate.getMonth();
            const isToday = day.toDateString() === new Date().toDateString();
            const isSelected = selectedDate?.toDateString() === day.toDateString();
            
            const dayInvoices = invoicesByDueDate.get(cloneDay.toDateString()) || [];
            const statuses = new Set(dayInvoices.map(inv => inv.status));

            days.push(
                <div
                    key={day.toString()}
                    className={`border-t border-l border-slate-200 dark:border-slate-700 p-2 h-24 sm:h-28 flex flex-col cursor-pointer transition-colors ${
                        !isCurrentMonth ? 'text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/50' : 'hover:bg-indigo-50 dark:hover:bg-indigo-900/30'
                    } ${ isSelected ? 'bg-indigo-100 dark:bg-indigo-900/50' : ''}`}
                    onClick={() => setSelectedDate(cloneDay)}
                >
                    <span className={`self-end font-medium text-xs sm:text-base ${isToday ? 'bg-indigo-600 text-white rounded-full h-7 w-7 flex items-center justify-center' : ''}`}>
                        {day.getDate()}
                    </span>
                     <div className="flex-grow flex items-end">
                        <div className="flex space-x-1">
                            {/* FIX: Explicitly type `status` as InvoiceStatus to resolve type inference issue. */}
                            {Array.from(statuses).map((status: InvoiceStatus) => (
                                <div key={status} className={`w-2 h-2 rounded-full ${statusClasses[status]}`} title={t(`common.status.${status}`)}></div>
                            ))}
                        </div>
                    </div>
                </div>
            );
            day.setDate(day.getDate() + 1);
        }
        rows.push(<div className="grid grid-cols-7" key={day.toString()}>{days}</div>);
        days = [];
        if (day > monthEnd && day.getDay() === 0) break;
    }
    return <div className="border-r border-b border-slate-200 dark:border-slate-700">{rows}</div>;
  };

  return (
    <div className="flex flex-col lg:flex-row h-full gap-6">
      <div className="flex-1 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
        {renderHeader()}
        {renderDays()}
        {renderCells()}
      </div>
      <aside className="w-full lg:w-96 bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 overflow-y-auto lg:max-h-[calc(100vh-10rem)]">
        <h3 className="text-xl font-semibold mb-4">
          {selectedDate ? `${t('calendar.sidebarTitle')} ${formatDate(selectedDate)}` : t('calendar.sidebarPrompt')}
        </h3>
        {selectedDayInvoices.length > 0 ? (
          <div className="space-y-4">
            {selectedDayInvoices.map(invoice => (
              <div key={invoice.id} className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-md">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold">{invoice.id}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{invoice.clientName}</p>
                  </div>
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${statusBadgeClasses[invoice.status]}`}>
                    {t(`common.status.${invoice.status}`)}
                  </span>
                </div>
                <p className="text-right font-semibold mt-2">
                    R$ {invoice.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 dark:text-slate-400 text-center mt-8">
            {selectedDate ? t('calendar.noInvoicesForDate') : t('calendar.selectDateMessage')}
          </p>
        )}
      </aside>
    </div>
  );
};

export default CalendarPage;
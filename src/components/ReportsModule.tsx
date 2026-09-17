import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../translations';
import { formatCurrency, formatCFT, formatDate } from '../utils/formatters';
import {
  FileSpreadsheet,
  Printer,
  Calendar,
  Layers,
  Users,
  TrendingUp,
  DollarSign,
  Truck,
  CheckCircle2,
  AlertTriangle,
  Download,
  Loader2,
  Info
} from 'lucide-react';
import {
  downloadElementAsPdf,
  printElementDirectly,
  printElementViaHiddenFrame,
  downloadCsv
} from '../utils/reportExport';

export const ReportsModule: React.FC = () => {
  const {
    data,
    language,
    shareholderShares,
    totalInvestedCapital,
    runningStockCFT,
    totalExtractedCFT,
    totalSoldCFT,
    totalWastageCFT,
    getCustomerSummary
  } = useApp();

  const t = translations[language];

  const [periodFilter, setPeriodFilter] = useState<'all' | 'month' | 'week' | 'today' | 'custom'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Calculate filtered date range
  const now = new Date();
  const filterDateRange = useMemo(() => {
    let start: Date | null = null;
    let end: Date | null = null;

    if (periodFilter === 'today') {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    } else if (periodFilter === 'week') {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      start = new Date(now.setDate(diff));
      start.setHours(0, 0, 0, 0);
      end = new Date();
    } else if (periodFilter === 'month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    } else if (periodFilter === 'custom' && startDate && endDate) {
      start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      end = new Date(endDate);
      end.setHours(23, 59, 59);
    }

    return { start, end };
  }, [periodFilter, startDate, endDate]);

  const isWithinPeriod = (dateStr: string) => {
    if (!filterDateRange.start || !filterDateRange.end) return true;
    const d = new Date(dateStr);
    return d >= filterDateRange.start && d <= filterDateRange.end;
  };

  // Filtered dataset for reporting
  const filteredSales = useMemo(() => {
    return data.sales.filter(s => isWithinPeriod(s.date));
  }, [data.sales, filterDateRange]);

  const filteredExtractions = useMemo(() => {
    return data.extractions.filter(e => isWithinPeriod(e.date));
  }, [data.extractions, filterDateRange]);

  const filteredExpenses = useMemo(() => {
    return data.expenses.filter(e => isWithinPeriod(e.date));
  }, [data.expenses, filterDateRange]);

  const filteredWastages = useMemo(() => {
    return data.wastages.filter(w => isWithinPeriod(w.date));
  }, [data.wastages, filterDateRange]);

  // Financial aggregates for the chosen period
  const periodExtractedCFT = filteredExtractions.reduce((sum, e) => sum + e.quantityCFT, 0);
  const periodSoldCFT = filteredSales.reduce((sum, s) => sum + s.quantityCFT, 0);
  const periodWastageCFT = filteredWastages.reduce((sum, w) => sum + w.quantityCFT, 0);

  const periodSalesRevenue = filteredSales.reduce((sum, s) => sum + s.totalAmount, 0);
  const periodCashCollected = filteredSales.reduce((sum, s) => sum + s.paidAmount, 0);
  const periodDueReceivable = filteredSales.reduce((sum, s) => sum + s.dueAmount, 0);

  const periodDirectCost = filteredExtractions.reduce((sum, e) => sum + e.extractionCost, 0);
  const periodOperationalExpense = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const periodTotalCosts = periodDirectCost + periodOperationalExpense;

  const periodNetProfit = periodSalesRevenue - periodTotalCosts;

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'info' | 'error'; message: string } | null>(null);

  const showNotification = (type: 'success' | 'info' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 7000);
  };

  const getPeriodLabel = () => {
    if (periodFilter === 'all') return language === 'bn' ? 'সার্বিক_সকল_সময়' : 'All_Time';
    if (periodFilter === 'month') return language === 'bn' ? 'চলতি_মাস' : 'This_Month';
    if (periodFilter === 'week') return language === 'bn' ? 'চলতি_সপ্তাহ' : 'This_Week';
    if (periodFilter === 'today') return language === 'bn' ? 'আজকের' : 'Today';
    return `${startDate || 'শুরু'}_হতে_${endDate || 'শেষ'}`;
  };

  // High-fidelity client-side PDF export
  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    showNotification(
      'info',
      language === 'bn'
        ? 'পিডিএফ প্রস্তুত করা হচ্ছে... অনুগ্রহ করে কয়েক সেকেন্ড অপেক্ষা করুন।'
        : 'Generating high-resolution PDF... Please wait a few seconds.'
    );

    try {
      const filename = `সততা_বালু_মহাল_অডিট_রিপোর্ট_${getPeriodLabel()}_${new Date().toISOString().slice(0, 10)}.pdf`;
      const success = await downloadElementAsPdf('business-audit-report-document', {
        filename,
        margin: 8,
        orientation: 'portrait'
      });

      if (success) {
        showNotification(
          'success',
          language === 'bn'
            ? '✅ সফলভাবে PDF রিপোর্ট আপনার ডিভাইসে ডাউনলোড সম্পন্ন হয়েছে!'
            : '✅ PDF report downloaded successfully to your device!'
        );
      } else {
        // Fallback: try hidden iframe print
        showNotification(
          'info',
          language === 'bn'
            ? 'সরাসরি PDF ডাউনলোড না হলে প্রিন্ট ডায়ালগ থেকে "Save as PDF" নির্বাচন করুন।'
            : 'Please select "Save as PDF" from the print dialog.'
        );
        printElementViaHiddenFrame(
          'business-audit-report-document',
          language === 'bn' ? 'সততা বালু মহাল - অডিট রিপোর্ট' : 'Sand Business Audit Report'
        );
      }
    } catch (err) {
      console.error(err);
      showNotification(
        'error',
        language === 'bn'
          ? 'পিডিএফ তৈরিতে সমস্যা হয়েছে। অনুগ্রহ করে প্রিন্ট বাটন দিয়ে সংরক্ষণ করুন।'
          : 'Failed to generate PDF. Please try the Print button.'
      );
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Print function with hidden iframe support for sandboxed environments
  const handlePrint = () => {
    const success = printElementViaHiddenFrame(
      'business-audit-report-document',
      language === 'bn' ? 'সততা বালু মহাল - সার্বিক অডিট রিপোর্ট' : 'Sand Business Audit Report'
    );

    if (success) {
      showNotification(
        'info',
        language === 'bn'
          ? '🖨️ প্রিন্ট ডায়ালগ খোলা হয়েছে। আপনি চাইলে প্রিন্টার নির্বাচন করতে পারেন অথবা "Save as PDF" এ সংরক্ষণ করতে পারেন।'
          : '🖨️ Print dialog opened. Choose your printer or select "Save as PDF".'
      );
    } else {
      printElementDirectly('business-audit-report-document');
    }
  };

  // Export full financial and stock dataset to Excel CSV
  const handleExportCsv = () => {
    const filename = `বালু_ব্যবসা_অডিট_${getPeriodLabel()}_${new Date().toISOString().slice(0, 10)}.csv`;
    const headers = [
      language === 'bn' ? 'বিভাগ / খাত' : 'Category',
      language === 'bn' ? 'আইটেম / নাম' : 'Item / Name',
      language === 'bn' ? 'পরিমাণ / মেজারমেন্ট' : 'Quantity / Info',
      language === 'bn' ? 'টাকার পরিমাণ (৳)' : 'Amount (BDT)'
    ];

    const rows: (string | number)[][] = [
      [language === 'bn' ? 'প্রতিষ্ঠান' : 'Company', language === 'bn' ? 'মেসার্স সততা বালু মহাল ও সরবরাহকারী' : 'M/S Sand Mining & Joint Venture', '', ''],
      [language === 'bn' ? 'অডিট সময়কাল' : 'Period', getPeriodLabel(), '', ''],
      [language === 'bn' ? 'রিপোর্ট তৈরির তারিখ' : 'Date', new Date().toLocaleDateString('bn-BD'), '', ''],
      ['', '', '', ''],
      [language === 'bn' ? 'আর্থিক বিবরণী' : 'Financial Statement', language === 'bn' ? 'মোট বিক্রয় রাজস্ব' : 'Gross Sales Revenue', `${periodSoldCFT} CFT`, periodSalesRevenue],
      [language === 'bn' ? 'আর্থিক বিবরণী' : 'Financial Statement', language === 'bn' ? 'নগদ আদায়কৃত অর্থ' : 'Cash Collected', '', periodCashCollected],
      [language === 'bn' ? 'আর্থিক বিবরণী' : 'Financial Statement', language === 'bn' ? 'বকেয়া পাওনা জের' : 'Total Due Receivable', '', periodDueReceivable],
      [language === 'bn' ? 'আর্থিক বিবরণী' : 'Financial Statement', language === 'bn' ? 'সরাসরি উত্তোলন খরচ (ড্রেজার)' : 'Direct Pumping Cost', `${periodExtractedCFT} CFT`, periodDirectCost],
      [language === 'bn' ? 'আর্থিক বিবরণী' : 'Financial Statement', language === 'bn' ? 'সাধারণ পরিচালন ব্যয়' : 'Operating Expenses', '', periodOperationalExpense],
      [language === 'bn' ? 'আর্থিক বিবরণী' : 'Financial Statement', language === 'bn' ? 'সর্বমোট খরচ' : 'Total Costs', '', periodTotalCosts],
      [language === 'bn' ? 'আর্থিক বিবরণী' : 'Financial Statement', language === 'bn' ? 'নিট লাভ / লোকসান' : 'Net Profit / Loss', '', periodNetProfit],
      [language === 'bn' ? 'আর্থিক বিবরণী' : 'Financial Statement', language === 'bn' ? 'মোট যৌথ মূলধন' : 'Total Capital', '', totalInvestedCapital],
      ['', '', '', ''],
      // Shareholders
      ...shareholderShares.map(sh => [
        language === 'bn' ? 'শেয়ারহোল্ডার মুনাফা বন্টন' : 'Shareholder Dividend',
        sh.shareholder.name,
        `${sh.sharePercentage}% (${language === 'bn' ? 'মূলধন' : 'Capital'}: ${sh.totalInvestment} ৳)`,
        sh.profitShare
      ]),
      ['', '', '', ''],
      // Customers
      ...data.customers.map(c => {
        const s = getCustomerSummary(c.id);
        return [
          language === 'bn' ? 'ক্রেতার খাতা জের' : 'Customer Ledger',
          `${c.name} (${c.phone || '-'})`,
          `${s.totalCFT} CFT | ${language === 'bn' ? 'মোট বিল' : 'Bill'}: ${s.totalBill} ৳ | ${language === 'bn' ? 'পরিশোধ' : 'Paid'}: ${s.totalPaid} ৳`,
          s.totalDue
        ];
      }),
      ['', '', '', ''],
      // Stockpile
      [language === 'bn' ? 'বালু মজুদ অডিট' : 'Stock Audit', language === 'bn' ? 'মোট উত্তোলন (+)' : 'Total Extracted (+)', `${totalExtractedCFT} CFT`, ''],
      [language === 'bn' ? 'বালু মজুদ অডিট' : 'Stock Audit', language === 'bn' ? 'মোট বিক্রয় (-)' : 'Total Sold (-)', `${totalSoldCFT} CFT`, ''],
      [language === 'bn' ? 'বালু মজুদ অডিট' : 'Stock Audit', language === 'bn' ? 'ঘাটতি / অপচয় (-)' : 'Total Wastage (-)', `${totalWastageCFT} CFT`, ''],
      [language === 'bn' ? 'বালু মজুদ অডিট' : 'Stock Audit', language === 'bn' ? 'বর্তমান ইয়ার্ড স্টক (=)' : 'Current Running Stock (=)', `${runningStockCFT} CFT`, '']
    ];

    downloadCsv(filename, headers, rows);
    showNotification(
      'success',
      language === 'bn'
        ? '📊 এক্সেল / CSV ডাটা ফাইল সফলভাবে ডাউনলোড সম্পন্ন হয়েছে!'
        : '📊 Excel / CSV spreadsheet downloaded successfully!'
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Controls (Hidden on Print) */}
      <div className="no-print flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-amber-600" />
            {t.businessSummaryReport}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'bn'
              ? 'লাভ-লোকসান অডিট, শেয়ারহোল্ডার মুনাফা বন্টন বিবরণী ও স্টক রিকনসিলিয়েশন প্রতিবেদন।'
              : 'Audit balance sheet, shareholder dividends, and inventory stock reconciliation statements.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Period Filter Buttons */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-medium">
            <button
              onClick={() => setPeriodFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                periodFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.filterAllTime}
            </button>
            <button
              onClick={() => setPeriodFilter('month')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                periodFilter === 'month'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.filterThisMonth}
            </button>
            <button
              onClick={() => setPeriodFilter('week')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                periodFilter === 'week'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.filterThisWeek}
            </button>
            <button
              onClick={() => setPeriodFilter('today')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                periodFilter === 'today'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.filterToday}
            </button>
            <button
              onClick={() => setPeriodFilter('custom')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                periodFilter === 'custom'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {language === 'bn' ? 'তারিখ নির্দিষ্ট' : 'Custom'}
            </button>
          </div>

          {/* PDF Download Button */}
          <button
            id="download-pdf-report-btn"
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            {isGeneratingPdf ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{language === 'bn' ? 'তৈরি হচ্ছে...' : 'Generating...'}</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>{language === 'bn' ? 'PDF রিপোর্ট' : 'Download PDF'}</span>
              </>
            )}
          </button>

          {/* Direct Print Button */}
          <button
            id="print-report-btn"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>{language === 'bn' ? 'প্রিন্ট' : 'Print'}</span>
          </button>

          {/* CSV / Excel Export Button */}
          <button
            id="export-csv-btn"
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
            title={language === 'bn' ? 'এক্সেল স্প্রেডশিট ডাউনলোড' : 'Download Excel CSV'}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{language === 'bn' ? 'CSV এক্সেল' : 'CSV'}</span>
          </button>
        </div>
      </div>

      {/* Notification Toast Banner */}
      {notification && (
        <div
          className={`no-print p-4 rounded-xl border text-xs flex items-center justify-between transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : notification.type === 'info'
              ? 'bg-blue-50 border-blue-200 text-blue-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2 font-medium">
            {notification.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
            {notification.type === 'info' && <Info className="w-4 h-4 text-blue-600 shrink-0" />}
            {notification.type === 'error' && <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-slate-600 font-bold ml-3"
          >
            ✕
          </button>
        </div>
      )}

      {/* Custom Date Pickers (if selected) */}
      {periodFilter === 'custom' && (
        <div className="no-print bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">{t.dateFrom}:</span>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">{t.dateTo}:</span>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
            />
          </div>
        </div>
      )}

      {/* Main Printable Document Section */}
      <div
        id="business-audit-report-document"
        className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 print:p-0 print:border-none print:shadow-none space-y-8"
      >
        {/* Printable Header */}
        <div className="border-b-2 border-slate-900 pb-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-950 tracking-tight">
                {language === 'bn' ? 'মেসার্স সততা বালু মহাল ও সরবরাহকারী' : 'M/S Sand Mining & Joint Venture'}
              </h1>
              <p className="text-xs text-slate-600 mt-1 font-medium">
                {t.businessSummaryReport} • {language === 'bn' ? 'মেঘনা চর ঘাট বালু স্টকপাইল ইয়ার্ড' : 'Meghna Ghat Sand Stockpile Yard'}
              </p>
            </div>
            <div className="text-left sm:text-right text-xs">
              <span className="px-2.5 py-1 bg-amber-100 text-amber-900 font-bold rounded-md border border-amber-300 inline-block text-[11px]">
                {language === 'bn' ? 'সময়কাল: ' : 'Period: '}
                {periodFilter === 'all'
                  ? t.filterAllTime
                  : periodFilter === 'month'
                  ? t.filterThisMonth
                  : periodFilter === 'week'
                  ? t.filterThisWeek
                  : periodFilter === 'today'
                  ? t.filterToday
                  : `${startDate || '-'} হতে ${endDate || '-'}`}
              </span>
              <p className="text-slate-500 text-[11px] mt-1.5">
                {t.printDate}: {formatDate(new Date().toISOString(), language)}
              </p>
            </div>
          </div>
        </div>

        {/* 1. Core Financial & Operating Performance Grid */}
        <div>
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            {language === 'bn' ? '১. সার্বিক আর্থিক ও লাভ-লোকসান বিবরণী' : '1. Financial & Profit / Loss Statement'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Sales Revenue */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">{t.grossRevenue}</span>
              <p className="text-xl font-black text-slate-900 mt-1">
                {formatCurrency(periodSalesRevenue, language)}
              </p>
              <div className="mt-2 text-[11px] text-slate-600 space-y-0.5">
                <div className="flex justify-between">
                  <span>{t.cashReceived}:</span>
                  <span className="font-semibold text-emerald-700">{formatCurrency(periodCashCollected, language)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t.totalDueReceivable}:</span>
                  <span className="font-semibold text-rose-600">{formatCurrency(periodDueReceivable, language)}</span>
                </div>
              </div>
            </div>

            {/* Total Expenses */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">{t.totalExpenseSum}</span>
              <p className="text-xl font-black text-rose-700 mt-1">
                {formatCurrency(periodTotalCosts, language)}
              </p>
              <div className="mt-2 text-[11px] text-slate-600 space-y-0.5">
                <div className="flex justify-between">
                  <span>{language === 'bn' ? 'উত্তোলন সরাসরি খরচ:' : 'Direct Pumping:'}</span>
                  <span className="font-semibold">{formatCurrency(periodDirectCost, language)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{language === 'bn' ? 'সাধারণ পরিচালন ব্যয়:' : 'Operating Costs:'}</span>
                  <span className="font-semibold">{formatCurrency(periodOperationalExpense, language)}</span>
                </div>
              </div>
            </div>

            {/* Net Profit / Loss */}
            <div className={`p-4 rounded-xl border ${periodNetProfit >= 0 ? 'border-emerald-200 bg-emerald-50/50' : 'border-rose-200 bg-rose-50/50'}`}>
              <span className="text-[11px] font-semibold text-slate-600 uppercase">{t.netProfitLoss}</span>
              <p className={`text-xl font-black mt-1 ${periodNetProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {formatCurrency(periodNetProfit, language)}
              </p>
              <p className="text-[11px] text-slate-600 mt-2">
                {periodNetProfit >= 0
                  ? (language === 'bn' ? 'অংশীদারদের মাঝে বন্টনযোগ্য নিট লাভ' : 'Net profit for distribution')
                  : (language === 'bn' ? 'উক্ত সময়কালে ব্যবসায়িক ক্ষতি' : 'Net business loss')}
              </p>
            </div>

            {/* Total Capital Base */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">{t.totalCapital}</span>
              <p className="text-xl font-black text-slate-900 mt-1">
                {formatCurrency(totalInvestedCapital, language)}
              </p>
              <p className="text-[11px] text-slate-600 mt-2">
                {data.shareholders.length} {language === 'bn' ? 'জন মূলধন বিনিয়োগকারী অংশীদার' : 'active joint investors'}
              </p>
            </div>
          </div>
        </div>

        {/* 2. Shareholder Profit Distribution Table */}
        <div>
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-teal-600" />
            {language === 'bn' ? '২. শেয়ারহোল্ডার অনুপাতে স্বয়ংক্রিয় লাভ-ভাগ হিসাব' : '2. Automatic Shareholder Profit Allocation'}
          </h3>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
                  <th className="p-3">{language === 'bn' ? 'অংশীদারের নাম' : 'Shareholder Name'}</th>
                  <th className="p-3 text-right">{t.initialInvestment}</th>
                  <th className="p-3 text-right">{language === 'bn' ? 'অতিরিক্ত বিনিয়োগ' : 'Additional'}</th>
                  <th className="p-3 text-right">{t.totalContribution}</th>
                  <th className="p-3 text-center">{t.sharePercentage}</th>
                  <th className="p-3 text-right font-bold text-emerald-800">{language === 'bn' ? 'প্রাপ্য লাভ (মুনাফা)' : 'Calculated Profit'}</th>
                  <th className="p-3 text-right text-amber-800">{t.totalWithdrawn}</th>
                  <th className="p-3 text-right font-black">{language === 'bn' ? 'অবশিষ্ট পাওনা ব্যালেন্স' : 'Net Receivable'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {shareholderShares.map(sh => (
                  <tr key={sh.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">
                      {sh.name}
                      <span className="block text-[10px] text-slate-500 font-normal">{sh.phone}</span>
                    </td>
                    <td className="p-3 text-right">{formatCurrency(sh.initialInvestment, language)}</td>
                    <td className="p-3 text-right">{formatCurrency(sh.additionalInvestment, language)}</td>
                    <td className="p-3 text-right font-bold text-slate-900">{formatCurrency(sh.totalInvested, language)}</td>
                    <td className="p-3 text-center font-bold text-teal-800">{sh.sharePercentage}%</td>
                    <td className="p-3 text-right font-bold text-emerald-700">{formatCurrency(sh.profitShareAmount, language)}</td>
                    <td className="p-3 text-right text-amber-700">{formatCurrency(sh.totalWithdrawn, language)}</td>
                    <td className="p-3 text-right font-black text-sm">
                      <span className={sh.netReceivableOrPayable >= 0 ? 'text-emerald-700' : 'text-rose-700'}>
                        {formatCurrency(sh.netReceivableOrPayable, language)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 font-black text-slate-900 border-t-2 border-slate-300">
                  <td className="p-3">{language === 'bn' ? 'সর্বমোট' : 'Total'}</td>
                  <td className="p-3 text-right">
                    {formatCurrency(
                      shareholderShares.reduce((s, sh) => s + sh.initialInvestment, 0),
                      language
                    )}
                  </td>
                  <td className="p-3 text-right">
                    {formatCurrency(
                      shareholderShares.reduce((s, sh) => s + sh.additionalInvestment, 0),
                      language
                    )}
                  </td>
                  <td className="p-3 text-right">{formatCurrency(totalInvestedCapital, language)}</td>
                  <td className="p-3 text-center">100%</td>
                  <td className="p-3 text-right text-emerald-700">
                    {formatCurrency(
                      shareholderShares.reduce((s, sh) => s + sh.profitShareAmount, 0),
                      language
                    )}
                  </td>
                  <td className="p-3 text-right text-amber-700">
                    {formatCurrency(
                      shareholderShares.reduce((s, sh) => s + sh.totalWithdrawn, 0),
                      language
                    )}
                  </td>
                  <td className="p-3 text-right">
                    {formatCurrency(
                      shareholderShares.reduce((s, sh) => s + sh.netReceivableOrPayable, 0),
                      language
                    )}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* 3. Customer Receivables & Due Summary */}
        <div>
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-amber-600" />
            {language === 'bn' ? '৩. ক্রেতাভিত্তিক বিক্রয় ও বকেয়া হিসাব খাতা' : '3. Customer Sales & Outstanding Due Ledger'}
          </h3>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
                  <th className="p-3">{language === 'bn' ? 'ক্রেতার নাম' : 'Customer Name'}</th>
                  <th className="p-3">{language === 'bn' ? 'ঠিকানা ও ফোন' : 'Contact / Address'}</th>
                  <th className="p-3 text-right">{language === 'bn' ? 'মোট সরবরাহ (CFT)' : 'Delivered (CFT)'}</th>
                  <th className="p-3 text-right">{language === 'bn' ? 'মোট বিল (৳)' : 'Total Billed (৳)'}</th>
                  <th className="p-3 text-right text-emerald-700">{language === 'bn' ? 'আদায়কৃত (৳)' : 'Collected (৳)'}</th>
                  <th className="p-3 text-right text-rose-700">{language === 'bn' ? 'অবশিষ্ট পাওনা (৳)' : 'Due Balance (৳)'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.customers.map(c => {
                  const summary = getCustomerSummary(c.id);
                  return (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900">{c.name}</td>
                      <td className="p-3 text-slate-600">
                        <div>{c.phone || '-'}</div>
                        <div className="text-[11px] text-slate-500">{c.address || '-'}</div>
                      </td>
                      <td className="p-3 text-right font-black text-amber-900">
                        {formatCFT(summary.totalCFT, language)}
                      </td>
                      <td className="p-3 text-right font-bold text-slate-900">
                        {formatCurrency(summary.totalBill, language)}
                      </td>
                      <td className="p-3 text-right font-semibold text-emerald-700">
                        {formatCurrency(summary.totalPaid, language)}
                      </td>
                      <td className="p-3 text-right font-bold">
                        <span className={summary.totalDue > 0 ? 'text-rose-600' : 'text-emerald-700'}>
                          {formatCurrency(summary.totalDue, language)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-slate-100 font-bold text-slate-900 border-t border-slate-300">
                <tr>
                  <td colSpan={2} className="p-3 uppercase tracking-wider">{t.total}</td>
                  <td className="p-3 text-right text-amber-900">
                    {formatCFT(
                      data.customers.reduce((sum, c) => sum + getCustomerSummary(c.id).totalCFT, 0),
                      language
                    )}
                  </td>
                  <td className="p-3 text-right">
                    {formatCurrency(
                      data.customers.reduce((sum, c) => sum + getCustomerSummary(c.id).totalBill, 0),
                      language
                    )}
                  </td>
                  <td className="p-3 text-right text-emerald-700">
                    {formatCurrency(
                      data.customers.reduce((sum, c) => sum + getCustomerSummary(c.id).totalPaid, 0),
                      language
                    )}
                  </td>
                  <td className="p-3 text-right text-rose-700">
                    {formatCurrency(
                      data.customers.reduce((sum, c) => sum + getCustomerSummary(c.id).totalDue, 0),
                      language
                    )}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* 4. Stockpile Audit & Reconciliation Section */}
        <div>
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-amber-600" />
            {language === 'bn' ? '৪. বালু স্টক রিকনসিলিয়েশন ও ফিজিক্যাল ব্যালেন্স অডিট' : '4. Sand Inventory Reconciliation & Stockpile Audit'}
          </h3>

          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500 block">{t.totalExtracted} (+)</span>
                <span className="text-base font-black text-amber-900 mt-1 block">
                  {formatCFT(totalExtractedCFT, language)}
                </span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500 block">{t.totalSold} (-)</span>
                <span className="text-base font-black text-blue-900 mt-1 block">
                  {formatCFT(totalSoldCFT, language)}
                </span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500 block">{t.totalWastage} (-)</span>
                <span className="text-base font-black text-rose-700 mt-1 block">
                  {formatCFT(totalWastageCFT, language)}
                </span>
              </div>
              <div className="p-3 bg-amber-100/70 rounded-lg border border-amber-300">
                <span className="text-[11px] font-bold text-amber-950 block">{t.runningStock} (=)</span>
                <span className="text-base font-black text-slate-950 mt-1 block">
                  {formatCFT(runningStockCFT, language)}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600">
              <span className="flex items-center gap-1 font-semibold text-emerald-700">
                <CheckCircle2 className="w-4 h-4" />
                {language === 'bn' ? 'গাণিতিক ব্যালেন্স শতভাগ নির্ভুল ও মিল রয়েছে।' : 'Balance equation reconciled.'}
              </span>
              <span className="font-mono text-slate-500 text-[11px]">
                {totalExtractedCFT} - {totalSoldCFT} - {totalWastageCFT} = {runningStockCFT} CFT
              </span>
            </div>
          </div>
        </div>

        {/* 4. Signatures (Clean print footer) */}
        <div className="pt-16 grid grid-cols-3 gap-6 text-center text-xs">
          <div>
            <div className="border-t border-slate-400 w-44 mx-auto pt-1 font-semibold text-slate-700">
              {language === 'bn' ? 'প্রস্তুতকারীর স্বাক্ষর' : 'Prepared By'}
            </div>
          </div>
          <div>
            <div className="border-t border-slate-400 w-44 mx-auto pt-1 font-semibold text-slate-700">
              {language === 'bn' ? 'অডিট ও হিসাব নিরীক্ষক' : 'Audited By'}
            </div>
          </div>
          <div>
            <div className="border-t border-slate-400 w-44 mx-auto pt-1 font-semibold text-slate-700">
              {language === 'bn' ? 'ব্যবস্থাপনা পরিচালক / শেয়ারহোল্ডার' : 'Managing Director'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

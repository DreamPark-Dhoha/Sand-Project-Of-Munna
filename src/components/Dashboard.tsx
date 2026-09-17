import React from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../translations';
import { formatCurrency, formatCFT, formatDate } from '../utils/formatters';
import { NewUserWelcomeBanner } from './NewUserWelcomeBanner';
import {
  TrendingUp,
  Layers,
  Truck,
  DollarSign,
  AlertTriangle,
  ArrowDownRight,
  ShieldCheck,
  PlusCircle,
  Clock,
  CheckCircle2,
  Users
} from 'lucide-react';

interface DashboardProps {
  setActiveTab: (tab: string) => void;
  onOpenNewSaleModal: () => void;
  onOpenNewExtractionModal: () => void;
  onOpenNewExpenseModal: () => void;
  onSelectSaleForDue: (saleId: string) => void;
  onSelectSaleForInvoice: (saleId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  setActiveTab,
  onOpenNewSaleModal,
  onOpenNewExtractionModal,
  onOpenNewExpenseModal,
  onSelectSaleForDue,
  onSelectSaleForInvoice
}) => {
  const {
    data,
    language,
    userRole,
    runningStockCFT,
    totalExtractedCFT,
    totalSoldCFT,
    totalWastageCFT,
    totalInvestedCapital,
    totalSalesRevenue,
    totalCashReceived,
    totalDueAmount,
    totalAllExpenses,
    netProfit,
    shareholderShares
  } = useApp();

  const t = translations[language];

  // Stock health threshold
  const isStockLow = runningStockCFT < 15000;

  // Unpaid or partially paid sales
  const dueSales = data.sales.filter(s => s.dueAmount > 0);

  return (
    <div className="space-y-6">
      {/* New User Onboarding Banner */}
      <NewUserWelcomeBanner />

      {/* Top Banner / Welcome & Quick Action Bar */}
      <div className="bg-gradient-to-r from-amber-800 to-amber-950 text-white rounded-2xl p-6 shadow-md border border-amber-800/40">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/30 text-amber-200 border border-amber-400/30">
                {userRole === 'admin' ? t.roleBadgeAdmin : t.roleBadgeShareholder}
              </span>
              <span className="text-xs text-amber-200 font-medium">
                {formatDate(new Date().toISOString(), language)}
              </span>
            </div>
            <h2 className="text-2xl font-black tracking-tight">
              {t.appTitle}
            </h2>
            <p className="text-xs text-amber-200/90 mt-1 max-w-2xl">
              {language === 'bn'
                ? 'নদী থেকে বল গেট ড্রেজারে বালু উত্তোলন, মজুদ ফিল্ড ব্যালেন্স, ট্রাক ডেলিভারি চালান ও অংশীদারদের মুনাফার স্বয়ংক্রিয় ডিজিটাল খাতা।'
                : 'Digital sand ledger: Ball gate dredger extraction, stockpile reconciliation, truck shipments & joint-venture shareholder dividends.'}
            </p>
          </div>

          {/* Quick Action Buttons (Admin Only) */}
          {userRole === 'admin' ? (
            <div className="flex flex-wrap items-center gap-2">
              <button
                id="btn-quick-sale"
                onClick={onOpenNewSaleModal}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95"
              >
                <Truck className="w-4 h-4" />
                <span>{t.newSale}</span>
              </button>
              <button
                id="btn-quick-customers"
                onClick={() => setActiveTab('customers')}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/20 transition-all active:scale-95"
              >
                <Users className="w-4 h-4 text-sky-300" />
                <span>{t.customerLedger}</span>
              </button>
              <button
                id="btn-quick-extraction"
                onClick={onOpenNewExtractionModal}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/20 transition-all active:scale-95"
              >
                <PlusCircle className="w-4 h-4 text-amber-300" />
                <span>{t.newExtraction}</span>
              </button>
              <button
                id="btn-quick-expense"
                onClick={onOpenNewExpenseModal}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/20 transition-all active:scale-95"
              >
                <DollarSign className="w-4 h-4 text-emerald-300" />
                <span>{t.newExpense}</span>
              </button>
            </div>
          ) : (
            <div className="bg-white/10 px-3.5 py-2 rounded-xl border border-white/10 text-xs text-amber-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-300" />
              <span>{t.readOnlyNotice}</span>
            </div>
          )}
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Running Stockpile */}
        <div
          onClick={() => setActiveTab('stockpile')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-amber-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
              {t.runningStock}
            </span>
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800 group-hover:scale-110 transition-transform">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-slate-900">
              {formatCFT(runningStockCFT, language)}
            </h3>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold text-[11px] ${
                  isStockLow ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {isStockLow ? (
                  <>
                    <AlertTriangle className="w-3 h-3" /> {t.stockLow}
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3 h-3" /> {t.stockHealthy}
                  </>
                )}
              </span>
              <span className="text-slate-600 font-medium hover:underline">
                {language === 'bn' ? 'বিস্তারিত' : 'View'} →
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Net Profit / Loss */}
        <div
          onClick={() => setActiveTab('reports')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
              {t.netProfitLoss}
            </span>
            <div
              className={`p-2 rounded-xl ${
                netProfit >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              } group-hover:scale-110 transition-transform`}
            >
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3
              className={`text-2xl font-black ${
                netProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'
              }`}
            >
              {formatCurrency(netProfit, language)}
            </h3>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-600">
              <span>{netProfit >= 0 ? t.profit : t.loss}</span>
              <span className="font-semibold text-slate-700 hover:underline">
                {language === 'bn' ? 'লাভ-ভাগ দেখুন' : 'Dividends'} →
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Gross Sales & Cash Inflow */}
        <div
          onClick={() => setActiveTab('sales')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
              {t.grossRevenue}
            </span>
            <div className="p-2 rounded-xl bg-blue-100 text-blue-800 group-hover:scale-110 transition-transform">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-slate-900">
              {formatCurrency(totalSalesRevenue, language)}
            </h3>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-slate-600">
                {t.cashReceived}: <strong className="text-emerald-700">{formatCurrency(totalCashReceived, language)}</strong>
              </span>
              <span className="text-slate-600 font-medium hover:underline">
                {formatCFT(totalSoldCFT, language)}
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Total Due / Receivables */}
        <div
          onClick={() => setActiveTab('sales')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-rose-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
              {t.totalDueReceivable}
            </span>
            <div className="p-2 rounded-xl bg-rose-100 text-rose-800 group-hover:scale-110 transition-transform">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-rose-600">
              {formatCurrency(totalDueAmount, language)}
            </h3>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-rose-600 font-semibold">
                {dueSales.length} {language === 'bn' ? 'টি চালানে বাকি রয়েছে' : 'unpaid invoices'}
              </span>
              <span className="text-slate-600 font-medium hover:underline">
                {language === 'bn' ? 'আদায় করুন' : 'Collect'} →
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stock Reconciliation Visual Formula Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-600" />
            {language === 'bn' ? 'স্টকপাইল রিকনসিলিয়েশন ও গাণিতিক সামঞ্জস্য' : 'Stockpile Balance Equation'}
          </h3>
          <span className="text-xs text-slate-600 font-mono hidden sm:inline">
            {t.stockFormula}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
          <div className="p-2">
            <span className="text-[11px] font-semibold text-slate-600 block">{t.totalExtracted} (+)</span>
            <span className="text-base sm:text-lg font-black text-amber-800 mt-1 block">
              {formatCFT(totalExtractedCFT, language)}
            </span>
          </div>

          <div className="p-2 border-l border-slate-200">
            <span className="text-[11px] font-semibold text-slate-600 block">{t.totalSold} (-)</span>
            <span className="text-base sm:text-lg font-black text-blue-800 mt-1 block">
              {formatCFT(totalSoldCFT, language)}
            </span>
          </div>

          <div className="p-2 border-l border-slate-200">
            <span className="text-[11px] font-semibold text-slate-600 block">{t.totalWastage} (-)</span>
            <span className="text-base sm:text-lg font-black text-rose-800 mt-1 block">
              {formatCFT(totalWastageCFT, language)}
            </span>
          </div>

          <div className="p-2 border-l border-slate-200 bg-amber-100/60 rounded-lg">
            <span className="text-[11px] font-bold text-amber-900 block">{t.runningStock} (=)</span>
            <span className="text-base sm:text-lg font-black text-slate-950 mt-1 block">
              {formatCFT(runningStockCFT, language)}
            </span>
          </div>
        </div>
      </div>

      {/* Shareholder Equity & Profit Preview */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Users className="w-4 h-4 text-teal-600" />
              {language === 'bn' ? 'অংশীদারদের বিনিয়োগ ও লাভ বন্টন সামারি' : 'Shareholder Capital & Dividend Distribution'}
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              {language === 'bn'
                ? `মোট মূলধন: ${formatCurrency(totalInvestedCapital, language)} | নিট অর্জিত মুনাফা: ${formatCurrency(netProfit, language)}`
                : `Total Capital: ${formatCurrency(totalInvestedCapital, language)} | Net Profit: ${formatCurrency(netProfit, language)}`}
            </p>
          </div>
          <button
            onClick={() => setActiveTab('shareholders')}
            className="text-xs font-semibold text-amber-700 hover:text-amber-800"
          >
            {language === 'bn' ? 'সম্পূর্ণ হিসাব দেখুন' : 'View Full Ledger'} →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {shareholderShares.map(sh => (
            <div
              key={sh.id}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">{sh.name}</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800 border border-teal-200">
                  {sh.sharePercentage}%
                </span>
              </div>
              <div className="mt-3 space-y-1 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>{t.totalContribution}:</span>
                  <span className="font-semibold text-slate-800">{formatCurrency(sh.totalInvested, language)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>{language === 'bn' ? 'প্রাপ্য লাভ (মুনাফা)' : 'Profit Share'}:</span>
                  <span className="font-bold text-emerald-700">{formatCurrency(sh.profitShareAmount, language)}</span>
                </div>
                <div className="flex justify-between text-slate-600 pt-1 border-t border-slate-200">
                  <span>{language === 'bn' ? 'উত্তোলিত লভ্যাংশ' : 'Withdrawn'}:</span>
                  <span className="text-slate-700">{formatCurrency(sh.totalWithdrawn, language)}</span>
                </div>
                <div className="flex justify-between font-bold text-xs pt-1">
                  <span className="text-slate-800">{language === 'bn' ? 'অবশিষ্ট পাওনা' : 'Net Balance'}:</span>
                  <span className={sh.netReceivableOrPayable >= 0 ? 'text-emerald-700' : 'text-rose-700'}>
                    {formatCurrency(sh.netReceivableOrPayable, language)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Due Follow-up Priority Table */}
      {dueSales.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-rose-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-rose-100 rounded-lg text-rose-700">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {language === 'bn' ? 'বাকি বিক্রয়ের জরুরি ফলোআপ তালিকা' : 'Outstanding Receivables (Due Follow-up)'}
                </h3>
                <p className="text-xs text-slate-600">
                  {language === 'bn' ? 'মোট পাওনা টাকা আদায়ের জন্য সরাসরি যোগাযোগ ও রসিদ কাটুন' : 'Track and collect overdue balances from customers'}
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
              {formatCurrency(totalDueAmount, language)}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <th className="p-2.5">{t.invoiceNo}</th>
                  <th className="p-2.5">{t.date}</th>
                  <th className="p-2.5">{t.customerName}</th>
                  <th className="p-2.5">{t.destination}</th>
                  <th className="p-2.5 text-right">{t.totalAmount}</th>
                  <th className="p-2.5 text-right text-rose-700">{t.dueAmount}</th>
                  <th className="p-2.5 text-center">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dueSales.map(sale => (
                  <tr key={sale.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-2.5 font-mono font-bold text-slate-800">{sale.invoiceNo}</td>
                    <td className="p-2.5 text-slate-600">{formatDate(sale.date, language)}</td>
                    <td className="p-2.5 font-semibold text-slate-900">
                      {sale.customerName}
                      <span className="block text-[10px] text-slate-600 font-normal">
                        {sale.customerPhone} {sale.customerAddress ? `• ${sale.customerAddress}` : ''}
                      </span>
                    </td>
                    <td className="p-2.5 text-slate-600">{sale.destination}</td>
                    <td className="p-2.5 text-right font-medium">{formatCurrency(sale.totalAmount, language)}</td>
                    <td className="p-2.5 text-right font-bold text-rose-600">{formatCurrency(sale.dueAmount, language)}</td>
                    <td className="p-2.5 text-center space-x-1 whitespace-nowrap">
                      {userRole === 'admin' && (
                        <button
                          onClick={() => onSelectSaleForDue(sale.id)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-2xs transition-colors"
                        >
                          {t.collectDue}
                        </button>
                      )}
                      <button
                        onClick={() => onSelectSaleForInvoice(sale.id)}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors"
                      >
                        {language === 'bn' ? 'চালান' : 'Challan'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Extraction & Operational Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latest Extractions */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              {language === 'bn' ? 'সাম্প্রতিক বল গেট উত্তোলন' : 'Recent Ball Gate Extractions'}
            </h3>
            <button
              onClick={() => setActiveTab('extraction')}
              className="text-xs font-semibold text-amber-700 hover:underline"
            >
              {language === 'bn' ? 'সব দেখুন' : 'View All'} →
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {data.extractions.slice(0, 4).map(ext => (
              <div key={ext.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-slate-900">{ext.ghatName}</p>
                  <p className="text-slate-600 text-[11px]">
                    {formatDate(ext.date, language)} • {ext.machineId} • {ext.operatorName}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-amber-800 text-sm block">
                    {formatCFT(ext.quantityCFT, language)}
                  </span>
                  <span className="text-slate-600 text-[10px]">
                    {language === 'bn' ? 'খরচ: ' : 'Cost: '}
                    {formatCurrency(ext.extractionCost, language)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Latest Expenses */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              {language === 'bn' ? 'সাম্প্রতিক পরিচালন ব্যয়' : 'Recent Operational Expenses'}
            </h3>
            <button
              onClick={() => setActiveTab('expenses')}
              className="text-xs font-semibold text-amber-700 hover:underline"
            >
              {language === 'bn' ? 'সব দেখুন' : 'View All'} →
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {data.expenses.slice(0, 4).map(exp => (
              <div key={exp.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-slate-900">{exp.title}</p>
                  <p className="text-slate-600 text-[11px]">
                    {formatDate(exp.date, language)} • {exp.paidTo}
                  </p>
                </div>
                <div className="text-right font-bold text-slate-900">
                  {formatCurrency(exp.amount, language)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

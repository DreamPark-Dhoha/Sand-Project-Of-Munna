import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../translations';
import { formatCurrency, formatCFT, formatDate } from '../utils/formatters';
import {
  Layers,
  AlertOctagon,
  Trash2,
  PlusCircle,
  X,
  Wrench,
  TrendingDown,
  ShieldAlert,
  CheckCircle2
} from 'lucide-react';

export const StockpileModule: React.FC = () => {
  const {
    data,
    language,
    userRole,
    runningStockCFT,
    totalExtractedCFT,
    totalSoldCFT,
    totalWastageCFT,
    addWastage,
    deleteWastage
  } = useApp();

  const t = translations[language];

  const [showWastageModal, setShowWastageModal] = useState(false);
  const [wstDate, setWstDate] = useState(new Date().toISOString().slice(0, 10));
  const [wstQuantity, setWstQuantity] = useState<number>(0);
  const [wstReason, setWstReason] = useState(t.reasonRainWastage);
  const [wstNote, setWstNote] = useState('');

  const isLowStock = runningStockCFT < 15000;

  // Filter stockpile maintenance expenses
  const stockpileExpenses = data.expenses.filter(e => e.category === 'stockpile');
  const totalMaintenanceCost = stockpileExpenses.reduce((sum, e) => sum + e.amount, 0);

  const handleAddWastage = (e: React.FormEvent) => {
    e.preventDefault();
    if (wstQuantity <= 0) return;

    addWastage({
      date: wstDate,
      quantityCFT: Number(wstQuantity),
      reason: wstReason,
      note: wstNote.trim()
    });

    setWstQuantity(0);
    setWstNote('');
    setShowWastageModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-600" />
            {t.stockpile}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'bn'
              ? 'উত্তোলিত বালুর মাঠের রানিং মজুদ ব্যালেন্স, ক্ষয়ক্ষতি/অপচয় রেজিস্টার ও সাইট রক্ষণাবেক্ষণ।'
              : 'Field stockpile running balance, wastage/spill register and yard maintenance logs.'}
          </p>
        </div>

        {userRole === 'admin' && (
          <button
            id="add-wastage-btn"
            onClick={() => setShowWastageModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
          >
            <AlertOctagon className="w-4 h-4" />
            <span>{t.logWastage}</span>
          </button>
        )}
      </div>

      {/* Hero Stock Balance Card */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-amber-700" />
              {t.runningStock}
            </span>
            <div className="mt-2 flex items-baseline gap-3">
              <h1 className="text-4xl sm:text-5xl font-black text-slate-950 tracking-tight">
                {formatCFT(runningStockCFT, language)}
              </h1>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                  isLowStock
                    ? 'bg-rose-100 text-rose-800 border border-rose-200'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}
              >
                {isLowStock ? (
                  <>
                    <ShieldAlert className="w-3.5 h-3.5" />
                    {t.stockLow}
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {t.stockHealthy}
                  </>
                )}
              </span>
              <span className="text-xs text-slate-600 font-medium">
                {language === 'bn'
                  ? 'ফিল্ড স্টকপাইল প্রস্তুত অবস্থায় মজুদ আছে'
                  : 'Ready stock available in yard'}
              </span>
            </div>
          </div>

          {/* Detailed Equation Matrix */}
          <div className="bg-white/90 backdrop-blur-xs p-5 rounded-2xl border border-amber-200/80 shadow-xs space-y-3 min-w-[280px]">
            <p className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-2">
              {language === 'bn' ? 'মজুদ হিসাবের বিবরণ' : 'Stock Equation Breakdown'}
            </p>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">
                1. {t.totalExtracted} (+):
              </span>
              <span className="font-bold text-amber-900">
                {formatCFT(totalExtractedCFT, language)}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">
                2. {t.totalSold} (-):
              </span>
              <span className="font-bold text-blue-800">
                {formatCFT(totalSoldCFT, language)}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">
                3. {t.totalWastage} (-):
              </span>
              <span className="font-bold text-rose-700">
                {formatCFT(totalWastageCFT, language)}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs font-bold">
              <span className="text-slate-900">{language === 'bn' ? 'অবশিষ্ট রানিং ব্যালেন্স:' : 'Current Balance:'}</span>
              <span className="text-amber-800 text-sm">{formatCFT(runningStockCFT, language)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Two Columns: Wastage Register & Maintenance Cost */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Wastage & Loss Register */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-rose-100 rounded-lg text-rose-700">
                  <TrendingDown className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{t.wastageRecords}</h3>
                  <p className="text-[11px] text-slate-500">
                    {language === 'bn'
                      ? 'বৃষ্টির ধস, মাপের অমিল বা পরিবহন অপচয়'
                      : 'Rain washout, slump, transport or measure loss'}
                  </p>
                </div>
              </div>

              <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                {formatCFT(totalWastageCFT, language)}
              </span>
            </div>

            {data.wastages.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                {language === 'bn' ? 'কোনো অপচয়ের রেকর্ড নেই' : 'No wastage logged yet'}
              </div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                {data.wastages.map(wst => (
                  <div key={wst.id} className="py-3 flex items-start justify-between text-xs">
                    <div>
                      <span className="font-semibold text-slate-900 block">{wst.reason}</span>
                      <span className="text-[11px] text-slate-500">
                        {formatDate(wst.date, language)}
                      </span>
                      {wst.note && (
                        <p className="text-[11px] text-slate-600 mt-1 italic">{wst.note}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-rose-600 text-sm whitespace-nowrap">
                        -{formatCFT(wst.quantityCFT, language)}
                      </span>
                      {userRole === 'admin' && (
                        <button
                          onClick={() => {
                            if (window.confirm(t.confirmDelete)) {
                              deleteWastage(wst.id);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-slate-100 transition-colors"
                          title={t.delete}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {userRole === 'admin' && (
            <div className="mt-4 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowWastageModal(true)}
                className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-xl border border-rose-200 transition-colors flex items-center justify-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{t.addWastageTitle}</span>
              </button>
            </div>
          )}
        </div>

        {/* Right: Stockpile Yard Maintenance Expenses */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-100 rounded-lg text-amber-700">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{t.stockMaintenanceExpenses}</h3>
                  <p className="text-[11px] text-slate-500">
                    {language === 'bn'
                      ? 'মাঠ লেভেলিং, ড্রেনেজ ও বালু সাইটের রক্ষণাবেক্ষণ খরচ'
                      : 'Excavator leveling, yard security & drainage expenses'}
                  </p>
                </div>
              </div>

              <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                {formatCurrency(totalMaintenanceCost, language)}
              </span>
            </div>

            {stockpileExpenses.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                {language === 'bn' ? 'কোনো মাঠ রক্ষণাবেক্ষণ খরচ লিপিবদ্ধ নেই' : 'No maintenance expenses recorded'}
              </div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                {stockpileExpenses.map(exp => (
                  <div key={exp.id} className="py-3 flex items-start justify-between text-xs">
                    <div>
                      <span className="font-semibold text-slate-900 block">{exp.title}</span>
                      <span className="text-[11px] text-slate-500">
                        {formatDate(exp.date, language)} • {exp.paidTo}
                      </span>
                      {exp.note && (
                        <p className="text-[11px] text-slate-600 mt-0.5">{exp.note}</p>
                      )}
                    </div>
                    <span className="font-bold text-slate-900 whitespace-nowrap">
                      {formatCurrency(exp.amount, language)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-center">
            <span className="text-xs text-slate-500">
              {language === 'bn'
                ? 'মাঠের নতুন খরচ যোগ করতে খরচ মডিউলে গিয়ে ক্যাটাগরি "মজুদ মাঠ" সিলেক্ট করুন।'
                : 'Log yard maintenance in the Expenses module under Stockpile category.'}
            </span>
          </div>
        </div>
      </div>

      {/* Add Wastage Modal */}
      {showWastageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
            <div className="bg-rose-700 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="text-base font-bold flex items-center gap-2">
                <AlertOctagon className="w-5 h-5" />
                {t.addWastageTitle}
              </h3>
              <button
                onClick={() => setShowWastageModal(false)}
                className="p-1 text-rose-200 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddWastage} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.date} *
                  </label>
                  <input
                    type="date"
                    required
                    value={wstDate}
                    onChange={e => setWstDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {language === 'bn' ? 'ক্ষতি/অপচয়ের পরিমাণ (CFT)' : 'Quantity Lost (CFT)'} *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="2500"
                    value={wstQuantity || ''}
                    onChange={e => setWstQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-bold focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.wastageReason} *
                </label>
                <select
                  value={wstReason}
                  onChange={e => setWstReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-rose-500 focus:outline-hidden bg-white"
                >
                  <option value={t.reasonRainWastage}>{t.reasonRainWastage}</option>
                  <option value={t.reasonTransportLoss}>{t.reasonTransportLoss}</option>
                  <option value={t.reasonErosion}>{t.reasonErosion}</option>
                  <option value={t.reasonMeasurementDiff}>{t.reasonMeasurementDiff}</option>
                  <option value="অন্যান্য কারণ">{language === 'bn' ? 'অন্যান্য কারণ' : 'Other'}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.note}
                </label>
                <input
                  type="text"
                  placeholder={language === 'bn' ? 'ক্ষতির বিস্তারিত কারণ ও এলাকা...' : 'Details about the loss...'}
                  value={wstNote}
                  onChange={e => setWstNote(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowWastageModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl border border-slate-200"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

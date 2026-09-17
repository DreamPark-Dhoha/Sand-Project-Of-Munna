import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../translations';
import {
  Trash2,
  AlertTriangle,
  Download,
  RotateCcw,
  CheckCircle2,
  X,
  Shield,
  Layers,
  Sparkles,
  FileSpreadsheet,
  Users,
  Pickaxe,
  Receipt
} from 'lucide-react';

type CleanMode = 'start_fresh' | 'transactions_only' | 'full_wipe' | 'selective' | 'demo_data';

export const DataCleanModal: React.FC = () => {
  const {
    language,
    showDataCleanModal,
    setShowDataCleanModal,
    isAdminAuthenticated,
    setShowLoginModal,
    loginAdmin,
    exportJSON,
    cleanData,
    resetToDemoData,
    startFresh,
    isDemoData,
    data
  } = useApp();
  const t = translations[language];

  const [mode, setMode] = useState<CleanMode>(() => isDemoData ? 'start_fresh' : 'transactions_only');
  const [startFreshSubMode, setStartFreshSubMode] = useState<'blank_slate' | 'zero_transactions'>('blank_slate');
  const [quickConfirmChecked, setQuickConfirmChecked] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [selectiveOptions, setSelectiveOptions] = useState({
    sales: true,
    extractions: true,
    expenses: true,
    customers: false,
    shareholders: false
  });
  const [isSuccess, setIsSuccess] = useState(false);
  const [backupDownloaded, setBackupDownloaded] = useState(false);

  if (!showDataCleanModal) return null;

  const handleBackupDownload = () => {
    exportJSON();
    setBackupDownloaded(true);
  };

  const handleClose = () => {
    setConfirmText('');
    setQuickConfirmChecked(false);
    setIsSuccess(false);
    setShowDataCleanModal(false);
  };

  const handleRequireAdminLogin = () => {
    setShowDataCleanModal(false);
    setShowLoginModal(true);
  };

  const handleQuickAdminLogin = () => {
    loginAdmin('MunnaSand2026', 'MS12345');
  };

  const isConfirmed =
    mode === 'demo_data' ||
    (mode === 'start_fresh' && (quickConfirmChecked || confirmText.trim().toUpperCase() === 'DELETE' || confirmText.trim() === 'মুছুন' || confirmText.trim().toUpperCase() === 'START')) ||
    confirmText.trim().toUpperCase() === 'DELETE' ||
    confirmText.trim() === 'মুছুন';

  const handleExecute = () => {
    if (!isConfirmed) return;

    if (mode === 'start_fresh') {
      startFresh(startFreshSubMode);
    } else if (mode === 'demo_data') {
      resetToDemoData();
    } else if (mode === 'selective') {
      cleanData('selective', selectiveOptions);
    } else {
      cleanData(mode);
    }

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setConfirmText('');
      setQuickConfirmChecked(false);
      setShowDataCleanModal(false);
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="data-clean-heading"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-600 to-rose-700 px-6 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center border border-white/20">
              <Trash2 className="w-5 h-5 text-rose-100" />
            </div>
            <div>
              <h3 id="data-clean-heading" className="text-base font-bold text-white tracking-tight">
                {t.dataCleanTitle}
              </h3>
              <p className="text-xs text-rose-100">
                {t.dataCleanSubtitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            title={t.cancel}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-slate-800">
          {!isAdminAuthenticated ? (
            /* Admin Protection Guard */
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
                <Shield className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-slate-900">
                  {language === 'bn' ? 'অ্যাডমিন অনুমোদন আবশ্যক' : 'Admin Authorization Required'}
                </h4>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  {language === 'bn'
                    ? 'ব্যবসায়ের হিসাব ও ডাটা ক্লিন করার জন্য প্রথমে অ্যাডমিন হিসেবে লগইন করতে হবে।'
                    : 'Cleaning or resetting business ledger records requires an active Admin login.'}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleQuickAdminLogin}
                  className="w-full sm:w-auto px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Shield className="w-4 h-4" />
                  <span>{t.unlockAdmin} (MunnaSand2026)</span>
                </button>
                <button
                  type="button"
                  onClick={handleRequireAdminLogin}
                  className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors"
                >
                  <span>{language === 'bn' ? 'লগইন উইন্ডো খুলুন' : 'Open Login Dialog'}</span>
                </button>
              </div>
            </div>
          ) : isSuccess ? (
            /* Success Feedback */
            <div className="py-10 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-slate-900">
                {t.cleanSuccessMsg}
              </h4>
              <p className="text-xs text-slate-500">
                {language === 'bn' ? 'নতুন হিসাব প্রস্তুত করা হয়েছে।' : 'Ledger has been refreshed.'}
              </p>
            </div>
          ) : (
            /* Form Content */
            <>
              {/* Backup Recommendation Banner */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-900">
                    <span className="font-bold block mb-0.5">{language === 'bn' ? 'গুরুত্বপূর্ণ সতর্কতা:' : 'Important Safety:'}</span>
                    <p className="text-amber-800 leading-relaxed">
                      {t.cleanWarning}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleBackupDownload}
                  className={`shrink-0 px-3 py-1.5 text-xs font-bold rounded-lg border flex items-center gap-1.5 transition-all shadow-2xs ${
                    backupDownloaded
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white hover:bg-amber-100 text-amber-900 border-amber-300'
                  }`}
                >
                  {backupDownloaded ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{language === 'bn' ? 'ব্যাকআপ সংরক্ষিত' : 'Backup Saved'}</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5 text-amber-700" />
                      <span>{t.downloadBackupFirst}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Current Records Statistics Badge */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'বর্তমান হিসাবের সারসংক্ষেপ:' : 'Current Records in System:'}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <span className="text-slate-500 block text-[10px]">{language === 'bn' ? 'বিক্রয় চালান' : 'Sales'}</span>
                    <span className="font-bold text-slate-800 text-sm">{data.sales.length}</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <span className="text-slate-500 block text-[10px]">{language === 'bn' ? 'উত্তোলন লগ' : 'Extractions'}</span>
                    <span className="font-bold text-slate-800 text-sm">{data.extractions.length}</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <span className="text-slate-500 block text-[10px]">{language === 'bn' ? 'খরচ ভাউচার' : 'Expenses'}</span>
                    <span className="font-bold text-slate-800 text-sm">{data.expenses.length}</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <span className="text-slate-500 block text-[10px]">{language === 'bn' ? 'নিবন্ধিত ক্রেতা' : 'Customers'}</span>
                    <span className="font-bold text-slate-800 text-sm">{data.customers.length}</span>
                  </div>
                </div>
              </div>

              {/* Select Clean Option */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  {language === 'bn' ? 'পরিচ্ছন্ন করার ধরণ নির্বাচন করুন:' : 'Select Clean Mode:'}
                </label>

                {/* Option 0: Start Fresh (Recommended for New Users) */}
                <div
                  onClick={() => setMode('start_fresh')}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    mode === 'start_fresh'
                      ? 'border-amber-500 bg-amber-50/70 ring-2 ring-amber-400/60 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="clean_mode"
                      checked={mode === 'start_fresh'}
                      onChange={() => setMode('start_fresh')}
                      className="mt-1 text-amber-600 focus:ring-amber-500"
                    />
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-amber-600" />
                          <span>{t.cleanOptionStartFresh}</span>
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                          ✨ {language === 'bn' ? 'নতুন ব্যবহারকারী' : 'New User'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {t.cleanOptionStartFreshDesc}
                      </p>

                      {mode === 'start_fresh' && (
                        <div className="pt-2 mt-2 border-t border-amber-200/80 space-y-2">
                          <span className="text-[11px] font-semibold text-slate-700 block">
                            {language === 'bn' ? 'নতুন খাতার ধরণ বেছে নিন:' : 'Choose Fresh Start Style:'}
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <label className={`p-2.5 rounded-lg border text-xs cursor-pointer flex items-start gap-2 transition-all ${
                              startFreshSubMode === 'blank_slate'
                                ? 'border-amber-500 bg-white font-semibold text-amber-950 ring-1 ring-amber-400'
                                : 'border-slate-200 bg-white/60 text-slate-700'
                            }`}>
                              <input
                                type="radio"
                                name="fresh_sub_mode"
                                checked={startFreshSubMode === 'blank_slate'}
                                onChange={() => setStartFreshSubMode('blank_slate')}
                                className="mt-0.5 text-amber-600 focus:ring-amber-500"
                              />
                              <div>
                                <span className="block font-bold">{t.blankSlateRadio}</span>
                                <span className="text-[10px] text-slate-500 block font-normal">
                                  {language === 'bn' ? 'সবকিছু সম্পূর্ণ খালি, নতুন কাস্টমার ও শেয়ারহোল্ডার নিজ হাতে যোগ করবেন' : '0 customers, 0 transactions. Completely blank.'}
                                </span>
                              </div>
                            </label>

                            <label className={`p-2.5 rounded-lg border text-xs cursor-pointer flex items-start gap-2 transition-all ${
                              startFreshSubMode === 'zero_transactions'
                                ? 'border-amber-500 bg-white font-semibold text-amber-950 ring-1 ring-amber-400'
                                : 'border-slate-200 bg-white/60 text-slate-700'
                            }`}>
                              <input
                                type="radio"
                                name="fresh_sub_mode"
                                checked={startFreshSubMode === 'zero_transactions'}
                                onChange={() => setStartFreshSubMode('zero_transactions')}
                                className="mt-0.5 text-amber-600 focus:ring-amber-500"
                              />
                              <div>
                                <span className="block font-bold">{t.zeroTransactionsRadio}</span>
                                <span className="text-[10px] text-slate-500 block font-normal">
                                  {language === 'bn' ? 'কাস্টমারদের নাম থাকবে, তবে বাকি ও লেনদেনের অংক ০ হবে' : 'Keeps customer directory, resets all balances to 0.'}
                                </span>
                              </div>
                            </label>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Option 1: Transactions Only */}
                <div
                  onClick={() => setMode('transactions_only')}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    mode === 'transactions_only'
                      ? 'border-rose-500 bg-rose-50/50 ring-1 ring-rose-400'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="clean_mode"
                      checked={mode === 'transactions_only'}
                      onChange={() => setMode('transactions_only')}
                      className="mt-1 text-rose-600 focus:ring-rose-500"
                    />
                    <div className="space-y-0.5 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">
                          {t.cleanOptionTransactionsOnly}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          {language === 'bn' ? 'সুপারিশকৃত' : 'Recommended'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">
                        {t.cleanOptionTransactionsDesc}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Option 2: Full Wipe */}
                <div
                  onClick={() => setMode('full_wipe')}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    mode === 'full_wipe'
                      ? 'border-rose-500 bg-rose-50/50 ring-1 ring-rose-400'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="clean_mode"
                      checked={mode === 'full_wipe'}
                      onChange={() => setMode('full_wipe')}
                      className="mt-1 text-rose-600 focus:ring-rose-500"
                    />
                    <div className="space-y-0.5 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-rose-950">
                          {t.cleanOptionFullWipe}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                          {language === 'bn' ? 'সম্পূর্ণ খালি' : 'Zero State'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">
                        {t.cleanOptionFullWipeDesc}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Option 3: Selective Clean */}
                <div
                  onClick={() => setMode('selective')}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    mode === 'selective'
                      ? 'border-rose-500 bg-rose-50/50 ring-1 ring-rose-400'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="clean_mode"
                      checked={mode === 'selective'}
                      onChange={() => setMode('selective')}
                      className="mt-1 text-rose-600 focus:ring-rose-500"
                    />
                    <div className="space-y-1 flex-1">
                      <span className="text-xs font-bold text-slate-900 block">
                        {t.cleanOptionSelective}
                      </span>
                      <p className="text-xs text-slate-600">
                        {t.cleanOptionSelectiveDesc}
                      </p>

                      {mode === 'selective' && (
                        <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 border-t border-rose-200/80">
                          <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectiveOptions.sales}
                              onChange={e =>
                                setSelectiveOptions(prev => ({ ...prev, sales: e.target.checked }))
                              }
                              className="rounded text-rose-600 focus:ring-rose-500"
                            />
                            <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
                            <span>{t.clearSalesInvoices} ({data.sales.length})</span>
                          </label>

                          <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectiveOptions.extractions}
                              onChange={e =>
                                setSelectiveOptions(prev => ({ ...prev, extractions: e.target.checked }))
                              }
                              className="rounded text-rose-600 focus:ring-rose-500"
                            />
                            <Pickaxe className="w-3.5 h-3.5 text-slate-500" />
                            <span>{t.clearExtractionsWastages} ({data.extractions.length})</span>
                          </label>

                          <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectiveOptions.expenses}
                              onChange={e =>
                                setSelectiveOptions(prev => ({ ...prev, expenses: e.target.checked }))
                              }
                              className="rounded text-rose-600 focus:ring-rose-500"
                            />
                            <Receipt className="w-3.5 h-3.5 text-slate-500" />
                            <span>{t.clearExpenses} ({data.expenses.length})</span>
                          </label>

                          <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectiveOptions.customers}
                              onChange={e =>
                                setSelectiveOptions(prev => ({ ...prev, customers: e.target.checked }))
                              }
                              className="rounded text-rose-600 focus:ring-rose-500"
                            />
                            <Users className="w-3.5 h-3.5 text-slate-500" />
                            <span>{t.clearCustomers} ({data.customers.length})</span>
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Option 4: Restore Sample Demo Data */}
                <div
                  onClick={() => setMode('demo_data')}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    mode === 'demo_data'
                      ? 'border-amber-500 bg-amber-50/50 ring-1 ring-amber-400'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="clean_mode"
                      checked={mode === 'demo_data'}
                      onChange={() => setMode('demo_data')}
                      className="mt-1 text-amber-600 focus:ring-amber-500"
                    />
                    <div className="space-y-0.5 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                          <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                          <span>{t.cleanOptionDemoData}</span>
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {language === 'bn' ? 'নমুনা তথ্য' : 'Demo Samples'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">
                        {t.cleanOptionDemoDataDesc}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Confirmation Input for Destructive Modes */}
              {mode === 'start_fresh' ? (
                <div className="pt-2 space-y-2.5 bg-amber-50/80 border border-amber-200 p-3.5 rounded-xl">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={quickConfirmChecked}
                      onChange={e => setQuickConfirmChecked(e.target.checked)}
                      className="mt-0.5 rounded text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                    />
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-amber-950 block">
                        {language === 'bn'
                          ? 'নিশ্চিত করছি যে ডেমো রেকর্ড মুছে বাস্তব হিসাবের পরিষ্কার খাতা শুরু করতে চাই'
                          : 'I confirm clearing demo records to start fresh with real business data.'}
                      </span>
                      <span className="text-[11px] text-amber-800 block">
                        {language === 'bn'
                          ? 'এটি টিক দিলে সরাসরি নিচের বোতামটি সক্রিয় হবে।'
                          : 'Checking this box activates the Start Fresh button immediately.'}
                      </span>
                    </div>
                  </label>

                  <div className="text-center text-[10px] text-slate-400 font-medium">
                    {language === 'bn' ? '— অথবা টাইপ করুন —' : '— OR TYPE —'}
                  </div>

                  <input
                    type="text"
                    value={confirmText}
                    onChange={e => setConfirmText(e.target.value)}
                    placeholder={language === 'bn' ? 'START অথবা DELETE অথবা মুছুন' : 'START or DELETE'}
                    className="w-full px-3 py-1.5 text-xs font-mono border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 uppercase tracking-widest bg-white text-amber-950"
                  />
                </div>
              ) : mode !== 'demo_data' ? (
                <div className="pt-2 space-y-1.5 bg-rose-50/60 border border-rose-200 p-3 rounded-xl">
                  <label className="block text-xs font-semibold text-rose-900">
                    {t.confirmCleanPrompt}
                  </label>
                  <input
                    type="text"
                    value={confirmText}
                    onChange={e => setConfirmText(e.target.value)}
                    placeholder={language === 'bn' ? 'DELETE অথবা মুছুন' : 'DELETE'}
                    className="w-full px-3 py-1.5 text-xs font-mono border border-rose-300 rounded-lg focus:ring-2 focus:ring-rose-500 uppercase tracking-widest bg-white text-rose-900"
                  />
                  <p className="text-[11px] text-rose-700">
                    {language === 'bn'
                      ? 'ভুলবশত ডাটা ডিলিট প্রতিরোধে এই ভেরিফিকেশনটি রাখা হয়েছে।'
                      : 'Type DELETE to unlock the execution button.'}
                  </p>
                </div>
              ) : null}
            </>
          )}
        </div>

        {/* Footer Actions */}
        {isAdminAuthenticated && !isSuccess && (
          <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-between shrink-0">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors"
            >
              {t.cancel}
            </button>

            <button
              type="button"
              id="execute-data-clean-btn"
              disabled={!isConfirmed}
              onClick={handleExecute}
              className={`px-5 py-2 text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all ${
                isConfirmed
                  ? mode === 'demo_data' || mode === 'start_fresh'
                    ? 'bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white cursor-pointer'
                    : 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
              }`}
            >
              {mode === 'demo_data' ? (
                <>
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'ডেমো ডাটা লোড করুন' : 'Load Demo Data'}</span>
                </>
              ) : mode === 'start_fresh' ? (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t.startFreshNowBtn}</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{t.executeCleanBtn}</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

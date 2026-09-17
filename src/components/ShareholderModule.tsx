import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../translations';
import { formatCurrency, formatDate } from '../utils/formatters';
import {
  Users,
  UserPlus,
  PlusCircle,
  ArrowUpRight,
  ArrowDownLeft,
  Trash2,
  X,
  PieChart,
  DollarSign
} from 'lucide-react';

export const ShareholderModule: React.FC = () => {
  const {
    data,
    language,
    userRole,
    addShareholder,
    deleteShareholder,
    addShareholderTransaction,
    shareholderShares,
    totalInvestedCapital,
    netProfit
  } = useApp();

  const t = translations[language];

  const [showAddModal, setShowAddModal] = useState(false);
  const [showTxModal, setShowTxModal] = useState(false);
  const [selectedShareholderId, setSelectedShareholderId] = useState<string>('');

  // Form states for new shareholder
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newInitialInv, setNewInitialInv] = useState<number>(0);
  const [newSharePercent, setNewSharePercent] = useState<number>(0);

  // Form states for transaction
  const [txShareholderId, setTxShareholderId] = useState('');
  const [txType, setTxType] = useState<'investment' | 'withdrawal' | 'dividend'>('investment');
  const [txAmount, setTxAmount] = useState<number>(0);
  const [txDate, setTxDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [txNote, setTxNote] = useState('');

  const handleCreateShareholder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || newInitialInv <= 0) return;

    addShareholder({
      name: newName.trim(),
      phone: newPhone.trim(),
      initialInvestment: Number(newInitialInv),
      sharePercentage: Number(newSharePercent)
    });

    setNewName('');
    setNewPhone('');
    setNewInitialInv(0);
    setNewSharePercent(0);
    setShowAddModal(false);
  };

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txShareholderId || txAmount <= 0) return;

    addShareholderTransaction(txShareholderId, {
      type: txType,
      amount: Number(txAmount),
      date: txDate,
      note: txNote.trim()
    });

    setTxAmount(0);
    setTxNote('');
    setShowTxModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header with quick stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-600" />
            {t.shareholderDirectory}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'bn'
              ? 'যৌথ ব্যবসায় অংশীদারদের বিনিয়োগ, মালিকানা শতাংশ, অতিরিক্ত মূলধন এবং লভ্যাংশ হিসাব।'
              : 'Joint venture investment tracking, equity percentage, additional capital logs & dividend payout.'}
          </p>
        </div>

        {userRole === 'admin' && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              id="add-shareholder-btn"
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>{t.newShareholder}</span>
            </button>
            <button
              id="add-tx-btn"
              onClick={() => {
                if (data.shareholders.length > 0) {
                  setTxShareholderId(data.shareholders[0].id);
                }
                setShowTxModal(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t.addTransactionTitle}</span>
            </button>
          </div>
        )}
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">{t.totalCapital}</span>
          <p className="text-xl font-black text-slate-900 mt-1">
            {formatCurrency(totalInvestedCapital, language)}
          </p>
          <span className="text-[11px] text-slate-500">
            {data.shareholders.length} {language === 'bn' ? 'জন অংশীদার' : 'partners'}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">
            {language === 'bn' ? 'মোট ব্যবসায়িক নিট লাভ' : 'Total Net Profit'}
          </span>
          <p className={`text-xl font-black mt-1 ${netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {formatCurrency(netProfit, language)}
          </p>
          <span className="text-[11px] text-slate-500">
            {language === 'bn' ? 'অংশীদারদের মাঝে বন্টনযোগ্য' : 'Available for distribution'}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">
            {language === 'bn' ? 'মোট উত্তোলিত লভ্যাংশ' : 'Total Withdrawn / Payout'}
          </span>
          <p className="text-xl font-black text-amber-600 mt-1">
            {formatCurrency(
              shareholderShares.reduce((sum, s) => sum + s.totalWithdrawn, 0),
              language
            )}
          </p>
          <span className="text-[11px] text-slate-500">
            {language === 'bn' ? 'ইতিমধ্যে বিতরণ করা হয়েছে' : 'Already distributed'}
          </span>
        </div>
      </div>

      {/* Shareholder List Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {shareholderShares.map(sh => {
          const rawShareholder = data.shareholders.find(s => s.id === sh.id);
          const txCount = rawShareholder?.transactions?.length || 0;

          return (
            <div
              key={sh.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between"
            >
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{sh.name}</h3>
                    <p className="text-xs text-slate-500">{sh.phone || '-'}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-black bg-teal-50 text-teal-800 border border-teal-200 flex items-center gap-1">
                    <PieChart className="w-3.5 h-3.5" />
                    {sh.sharePercentage}%
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-xs divide-y divide-slate-100">
                  <div className="flex justify-between py-1 text-slate-600">
                    <span>{t.initialInvestment}:</span>
                    <span className="font-semibold text-slate-800">{formatCurrency(sh.initialInvestment, language)}</span>
                  </div>

                  <div className="flex justify-between py-1 text-slate-600">
                    <span>{language === 'bn' ? 'অতিরিক্ত মূলধন (+)' : 'Additional (+)'}:</span>
                    <span className="font-semibold text-slate-800">{formatCurrency(sh.additionalInvestment, language)}</span>
                  </div>

                  <div className="flex justify-between py-1 font-bold text-slate-900 bg-slate-50 px-2 rounded-md">
                    <span>{t.totalContribution}:</span>
                    <span>{formatCurrency(sh.totalInvested, language)}</span>
                  </div>

                  <div className="flex justify-between py-1 text-slate-600">
                    <span>{t.calculatedProfitShare} ({sh.sharePercentage}%):</span>
                    <span className={`font-bold ${sh.profitShareAmount >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {formatCurrency(sh.profitShareAmount, language)}
                    </span>
                  </div>

                  <div className="flex justify-between py-1 text-slate-600">
                    <span>{t.totalWithdrawn} (-):</span>
                    <span className="font-semibold text-amber-700">{formatCurrency(sh.totalWithdrawn, language)}</span>
                  </div>

                  <div className="flex justify-between py-1.5 font-bold text-sm bg-teal-50/70 px-2 rounded-md border border-teal-100">
                    <span className="text-teal-950">{language === 'bn' ? 'অবশিষ্ট প্রাপ্য ব্যালেন্স' : 'Net Receivable'}:</span>
                    <span className={sh.netReceivableOrPayable >= 0 ? 'text-emerald-700' : 'text-rose-600'}>
                      {formatCurrency(sh.netReceivableOrPayable, language)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => setSelectedShareholderId(selectedShareholderId === sh.id ? '' : sh.id)}
                  className="font-semibold text-teal-700 hover:text-teal-800"
                >
                  {selectedShareholderId === sh.id
                    ? (language === 'bn' ? 'লেনদেন লুকান' : 'Hide Logs')
                    : `${language === 'bn' ? 'লেনদেন ইতিহাস' : 'Logs'} (${txCount})`}
                </button>

                {userRole === 'admin' && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setTxShareholderId(sh.id);
                        setShowTxModal(true);
                      }}
                      className="p-1 text-slate-600 hover:text-teal-700 rounded-md hover:bg-slate-200 transition-colors"
                      title={t.addTransactionTitle}
                    >
                      <PlusCircle className="w-4 h-4" />
                    </button>
                    {data.shareholders.length > 1 && (
                      <button
                        onClick={() => {
                          if (window.confirm(t.confirmDelete)) {
                            deleteShareholder(sh.id);
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-slate-200 transition-colors"
                        title={t.delete}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Collapsible Transaction History Ledger */}
              {selectedShareholderId === sh.id && rawShareholder && (
                <div className="p-4 bg-slate-100 border-t border-slate-200 text-xs space-y-2">
                  <h4 className="font-bold text-slate-800 mb-2">
                    {language === 'bn' ? 'লেনদেন ও উত্তোলনের বিবরণী' : 'Transaction History'}
                  </h4>
                  {rawShareholder.transactions.length === 0 ? (
                    <p className="text-slate-500 text-[11px] italic">
                      {language === 'bn' ? 'কোনো অতিরিক্ত লেনদেন নেই' : 'No additional transactions'}
                    </p>
                  ) : (
                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                      {rawShareholder.transactions.map(tx => (
                        <div
                          key={tx.id}
                          className="p-2 bg-white rounded-lg border border-slate-200 flex items-center justify-between"
                        >
                          <div>
                            <div className="flex items-center gap-1.5">
                              {tx.type === 'investment' ? (
                                <span className="flex items-center text-emerald-700 font-bold text-[10px]">
                                  <ArrowUpRight className="w-3 h-3" /> {t.transTypeInvestment}
                                </span>
                              ) : (
                                <span className="flex items-center text-amber-700 font-bold text-[10px]">
                                  <ArrowDownLeft className="w-3 h-3" /> {t.transTypeWithdrawal}
                                </span>
                              )}
                              <span className="text-[10px] text-slate-500">
                                {formatDate(tx.date, language)}
                              </span>
                            </div>
                            {tx.note && <p className="text-[11px] text-slate-600 mt-0.5">{tx.note}</p>}
                          </div>
                          <span
                            className={`font-bold ${
                              tx.type === 'investment' ? 'text-emerald-700' : 'text-amber-700'
                            }`}
                          >
                            {tx.type === 'investment' ? '+' : '-'}
                            {formatCurrency(tx.amount, language)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Shareholder Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
            <div className="bg-teal-800 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="text-base font-bold flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                {t.addShareholderTitle}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-teal-200 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateShareholder} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === 'bn' ? 'অংশীদারের নাম' : 'Shareholder Name'} *
                </label>
                <input
                  type="text"
                  required
                  placeholder={language === 'bn' ? 'যেমন: মো: রফিকুল ইসলাম' : 'e.g., Rafiqul Islam'}
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === 'bn' ? 'মোবাইল নম্বর' : 'Phone Number'}
                </label>
                <input
                  type="text"
                  placeholder="017XXXXXXXX"
                  value={newPhone}
                  onChange={e => setNewPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.initialInvestment} (৳) *
                  </label>
                  <input
                    type="number"
                    min="1000"
                    required
                    value={newInitialInv || ''}
                    onChange={e => setNewInitialInv(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.sharePercentage} (%) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    step="0.1"
                    required
                    value={newSharePercent || ''}
                    onChange={e => setNewSharePercent(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl border border-slate-200"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Transaction Modal */}
      {showTxModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="text-base font-bold flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-amber-400" />
                {t.addTransactionTitle}
              </h3>
              <button
                onClick={() => setShowTxModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTransaction} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === 'bn' ? 'অংশীদার নির্বাচন করুন' : 'Select Shareholder'} *
                </label>
                <select
                  value={txShareholderId}
                  onChange={e => setTxShareholderId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden bg-white"
                  required
                >
                  {data.shareholders.map(sh => (
                    <option key={sh.id} value={sh.id}>
                      {sh.name} ({sh.sharePercentage}%)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {language === 'bn' ? 'লেনদেনের ধরন' : 'Transaction Type'} *
                  </label>
                  <select
                    value={txType}
                    onChange={e => setTxType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden bg-white font-semibold"
                  >
                    <option value="investment">{t.transTypeInvestment}</option>
                    <option value="withdrawal">{t.transTypeWithdrawal}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.date} *
                  </label>
                  <input
                    type="date"
                    required
                    value={txDate}
                    onChange={e => setTxDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === 'bn' ? 'টাকার পরিমাণ (৳)' : 'Amount (৳)'} *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={txAmount || ''}
                  onChange={e => setTxAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-bold focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.note}
                </label>
                <input
                  type="text"
                  placeholder={language === 'bn' ? 'যেমন: পাইপ ক্রয় বাবদ বা জরুরি প্রফিট উত্তোলন' : 'e.g., Equipment funding'}
                  value={txNote}
                  onChange={e => setTxNote(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowTxModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl border border-slate-200"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs"
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

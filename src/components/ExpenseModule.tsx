import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../translations';
import { ExpenseCategory, ExpenseRecord } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import {
  DollarSign,
  PlusCircle,
  Search,
  Trash2,
  Edit2,
  X,
  Users,
  Wrench,
  Fuel,
  Truck,
  Landmark,
  Layers,
  HelpCircle
} from 'lucide-react';

interface ExpenseModuleProps {
  showAddModalDefault?: boolean;
  onCloseAddModalDefault?: () => void;
}

export const ExpenseModule: React.FC<ExpenseModuleProps> = ({
  showAddModalDefault = false,
  onCloseAddModalDefault
}) => {
  const {
    data,
    language,
    userRole,
    addExpense,
    updateExpense,
    deleteExpense,
    totalOperationalExpenses,
    totalDirectExtractionCosts,
    totalAllExpenses
  } = useApp();

  const t = translations[language];

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(showAddModalDefault);
  const [editingItem, setEditingItem] = useState<ExpenseRecord | null>(null);

  // Form states
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [category, setCategory] = useState<ExpenseCategory>('fuel');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [paidTo, setPaidTo] = useState('');
  const [voucherNo, setVoucherNo] = useState('');
  const [note, setNote] = useState('');

  // Sync external prop
  React.useEffect(() => {
    if (showAddModalDefault) {
      setIsModalOpen(true);
      resetForm();
    }
  }, [showAddModalDefault]);

  const resetForm = () => {
    setDate(new Date().toISOString().slice(0, 10));
    setCategory('fuel');
    setTitle('');
    setAmount(0);
    setPaidTo('');
    setVoucherNo('');
    setNote('');
    setEditingItem(null);
  };

  const openEditModal = (item: ExpenseRecord) => {
    setEditingItem(item);
    setDate(item.date);
    setCategory(item.category);
    setTitle(item.title);
    setAmount(item.amount);
    setPaidTo(item.paidTo);
    setVoucherNo(item.voucherNo || '');
    setNote(item.note || '');
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || amount <= 0) return;

    if (editingItem) {
      updateExpense(editingItem.id, {
        date,
        category,
        title: title.trim(),
        amount: Number(amount),
        paidTo: paidTo.trim(),
        voucherNo: voucherNo.trim(),
        note: note.trim()
      });
    } else {
      addExpense({
        date,
        category,
        title: title.trim(),
        amount: Number(amount),
        paidTo: paidTo.trim(),
        voucherNo: voucherNo.trim(),
        note: note.trim()
      });
    }

    setIsModalOpen(false);
    resetForm();
    if (onCloseAddModalDefault) onCloseAddModalDefault();
  };

  // Category labels and icons helper
  const getCategoryMeta = (cat: ExpenseCategory) => {
    switch (cat) {
      case 'labor':
        return { label: t.catLabor, icon: Users, color: 'text-blue-700 bg-blue-50 border-blue-200' };
      case 'maintenance':
        return { label: t.catMaintenance, icon: Wrench, color: 'text-orange-700 bg-orange-50 border-orange-200' };
      case 'fuel':
        return { label: t.catFuel, icon: Fuel, color: 'text-amber-700 bg-amber-50 border-amber-200' };
      case 'transport':
        return { label: t.catTransport, icon: Truck, color: 'text-purple-700 bg-purple-50 border-purple-200' };
      case 'ghat_lease':
        return { label: t.catGhatLease, icon: Landmark, color: 'text-indigo-700 bg-indigo-50 border-indigo-200' };
      case 'stockpile':
        return { label: t.catStockpile, icon: Layers, color: 'text-teal-700 bg-teal-50 border-teal-200' };
      case 'misc':
      default:
        return { label: t.catMisc, icon: HelpCircle, color: 'text-slate-700 bg-slate-100 border-slate-200' };
    }
  };

  // Filtered expenses
  const filteredExpenses = useMemo(() => {
    return data.expenses.filter(item => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.paidTo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.voucherNo && item.voucherNo.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCat = selectedCat === 'all' || item.category === selectedCat;
      return matchesSearch && matchesCat;
    });
  }, [data.expenses, searchTerm, selectedCat]);

  // Category summary calculation
  const categorySums = useMemo(() => {
    const sums: Record<ExpenseCategory, number> = {
      fuel: 0,
      maintenance: 0,
      labor: 0,
      ghat_lease: 0,
      stockpile: 0,
      transport: 0,
      misc: 0
    };
    data.expenses.forEach(e => {
      sums[e.category] = (sums[e.category] || 0) + e.amount;
    });
    return sums;
  }, [data.expenses]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            {t.expenses}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'bn'
              ? 'শ্রমিক মজুরি, ড্রেজার ও বল গেট মেরামত, ডিজেল, নদী ঘাট ইজারা ও আনুষঙ্গিক পরিচালন খরচ।'
              : 'Labor wages, dredger & machinery repairs, diesel fuel, ghat leases and operational expenses.'}
          </p>
        </div>

        {userRole === 'admin' && (
          <button
            id="add-expense-top-btn"
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t.newExpense}</span>
          </button>
        )}
      </div>

      {/* Expense KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">{t.totalExpenseSum}</span>
          <p className="text-xl font-black text-slate-900 mt-1">
            {formatCurrency(totalOperationalExpenses, language)}
          </p>
          <span className="text-[11px] text-slate-500">
            {data.expenses.length} {language === 'bn' ? 'টি ভাউচার রেজিস্টার' : 'voucher records'}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">
            {language === 'bn' ? 'ড্রেজার সরাসরি উত্তোলন খরচ' : 'Direct Extraction Costs'}
          </span>
          <p className="text-xl font-black text-amber-800 mt-1">
            {formatCurrency(totalDirectExtractionCosts, language)}
          </p>
          <span className="text-[11px] text-slate-500">
            {language === 'bn' ? 'উত্তোলন লগ হতে সংগৃহীত' : 'From extraction logs'}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">
            {language === 'bn' ? 'সর্বমোট ব্যবসা ব্যয়' : 'Total All Combined Costs'}
          </span>
          <p className="text-xl font-black text-rose-600 mt-1">
            {formatCurrency(totalAllExpenses, language)}
          </p>
          <span className="text-[11px] text-slate-500">
            {language === 'bn' ? 'নিট লাভ গণনায় ব্যবহৃত' : 'Deducted for net profit'}
          </span>
        </div>
      </div>

      {/* Category Pills Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {(['fuel', 'maintenance', 'labor', 'ghat_lease', 'stockpile', 'transport', 'misc'] as ExpenseCategory[]).map(
          cat => {
            const meta = getCategoryMeta(cat);
            const Icon = meta.icon;
            const sum = categorySums[cat] || 0;
            const isSelected = selectedCat === cat;

            return (
              <button
                key={cat}
                onClick={() => setSelectedCat(isSelected ? 'all' : cat)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-1.5 text-slate-600 mb-1">
                  <Icon className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-medium truncate">{meta.label}</span>
                </div>
                <div className="font-bold text-xs text-slate-900">
                  {formatCurrency(sum, language)}
                </div>
              </button>
            );
          }
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder={language === 'bn' ? 'খরচের বিবরণ, প্রাপক বা ভাউচার নং...' : 'Search title, recipient, voucher...'}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs text-slate-500 font-medium whitespace-nowrap">
            {t.expenseCategory}:
          </label>
          <select
            value={selectedCat}
            onChange={e => setSelectedCat(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-white"
          >
            <option value="all">{language === 'bn' ? 'সকল খাত' : 'All Categories'}</option>
            <option value="labor">{t.catLabor}</option>
            <option value="maintenance">{t.catMaintenance}</option>
            <option value="fuel">{t.catFuel}</option>
            <option value="transport">{t.catTransport}</option>
            <option value="ghat_lease">{t.catGhatLease}</option>
            <option value="stockpile">{t.catStockpile}</option>
            <option value="misc">{t.catMisc}</option>
          </select>
        </div>
      </div>

      {/* Expense Records Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <th className="p-3">{t.date}</th>
                <th className="p-3">{t.expenseCategory}</th>
                <th className="p-3">{t.expenseTitle}</th>
                <th className="p-3 text-right">{t.totalAmount}</th>
                <th className="p-3">{t.paidTo}</th>
                <th className="p-3">{t.voucherNo}</th>
                <th className="p-3">{t.note}</th>
                {userRole === 'admin' && <th className="p-3 text-center">{t.actions}</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    {t.noData}
                  </td>
                </tr>
              ) : (
                filteredExpenses.map(exp => {
                  const meta = getCategoryMeta(exp.category);
                  const Icon = meta.icon;
                  return (
                    <tr key={exp.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-semibold text-slate-900 whitespace-nowrap">
                        {formatDate(exp.date, language)}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${meta.color}`}
                        >
                          <Icon className="w-3 h-3" />
                          {meta.label}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-slate-800 max-w-xs">
                        {exp.title}
                      </td>
                      <td className="p-3 text-right font-black text-rose-700 text-sm whitespace-nowrap">
                        {formatCurrency(exp.amount, language)}
                      </td>
                      <td className="p-3 text-slate-700 whitespace-nowrap">
                        {exp.paidTo || '-'}
                      </td>
                      <td className="p-3 font-mono text-slate-500 whitespace-nowrap">
                        {exp.voucherNo || '-'}
                      </td>
                      <td className="p-3 text-slate-500 max-w-xs truncate">
                        {exp.note || '-'}
                      </td>
                      {userRole === 'admin' && (
                        <td className="p-3 text-center whitespace-nowrap space-x-1">
                          <button
                            onClick={() => openEditModal(exp)}
                            className="p-1 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 rounded-md transition-colors"
                            title={t.edit}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(t.confirmDelete)) {
                                deleteExpense(exp.id);
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-md transition-colors"
                            title={t.delete}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden">
            <div className="bg-emerald-700 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="text-base font-bold flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                {editingItem
                  ? (language === 'bn' ? 'খরচ তথ্য সম্পাদনা' : 'Edit Expense')
                  : t.addExpenseTitle}
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  if (onCloseAddModalDefault) onCloseAddModalDefault();
                }}
                className="p-1 text-emerald-200 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.date} *
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.expenseCategory} *
                  </label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as ExpenseCategory)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-white"
                  >
                    <option value="fuel">{t.catFuel}</option>
                    <option value="maintenance">{t.catMaintenance}</option>
                    <option value="labor">{t.catLabor}</option>
                    <option value="ghat_lease">{t.catGhatLease}</option>
                    <option value="stockpile">{t.catStockpile}</option>
                    <option value="transport">{t.catTransport}</option>
                    <option value="misc">{t.catMisc}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.expenseTitle} *
                </label>
                <input
                  type="text"
                  required
                  placeholder={language === 'bn' ? 'যেমন: ডিজেল ক্রয় ১০ ব্যারেল' : 'Expense description'}
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {language === 'bn' ? 'টাকার পরিমাণ (৳)' : 'Amount (৳)'} *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="25000"
                    value={amount || ''}
                    onChange={e => setAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.paidTo}
                  </label>
                  <input
                    type="text"
                    placeholder={language === 'bn' ? 'দোকান বা ব্যক্তির নাম' : 'Payee name'}
                    value={paidTo}
                    onChange={e => setPaidTo(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.voucherNo}
                  </label>
                  <input
                    type="text"
                    placeholder="V-102"
                    value={voucherNo}
                    onChange={e => setVoucherNo(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.note}
                  </label>
                  <input
                    type="text"
                    placeholder={language === 'bn' ? 'অতিরিক্ত মন্তব্য' : 'Remarks'}
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    if (onCloseAddModalDefault) onCloseAddModalDefault();
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl border border-slate-200"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
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

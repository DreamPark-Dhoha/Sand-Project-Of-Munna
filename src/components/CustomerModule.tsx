import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../translations';
import { Customer, SaleRecord } from '../types';
import { formatCurrency, formatCFT, formatDate } from '../utils/formatters';
import {
  Users,
  PlusCircle,
  Search,
  Phone,
  MapPin,
  FileText,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  X,
  Edit2,
  Trash2,
  Printer,
  Truck,
  ArrowUpRight,
  Receipt
} from 'lucide-react';

interface CustomerModuleProps {
  onOpenInvoiceModal: (sale: SaleRecord) => void;
}

export const CustomerModule: React.FC<CustomerModuleProps> = ({ onOpenInvoiceModal }) => {
  const {
    data,
    language,
    userRole,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    recordCustomerPayment,
    getCustomerSummary
  } = useApp();

  const t = translations[language];

  // Search and filter
  const [searchTerm, setSearchTerm] = useState('');
  const [dueFilter, setDueFilter] = useState<'all' | 'hasDue' | 'paid'>('all');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedCustomerForLedger, setSelectedCustomerForLedger] = useState<Customer | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [customerForPayment, setCustomerForPayment] = useState<Customer | null>(null);

  // Form states for Add/Edit Customer
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [openingDue, setOpeningDue] = useState<number>(0);
  const [note, setNote] = useState('');

  // Payment form states
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bank' | 'bkash'>('cash');
  const [paymentNote, setPaymentNote] = useState('');

  const resetForm = () => {
    setName('');
    setPhone('');
    setAddress('');
    setOpeningDue(0);
    setNote('');
    setEditingCustomer(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setName(customer.name);
    setPhone(customer.phone);
    setAddress(customer.address);
    setOpeningDue(customer.openingDue || 0);
    setNote(customer.note || '');
    setIsAddModalOpen(true);
  };

  const handleCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingCustomer) {
      updateCustomer(editingCustomer.id, {
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        openingDue: Number(openingDue) || 0,
        note: note.trim()
      });
    } else {
      addCustomer({
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        openingDue: Number(openingDue) || 0,
        note: note.trim()
      });
    }

    setIsAddModalOpen(false);
    resetForm();
  };

  const handleDelete = (customer: Customer) => {
    if (window.confirm(language === 'bn' ? `আপনি কি নিশ্চিত যে "${customer.name}" মুছে ফেলতে চান?` : `Are you sure you want to delete "${customer.name}"?`)) {
      const res = deleteCustomer(customer.id);
      if (!res.success && res.message) {
        alert(res.message);
      }
    }
  };

  const handleOpenPayment = (customer: Customer) => {
    const summary = getCustomerSummary(customer.id);
    setCustomerForPayment(customer);
    setPaymentDate(new Date().toISOString().slice(0, 10));
    setPaymentAmount(summary.totalDue > 0 ? summary.totalDue : 0);
    setPaymentMethod('cash');
    setPaymentNote('');
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerForPayment || paymentAmount <= 0) return;

    recordCustomerPayment(customerForPayment.id, {
      date: paymentDate,
      amount: Number(paymentAmount),
      paymentMethod,
      note: paymentNote.trim() || undefined
    });

    setIsPaymentModalOpen(false);
    setCustomerForPayment(null);
  };

  // Filtered customer list with summaries
  const customerListWithSummary = useMemo(() => {
    return data.customers.map(c => {
      const summary = getCustomerSummary(c.id);
      return {
        ...c,
        summary
      };
    });
  }, [data.customers, data.sales]);

  const filteredCustomers = useMemo(() => {
    return customerListWithSummary.filter(c => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm) ||
        c.address.toLowerCase().includes(searchTerm.toLowerCase());

      let matchesDue = true;
      if (dueFilter === 'hasDue') matchesDue = c.summary.totalDue > 0;
      if (dueFilter === 'paid') matchesDue = c.summary.totalDue <= 0;

      return matchesSearch && matchesDue;
    });
  }, [customerListWithSummary, searchTerm, dueFilter]);

  // Overall calculations across all customers
  const overallCustomerStats = useMemo(() => {
    let totalCFT = 0;
    let totalBill = 0;
    let totalPaid = 0;
    let totalDue = 0;

    customerListWithSummary.forEach(c => {
      totalCFT += c.summary.totalCFT;
      totalBill += c.summary.totalAmount;
      totalPaid += c.summary.totalPaid;
      totalDue += c.summary.totalDue;
    });

    return { totalCFT, totalBill, totalPaid, totalDue };
  }, [customerListWithSummary]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-600" />
            {t.customerDirectory}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'bn'
              ? 'ক্রেতার নাম, স্থায়ী ঠিকানা, ফোন নম্বর, ট্র্যাক ডেলিভারি খাতা এবং বাকি ও পেমেন্ট হিসেব।'
              : 'Customer accounts, contact address, phone, truck delivery history, and balance ledger.'}
          </p>
        </div>

        {userRole === 'admin' && (
          <button
            id="add-customer-top-btn"
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t.newCustomer}</span>
          </button>
        )}
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">
            {language === 'bn' ? 'নিবন্ধিত ক্রেতা' : 'Registered Customers'}
          </span>
          <p className="text-xl font-black text-slate-900 mt-1">
            {data.customers.length} {language === 'bn' ? 'জন' : ''}
          </p>
          <span className="text-[11px] text-slate-500">
            {customerListWithSummary.filter(c => c.summary.totalDue > 0).length} {language === 'bn' ? 'জনের বাকি রয়েছে' : 'have due'}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">{t.customerTotalSand}</span>
          <p className="text-xl font-black text-amber-900 mt-1">
            {formatCFT(overallCustomerStats.totalCFT, language)}
          </p>
          <span className="text-[11px] text-slate-500">
            {language === 'bn' ? 'ট্রাকযোগে সরবরাহ' : 'Delivered by truck'}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">{t.customerTotalPaid}</span>
          <p className="text-xl font-black text-emerald-700 mt-1">
            {formatCurrency(overallCustomerStats.totalPaid, language)}
          </p>
          <span className="text-[11px] text-slate-500">
            {language === 'bn' ? 'মোট সংগৃহীত পেমেন্ট' : 'Total payments received'}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">{t.customerNetDue}</span>
          <p className="text-xl font-black text-rose-600 mt-1">
            {formatCurrency(overallCustomerStats.totalDue, language)}
          </p>
          <span className="text-[11px] text-rose-500 font-medium">
            {language === 'bn' ? 'বাজার থেকে আদায়যোগ্য বাকি' : 'Total market receivables'}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={language === 'bn' ? 'ক্রেতার নাম, ফোন বা ঠিকানা দিয়ে খুঁজুন...' : 'Search customer by name, phone or address...'}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setDueFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                dueFilter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {language === 'bn' ? 'সকল ক্রেতা' : 'All Customers'} ({customerListWithSummary.length})
            </button>
            <button
              onClick={() => setDueFilter('hasDue')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                dueFilter === 'hasDue'
                  ? 'bg-rose-600 text-white'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
              }`}
            >
              {language === 'bn' ? 'বাকি রয়েছে' : 'Outstanding Due'} ({customerListWithSummary.filter(c => c.summary.totalDue > 0).length})
            </button>
            <button
              onClick={() => setDueFilter('paid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                dueFilter === 'paid'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              {language === 'bn' ? 'পরিশোধিত' : 'Fully Cleared'}
            </button>
          </div>
        </div>

        {/* Customer Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-y border-slate-200 text-slate-600 font-semibold">
                <th className="p-3">{t.customerName}</th>
                <th className="p-3">{t.customerPhone}</th>
                <th className="p-3">{t.customerAddress}</th>
                <th className="p-3 text-right">{t.customerTotalSand}</th>
                <th className="p-3 text-right">{t.customerTotalBill}</th>
                <th className="p-3 text-right">{t.customerTotalPaid}</th>
                <th className="p-3 text-right">{t.customerNetDue}</th>
                <th className="p-3 text-center">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    {language === 'bn' ? 'কোনো ক্রেতার তথ্য পাওয়া যায়নি।' : 'No customer records found.'}
                  </td>
                </tr>
              ) : (
                filteredCustomers.map(customer => (
                  <tr key={customer.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{customer.name}</span>
                        {customer.note && (
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200" title={customer.note}>
                            {language === 'bn' ? 'নোট' : 'Note'}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {language === 'bn' ? 'নিবন্ধন:' : 'Joined:'} {formatDate(customer.createdAt, language)}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-slate-700 whitespace-nowrap">
                      {customer.phone ? (
                        <a href={`tel:${customer.phone}`} className="flex items-center gap-1 hover:text-amber-700">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{customer.phone}</span>
                        </a>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="p-3 text-slate-600 max-w-xs truncate">
                      <span className="flex items-center gap-1" title={customer.address}>
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{customer.address || '-'}</span>
                      </span>
                    </td>
                    <td className="p-3 text-right font-black text-amber-900 whitespace-nowrap">
                      {formatCFT(customer.summary.totalCFT, language)}
                    </td>
                    <td className="p-3 text-right font-bold text-slate-900 whitespace-nowrap">
                      {formatCurrency(customer.summary.totalAmount, language)}
                    </td>
                    <td className="p-3 text-right font-semibold text-emerald-700 whitespace-nowrap">
                      {formatCurrency(customer.summary.totalPaid, language)}
                    </td>
                    <td className="p-3 text-right whitespace-nowrap">
                      {customer.summary.totalDue > 0 ? (
                        <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                          {formatCurrency(customer.summary.totalDue, language)}
                        </span>
                      ) : (
                        <span className="text-emerald-700 text-[11px] font-semibold flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {language === 'bn' ? 'পরিশোধিত' : 'Cleared'}
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-center whitespace-nowrap space-x-1">
                      {/* View Ledger Statement */}
                      <button
                        onClick={() => setSelectedCustomerForLedger(customer)}
                        className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 font-semibold rounded-lg border border-amber-200 transition-colors inline-flex items-center gap-1"
                        title={t.customerLedger}
                      >
                        <Receipt className="w-3.5 h-3.5 text-amber-700" />
                        <span>{language === 'bn' ? 'খাতা / লেজার' : 'Ledger'}</span>
                      </button>

                      {/* Collect Due Payment */}
                      {userRole === 'admin' && customer.summary.totalDue > 0 && (
                        <button
                          onClick={() => handleOpenPayment(customer)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-2xs transition-colors inline-flex items-center gap-1"
                          title={t.collectCustomerDue}
                        >
                          <DollarSign className="w-3 h-3" />
                          <span>{language === 'bn' ? 'আদায়' : 'Pay'}</span>
                        </button>
                      )}

                      {/* Edit Customer */}
                      {userRole === 'admin' && (
                        <button
                          onClick={() => handleOpenEdit(customer)}
                          className="p-1 text-slate-400 hover:text-amber-700 hover:bg-slate-100 rounded-md transition-colors"
                          title={t.edit}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Delete Customer */}
                      {userRole === 'admin' && (
                        <button
                          onClick={() => handleDelete(customer)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-md transition-colors"
                          title={t.delete}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Customer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden my-8">
            <div className="bg-amber-700 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Users className="w-5 h-5" />
                {editingCustomer
                  ? (language === 'bn' ? 'ক্রেতার তথ্য সম্পাদনা' : 'Edit Customer Information')
                  : (language === 'bn' ? 'নতুন ক্রেতা যোগ করুন' : 'Add New Customer')}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  resetForm();
                }}
                className="p-1 text-amber-200 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCustomerSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.customerName} *
                </label>
                <input
                  type="text"
                  required
                  placeholder={language === 'bn' ? 'যেমন: দেশবন্ধু বিল্ডার্স লিমিটেড' : 'Customer or Company Name'}
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.customerPhone} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="01XXXXXXXXX"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.customerOpeningDue}
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={openingDue || ''}
                    onChange={e => setOpeningDue(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                  <span className="text-[10px] text-slate-400">
                    {language === 'bn' ? 'পূর্বে কোনো বকেয়া থাকলে লিখুন' : 'Any prior opening balance'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.customerAddress} *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder={language === 'bn' ? 'সাইটের ঠিকানা, রোড, জেলা ইত্যাদি' : 'Site location or office address'}
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.note}
                </label>
                <input
                  type="text"
                  placeholder={language === 'bn' ? 'বিশেষ শর্ত বা প্রজেক্ট নোট' : 'Special terms or remarks'}
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl border border-slate-200"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl shadow-xs"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Collect Due Payment Modal */}
      {isPaymentModalOpen && customerForPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden my-8">
            <div className="bg-emerald-700 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="text-base font-bold flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                {t.collectCustomerDue}
              </h3>
              <button
                onClick={() => {
                  setIsPaymentModalOpen(false);
                  setCustomerForPayment(null);
                }}
                className="p-1 text-emerald-200 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePaymentSubmit} className="p-6 space-y-4">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                <div className="font-bold text-slate-900 text-sm">{customerForPayment.name}</div>
                <div className="text-slate-600 mt-0.5">{customerForPayment.phone} • {customerForPayment.address}</div>
                <div className="mt-2 pt-2 border-t border-slate-200 flex justify-between items-center">
                  <span className="text-slate-600">{t.previousDueBalance}:</span>
                  <span className="font-bold text-rose-600 text-sm">
                    {formatCurrency(getCustomerSummary(customerForPayment.id).totalDue, language)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.date} *
                </label>
                <input
                  type="date"
                  required
                  value={paymentDate}
                  onChange={e => setPaymentDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === 'bn' ? 'জমা / আদায়কৃত টাকা (৳) *' : 'Payment Amount (৳) *'}
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="0"
                  value={paymentAmount || ''}
                  onChange={e => setPaymentAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-base font-bold text-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.paymentMethod}
                </label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-white"
                >
                  <option value="cash">{language === 'bn' ? 'নগদ ক্যাশ' : 'Cash'}</option>
                  <option value="bank">{language === 'bn' ? 'ব্যাংক ট্রান্সফার / চেক' : 'Bank Transfer'}</option>
                  <option value="bkash">{language === 'bn' ? 'বিকাশ / নগদ (MFS)' : 'bKash / Nagad'}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.note}
                </label>
                <input
                  type="text"
                  placeholder={language === 'bn' ? 'রসিদ বা ব্যাংক চেক নম্বর' : 'Receipt or cheque no'}
                  value={paymentNote}
                  onChange={e => setPaymentNote(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsPaymentModalOpen(false);
                    setCustomerForPayment(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl border border-slate-200"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs"
                >
                  {language === 'bn' ? 'জমা নিশ্চিত করুন' : 'Confirm Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Full Account Statement & Ledger Modal */}
      {selectedCustomerForLedger && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden my-8 print:my-0 print:shadow-none print:w-full print:max-w-none print:rounded-none">
            {/* Modal Top Bar */}
            <div className="no-print bg-slate-100 border-b border-slate-200 px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-amber-700" />
                <span className="text-sm font-bold text-slate-800">
                  {selectedCustomerForLedger.name} - {t.customerLedger}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{t.printStatement}</span>
                </button>
                <button
                  onClick={() => setSelectedCustomerForLedger(null)}
                  className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Ledger Sheet */}
            <div className="p-8 print:p-6 bg-white text-slate-900 space-y-6">
              {/* Business & Customer Header */}
              <div className="border-b-2 border-slate-900 pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-2xl font-black tracking-tight text-slate-900">
                      {language === 'bn' ? 'মেসার্স সততা বালু মহাল ও সরবরাহকারী' : 'M/S Sand Mining & Supply Co.'}
                    </h1>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {language === 'bn'
                        ? 'নদী ঘাট থেকে বল গেট ড্রেজারে উত্তোলিত ভিটি ও লাল বালু পাইকারি ও খুচরা বিক্রেতা'
                        : 'Wholesale & Retail Supplier of High-Quality Dredged River Sand'}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {language === 'bn' ? 'ঘাট ও ইয়ার্ড: মেঘনা চর ঘাট, সোনারগাঁও | মোবাইল: 01711-XXXXXX' : 'Meghna Char Ghat, Sonargaon | Mobile: 01711-XXXXXX'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block bg-amber-100 text-amber-900 font-bold px-3 py-1 rounded-md text-xs border border-amber-300">
                      {language === 'bn' ? 'ক্রেতার খতিয়ান ও হিসাব বিবরণী' : 'CUSTOMER LEDGER STATEMENT'}
                    </span>
                    <p className="text-xs text-slate-500 mt-2">
                      {language === 'bn' ? 'তারিখ:' : 'Date:'} {formatDate(new Date().toISOString().slice(0, 10), language)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Customer Profile Box */}
              {(() => {
                const summary = getCustomerSummary(selectedCustomerForLedger.id);
                return (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                      <div>
                        <p className="text-slate-500 font-semibold uppercase text-[10px]">{t.customerDetails}</p>
                        <p className="text-base font-bold text-slate-900 mt-0.5">{selectedCustomerForLedger.name}</p>
                        <p className="text-slate-600 mt-1 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{selectedCustomerForLedger.phone || '-'}</span>
                        </p>
                        <p className="text-slate-600 mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{selectedCustomerForLedger.address || '-'}</span>
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-right">
                        <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                          <span className="text-[10px] text-slate-500 block uppercase">{t.customerTotalSand}</span>
                          <span className="text-sm font-black text-amber-900 block mt-0.5">
                            {formatCFT(summary.totalCFT, language)}
                          </span>
                        </div>

                        <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                          <span className="text-[10px] text-slate-500 block uppercase">{t.customerTotalBill}</span>
                          <span className="text-sm font-black text-slate-900 block mt-0.5">
                            {formatCurrency(summary.totalAmount, language)}
                          </span>
                        </div>

                        <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                          <span className="text-[10px] text-slate-500 block uppercase">{t.customerTotalPaid}</span>
                          <span className="text-sm font-black text-emerald-700 block mt-0.5">
                            {formatCurrency(summary.totalPaid, language)}
                          </span>
                        </div>

                        <div className="bg-white p-2.5 rounded-lg border border-rose-200 bg-rose-50/50">
                          <span className="text-[10px] text-rose-700 font-bold block uppercase">{t.customerNetDue}</span>
                          <span className="text-sm font-black text-rose-600 block mt-0.5">
                            {formatCurrency(summary.totalDue, language)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Sales & Truck Deliveries Table */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Truck className="w-4 h-4 text-amber-600" />
                        {language === 'bn' ? 'চালান ও ট্রাক পরিবহন ডেলিভারি সমূহ' : 'Challan & Truck Delivery Records'}
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border border-slate-300 border-collapse">
                          <thead>
                            <tr className="bg-slate-100 text-slate-800 font-bold">
                              <th className="border border-slate-300 p-2">{t.date}</th>
                              <th className="border border-slate-300 p-2">{t.invoiceNo}</th>
                              <th className="border border-slate-300 p-2">{t.truckInfo}</th>
                              <th className="border border-slate-300 p-2">{t.destination}</th>
                              <th className="border border-slate-300 p-2 text-right">CFT</th>
                              <th className="border border-slate-300 p-2 text-right">{t.rate}</th>
                              <th className="border border-slate-300 p-2 text-right">{t.totalAmount}</th>
                              <th className="border border-slate-300 p-2 text-right">{t.paidAmount}</th>
                              <th className="border border-slate-300 p-2 text-right">{t.dueAmount}</th>
                              <th className="border border-slate-300 p-2 text-center no-print">{t.viewChallan}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {summary.sales.length === 0 ? (
                              <tr>
                                <td colSpan={10} className="p-4 text-center text-slate-400">
                                  {language === 'bn' ? 'এই ক্রেতার এখনও কোনো চালানের রেকর্ড নেই।' : 'No sales records for this customer yet.'}
                                </td>
                              </tr>
                            ) : (
                              summary.sales.map(sale => (
                                <tr key={sale.id} className="hover:bg-slate-50">
                                  <td className="border border-slate-300 p-2 whitespace-nowrap">
                                    {formatDate(sale.date, language)}
                                  </td>
                                  <td className="border border-slate-300 p-2 font-mono font-bold whitespace-nowrap">
                                    {sale.invoiceNo}
                                  </td>
                                  <td className="border border-slate-300 p-2 text-[11px]">
                                    <span className="font-semibold text-slate-800 block">{sale.truckNo}</span>
                                    {sale.driverName && (
                                      <span className="text-slate-500 block">
                                        {sale.driverName} {sale.driverPhone ? `(${sale.driverPhone})` : ''}
                                      </span>
                                    )}
                                  </td>
                                  <td className="border border-slate-300 p-2 text-slate-600">
                                    {sale.destination || '-'}
                                  </td>
                                  <td className="border border-slate-300 p-2 text-right font-bold text-amber-900 whitespace-nowrap">
                                    {formatCFT(sale.quantityCFT, language)}
                                  </td>
                                  <td className="border border-slate-300 p-2 text-right whitespace-nowrap">
                                    ৳ {sale.ratePerCFT}
                                  </td>
                                  <td className="border border-slate-300 p-2 text-right font-bold whitespace-nowrap">
                                    {formatCurrency(sale.totalAmount, language)}
                                  </td>
                                  <td className="border border-slate-300 p-2 text-right text-emerald-700 font-semibold whitespace-nowrap">
                                    {formatCurrency(sale.paidAmount, language)}
                                  </td>
                                  <td className="border border-slate-300 p-2 text-right whitespace-nowrap">
                                    {sale.dueAmount > 0 ? (
                                      <span className="font-bold text-rose-600">{formatCurrency(sale.dueAmount, language)}</span>
                                    ) : (
                                      <span className="text-emerald-700">0 ৳</span>
                                    )}
                                  </td>
                                  <td className="border border-slate-300 p-2 text-center no-print whitespace-nowrap">
                                    <button
                                      onClick={() => {
                                        setSelectedCustomerForLedger(null);
                                        onOpenInvoiceModal(sale);
                                      }}
                                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-medium inline-flex items-center gap-1"
                                    >
                                      <FileText className="w-3 h-3 text-amber-600" />
                                      <span>{language === 'bn' ? 'চালান' : 'Challan'}</span>
                                    </button>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Payment History across all sales for this customer */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Receipt className="w-4 h-4 text-emerald-600" />
                        {language === 'bn' ? 'টাকা প্রাপ্তি ও পরিশোধ হিস্ট্রি' : 'Payment Collection History'}
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border border-slate-300 border-collapse">
                          <thead>
                            <tr className="bg-slate-100 text-slate-800 font-bold">
                              <th className="border border-slate-300 p-2">{t.date}</th>
                              <th className="border border-slate-300 p-2">{language === 'bn' ? 'চালান নং' : 'Challan Ref'}</th>
                              <th className="border border-slate-300 p-2">{t.paymentMethod}</th>
                              <th className="border border-slate-300 p-2">{t.note}</th>
                              <th className="border border-slate-300 p-2 text-right">{language === 'bn' ? 'প্রাপ্ত টাকা' : 'Amount Received'}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {summary.sales.flatMap(s => (s.paymentHistory || []).map(p => ({ ...p, invoiceNo: s.invoiceNo }))).length === 0 ? (
                              <tr>
                                <td colSpan={5} className="p-4 text-center text-slate-400">
                                  {language === 'bn' ? 'কোনো পেমেন্ট হিস্ট্রি পাওয়া যায়নি।' : 'No payment logs found.'}
                                </td>
                              </tr>
                            ) : (
                              summary.sales
                                .flatMap(s => (s.paymentHistory || []).map(p => ({ ...p, invoiceNo: s.invoiceNo })))
                                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                .map(log => (
                                  <tr key={log.id} className="hover:bg-slate-50">
                                    <td className="border border-slate-300 p-2 whitespace-nowrap">
                                      {formatDate(log.date, language)}
                                    </td>
                                    <td className="border border-slate-300 p-2 font-mono font-semibold text-slate-800 whitespace-nowrap">
                                      {log.invoiceNo}
                                    </td>
                                    <td className="border border-slate-300 p-2 capitalize text-slate-700">
                                      {log.paymentMethod === 'cash' ? (language === 'bn' ? 'নগদ ক্যাশ' : 'Cash') : log.paymentMethod === 'bank' ? (language === 'bn' ? 'ব্যাংক' : 'Bank') : 'bKash/Nagad'}
                                    </td>
                                    <td className="border border-slate-300 p-2 text-slate-600">
                                      {log.note || '-'}
                                    </td>
                                    <td className="border border-slate-300 p-2 text-right font-black text-emerald-700 whitespace-nowrap">
                                      {formatCurrency(log.amount, language)}
                                    </td>
                                  </tr>
                                ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Signature block on print */}
                    <div className="hidden print:grid grid-cols-2 pt-16 text-center text-xs">
                      <div>
                        <div className="border-t border-slate-400 w-48 mx-auto pt-1">
                          {language === 'bn' ? 'ক্রেতার স্বাক্ষর' : 'Customer Signature'}
                        </div>
                      </div>
                      <div>
                        <div className="border-t border-slate-400 w-48 mx-auto pt-1">
                          {language === 'bn' ? 'কর্তৃপক্ষের স্বাক্ষর' : 'Authorized Signature'}
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

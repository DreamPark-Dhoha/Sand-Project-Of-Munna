import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../translations';
import { SaleRecord } from '../types';
import { formatCurrency, formatCFT, formatDate } from '../utils/formatters';
import {
  Truck,
  PlusCircle,
  Search,
  Trash2,
  FileText,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  X,
  Phone,
  ArrowRight,
  MapPin,
  UserCheck
} from 'lucide-react';

interface SalesModuleProps {
  showAddModalDefault?: boolean;
  onCloseAddModalDefault?: () => void;
  onOpenInvoiceModal: (sale: SaleRecord) => void;
  onOpenDueModal: (sale: SaleRecord) => void;
}

export const SalesModule: React.FC<SalesModuleProps> = ({
  showAddModalDefault = false,
  onCloseAddModalDefault,
  onOpenInvoiceModal,
  onOpenDueModal
}) => {
  const {
    data,
    language,
    userRole,
    addSale,
    deleteSale,
    totalSoldCFT,
    totalSalesRevenue,
    totalCashReceived,
    totalDueAmount,
    runningStockCFT,
    getCustomerSummary
  } = useApp();

  const t = translations[language];

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'partial' | 'due' | 'unpaid'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(showAddModalDefault);

  // Form states for new sale
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [destination, setDestination] = useState('');
  const [quantityCFT, setQuantityCFT] = useState<number>(0);
  const [ratePerCFT, setRatePerCFT] = useState<number>(16);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bank' | 'bkash'>('cash');
  const [truckNo, setTruckNo] = useState('');
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [transportCost, setTransportCost] = useState<number>(0);
  const [transportBorneBy, setTransportBorneBy] = useState<'customer' | 'business'>('customer');
  const [note, setNote] = useState('');

  // Handle external prop
  React.useEffect(() => {
    if (showAddModalDefault) {
      setIsAddModalOpen(true);
      resetForm();
    }
  }, [showAddModalDefault]);

  const resetForm = () => {
    setDate(new Date().toISOString().slice(0, 10));
    setSelectedCustomerId('');
    setCustomerName('');
    setCustomerPhone('');
    setCustomerAddress('');
    setDestination('');
    setQuantityCFT(0);
    setRatePerCFT(16);
    setPaidAmount(0);
    setPaymentMethod('cash');
    setTruckNo('');
    setDriverName('');
    setDriverPhone('');
    setTransportCost(0);
    setTransportBorneBy('customer');
    setNote('');
  };

  const handleCustomerSelectChange = (customerId: string) => {
    setSelectedCustomerId(customerId);
    if (!customerId || customerId === '__new__') {
      // Clear for manual typing
      setCustomerName('');
      setCustomerPhone('');
      setCustomerAddress('');
      return;
    }
    const found = data.customers.find(c => c.id === customerId);
    if (found) {
      setCustomerName(found.name);
      setCustomerPhone(found.phone);
      setCustomerAddress(found.address);
      if (!destination) {
        setDestination(found.address);
      }
    }
  };

  // Live total calculation
  const calculatedTotal = Math.round((Number(quantityCFT) || 0) * (Number(ratePerCFT) || 0));
  const calculatedDue = Math.max(0, calculatedTotal - (Number(paidAmount) || 0));

  const selectedCustomer = selectedCustomerId && selectedCustomerId !== '__new__'
    ? data.customers.find(c => c.id === selectedCustomerId)
    : null;
  const currentCustomerSummary = selectedCustomer ? getCustomerSummary(selectedCustomer.id) : null;
  const currentCustomerPreviousDue = currentCustomerSummary ? currentCustomerSummary.totalDue : 0;
  const totalCombinedDue = currentCustomerPreviousDue + calculatedDue;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || quantityCFT <= 0 || ratePerCFT <= 0) return;

    if (quantityCFT > runningStockCFT) {
      if (!window.confirm(
        language === 'bn'
          ? `সতর্কতা: বিক্রিত পরিমাণ (${quantityCFT} CFT) বর্তমান মজুদ (${runningStockCFT} CFT) এর চেয়ে বেশি। আপনি কি তবুও বিক্রয় সংরক্ষণ করতে চান?`
          : `Warning: Sales quantity (${quantityCFT} CFT) exceeds running stock (${runningStockCFT} CFT). Continue anyway?`
      )) {
        return;
      }
    }

    addSale({
      date,
      customerId: selectedCustomerId && selectedCustomerId !== '__new__' ? selectedCustomerId : undefined,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerAddress: customerAddress.trim(),
      destination: destination.trim(),
      quantityCFT: Number(quantityCFT),
      ratePerCFT: Number(ratePerCFT),
      paidAmount: Number(paidAmount),
      paymentStatus: calculatedDue === 0 ? 'paid' : paidAmount > 0 ? 'partial' : 'due',
      paymentMethod,
      truckNo: truckNo.trim() || (language === 'bn' ? 'অনির্দিষ্ট ট্রাক' : 'Truck pending'),
      driverName: driverName.trim(),
      driverPhone: driverPhone.trim(),
      transportCost: Number(transportCost) || 0,
      transportBorneBy,
      note: note.trim()
    });

    setIsAddModalOpen(false);
    resetForm();
    if (onCloseAddModalDefault) onCloseAddModalDefault();
  };

  // Filtered sales
  const filteredSales = useMemo(() => {
    return data.sales.filter(item => {
      const matchesSearch =
        item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.truckNo && item.truckNo.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.customerPhone && item.customerPhone.includes(searchTerm)) ||
        (item.destination && item.destination.toLowerCase().includes(searchTerm.toLowerCase()));

      let matchesStatus = true;
      if (statusFilter === 'paid') matchesStatus = item.paymentStatus === 'paid';
      if (statusFilter === 'partial') matchesStatus = item.paymentStatus === 'partial';
      if (statusFilter === 'due') matchesStatus = item.paymentStatus === 'due';
      if (statusFilter === 'unpaid') matchesStatus = item.dueAmount > 0; // both partial and due

      return matchesSearch && matchesStatus;
    });
  }, [data.sales, searchTerm, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Truck className="w-5 h-5 text-amber-600" />
            {t.sales}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'bn'
              ? 'ট্রাক ডেলিভারি চালান তৈরি, সিএফটি দর, নগদ/বাকি ট্র্যাকিং ও পেমেন্ট রসিদ।'
              : 'Truck sales delivery challans, CFT rates, cash vs due ledger and printable receipts.'}
          </p>
        </div>

        {userRole === 'admin' && (
          <button
            id="add-sale-top-btn"
            onClick={() => {
              resetForm();
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t.newSale}</span>
          </button>
        )}
      </div>

      {/* Sales KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">{t.totalSold}</span>
          <p className="text-xl font-black text-slate-900 mt-1">
            {formatCFT(totalSoldCFT, language)}
          </p>
          <span className="text-[11px] text-slate-500">
            {data.sales.length} {language === 'bn' ? 'টি চালান প্রদান' : 'challans issued'}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">{t.grossRevenue}</span>
          <p className="text-xl font-black text-slate-900 mt-1">
            {formatCurrency(totalSalesRevenue, language)}
          </p>
          <span className="text-[11px] text-slate-500">
            {language === 'bn' ? 'মোট বিক্রিত মূল্য' : 'Gross invoice value'}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">{t.cashReceived}</span>
          <p className="text-xl font-black text-emerald-600 mt-1">
            {formatCurrency(totalCashReceived, language)}
          </p>
          <span className="text-[11px] text-slate-500">
            {language === 'bn' ? 'নগদ/ব্যাংকে সংগৃহীত' : 'Collected in cash/bank'}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-rose-200 bg-rose-50/40 shadow-xs">
          <span className="text-xs font-semibold text-rose-700 uppercase">{t.totalDueReceivable}</span>
          <p className="text-xl font-black text-rose-600 mt-1">
            {formatCurrency(totalDueAmount, language)}
          </p>
          <span className="text-[11px] text-rose-600 font-medium">
            {data.sales.filter(s => s.dueAmount > 0).length} {language === 'bn' ? 'টি চালানে বাকি' : 'invoices with due'}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder={language === 'bn' ? 'ক্রেতা, চালান নং, ফোন বা ট্রাক নম্বর...' : 'Search customer, challan, truck...'}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              statusFilter === 'all'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {language === 'bn' ? 'সকল' : 'All'}
          </button>
          <button
            onClick={() => setStatusFilter('unpaid')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              statusFilter === 'unpaid'
                ? 'bg-rose-600 text-white shadow-2xs font-bold'
                : 'text-rose-700 hover:bg-rose-50'
            }`}
          >
            {language === 'bn' ? 'বাকির খাতা' : 'Due Accounts'} ({data.sales.filter(s => s.dueAmount > 0).length})
          </button>
          <button
            onClick={() => setStatusFilter('paid')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              statusFilter === 'paid'
                ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.statusPaid}
          </button>
        </div>
      </div>

      {/* Sales Records Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <th className="p-3">{t.invoiceNo}</th>
                <th className="p-3">{t.date}</th>
                <th className="p-3">{t.customerName}</th>
                <th className="p-3 text-right">{language === 'bn' ? 'পরিমাণ (CFT)' : 'Quantity'}</th>
                <th className="p-3 text-right">{t.ratePerCft}</th>
                <th className="p-3 text-right">{t.totalAmount}</th>
                <th className="p-3 text-right">{t.paidAmount}</th>
                <th className="p-3 text-right text-rose-700">{t.dueAmount}</th>
                <th className="p-3">{t.truckInfo}</th>
                <th className="p-3 text-center">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-400">
                    {t.noData}
                  </td>
                </tr>
              ) : (
                filteredSales.map(sale => (
                  <tr key={sale.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {sale.invoiceNo}
                    </td>
                    <td className="p-3 text-slate-600 whitespace-nowrap">
                      {formatDate(sale.date, language)}
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{sale.customerName}</div>
                      <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-1 mt-0.5">
                        {sale.customerPhone && (
                          <span className="flex items-center gap-0.5">
                            <Phone className="w-2.5 h-2.5 text-slate-400" /> {sale.customerPhone}
                          </span>
                        )}
                        {(sale.customerAddress || sale.destination) && (
                          <span className="flex items-center gap-0.5 text-slate-500">
                            <MapPin className="w-2.5 h-2.5 text-slate-400" />
                            {sale.customerAddress || sale.destination}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-right font-black text-amber-900 text-sm whitespace-nowrap">
                      {formatCFT(sale.quantityCFT, language)}
                    </td>
                    <td className="p-3 text-right whitespace-nowrap">
                      ৳ {sale.ratePerCFT}
                    </td>
                    <td className="p-3 text-right font-bold text-slate-900 whitespace-nowrap">
                      {formatCurrency(sale.totalAmount, language)}
                    </td>
                    <td className="p-3 text-right font-semibold text-emerald-700 whitespace-nowrap">
                      {formatCurrency(sale.paidAmount, language)}
                    </td>
                    <td className="p-3 text-right whitespace-nowrap">
                      {sale.dueAmount > 0 ? (
                        <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                          {formatCurrency(sale.dueAmount, language)}
                        </span>
                      ) : (
                        <span className="text-emerald-700 text-[11px] font-semibold flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {t.statusPaid}
                        </span>
                      )}
                    </td>
                    <td className="p-3 whitespace-nowrap text-[11px]">
                      <span className="font-medium text-slate-800 block">{sale.truckNo}</span>
                      <span className="text-slate-500 block">
                        {sale.driverName || '-'} {sale.driverPhone ? `(${sale.driverPhone})` : ''}
                      </span>
                    </td>
                    <td className="p-3 text-center whitespace-nowrap space-x-1">
                      {/* Collect Due Button if balance remaining */}
                      {userRole === 'admin' && sale.dueAmount > 0 && (
                        <button
                          onClick={() => onOpenDueModal(sale)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-2xs transition-colors"
                          title={t.collectDue}
                        >
                          {t.collectDue}
                        </button>
                      )}

                      {/* View Invoice Challan Button */}
                      <button
                        onClick={() => onOpenInvoiceModal(sale)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium rounded-lg transition-colors inline-flex items-center gap-1"
                        title={t.viewChallan}
                      >
                        <FileText className="w-3.5 h-3.5 text-amber-700" />
                        <span>{language === 'bn' ? 'চালান' : 'Challan'}</span>
                      </button>

                      {/* Delete */}
                      {userRole === 'admin' && (
                        <button
                          onClick={() => {
                            if (window.confirm(t.confirmDelete)) {
                              deleteSale(sale.id);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-md transition-colors"
                          title={t.delete}
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Add Sand Sale Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden my-8">
            <div className="bg-amber-700 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Truck className="w-5 h-5" />
                {t.recordSaleTitle}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  if (onCloseAddModalDefault) onCloseAddModalDefault();
                }}
                className="p-1 text-amber-200 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              {/* 1. Customer Information Section */}
              <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-amber-600" />
                    <span>{language === 'bn' ? '১. ক্রেতার বিবরণ ও তথ্য' : '1. Customer Information'}</span>
                  </h4>

                  {/* Registered Customer Quick Selector */}
                  <div className="flex items-center gap-2">
                    <label className="text-[11px] font-semibold text-slate-600 whitespace-nowrap">
                      {language === 'bn' ? 'নিবন্ধিত ক্রেতা:' : 'Registered Customer:'}
                    </label>
                    <select
                      value={selectedCustomerId}
                      onChange={e => handleCustomerSelectChange(e.target.value)}
                      className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white font-medium text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                    >
                      <option value="">{language === 'bn' ? '-- নতুন ক্রেতা লিখুন --' : '-- Type New Customer --'}</option>
                      {data.customers.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.phone || c.address || 'ID'})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t.customerName} *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={language === 'bn' ? 'যেমন: মেসার্স দেশবন্ধু ট্রেডার্স' : 'Customer Name'}
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t.customerPhone} *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="01XXXXXXXXX"
                      value={customerPhone}
                      onChange={e => setCustomerPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {language === 'bn' ? 'ক্রেতার স্থায়ী ঠিকানা / অফিস' : 'Customer Address / Office'} *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={language === 'bn' ? 'যেমন: চাষাড়া, নারায়ণগঞ্জ' : 'Customer Office / Address'}
                      value={customerAddress}
                      onChange={e => setCustomerAddress(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t.destination} (আনলোডিং সাইট)
                    </label>
                    <input
                      type="text"
                      placeholder={language === 'bn' ? 'ডেলিভারি সাইট / ঠিকানা' : 'Site destination'}
                      value={destination}
                      onChange={e => setDestination(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden bg-white"
                    />
                  </div>
                </div>

                {/* Customer Outstanding Due Banner */}
                {selectedCustomer && (
                  <div className="mt-3 pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-600">{language === 'bn' ? 'ক্রেতার বর্তমান বকেয়া জের:' : 'Previous Due Balance:'}</span>
                      <span className={`font-bold ${currentCustomerPreviousDue > 0 ? 'text-rose-600 font-mono text-sm' : 'text-emerald-700'}`}>
                        {formatCurrency(currentCustomerPreviousDue, language)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 text-amber-950 font-medium">
                      <span>{language === 'bn' ? 'এই চালানসহ মোট বকেয়া দাঁড়াবে:' : 'Projected Total Due:'}</span>
                      <span className="font-bold font-mono text-sm text-rose-700">
                        {formatCurrency(totalCombinedDue, language)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Truck & Transport Section */}
              <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-amber-600" />
                  <span>{language === 'bn' ? '২. ট্রাক ও পরিবহন তথ্য' : '2. Truck & Transport Details'}</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t.truckNo} *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="ঢাকা মেট্রো-ট-..."
                      value={truckNo}
                      onChange={e => setTruckNo(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t.driverName}
                    </label>
                    <input
                      type="text"
                      placeholder="ড্রাইভারের নাম"
                      value={driverName}
                      onChange={e => setDriverName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t.driverPhone}
                    </label>
                    <input
                      type="text"
                      placeholder="01XXXXXXXXX"
                      value={driverPhone}
                      onChange={e => setDriverPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t.transportCost} (৳)
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={transportCost || ''}
                      onChange={e => setTransportCost(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t.transportBorneBy}
                    </label>
                    <select
                      value={transportBorneBy}
                      onChange={e => setTransportBorneBy(e.target.value as any)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden bg-white"
                    >
                      <option value="customer">{t.borneByCustomer}</option>
                      <option value="business">{t.borneByBusiness}</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 3. Quantity & Pricing Section */}
              <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                    <span>{language === 'bn' ? '৩. বালুর পরিমাণ ও দর' : '3. Sand Quantity & Pricing'}</span>
                  </h4>
                  <span className="text-xs text-amber-800 font-semibold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    {language === 'bn' ? 'বর্তমান মজুদ:' : 'Stock Available:'} {formatCFT(runningStockCFT, language)}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t.date} *
                    </label>
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={e => setDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {language === 'bn' ? 'পরিমাণ (CFT)' : 'Quantity (CFT)'} *
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      placeholder="15000"
                      value={quantityCFT || ''}
                      onChange={e => setQuantityCFT(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-bold focus:ring-2 focus:ring-amber-500 focus:outline-hidden bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t.ratePerCft} *
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="0.1"
                      required
                      placeholder="16.5"
                      value={ratePerCFT || ''}
                      onChange={e => setRatePerCFT(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-bold focus:ring-2 focus:ring-amber-500 focus:outline-hidden bg-white"
                    />
                  </div>
                  <div className="bg-amber-50/70 p-2 rounded-xl border border-amber-200 text-center flex flex-col justify-center">
                    <span className="text-[10px] text-amber-900 font-bold block uppercase">{t.totalAmount}</span>
                    <span className="text-sm font-black text-slate-900 block mt-0.5 font-mono">
                      {formatCurrency(calculatedTotal, language)}
                    </span>
                  </div>
                </div>
              </div>

              {/* 4. Payment Section */}
              <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <span>{language === 'bn' ? '৪. পেমেন্ট ও বাকি হিসাব' : '4. Payment & Due Balance'}</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {language === 'bn' ? 'নগদ জমা প্রাপ্তি (৳)' : 'Paid Amount (৳)'}
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={calculatedTotal}
                      placeholder="0"
                      value={paidAmount || ''}
                      onChange={e => setPaidAmount(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-bold text-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t.paymentMethod}
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={e => setPaymentMethod(e.target.value as any)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden bg-white"
                    >
                      <option value="cash">{language === 'bn' ? 'নগদ ক্যাশ' : 'Cash'}</option>
                      <option value="bank">{language === 'bn' ? 'ব্যাংক ট্রান্সফার / চেক' : 'Bank Transfer'}</option>
                      <option value="bkash">{language === 'bn' ? 'বিকাশ / নগদ (MFS)' : 'bKash / Nagad'}</option>
                    </select>
                  </div>
                  <div className="bg-rose-50/70 p-2 rounded-xl border border-rose-200 text-center flex flex-col justify-center">
                    <span className="text-[10px] text-rose-800 font-bold block uppercase">{t.dueAmount}</span>
                    <span className="text-sm font-black text-rose-600 block mt-0.5 font-mono">
                      {formatCurrency(calculatedDue, language)}
                    </span>
                  </div>
                </div>
              </div>

              {/* 5. Remarks */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.note}
                </label>
                <input
                  type="text"
                  placeholder={language === 'bn' ? 'বিশেষ কোনো শর্ত বা সাইট মন্তব্য' : 'Special remarks or notes'}
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden bg-white"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    if (onCloseAddModalDefault) onCloseAddModalDefault();
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl border border-slate-200"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs"
                >
                  {language === 'bn' ? 'চালান ইস্যু ও সেভ করুন' : 'Issue Challan & Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

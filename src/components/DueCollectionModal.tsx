import React, { useState } from 'react';
import { SaleRecord } from '../types';
import { useApp } from '../context/AppContext';
import { translations } from '../translations';
import { formatCurrency, formatDate } from '../utils/formatters';
import { X, CheckCircle2, History } from 'lucide-react';

interface DueCollectionModalProps {
  sale: SaleRecord | null;
  onClose: () => void;
}

export const DueCollectionModal: React.FC<DueCollectionModalProps> = ({ sale, onClose }) => {
  const { language, recordDuePayment, data, getCustomerSummary } = useApp();
  const t = translations[language];

  const customer = sale?.customerId
    ? data.customers.find(c => c.id === sale.customerId)
    : data.customers.find(c => c.name.trim().toLowerCase() === sale?.customerName.trim().toLowerCase());
  const customerSummary = customer ? getCustomerSummary(customer.id) : null;

  const [paymentAmount, setPaymentAmount] = useState<number>(sale?.dueAmount || 0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bank' | 'bkash'>('cash');
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState<string>('');
  const [error, setError] = useState<string>('');

  if (!sale) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentAmount || paymentAmount <= 0) {
      setError(language === 'bn' ? 'অনুগ্রহ করে সঠিক টাকার পরিমাণ লিখুন।' : 'Please enter a valid amount.');
      return;
    }
    if (paymentAmount > sale.dueAmount) {
      setError(language === 'bn' ? 'পরিশোধের পরিমাণ অবশিষ্ট বাকির চেয়ে বেশি হতে পারে না।' : 'Amount cannot exceed remaining due.');
      return;
    }

    recordDuePayment(sale.id, {
      date,
      amount: paymentAmount,
      paymentMethod,
      note: note || (language === 'bn' ? 'বাকি আদায় কিস্তি' : 'Due settlement installment')
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden">
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              {t.collectDue}
            </h3>
            <p className="text-xs text-slate-300">
              {sale.customerName} ({sale.invoiceNo})
            </p>
          </div>
          <button
            id="close-due-modal-btn"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Customer & Transport Info Banner */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-1 mb-1.5">
              <span className="font-bold text-slate-900 text-sm">{customer?.name || sale.customerName}</span>
              <span className="font-mono text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200 font-semibold">
                {sale.invoiceNo}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-slate-600">
              <p>
                <span className="font-semibold text-slate-700">{t.customerPhone}:</span>{' '}
                {customer?.phone || sale.customerPhone || '-'}
              </p>
              <p>
                <span className="font-semibold text-slate-700">{t.customerAddress}:</span>{' '}
                {customer?.address || sale.customerAddress || sale.destination || '-'}
              </p>
              <p>
                <span className="font-semibold text-slate-700">{t.truckNo}:</span> {sale.truckNo}
              </p>
              {customerSummary && (
                <p className="text-rose-700 font-semibold">
                  <span>{language === 'bn' ? 'ক্রেতার মোট বকেয়া খাতা:' : 'Total Customer Due:'}</span>{' '}
                  {formatCurrency(customerSummary.totalDue, language)}
                </p>
              )}
            </div>
          </div>

          {/* Due Info Card */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <p className="text-slate-500">{t.totalAmount}</p>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{formatCurrency(sale.totalAmount, language)}</p>
            </div>
            <div>
              <p className="text-slate-500">{t.paidAmount}</p>
              <p className="font-bold text-emerald-600 text-sm mt-0.5">{formatCurrency(sale.paidAmount, language)}</p>
            </div>
            <div className="bg-rose-50 border border-rose-100 rounded-lg p-1">
              <p className="text-rose-700 font-semibold">{t.dueAmountRemaining}</p>
              <p className="font-bold text-rose-600 text-sm mt-0.5">{formatCurrency(sale.dueAmount, language)}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'bn' ? 'আদায়কৃত টাকার পরিমাণ (৳)' : 'Payment Collected (৳)'} *
              </label>
              <input
                type="number"
                min="1"
                max={sale.dueAmount}
                value={paymentAmount || ''}
                onChange={e => {
                  setPaymentAmount(Number(e.target.value));
                  setError('');
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden font-bold"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.date} *
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  required
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
                  <option value="bank">{language === 'bn' ? 'ব্যাংক চেক / ট্রান্সফার' : 'Bank Transfer'}</option>
                  <option value="bkash">{language === 'bn' ? 'বিকাশ / নগদ (MFS)' : 'bKash / Nagad'}</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.note}
              </label>
              <input
                type="text"
                placeholder={language === 'bn' ? 'যেমন: চেক নং বা ট্রানজেকশন আইডি...' : 'e.g., Check no. or TxID...'}
                value={note}
                onChange={e => setNote(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl border border-slate-200"
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors"
              >
                {language === 'bn' ? 'পেমেন্ট নিশ্চিত করুন' : 'Confirm Payment'}
              </button>
            </div>
          </form>

          {/* Payment History Log */}
          {sale.paymentHistory && sale.paymentHistory.length > 0 && (
            <div className="pt-3 border-t border-slate-200">
              <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-2">
                <History className="w-3.5 h-3.5 text-slate-500" />
                {language === 'bn' ? 'পূর্ববর্তী জমা বিবরণী' : 'Payment History Logs'}
              </h4>
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {sale.paymentHistory.map((h, i) => (
                  <div key={i} className="flex items-center justify-between text-[11px] p-2 bg-slate-50 rounded-lg border border-slate-100">
                    <div>
                      <span className="font-semibold text-slate-800">{formatDate(h.date, language)}</span>
                      <span className="text-slate-500 ml-2">({h.paymentMethod})</span>
                      {h.note && <p className="text-slate-500 text-[10px]">{h.note}</p>}
                    </div>
                    <span className="font-bold text-emerald-700">+{formatCurrency(h.amount, language)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

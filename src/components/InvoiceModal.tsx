import React, { useState } from 'react';
import { SaleRecord } from '../types';
import { useApp } from '../context/AppContext';
import { translations } from '../translations';
import { formatCurrency, formatCFT, formatDate } from '../utils/formatters';
import { Printer, X, CheckCircle2, AlertCircle, Download, Loader2 } from 'lucide-react';
import { downloadElementAsPdf, printElementViaHiddenFrame, printElementDirectly } from '../utils/reportExport';

interface InvoiceModalProps {
  sale: SaleRecord | null;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ sale, onClose }) => {
  const { language, data, getCustomerSummary } = useApp();
  const t = translations[language];
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  if (!sale) return null;

  const customer = sale.customerId ? data.customers.find(c => c.id === sale.customerId) : null;
  const customerSummary = customer ? getCustomerSummary(customer.id) : null;

  const handlePrint = () => {
    const success = printElementViaHiddenFrame('printable-challan', `Challan-${sale.invoiceNo}`);
    if (!success) {
      printElementDirectly('printable-challan');
    }
  };

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      await downloadElementAsPdf('printable-challan', {
        filename: `বালু_চালান_${sale.invoiceNo}_${sale.customerName}.pdf`,
        margin: 6,
        orientation: 'portrait'
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden my-8 print:my-0 print:shadow-none print:w-full print:max-w-none print:rounded-none">
        {/* Modal Action Bar (Hidden on print) */}
        <div className="no-print bg-slate-100 border-b border-slate-200 px-6 py-3 flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-700">
            {language === 'bn' ? 'চালান ও বিল রসিদ' : 'Challan & Sales Receipt'}
          </span>
          <div className="flex items-center gap-2">
            <button
              id="download-challan-pdf-btn"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{language === 'bn' ? 'তৈরি হচ্ছে...' : 'Generating...'}</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'PDF ডাউনলোড' : 'Download PDF'}</span>
                </>
              )}
            </button>
            <button
              id="print-challan-btn"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'প্রিন্ট' : 'Print'}</span>
            </button>
            <button
              id="close-invoice-modal-btn"
              onClick={onClose}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Challan Paper Layout */}
        <div className="p-8 print:p-6 bg-white text-slate-900" id="printable-challan">
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-4 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900">
                  {language === 'bn' ? 'মেসার্স সততা বালু মহাল ও সরবরাহকারী' : 'M/S Sand Mining & Supply Co.'}
                </h1>
                <p className="text-xs text-slate-600 mt-0.5">
                  {language === 'bn'
                    ? 'নদী ঘাট থেকে বল গেট ড্রেজারে উত্তোলিত ভিটি, সিলেকশন ও লাল বালু পাইকারি ও খুচরা বিক্রেতা'
                    : 'Wholesale & Retail Supplier of High-Quality Dredged River Sand'}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {language === 'bn' ? 'ঘাট ও স্টকপাইল ইয়ার্ড: মেঘনা চর ঘাট, সোনারগাঁও | মোবাইল: 01711-XXXXXX' : 'Ghat & Stockpile Yard: Meghna Char, Sonargaon | Mobile: 01711-XXXXXX'}
                </p>
              </div>
              <div className="text-right">
                <span className="inline-block bg-amber-100 text-amber-900 font-bold px-3 py-1 rounded-md text-xs border border-amber-300">
                  {language === 'bn' ? 'ডেলিভারি চালান / ক্যাশ মেমো' : 'DELIVERY CHALLAN & BILL'}
                </span>
                <p className="text-xs font-mono font-bold text-slate-800 mt-2">
                  {t.invoiceNo}: {sale.invoiceNo}
                </p>
                <p className="text-xs text-slate-600">
                  {t.date}: {formatDate(sale.date, language)}
                </p>
              </div>
            </div>
          </div>

          {/* Customer & Transport Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div>
              <p className="font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1.5 flex items-center gap-1">
                <span>👤</span> {language === 'bn' ? 'ক্রেতার বিবরণ' : 'Customer Details'}
              </p>
              <p className="font-bold text-slate-900 text-sm">{customer?.name || sale.customerName}</p>
              <p className="text-slate-600 mt-0.5">
                <span className="font-semibold text-slate-700">{t.customerPhone}:</span> {customer?.phone || sale.customerPhone || '-'}
              </p>
              <p className="text-slate-600 mt-0.5">
                <span className="font-semibold text-slate-700">{t.customerAddress}:</span> {customer?.address || sale.customerAddress || '-'}
              </p>
              {sale.destination && (
                <p className="text-slate-600 mt-0.5">
                  <span className="font-semibold text-slate-700">{t.destination}:</span> {sale.destination}
                </p>
              )}
            </div>
            <div>
              <p className="font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1.5 flex items-center gap-1">
                <span>🚚</span> {language === 'bn' ? 'ট্রাক ও পরিবহন বিবরণ' : 'Truck & Transport'}
              </p>
              <p className="font-bold text-slate-900 text-sm">{t.truckNo}: {sale.truckNo}</p>
              <p className="text-slate-600 mt-0.5">
                <span className="font-semibold text-slate-700">{t.driverName}:</span> {sale.driverName || '-'} {sale.driverPhone ? `(${sale.driverPhone})` : ''}
              </p>
              <p className="text-slate-600 mt-0.5">
                <span className="font-semibold text-slate-700">{t.transportCost}:</span> {formatCurrency(sale.transportCost, language)} (
                {sale.transportBorneBy === 'customer' ? t.borneByCustomer : t.borneByBusiness})
              </p>
            </div>
          </div>

          {/* Itemized Table */}
          <table className="w-full border-collapse border border-slate-300 text-xs mb-6">
            <thead>
              <tr className="bg-slate-200 text-slate-800 font-bold">
                <th className="border border-slate-300 p-2.5 text-center w-12">#</th>
                <th className="border border-slate-300 p-2.5 text-left">
                  {language === 'bn' ? 'পণ্যের বিবরণ (বালুর ধরন)' : 'Description (Sand Grade)'}
                </th>
                <th className="border border-slate-300 p-2.5 text-right w-28">
                  {language === 'bn' ? 'পরিমাণ (CFT)' : 'Quantity (CFT)'}
                </th>
                <th className="border border-slate-300 p-2.5 text-right w-24">
                  {language === 'bn' ? 'প্রতি CFT দর' : 'Rate / CFT'}
                </th>
                <th className="border border-slate-300 p-2.5 text-right w-28">
                  {language === 'bn' ? 'মোট মূল্য' : 'Total'}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-slate-300 p-2.5 text-center">1</td>
                <td className="border border-slate-300 p-2.5">
                  <p className="font-semibold text-slate-900">
                    {language === 'bn' ? 'উত্তোলিত নদী বালু (River Sand)' : 'Dredged River Sand (CFT)'}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {sale.note || (language === 'bn' ? 'বল গেট ড্রেজার দিয়ে নদী থেকে উত্তোলিত' : 'River dredged coarse/fine sand')}
                  </p>
                </td>
                <td className="border border-slate-300 p-2.5 text-right font-bold text-slate-900">
                  {formatCFT(sale.quantityCFT, language)}
                </td>
                <td className="border border-slate-300 p-2.5 text-right">
                  {formatCurrency(sale.ratePerCFT, language)}
                </td>
                <td className="border border-slate-300 p-2.5 text-right font-bold text-slate-900">
                  {formatCurrency(sale.totalAmount, language)}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Financial Summary */}
          <div className="flex justify-end mb-8">
            <div className="w-64 space-y-1.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-600">{t.totalAmount}:</span>
                <span className="font-bold text-slate-900">{formatCurrency(sale.totalAmount, language)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-600">{t.paidAmount}:</span>
                <span className="font-semibold text-emerald-700">{formatCurrency(sale.paidAmount, language)}</span>
              </div>
              <div className="flex justify-between py-1 font-bold text-sm bg-slate-100 p-1.5 rounded-sm">
                <span className="text-slate-800">{t.dueAmount}:</span>
                <span className={sale.dueAmount > 0 ? 'text-rose-600' : 'text-emerald-700'}>
                  {formatCurrency(sale.dueAmount, language)}
                </span>
              </div>
              <div className="pt-1 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">{t.paymentStatus}:</span>
                <span className="flex items-center gap-1 font-semibold">
                  {sale.paymentStatus === 'paid' ? (
                    <span className="text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {t.statusPaid}
                    </span>
                  ) : (
                    <span className="text-amber-700 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {sale.paymentStatus === 'partial' ? t.statusPartial : t.statusDue}
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Dual Signatures */}
          <div className="pt-12 grid grid-cols-2 gap-8 text-center text-xs">
            <div>
              <div className="border-t border-slate-400 w-44 mx-auto pt-1 text-slate-700 font-semibold">
                {language === 'bn' ? 'ক্রেতা / ট্রাক গ্রহণকারীর স্বাক্ষর' : "Customer / Receiver's Signature"}
              </div>
            </div>
            <div>
              <div className="border-t border-slate-400 w-44 mx-auto pt-1 text-slate-700 font-semibold">
                {language === 'bn' ? 'অনুমোদিত ম্যানেজার স্বাক্ষর' : "Authorized Manager's Signature"}
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-8 pt-3 border-t border-slate-200 text-center text-[10px] text-slate-500">
            {language === 'bn'
              ? 'ধন্যবাদ! কোনো ত্রুটি বা পরিমাপের অভিযোগ থাকলে ট্রাক সাইট ছাড়ার পূর্বে জানান।'
              : 'Thank you! Please inspect measurements before the truck departs the stockpile yard.'}
          </div>
        </div>
      </div>
    </div>
  );
};

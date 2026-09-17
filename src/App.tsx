/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { ShareholderModule } from './components/ShareholderModule';
import { ExtractionModule } from './components/ExtractionModule';
import { StockpileModule } from './components/StockpileModule';
import { SalesModule } from './components/SalesModule';
import { CustomerModule } from './components/CustomerModule';
import { ExpenseModule } from './components/ExpenseModule';
import { ReportsModule } from './components/ReportsModule';
import { InvoiceModal } from './components/InvoiceModal';
import { DueCollectionModal } from './components/DueCollectionModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { DataCleanModal } from './components/DataCleanModal';
import { SaleRecord } from './types';
import { translations } from './translations';
import { Waves, Shield, CheckCircle2 } from 'lucide-react';

function AppContent() {
  const { language, userRole, data } = useApp();
  const t = translations[language];

  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Modals state
  const [selectedSaleForInvoice, setSelectedSaleForInvoice] = useState<SaleRecord | null>(null);
  const [selectedSaleForDue, setSelectedSaleForDue] = useState<SaleRecord | null>(null);

  // Quick modals trigger from dashboard
  const [openNewSale, setOpenNewSale] = useState(false);
  const [openNewExtraction, setOpenNewExtraction] = useState(false);
  const [openNewExpense, setOpenNewExpense] = useState(false);

  // Helper when dashboard clicks action
  const handleQuickSale = () => {
    setActiveTab('sales');
    setOpenNewSale(true);
  };

  const handleQuickExtraction = () => {
    setActiveTab('extraction');
    setOpenNewExtraction(true);
  };

  const handleQuickExpense = () => {
    setActiveTab('expenses');
    setOpenNewExpense(true);
  };

  const handleSelectSaleForDue = (saleId: string) => {
    const s = data.sales.find(x => x.id === saleId);
    if (s) setSelectedSaleForDue(s);
  };

  const handleSelectSaleForInvoice = (saleId: string) => {
    const s = data.sales.find(x => x.id === saleId);
    if (s) setSelectedSaleForInvoice(s);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <Dashboard
            setActiveTab={setActiveTab}
            onOpenNewSaleModal={handleQuickSale}
            onOpenNewExtractionModal={handleQuickExtraction}
            onOpenNewExpenseModal={handleQuickExpense}
            onSelectSaleForDue={handleSelectSaleForDue}
            onSelectSaleForInvoice={handleSelectSaleForInvoice}
          />
        )}

        {activeTab === 'extraction' && (
          <ExtractionModule
            showAddModalDefault={openNewExtraction}
            onCloseAddModalDefault={() => setOpenNewExtraction(false)}
          />
        )}

        {activeTab === 'stockpile' && <StockpileModule />}

        {activeTab === 'sales' && (
          <SalesModule
            showAddModalDefault={openNewSale}
            onCloseAddModalDefault={() => setOpenNewSale(false)}
            onOpenInvoiceModal={sale => setSelectedSaleForInvoice(sale)}
            onOpenDueModal={sale => setSelectedSaleForDue(sale)}
          />
        )}

        {activeTab === 'customers' && (
          <CustomerModule
            onOpenInvoiceModal={sale => setSelectedSaleForInvoice(sale)}
          />
        )}

        {activeTab === 'expenses' && (
          <ExpenseModule
            showAddModalDefault={openNewExpense}
            onCloseAddModalDefault={() => setOpenNewExpense(false)}
          />
        )}

        {activeTab === 'shareholders' && <ShareholderModule />}

        {activeTab === 'reports' && <ReportsModule />}
      </main>

      {/* Modals */}
      <InvoiceModal
        sale={selectedSaleForInvoice}
        onClose={() => setSelectedSaleForInvoice(null)}
      />

      <DueCollectionModal
        sale={selectedSaleForDue}
        onClose={() => setSelectedSaleForDue(null)}
      />

      <AdminLoginModal />
      <DataCleanModal />

      {/* Footer (Hidden on print) */}
      <footer className="no-print bg-white border-t border-slate-200 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">{t.appTitle}</span>
            <span>•</span>
            <span>{t.appSubtitle}</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1 font-medium text-slate-600">
              <Shield className="w-3.5 h-3.5 text-amber-600" />
              {userRole === 'admin' ? t.roleBadgeAdmin : t.roleBadgeShareholder}
            </span>
            <span className="text-slate-400">|</span>
            <span className="text-emerald-700 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {language === 'bn' ? 'অফলাইন ও অটো-সেভ সক্রিয়' : 'Auto-saved locally'}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

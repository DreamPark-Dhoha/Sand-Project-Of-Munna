import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  BusinessData,
  Customer,
  ExtractionRecord,
  ExpenseRecord,
  Language,
  SaleRecord,
  Shareholder,
  ShareholderTransaction,
  UserRole,
  WastageRecord,
  DuePaymentLog
} from '../types';
import { initialBusinessData } from '../data/initialData';

const STORAGE_KEY = 'sand_business_ledger_data_v1';
const ROLE_KEY = 'sand_business_ledger_role';
const LANG_KEY = 'sand_business_ledger_lang';
const ADMIN_AUTH_KEY = 'sand_business_ledger_admin_auth';

export const ADMIN_CREDENTIALS = {
  username: 'MunnaSand2026',
  password: 'MS12345'
};

export interface ShareholderShareSummary {
  id: string;
  name: string;
  phone: string;
  initialInvestment: number;
  additionalInvestment: number;
  totalInvested: number;
  totalWithdrawn: number;
  sharePercentage: number;
  profitShareAmount: number; // proportionate to share percentage
  netReceivableOrPayable: number;
}

interface AppContextType {
  data: BusinessData;
  language: Language;
  setLanguage: (lang: Language) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  
  // Customer actions
  addCustomer: (cust: Omit<Customer, 'id' | 'createdAt'>) => string;
  updateCustomer: (id: string, cust: Partial<Customer>) => void;
  deleteCustomer: (id: string) => { success: boolean; message?: string };
  recordCustomerPayment: (customerId: string, payment: { date: string; amount: number; paymentMethod: 'cash' | 'bank' | 'bkash'; note?: string }) => void;
  getCustomerSummary: (customerId: string) => {
    customer?: Customer;
    totalCFT: number;
    totalAmount: number;
    totalPaid: number;
    totalDue: number;
    sales: SaleRecord[];
  };

  // Shareholder actions
  addShareholder: (sh: Omit<Shareholder, 'id' | 'transactions'>) => void;
  updateShareholder: (id: string, sh: Partial<Shareholder>) => void;
  deleteShareholder: (id: string) => void;
  addShareholderTransaction: (shareholderId: string, tx: Omit<ShareholderTransaction, 'id'>) => void;
  
  // Extraction actions
  addExtraction: (ext: Omit<ExtractionRecord, 'id'>) => void;
  updateExtraction: (id: string, ext: Partial<ExtractionRecord>) => void;
  deleteExtraction: (id: string) => void;
  
  // Wastage actions
  addWastage: (wst: Omit<WastageRecord, 'id'>) => void;
  deleteWastage: (id: string) => void;
  
  // Sales actions
  addSale: (sale: Omit<SaleRecord, 'id' | 'invoiceNo' | 'dueAmount' | 'totalAmount' | 'paymentHistory'>) => void;
  updateSale: (id: string, sale: Partial<SaleRecord>) => void;
  deleteSale: (id: string) => void;
  recordDuePayment: (saleId: string, payment: Omit<DuePaymentLog, 'id'>) => void;
  
  // Expense actions
  addExpense: (exp: Omit<ExpenseRecord, 'id'>) => void;
  updateExpense: (id: string, exp: Partial<ExpenseRecord>) => void;
  deleteExpense: (id: string) => void;
  
  // Backup & Reset & Data Clean
  resetData: () => void;
  resetToDemoData: () => void;
  startFresh: (mode?: 'blank_slate' | 'zero_transactions') => void;
  isDemoData: boolean;
  cleanData: (
    mode: 'full_wipe' | 'transactions_only' | 'selective',
    selectiveOptions?: {
      sales?: boolean;
      extractions?: boolean;
      expenses?: boolean;
      customers?: boolean;
      shareholders?: boolean;
    }
  ) => void;
  exportJSON: () => void;
  importJSON: (jsonString: string) => boolean;
  showDataCleanModal: boolean;
  setShowDataCleanModal: (show: boolean) => void;
  showNewUserBanner: boolean;
  dismissNewUserBanner: () => void;
  setShowNewUserBanner: (show: boolean) => void;

  // Admin Authentication
  isAdminAuthenticated: boolean;
  loginAdmin: (user: string, pass: string) => { success: boolean; message?: string };
  logoutAdmin: () => void;
  showLoginModal: boolean;
  setShowLoginModal: (show: boolean) => void;
  
  // Calculated Metrics
  totalExtractedCFT: number;
  totalSoldCFT: number;
  totalWastageCFT: number;
  runningStockCFT: number;
  
  totalInvestedCapital: number;
  totalSalesRevenue: number;
  totalCashReceived: number;
  totalDueAmount: number;
  totalDirectExtractionCosts: number;
  totalOperationalExpenses: number;
  totalAllExpenses: number;
  netProfit: number;
  
  shareholderShares: ShareholderShareSummary[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const BANNER_HIDE_KEY = 'sand_business_hide_new_user_banner';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<BusinessData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          customers: Array.isArray(parsed.customers) ? parsed.customers : [],
          shareholders: Array.isArray(parsed.shareholders) ? parsed.shareholders : [],
          extractions: Array.isArray(parsed.extractions) ? parsed.extractions : [],
          wastages: Array.isArray(parsed.wastages) ? parsed.wastages : [],
          sales: Array.isArray(parsed.sales) ? parsed.sales : [],
          expenses: Array.isArray(parsed.expenses) ? parsed.expenses : []
        };
      }
    } catch (e) {
      console.error('Failed to load data from storage:', e);
    }
    return initialBusinessData;
  });

  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem(LANG_KEY) as Language) || 'bn';
  });

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem(ADMIN_AUTH_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [userRole, setUserRoleState] = useState<UserRole>(() => {
    try {
      const isAuth = localStorage.getItem(ADMIN_AUTH_KEY) === 'true';
      const savedRole = localStorage.getItem(ROLE_KEY) as UserRole;
      if (savedRole === 'admin' && isAuth) {
        return 'admin';
      }
      return 'shareholder';
    } catch {
      return 'shareholder';
    }
  });

  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [showDataCleanModal, setShowDataCleanModal] = useState<boolean>(false);

  const [showNewUserBanner, setShowNewUserBannerState] = useState<boolean>(() => {
    try {
      return localStorage.getItem(BANNER_HIDE_KEY) !== 'true';
    } catch {
      return true;
    }
  });

  const dismissNewUserBanner = () => {
    setShowNewUserBannerState(false);
    try {
      localStorage.setItem(BANNER_HIDE_KEY, 'true');
    } catch (e) {
      console.error('Failed to save banner dismissal:', e);
    }
  };

  const setShowNewUserBanner = (show: boolean) => {
    setShowNewUserBannerState(show);
    try {
      if (!show) {
        localStorage.setItem(BANNER_HIDE_KEY, 'true');
      } else {
        localStorage.removeItem(BANNER_HIDE_KEY);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to persist data:', e);
    }
  }, [data]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(LANG_KEY, lang);
  };

  const loginAdmin = (user: string, pass: string): { success: boolean; message?: string } => {
    if (user.trim() === ADMIN_CREDENTIALS.username && pass === ADMIN_CREDENTIALS.password) {
      setIsAdminAuthenticated(true);
      setUserRoleState('admin');
      try {
        localStorage.setItem(ADMIN_AUTH_KEY, 'true');
        localStorage.setItem(ROLE_KEY, 'admin');
      } catch (e) {
        console.error('Failed to persist admin auth:', e);
      }
      return { success: true };
    }
    return {
      success: false,
      message: language === 'bn' ? 'ভুল ব্যবহারকারীর নাম অথবা পাসওয়ার্ড!' : 'Invalid username or password!'
    };
  };

  const logoutAdmin = () => {
    setIsAdminAuthenticated(false);
    setUserRoleState('shareholder');
    try {
      localStorage.removeItem(ADMIN_AUTH_KEY);
      localStorage.setItem(ROLE_KEY, 'shareholder');
    } catch (e) {
      console.error('Failed to clear admin auth:', e);
    }
  };

  const setUserRole = (role: UserRole) => {
    if (role === 'admin') {
      if (isAdminAuthenticated) {
        setUserRoleState('admin');
        localStorage.setItem(ROLE_KEY, 'admin');
      } else {
        setShowLoginModal(true);
      }
    } else {
      setUserRoleState('shareholder');
      localStorage.setItem(ROLE_KEY, 'shareholder');
    }
  };

  // Customers
  const addCustomer = (custData: Omit<Customer, 'id' | 'createdAt'>): string => {
    const newId = `cust-${Date.now()}`;
    const newCustomer: Customer = {
      ...custData,
      id: newId,
      createdAt: new Date().toISOString().slice(0, 10)
    };
    setData(prev => ({
      ...prev,
      customers: [...prev.customers, newCustomer]
    }));
    return newId;
  };

  const updateCustomer = (id: string, updated: Partial<Customer>) => {
    setData(prev => ({
      ...prev,
      customers: prev.customers.map(c => (c.id === id ? { ...c, ...updated } : c)),
      sales: prev.sales.map(s => {
        if (s.customerId === id) {
          return {
            ...s,
            customerName: updated.name ?? s.customerName,
            customerPhone: updated.phone ?? s.customerPhone,
            customerAddress: updated.address ?? s.customerAddress
          };
        }
        return s;
      })
    }));
  };

  const deleteCustomer = (id: string): { success: boolean; message?: string } => {
    const hasSales = data.sales.some(s => s.customerId === id);
    if (hasSales) {
      return {
        success: false,
        message: language === 'bn' 
          ? 'এই ক্রেতার পূর্বের চালান রেকর্ড রয়েছে, সরাসরি মুছে ফেলা যাবে না।' 
          : 'Cannot delete this customer as they have active sales challans.'
      };
    }
    setData(prev => ({
      ...prev,
      customers: prev.customers.filter(c => c.id !== id)
    }));
    return { success: true };
  };

  const recordCustomerPayment = (
    customerId: string,
    payment: { date: string; amount: number; paymentMethod: 'cash' | 'bank' | 'bkash'; note?: string }
  ) => {
    setData(prev => {
      const customer = prev.customers.find(c => c.id === customerId);
      let remainingPayment = payment.amount;

      const updatedSales = [...prev.sales];
      const customerSaleIndices = updatedSales
        .map((s, idx) => ({ s, idx }))
        .filter(({ s }) => (s.customerId === customerId || (customer && s.customerName.trim().toLowerCase() === customer.name.trim().toLowerCase())) && s.dueAmount > 0)
        .sort((a, b) => new Date(a.s.date).getTime() - new Date(b.s.date).getTime());

      if (customerSaleIndices.length === 0) {
        const anySaleIndex = updatedSales.findIndex(s => s.customerId === customerId || (customer && s.customerName.trim().toLowerCase() === customer.name.trim().toLowerCase()));
        if (anySaleIndex !== -1) {
          const s = updatedSales[anySaleIndex];
          const log: DuePaymentLog = {
            id: `pay-${Date.now()}`,
            date: payment.date,
            amount: payment.amount,
            paymentMethod: payment.paymentMethod,
            note: payment.note || 'ক্রেতার অতিরিক্ত জমা'
          };
          updatedSales[anySaleIndex] = {
            ...s,
            paidAmount: s.paidAmount + payment.amount,
            paymentHistory: [...(s.paymentHistory || []), log]
          };
        }
        return { ...prev, sales: updatedSales };
      }

      for (const { idx } of customerSaleIndices) {
        if (remainingPayment <= 0) break;
        const currentSale = updatedSales[idx];
        const payableForThisSale = Math.min(remainingPayment, currentSale.dueAmount);
        const newPaid = currentSale.paidAmount + payableForThisSale;
        const newDue = Math.max(0, currentSale.totalAmount - newPaid);
        const newStatus: 'paid' | 'partial' | 'due' = newDue === 0 ? 'paid' : 'partial';

        const paymentLog: DuePaymentLog = {
          id: `pay-${Date.now()}-${idx}`,
          date: payment.date,
          amount: payableForThisSale,
          paymentMethod: payment.paymentMethod,
          note: payment.note || `ক্রেতার খাতা থেকে আদায় জমা (${payableForThisSale} ৳)`
        };

        updatedSales[idx] = {
          ...currentSale,
          paidAmount: newPaid,
          dueAmount: newDue,
          paymentStatus: newStatus,
          paymentHistory: [...(currentSale.paymentHistory || []), paymentLog]
        };

        remainingPayment -= payableForThisSale;
      }

      return {
        ...prev,
        sales: updatedSales
      };
    });
  };

  const getCustomerSummary = (customerId: string) => {
    const customer = data.customers.find(c => c.id === customerId);
    const custSales = data.sales.filter(s => s.customerId === customerId || (customer && s.customerName.trim().toLowerCase() === customer.name.trim().toLowerCase()));
    const totalCFT = custSales.reduce((sum, s) => sum + s.quantityCFT, 0);
    const totalAmount = custSales.reduce((sum, s) => sum + s.totalAmount, 0) + (customer?.openingDue || 0);
    const totalPaid = custSales.reduce((sum, s) => sum + s.paidAmount, 0);
    const totalDue = Math.max(0, totalAmount - totalPaid);
    return {
      customer,
      totalCFT,
      totalAmount,
      totalPaid,
      totalDue,
      sales: custSales
    };
  };

  // Shareholders
  const addShareholder = (sh: Omit<Shareholder, 'id' | 'transactions'>) => {
    const newSh: Shareholder = {
      ...sh,
      id: `sh-${Date.now()}`,
      transactions: []
    };
    setData(prev => ({
      ...prev,
      shareholders: [...prev.shareholders, newSh]
    }));
  };

  const updateShareholder = (id: string, updated: Partial<Shareholder>) => {
    setData(prev => ({
      ...prev,
      shareholders: prev.shareholders.map(s => (s.id === id ? { ...s, ...updated } : s))
    }));
  };

  const deleteShareholder = (id: string) => {
    setData(prev => ({
      ...prev,
      shareholders: prev.shareholders.filter(s => s.id !== id)
    }));
  };

  const addShareholderTransaction = (shareholderId: string, tx: Omit<ShareholderTransaction, 'id'>) => {
    const newTx: ShareholderTransaction = {
      ...tx,
      id: `tx-${Date.now()}`
    };
    setData(prev => ({
      ...prev,
      shareholders: prev.shareholders.map(s => {
        if (s.id === shareholderId) {
          return {
            ...s,
            transactions: [newTx, ...s.transactions]
          };
        }
        return s;
      })
    }));
  };

  // Extractions
  const addExtraction = (ext: Omit<ExtractionRecord, 'id'>) => {
    const newExt: ExtractionRecord = {
      ...ext,
      id: `ext-${Date.now()}`
    };
    setData(prev => ({
      ...prev,
      extractions: [newExt, ...prev.extractions]
    }));
  };

  const updateExtraction = (id: string, updated: Partial<ExtractionRecord>) => {
    setData(prev => ({
      ...prev,
      extractions: prev.extractions.map(e => (e.id === id ? { ...e, ...updated } : e))
    }));
  };

  const deleteExtraction = (id: string) => {
    setData(prev => ({
      ...prev,
      extractions: prev.extractions.filter(e => e.id !== id)
    }));
  };

  // Wastages
  const addWastage = (wst: Omit<WastageRecord, 'id'>) => {
    const newWst: WastageRecord = {
      ...wst,
      id: `wst-${Date.now()}`
    };
    setData(prev => ({
      ...prev,
      wastages: [newWst, ...prev.wastages]
    }));
  };

  const deleteWastage = (id: string) => {
    setData(prev => ({
      ...prev,
      wastages: prev.wastages.filter(w => w.id !== id)
    }));
  };

  // Sales
  const addSale = (saleData: Omit<SaleRecord, 'id' | 'invoiceNo' | 'dueAmount' | 'totalAmount' | 'paymentHistory'>) => {
    const totalAmount = Math.round(saleData.quantityCFT * saleData.ratePerCFT);
    const paidAmount = Math.min(saleData.paidAmount, totalAmount);
    const dueAmount = Math.max(0, totalAmount - paidAmount);
    
    let paymentStatus: 'paid' | 'partial' | 'due' = 'paid';
    if (dueAmount === 0) {
      paymentStatus = 'paid';
    } else if (paidAmount > 0) {
      paymentStatus = 'partial';
    } else {
      paymentStatus = 'due';
    }

    const todayCode = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const count = data.sales.length + 1;
    const invoiceNo = `CH-${todayCode}-${count.toString().padStart(2, '0')}`;

    const newPaymentHistory: DuePaymentLog[] = paidAmount > 0 ? [{
      id: `pay-${Date.now()}`,
      date: saleData.date,
      amount: paidAmount,
      paymentMethod: saleData.paymentMethod,
      note: 'প্রাথমিক নগদ/পেমেন্ট জমা'
    }] : [];

    setData(prev => {
      let finalCustomerId = saleData.customerId;
      let updatedCustomers = [...prev.customers];

      if (finalCustomerId) {
        // Find customer and optionally update phone or address if not set
        const custIdx = updatedCustomers.findIndex(c => c.id === finalCustomerId);
        if (custIdx !== -1) {
          if (!updatedCustomers[custIdx].address && saleData.customerAddress) {
            updatedCustomers[custIdx] = {
              ...updatedCustomers[custIdx],
              address: saleData.customerAddress
            };
          }
        }
      } else if (saleData.customerName && saleData.customerName.trim()) {
        const trimmedName = saleData.customerName.trim().toLowerCase();
        const existing = updatedCustomers.find(c => c.name.trim().toLowerCase() === trimmedName);
        if (existing) {
          finalCustomerId = existing.id;
        } else {
          // Auto register new customer
          const newCustId = `cust-${Date.now()}`;
          const newCust: Customer = {
            id: newCustId,
            name: saleData.customerName.trim(),
            phone: saleData.customerPhone || '',
            address: saleData.customerAddress || saleData.destination || '',
            openingDue: 0,
            note: 'চালান তৈরির সময় স্বয়ংক্রিয় নিবন্ধিত',
            createdAt: saleData.date || new Date().toISOString().slice(0, 10)
          };
          updatedCustomers = [...updatedCustomers, newCust];
          finalCustomerId = newCustId;
        }
      }

      const newSale: SaleRecord = {
        ...saleData,
        customerId: finalCustomerId,
        customerAddress: saleData.customerAddress || (finalCustomerId ? updatedCustomers.find(c => c.id === finalCustomerId)?.address : ''),
        id: `sl-${Date.now()}`,
        invoiceNo,
        totalAmount,
        paidAmount,
        dueAmount,
        paymentStatus,
        paymentHistory: newPaymentHistory
      };

      return {
        ...prev,
        customers: updatedCustomers,
        sales: [newSale, ...prev.sales]
      };
    });
  };

  const updateSale = (id: string, updated: Partial<SaleRecord>) => {
    setData(prev => ({
      ...prev,
      sales: prev.sales.map(s => {
        if (s.id === id) {
          const merged = { ...s, ...updated };
          const totalAmount = Math.round(merged.quantityCFT * merged.ratePerCFT);
          const dueAmount = Math.max(0, totalAmount - merged.paidAmount);
          let paymentStatus: 'paid' | 'partial' | 'due' = 'paid';
          if (dueAmount === 0) {
            paymentStatus = 'paid';
          } else if (merged.paidAmount > 0) {
            paymentStatus = 'partial';
          } else {
            paymentStatus = 'due';
          }
          return {
            ...merged,
            totalAmount,
            dueAmount,
            paymentStatus
          };
        }
        return s;
      })
    }));
  };

  const deleteSale = (id: string) => {
    setData(prev => ({
      ...prev,
      sales: prev.sales.filter(s => s.id !== id)
    }));
  };

  const recordDuePayment = (saleId: string, payment: Omit<DuePaymentLog, 'id'>) => {
    const paymentLog: DuePaymentLog = {
      ...payment,
      id: `pay-${Date.now()}`
    };

    setData(prev => ({
      ...prev,
      sales: prev.sales.map(s => {
        if (s.id === saleId) {
          const newPaid = s.paidAmount + payment.amount;
          const newDue = Math.max(0, s.totalAmount - newPaid);
          let newStatus: 'paid' | 'partial' | 'due' = 'paid';
          if (newDue === 0) {
            newStatus = 'paid';
          } else if (newPaid > 0) {
            newStatus = 'partial';
          } else {
            newStatus = 'due';
          }
          return {
            ...s,
            paidAmount: newPaid,
            dueAmount: newDue,
            paymentStatus: newStatus,
            paymentHistory: [...(s.paymentHistory || []), paymentLog]
          };
        }
        return s;
      })
    }));
  };

  // Expenses
  const addExpense = (exp: Omit<ExpenseRecord, 'id'>) => {
    const newExp: ExpenseRecord = {
      ...exp,
      id: `exp-${Date.now()}`
    };
    setData(prev => ({
      ...prev,
      expenses: [newExp, ...prev.expenses]
    }));
  };

  const updateExpense = (id: string, updated: Partial<ExpenseRecord>) => {
    setData(prev => ({
      ...prev,
      expenses: prev.expenses.map(e => (e.id === id ? { ...e, ...updated } : e))
    }));
  };

  const deleteExpense = (id: string) => {
    setData(prev => ({
      ...prev,
      expenses: prev.expenses.filter(e => e.id !== id)
    }));
  };

  // Reset & Backup & Data Clean
  const resetToDemoData = () => {
    setData(initialBusinessData);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialBusinessData));
    } catch (e) {
      console.error('Failed to save reset demo data:', e);
    }
  };

  const resetData = () => {
    resetToDemoData();
  };

  const cleanData = (
    mode: 'full_wipe' | 'transactions_only' | 'selective',
    selectiveOptions?: {
      sales?: boolean;
      extractions?: boolean;
      expenses?: boolean;
      customers?: boolean;
      shareholders?: boolean;
    }
  ) => {
    if (mode === 'full_wipe') {
      const blankData: BusinessData = {
        customers: [],
        shareholders: [],
        extractions: [],
        wastages: [],
        sales: [],
        expenses: []
      };
      setData(blankData);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(blankData));
      } catch (e) {
        console.error('Failed to save blank data:', e);
      }
    } else if (mode === 'transactions_only') {
      setData(prev => {
        const cleaned: BusinessData = {
          customers: prev.customers.map(c => ({ ...c, openingDue: 0 })),
          shareholders: prev.shareholders.map(s => ({ ...s, transactions: [] })),
          extractions: [],
          wastages: [],
          sales: [],
          expenses: []
        };
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
        } catch (e) {
          console.error('Failed to save transactions-only clean data:', e);
        }
        return cleaned;
      });
    } else if (mode === 'selective' && selectiveOptions) {
      setData(prev => {
        const cleaned: BusinessData = {
          customers: selectiveOptions.customers ? [] : prev.customers,
          shareholders: selectiveOptions.shareholders
            ? []
            : prev.shareholders.map(s => selectiveOptions.shareholders ? { ...s, transactions: [] } : s),
          extractions: selectiveOptions.extractions ? [] : prev.extractions,
          wastages: selectiveOptions.extractions ? [] : prev.wastages,
          sales: selectiveOptions.sales ? [] : prev.sales,
          expenses: selectiveOptions.expenses ? [] : prev.expenses
        };
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
        } catch (e) {
          console.error('Failed to save selective clean data:', e);
        }
        return cleaned;
      });
    }
  };

  const startFresh = (mode: 'blank_slate' | 'zero_transactions' = 'blank_slate') => {
    setIsAdminAuthenticated(true);
    setUserRoleState('admin');
    try {
      localStorage.setItem(ADMIN_AUTH_KEY, 'true');
      localStorage.setItem(ROLE_KEY, 'admin');
    } catch (e) {
      console.error('Failed to save admin on start fresh:', e);
    }

    if (mode === 'blank_slate') {
      const blankData: BusinessData = {
        customers: [],
        shareholders: [],
        extractions: [],
        wastages: [],
        sales: [],
        expenses: []
      };
      setData(blankData);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(blankData));
      } catch (e) {
        console.error('Failed to save blank data:', e);
      }
    } else {
      setData(prev => {
        const cleaned: BusinessData = {
          customers: prev.customers.map(c => ({ ...c, openingDue: 0 })),
          shareholders: prev.shareholders.map(s => ({ ...s, transactions: [] })),
          extractions: [],
          wastages: [],
          sales: [],
          expenses: []
        };
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
        } catch (e) {
          console.error('Failed to save zero-transactions data:', e);
        }
        return cleaned;
      });
    }

    dismissNewUserBanner();
  };

  const isDemoData =
    data.sales.some(s => s.id === 'sale-1') ||
    data.extractions.some(e => e.id === 'ext-1') ||
    data.customers.some(c => c.id === 'cust-1');

  const exportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `sand_business_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const importJSON = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.shareholders && parsed.extractions && parsed.sales && parsed.expenses) {
        setData(parsed);
        return true;
      }
    } catch (e) {
      console.error('Failed to parse import JSON:', e);
    }
    return false;
  };

  // Calculations
  const totalExtractedCFT = data.extractions.reduce((sum, e) => sum + (Number(e.quantityCFT) || 0), 0);
  const totalSoldCFT = data.sales.reduce((sum, s) => sum + (Number(s.quantityCFT) || 0), 0);
  const totalWastageCFT = data.wastages.reduce((sum, w) => sum + (Number(w.quantityCFT) || 0), 0);
  const runningStockCFT = Math.max(0, totalExtractedCFT - totalSoldCFT - totalWastageCFT);

  const totalDirectExtractionCosts = data.extractions.reduce((sum, e) => sum + (Number(e.extractionCost) || 0), 0);
  const totalOperationalExpenses = data.expenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
  const totalAllExpenses = totalDirectExtractionCosts + totalOperationalExpenses;

  const totalSalesRevenue = data.sales.reduce((sum, s) => sum + (Number(s.totalAmount) || 0), 0);
  const totalCashReceived = data.sales.reduce((sum, s) => sum + (Number(s.paidAmount) || 0), 0);
  const totalDueAmount = data.sales.reduce((sum, s) => sum + (Number(s.dueAmount) || 0), 0);

  const netProfit = totalSalesRevenue - totalAllExpenses;

  // Total Capital
  const totalInvestedCapital = data.shareholders.reduce((sum, sh) => {
    const additional = (sh.transactions || [])
      .filter(t => t.type === 'investment')
      .reduce((tSum, t) => tSum + (Number(t.amount) || 0), 0);
    return sum + (Number(sh.initialInvestment) || 0) + additional;
  }, 0);

  // Shareholder breakdowns
  const shareholderShares: ShareholderShareSummary[] = data.shareholders.map(sh => {
    const additionalInv = (sh.transactions || [])
      .filter(t => t.type === 'investment')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    const withdrawn = (sh.transactions || [])
      .filter(t => t.type === 'withdrawal' || t.type === 'dividend')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    const totalInvested = sh.initialInvestment + additionalInv;

    // Use explicit sharePercentage if provided, otherwise compute from total invested capital
    const sharePercentage = sh.sharePercentage > 0 
      ? sh.sharePercentage 
      : (totalInvestedCapital > 0 ? (totalInvested / totalInvestedCapital) * 100 : 0);

    const profitShareAmount = (netProfit * sharePercentage) / 100;
    const netReceivableOrPayable = profitShareAmount - withdrawn;

    return {
      id: sh.id,
      name: sh.name,
      phone: sh.phone,
      initialInvestment: sh.initialInvestment,
      additionalInvestment: additionalInv,
      totalInvested,
      totalWithdrawn: withdrawn,
      sharePercentage: Number(sharePercentage.toFixed(2)),
      profitShareAmount: Math.round(profitShareAmount),
      netReceivableOrPayable: Math.round(netReceivableOrPayable)
    };
  });

  return (
    <AppContext.Provider
      value={{
        data,
        language,
        setLanguage,
        userRole,
        setUserRole,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        recordCustomerPayment,
        getCustomerSummary,
        addShareholder,
        updateShareholder,
        deleteShareholder,
        addShareholderTransaction,
        addExtraction,
        updateExtraction,
        deleteExtraction,
        addWastage,
        deleteWastage,
        addSale,
        updateSale,
        deleteSale,
        recordDuePayment,
        addExpense,
        updateExpense,
        deleteExpense,
        resetData,
        resetToDemoData,
        startFresh,
        isDemoData,
        cleanData,
        exportJSON,
        importJSON,
        showDataCleanModal,
        setShowDataCleanModal,
        showNewUserBanner,
        dismissNewUserBanner,
        setShowNewUserBanner,
        isAdminAuthenticated,
        loginAdmin,
        logoutAdmin,
        showLoginModal,
        setShowLoginModal,
        totalExtractedCFT,
        totalSoldCFT,
        totalWastageCFT,
        runningStockCFT,
        totalInvestedCapital,
        totalSalesRevenue,
        totalCashReceived,
        totalDueAmount,
        totalDirectExtractionCosts,
        totalOperationalExpenses,
        totalAllExpenses,
        netProfit,
        shareholderShares
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

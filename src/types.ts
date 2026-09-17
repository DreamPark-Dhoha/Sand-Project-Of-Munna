export type Language = 'bn' | 'en';
export type UserRole = 'admin' | 'shareholder';

export interface ShareholderTransaction {
  id: string;
  date: string;
  type: 'investment' | 'withdrawal' | 'dividend';
  amount: number;
  note: string;
}

export interface Shareholder {
  id: string;
  name: string;
  phone: string;
  initialInvestment: number;
  sharePercentage: number; // custom or calculated share %
  transactions: ShareholderTransaction[];
}

export interface ExtractionRecord {
  id: string;
  date: string;
  ghatName: string; // e.g., মেঘনা চর ঘাট, পদ্মা ড্রেজিং পয়েন্ট
  machineId: string; // e.g., বল গেট ড্রেজার - ০১
  quantityCFT: number; // উত্তোলিত পরিমাণ (CFT)
  extractionCost: number; // ডিজেল, পাম্প চালনা খরচ
  operatorName: string;
  note?: string;
}

export interface WastageRecord {
  id: string;
  date: string;
  quantityCFT: number;
  reason: string; // বৃষ্টির ধস, পরিবহন অপচয়, নদীর ভাঙন
  note?: string;
}

export interface DuePaymentLog {
  id: string;
  date: string;
  amount: number;
  paymentMethod: 'cash' | 'bank' | 'bkash';
  note?: string;
}

export interface Customer {
  id: string;
  name: string; // ক্রেতার নাম
  phone: string; // মোবাইল নম্বর
  address: string; // ঠিকানা / ডেলিভারি সাইট
  openingDue?: number; // পূর্বের বকেয়া (যদি থাকে)
  note?: string; // মন্তব্য
  createdAt: string;
}

export interface SaleRecord {
  id: string;
  invoiceNo: string;
  date: string;
  customerId?: string; // নিবন্ধিত ক্রেতার আইডি
  customerName: string;
  customerPhone: string;
  customerAddress?: string; // ক্রেতার স্থায়ী বা অফিস ঠিকানা
  destination: string; // আনলোডিং / ডেলিভারি পয়েন্ট
  quantityCFT: number;
  ratePerCFT: number; // প্রতি CFT দর (৳)
  totalAmount: number; // quantityCFT * ratePerCFT
  paidAmount: number;
  dueAmount: number;
  paymentStatus: 'paid' | 'partial' | 'due';
  paymentMethod: 'cash' | 'bank' | 'bkash';
  truckNo: string; // ট্রাক নম্বর
  driverName?: string; // ড্রাইভারের নাম
  driverPhone?: string; // ড্রাইভারের ফোন
  transportCost: number; // পরিবহন খরচ
  transportBorneBy: 'customer' | 'business'; // পরিবহন খরচ বহনকারী
  note?: string;
  paymentHistory?: DuePaymentLog[];
}

export type ExpenseCategory =
  | 'labor' // শ্রমিক/লেবার কস্ট
  | 'maintenance' // মেশিন/ড্রেজার মেইনটেন্যান্স
  | 'fuel' // ডিজেল/জ্বালানি
  | 'transport' // পরিবহন ও লোডিং
  | 'ghat_lease' // ঘাট ইজারা/নদী টোল
  | 'stockpile' // মজুদ মাঠ রক্ষণাবেক্ষণ
  | 'misc'; // আনুষঙ্গিক/বিবিধ

export interface ExpenseRecord {
  id: string;
  date: string;
  category: ExpenseCategory;
  title: string;
  amount: number;
  paidTo: string;
  voucherNo?: string;
  note?: string;
}

export interface BusinessData {
  customers: Customer[];
  shareholders: Shareholder[];
  extractions: ExtractionRecord[];
  wastages: WastageRecord[];
  sales: SaleRecord[];
  expenses: ExpenseRecord[];
}

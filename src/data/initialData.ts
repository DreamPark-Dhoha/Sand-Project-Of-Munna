import { BusinessData } from '../types';

export const initialBusinessData: BusinessData = {
  customers: [
    {
      id: 'cust-1',
      name: 'আল-মদিনা রিয়েল এস্টেট',
      phone: '01712-112233',
      address: 'ডেমরা স্টাফ কোয়ার্টার প্রজেক্ট, ঢাকা',
      openingDue: 0,
      note: 'নিয়মিত বড় গ্রাহক, বড় প্রজেক্টের ভিটি বালু সরবরাহ',
      createdAt: '2026-08-20'
    },
    {
      id: 'cust-2',
      name: 'দেশবন্ধু বিল্ডার্স লিমিটেড',
      phone: '01911-334455',
      address: 'কাঁচপুর সাইট, নারায়ণগঞ্জ',
      openingDue: 0,
      note: 'কমার্শিয়াল প্রজেক্ট, প্রতি সপ্তাহে ৫-১০ ট্রাক বালু ডেলিভারি',
      createdAt: '2026-08-25'
    },
    {
      id: 'cust-3',
      name: 'মেঘনা ব্রিজ ঠিকাদারি প্রতিষ্ঠান',
      phone: '01818-445566',
      address: 'ভৈরব ঘাট এপ্রোচ রোড, ভৈরব',
      openingDue: 0,
      note: 'সরকারি ও হাইওয়ে রাস্তার সাব-কন্ট্রাক্টর',
      createdAt: '2026-08-28'
    },
    {
      id: 'cust-4',
      name: 'মেসার্স আনোয়ার ট্রেডার্স',
      phone: '01715-778899',
      address: 'সোনারগাঁও বাজার, নারায়ণগঞ্জ',
      openingDue: 0,
      note: 'লোকাল ডিলার ও বালু বিক্রেতা',
      createdAt: '2026-09-01'
    },
    {
      id: 'cust-5',
      name: 'সোনারগাঁও ব্রিকস এন্ড কংক্রিট',
      phone: '01812-990011',
      address: 'মেঘনা ঘাট সংলগ্ন ইয়ার্ড, সোনারগাঁও',
      openingDue: 0,
      note: 'রেডি মিক্স ও ব্লক তৈরির বালু সরবরাহ',
      createdAt: '2026-09-02'
    }
  ],
  shareholders: [
    {
      id: 'sh-1',
      name: 'আলহাজ্ব মো: রফিকুল ইসলাম',
      phone: '01711-234567',
      initialInvestment: 1200000,
      sharePercentage: 40,
      transactions: [
        {
          id: 'tx-101',
          date: '2026-08-15',
          type: 'investment',
          amount: 200000,
          note: 'বল গেট ড্রেজারের নতুন সাকশন পাইপ ক্রয়ের জন্য অতিরিক্ত মূলধন'
        },
        {
          id: 'tx-102',
          date: '2026-09-02',
          type: 'withdrawal',
          amount: 80000,
          note: 'অগ্নিম লভ্যাংশ উত্তোলন'
        }
      ]
    },
    {
      id: 'sh-2',
      name: 'মো: হাবিবুর রহমান',
      phone: '01819-345678',
      initialInvestment: 1050000,
      sharePercentage: 35,
      transactions: [
        {
          id: 'tx-201',
          date: '2026-08-20',
          type: 'investment',
          amount: 150000,
          note: 'মাঠের ড্রেনেজ ও বালু সাইট এক্সটেনশন বিনিয়োগ'
        }
      ]
    },
    {
      id: 'sh-3',
      name: 'ইঞ্জি. নাজমুল হাসান',
      phone: '01912-890123',
      initialInvestment: 750000,
      sharePercentage: 25,
      transactions: []
    }
  ],
  extractions: [
    {
      id: 'ext-1',
      date: '2026-08-28',
      ghatName: 'মেঘনা চর ঘাট - পয়েন্ট ১',
      machineId: 'বল গেট ড্রেজার - ০১',
      quantityCFT: 45000,
      extractionCost: 135000,
      operatorName: 'উস্তাদ রহিম মাঝি',
      note: 'পদ্মা-মেঘনা সঙ্গমস্থল থেকে মোটা বালু উত্তোলন'
    },
    {
      id: 'ext-2',
      date: '2026-09-02',
      ghatName: 'মেঘনা নদী ঘাট - পয়েন্ট ২',
      machineId: 'বল গেট ড্রেজার - ০২',
      quantityCFT: 62000,
      extractionCost: 186000,
      operatorName: 'শরীফুল ইসলাম',
      note: 'লালচে সিলেকশন বালু উত্তোলন'
    },
    {
      id: 'ext-3',
      date: '2026-09-07',
      ghatName: 'শীতলক্ষ্যা ড্রেজিং পয়েন্ট',
      machineId: 'বল গেট ড্রেজার - ০১',
      quantityCFT: 38000,
      extractionCost: 114000,
      operatorName: 'উস্তাদ রহিম মাঝি',
      note: 'ভিটি বালু উত্তোলন'
    },
    {
      id: 'ext-4',
      date: '2026-09-11',
      ghatName: 'মেঘনা চর ঘাট - পয়েন্ট ১',
      machineId: 'বল গেট ড্রেজার - ০২',
      quantityCFT: 52000,
      extractionCost: 156000,
      operatorName: 'মোতালেব হোসেন',
      note: 'উচ্চ মানের নির্মাণ উপযোগী বালু'
    }
  ],
  wastages: [
    {
      id: 'wst-1',
      date: '2026-09-04',
      quantityCFT: 3200,
      reason: 'বৃষ্টির পানি ও ধস',
      note: 'টানা ২ দিনের ভারী বর্ষণে মাঠের দক্ষিণাংশে বালু পানির তোড়ে ধসে যায়'
    },
    {
      id: 'wst-2',
      date: '2026-09-09',
      quantityCFT: 1500,
      reason: 'পরিবহন ও পরিমাপজনিত ঘাটতি',
      note: 'ট্রাক লোডিং ও মাপের ক্ষেত্রে স্বাভাবিক অপচয়'
    }
  ],
  sales: [
    {
      id: 'sl-1',
      invoiceNo: 'CH-260901',
      date: '2026-09-03',
      customerId: 'cust-1',
      customerName: 'আল-মদিনা রিয়েল এস্টেট',
      customerPhone: '01712-112233',
      customerAddress: 'ডেমরা স্টাফ কোয়ার্টার প্রজেক্ট, ঢাকা',
      destination: 'ডেমরা স্টাফ কোয়ার্টার প্রজেক্ট',
      quantityCFT: 12000,
      ratePerCFT: 16.5,
      totalAmount: 198000,
      paidAmount: 198000,
      dueAmount: 0,
      paymentStatus: 'paid',
      paymentMethod: 'bank',
      truckNo: 'ঢাকা মেট্রো-ট ১১-৪৫৬৭',
      driverName: 'কালাম মিয়া',
      driverPhone: '01815-667788',
      transportCost: 18000,
      transportBorneBy: 'customer',
      note: 'সম্পূর্ণ ক্যাশ পরিশোধিত',
      paymentHistory: []
    },
    {
      id: 'sl-2',
      invoiceNo: 'CH-260902',
      date: '2026-09-05',
      customerId: 'cust-2',
      customerName: 'দেশবন্ধু বিল্ডার্স লিমিটেড',
      customerPhone: '01911-334455',
      customerAddress: 'কাঁচপুর সাইট, নারায়ণগঞ্জ',
      destination: 'কাঁচপুর সাইট',
      quantityCFT: 18500,
      ratePerCFT: 15.5,
      totalAmount: 286750,
      paidAmount: 150000,
      dueAmount: 136750,
      paymentStatus: 'partial',
      paymentMethod: 'cash',
      truckNo: 'ঢাকা মেট্রো-ট ১২-৮৮৯০',
      driverName: 'রফিক ড্রাইভার',
      driverPhone: '01723-998877',
      transportCost: 22000,
      transportBorneBy: 'customer',
      note: 'বাকি টাকা আগামী সপ্তাহে পরিশোধের অঙ্গীকার',
      paymentHistory: [
        {
          id: 'pay-1',
          date: '2026-09-05',
          amount: 150000,
          paymentMethod: 'cash',
          note: 'চালান কাটার সময় নগদ জমা'
        }
      ]
    },
    {
      id: 'sl-3',
      invoiceNo: 'CH-260903',
      date: '2026-09-08',
      customerId: 'cust-3',
      customerName: 'মেঘনা ব্রিজ ঠিকাদারি প্রতিষ্ঠান',
      customerPhone: '01818-445566',
      customerAddress: 'ভৈরব ঘাট এপ্রোচ রোড, ভৈরব',
      destination: 'ভৈরব ঘাট এপ্রোচ রোড',
      quantityCFT: 25000,
      ratePerCFT: 15.0,
      totalAmount: 375000,
      paidAmount: 375000,
      dueAmount: 0,
      paymentStatus: 'paid',
      paymentMethod: 'bank',
      truckNo: 'ঢাকা মেট্রো-ট ১৫-২৩৪৫',
      driverName: 'সুমন আহমেদ',
      driverPhone: '01611-443322',
      transportCost: 30000,
      transportBorneBy: 'customer',
      note: 'ব্যাংক ট্রানজেকশনে পরিশোধিত',
      paymentHistory: []
    },
    {
      id: 'sl-4',
      invoiceNo: 'CH-260904',
      date: '2026-09-10',
      customerId: 'cust-4',
      customerName: 'মেসার্স আনোয়ার ট্রেডার্স',
      customerPhone: '01715-778899',
      customerAddress: 'সোনারগাঁও বাজার, নারায়ণগঞ্জ',
      destination: 'সোনারগাঁও বাজার',
      quantityCFT: 9000,
      ratePerCFT: 16.0,
      totalAmount: 144000,
      paidAmount: 0,
      dueAmount: 144000,
      paymentStatus: 'due',
      paymentMethod: 'cash',
      truckNo: 'ঢাকা মেট্রো-ট ১৪-৬৭৮৯',
      driverName: 'বিল্লাল হোসেন',
      driverPhone: '01914-556677',
      transportCost: 12000,
      transportBorneBy: 'customer',
      note: 'সম্পূর্ণ বাকি, ১৫ দিনের মধ্যে পরিশোধযোগ্য',
      paymentHistory: []
    },
    {
      id: 'sl-5',
      invoiceNo: 'CH-260905',
      date: '2026-09-12',
      customerId: 'cust-5',
      customerName: 'সোনারগাঁও ব্রিকস এন্ড কংক্রিট',
      customerPhone: '01812-990011',
      customerAddress: 'মেঘনা ঘাট সংলগ্ন ইয়ার্ড, সোনারগাঁও',
      destination: 'মেঘনা ঘাট সংলগ্ন ইয়ার্ড',
      quantityCFT: 14000,
      ratePerCFT: 16.2,
      totalAmount: 226800,
      paidAmount: 120000,
      dueAmount: 106800,
      paymentStatus: 'partial',
      paymentMethod: 'bkash',
      truckNo: 'ঢাকা মেট্রো-ট ১৬-১১২২',
      driverName: 'জহিরুল ইসলাম',
      driverPhone: '01718-223344',
      transportCost: 16000,
      transportBorneBy: 'customer',
      note: 'বিকাশে ১,২০,০০০ টাকা জমা হয়েছে',
      paymentHistory: [
        {
          id: 'pay-2',
          date: '2026-09-12',
          amount: 120000,
          paymentMethod: 'bkash',
          note: 'বিকাশ পেমেন্ট'
        }
      ]
    }
  ],
  expenses: [
    {
      id: 'exp-1',
      date: '2026-08-30',
      category: 'fuel',
      title: 'ড্রেজার ও বল গেট পাম্পের জন্য ডিজেল ক্রয় (১২ ব্যারেল)',
      amount: 156000,
      paidTo: 'মেঘনা ফিলিং স্টেশন',
      voucherNo: 'FS-9821',
      note: 'প্রতি ব্যারেল ১৩,০০০ টাকা'
    },
    {
      id: 'exp-2',
      date: '2026-09-01',
      category: 'maintenance',
      title: 'বল গেট ড্রেজার - ০১ এর সাকশন পাইপ ওয়েল্ডিং ও ব্লেড মেরামত',
      amount: 38500,
      paidTo: 'হাজী ইঞ্জিনিয়ারিং ডকইয়ার্ড',
      voucherNo: 'ENG-441',
      note: 'জরুরি মেরামত কাজ'
    },
    {
      id: 'exp-3',
      date: '2026-09-04',
      category: 'labor',
      title: 'ড্রেজার মাঝি, হেল্পার ও ঘাটের শ্রমিকদের পাক্ষিক মজুরি',
      amount: 72000,
      paidTo: 'রহিম মাঝি ও শ্রমিক দল',
      voucherNo: 'LB-104',
      note: '৮ জন শ্রমিকের ১৫ দিনের মজুরি'
    },
    {
      id: 'exp-4',
      date: '2026-09-06',
      category: 'ghat_lease',
      title: 'বালু মহাল ইজারা মাসিক কিস্তি ও ঘাট টোল ফি',
      amount: 85000,
      paidTo: 'উপজেলা ভূমি প্রশাসন / ইজারাদার সমিতি',
      voucherNo: 'GOV-552',
      note: 'ভাদ্রমাসের কিস্তি পরিশোধ'
    },
    {
      id: 'exp-5',
      date: '2026-09-08',
      category: 'stockpile',
      title: 'মজুদ মাঠের এক্সকাভেটর ভাড়া ও সাইট লেভেলিং',
      amount: 28000,
      paidTo: 'আলী হেভি ইকুইপমেন্ট',
      voucherNo: 'EQ-312',
      note: 'নতুন উত্তোলিত বালুর স্তূপ সুশৃঙ্খল করা'
    },
    {
      id: 'exp-6',
      date: '2026-09-10',
      category: 'misc',
      title: 'ঘাটের অফিস আনুষঙ্গিক খরচ, নিরাপত্তা গার্ডের খাবার ও চা-নাস্তা',
      amount: 9500,
      paidTo: 'লোকাল স্টোর',
      voucherNo: 'MSC-09',
      note: 'অফিস ক্যাশ'
    }
  ]
};

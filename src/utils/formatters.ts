import { Language } from '../types';

export const formatCurrency = (amount: number, lang: Language = 'bn'): string => {
  const formatted = new Intl.NumberFormat(lang === 'bn' ? 'bn-BD' : 'en-US', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0
  }).format(amount);

  return lang === 'bn' ? `৳ ${formatted}` : `BDT ${formatted}`;
};

export const formatNumber = (val: number, lang: Language = 'bn'): string => {
  return new Intl.NumberFormat(lang === 'bn' ? 'bn-BD' : 'en-US', {
    maximumFractionDigits: 2
  }).format(val);
};

export const formatCFT = (cft: number, lang: Language = 'bn'): string => {
  const formatted = formatNumber(cft, lang);
  return lang === 'bn' ? `${formatted} CFT` : `${formatted} CFT`;
};

export const formatDate = (dateStr: string, lang: Language = 'bn'): string => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return new Intl.DateTimeFormat(lang === 'bn' ? 'bn-BD' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(d);
  } catch {
    return dateStr;
  }
};

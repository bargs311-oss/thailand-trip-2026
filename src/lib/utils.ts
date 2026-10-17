import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ItemCategory } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Convert THB to ILS (Default: 1 THB ≈ 0.11 ILS, i.e., 100฿ ≈ 11₪)
export function jpyToIls(thb: number, rate: number = 0.11): number {
  return Number((thb * rate).toFixed(2));
}

export const thbToIls = jpyToIls;

// Convert ILS to THB
export function ilsToJpy(ils: number, rate: number = 0.11): number {
  if (rate === 0) return 0;
  return Math.round(ils / rate);
}

export const ilsToThb = ilsToJpy;

// Format THB (Thai Baht ฿) currency
export function formatJPY(amount: number): string {
  const formatted = new Intl.NumberFormat('he-IL', {
    maximumFractionDigits: 0,
  }).format(Math.round(amount || 0));
  return `${formatted} ฿`;
}

export const formatTHB = formatJPY;

// Format ILS currency
export function formatILS(amount: number): string {
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount || 0);
}

// Format Hebrew Date nicely
export function formatHebrewDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('he-IL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  } catch {
    return dateStr;
  }
}

// Category labels and badge colors tailored for Thailand
export const CATEGORY_INFO: Record<ItemCategory, {
  label: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
  iconName: string;
}> = {
  attraction: {
    label: 'אטרקציה / חוף',
    badgeBg: 'bg-teal-500/15',
    badgeText: 'text-teal-400',
    borderColor: 'border-teal-500/40',
    iconName: 'Landmark',
  },
  food: {
    label: 'אוכל / מסעדה',
    badgeBg: 'bg-amber-500/15',
    badgeText: 'text-amber-400',
    borderColor: 'border-amber-500/40',
    iconName: 'UtensilsCrossed',
  },
  transport: {
    label: 'טיסת פנים / מעבורת / מונית',
    badgeBg: 'bg-blue-500/15',
    badgeText: 'text-blue-400',
    borderColor: 'border-blue-500/40',
    iconName: 'Train',
  },
  hotel: {
    label: 'מלון / ריזורט',
    badgeBg: 'bg-indigo-500/15',
    badgeText: 'text-indigo-400',
    borderColor: 'border-indigo-500/40',
    iconName: 'Hotel',
  },
  shopping: {
    label: 'קניות / שוק לילה',
    badgeBg: 'bg-emerald-500/15',
    badgeText: 'text-emerald-400',
    borderColor: 'border-emerald-500/40',
    iconName: 'ShoppingBag',
  },
  activity: {
    label: 'שייט / מסאז׳ / חוויה',
    badgeBg: 'bg-purple-500/15',
    badgeText: 'text-purple-400',
    borderColor: 'border-purple-500/40',
    iconName: 'Sparkles',
  },
};

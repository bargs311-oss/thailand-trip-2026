import React, { useState, useEffect } from 'react';
import { TripDay, ItineraryItem, Expense, BookingDeadline, ChecklistItem, SavedHotel, WishlistItem, UserProfiles } from '../types';
import { 
  Plus, 
  MapPin, 
  Clock, 
  Edit3, 
  Trash2, 
  ExternalLink, 
  Ticket, 
  CheckCircle2, 
  Circle, 
  Car, 
  Hotel,
  CalendarDays,
  Wallet,
  Receipt,
  ChevronLeft,
  ChevronRight,
  BellRing,
  ShieldCheck,
  Compass,
  ShoppingBag,
  GripVertical,
  RotateCcw,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { CATEGORY_INFO, formatJPY, formatILS, formatHebrewDate } from '../lib/utils';
import { calculateDayRouteMetrics, DayRouteOptimizationResult } from '../lib/geoData';
import { DeadlinesView } from './DeadlinesView';
import { ChecklistView } from './ChecklistView';
import { HotelsHubView } from './HotelsHubView';
import { AttractionsCatalogView } from './AttractionsCatalogView';
import { ShoppingWishlistView } from './ShoppingWishlistView';

interface PlanningViewProps {
  days: TripDay[];
  currentDayId: string;
  setCurrentDayId: (id: string) => void;
  items: ItineraryItem[];
  onToggleCompleted: (itemId: string, currentStatus: boolean) => void;
  onOpenAddItem: () => void;
  onEditItem: (item: ItineraryItem) => void;
  onDeleteItem: (itemId: string) => void;
  onOpenTicket: (item: ItineraryItem) => void;
  onOpenTaxiCard: () => void;
  expenses?: Expense[];
  onAddExpense?: (expense: Omit<Expense, 'id'>) => void;
  onDeleteExpense?: (expenseId: string) => void;
  defaultRate?: number;
  onEditDay?: (day: TripDay) => void;
  onAddDay?: () => void;
  onDeleteDay?: (dayId: string) => void;
  onReorderDays?: (fromIndex: number, toIndex: number) => void;
  onReorderItems?: (dayId: string, fromIndex: number, toIndex: number) => void;
  onOptimizeDayItems?: (dayId: string) => Promise<DayRouteOptimizationResult | null>;
  deadlines?: BookingDeadline[];
  onToggleDeadlineBooked?: (id: string, isBooked: boolean) => void;
  onAddDeadline?: (deadline: Omit<BookingDeadline, 'id'>) => void;
  onDeleteDeadline?: (id: string) => void;
  checklist?: ChecklistItem[];
  onToggleChecklistCompleted?: (id: string, isCompleted: boolean) => void;
  onAddChecklistItem?: (item: Omit<ChecklistItem, 'id'>) => void;
  onDeleteChecklistItem?: (id: string) => void;
  savedHotels?: SavedHotel[];
  onAddHotel?: (hotel: Omit<SavedHotel, 'id'>) => void;
  onUpdateHotel?: (hotel: SavedHotel) => void;
  onDeleteHotel?: (hotelId: string) => void;
  onAssignHotelToDays?: (hotelId: string, dayNumbers: number[]) => void;
  onAddItemToCatalog?: (item: Omit<ItineraryItem, 'id'>) => void;
  onAssignItemToDay?: (itemId: string, dayId: string, timeSlot?: string) => void;
  onUnassignItem?: (itemId: string) => void;
  onOpenAiPlacementForHotel?: (hotel: SavedHotel) => void;
  onOpenAiPlacementForItem?: (item: ItineraryItem) => void;
  wishlistItems?: WishlistItem[];
  onAddWishlistItem?: (item: Omit<WishlistItem, 'id'>) => void;
  onToggleWishlistItemPurchased?: (itemId: string, currentStatus: boolean) => void;
  onDeleteWishlistItem?: (itemId: string) => void;
  userProfiles?: UserProfiles;
}

const EXPENSE_CATEGORIES = [
  { id: 'מלון', label: '🏨 מלונות ולינה', color: 'from-indigo-500 to-blue-500', badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' },
  { id: 'טיסות פנים', label: '✈️ טיסות פנים ומעבורות', color: 'from-sky-500 to-cyan-500', badge: 'bg-sky-500/20 text-sky-300 border-sky-500/40' },
  { id: 'אטרקציה', label: '🏝️ אטרקציות ושייט', color: 'from-emerald-500 to-teal-500', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
  { id: 'אוכל', label: '🍜 אוכל ומסעדות', color: 'from-amber-500 to-orange-500', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  { id: 'תחבורה', label: '🚕 מוניות, Grab וטוק-טוק', color: 'from-purple-500 to-violet-500', badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40' },
  { id: 'קניות', label: '🛍️ קניות ושופינג', color: 'from-pink-500 to-rose-500', badge: 'bg-pink-500/20 text-pink-300 border-pink-500/40' },
  { id: 'מסאז׳ים', label: '💆 מסאז׳ים ופינוקים', color: 'from-teal-400 to-emerald-400', badge: 'bg-teal-500/20 text-teal-300 border-teal-500/40' },
  { id: 'כללי', label: '📦 הוצאה כללית', color: 'from-slate-500 to-slate-400', badge: 'bg-slate-700/50 text-slate-300 border-slate-600/50' },
];

export const PlanningView: React.FC<PlanningViewProps> = ({
  days,
  currentDayId,
  setCurrentDayId,
  items,
  onToggleCompleted,
  onOpenAddItem,
  onEditItem,
  onDeleteItem,
  onOpenTicket,
  onOpenTaxiCard,
  expenses = [],
  onAddExpense,
  onDeleteExpense,
  defaultRate = 0.11,
  onEditDay,
  onAddDay,
  onDeleteDay,
  onReorderDays,
  onReorderItems,
  onOptimizeDayItems,
  deadlines = [],
  onToggleDeadlineBooked,
  onAddDeadline,
  onDeleteDeadline,
  checklist = [],
  onToggleChecklistCompleted,
  onAddChecklistItem,
  onDeleteChecklistItem,
  savedHotels = [],
  onAddHotel,
  onUpdateHotel,
  onDeleteHotel,
  onAssignHotelToDays,
  onAddItemToCatalog,
  onAssignItemToDay,
  onUnassignItem,
  onOpenAiPlacementForHotel,
  onOpenAiPlacementForItem,
  wishlistItems = [],
  onAddWishlistItem,
  onToggleWishlistItemPurchased,
  onDeleteWishlistItem,
  userProfiles,
}) => {
  const [activeTab, setActiveTab] = useState<'itinerary' | 'hotels' | 'catalog' | 'expenses' | 'deadlines' | 'checklist' | 'shopping'>('itinerary');

  // Drag and drop state for Days
  const [draggedDayIndex, setDraggedDayIndex] = useState<number | null>(null);
  const [dragOverDayIndex, setDragOverDayIndex] = useState<number | null>(null);
  const [touchDraggedDayIndex, setTouchDraggedDayIndex] = useState<number | null>(null);

  // Drag and drop state for Itinerary Items
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
  const [dragOverItemIndex, setDragOverItemIndex] = useState<number | null>(null);
  const [touchDraggedItemIndex, setTouchDraggedItemIndex] = useState<number | null>(null);

  // Route optimization feedback banner
  const [optimizationBanner, setOptimizationBanner] = useState<string | null>(null);

  useEffect(() => {
    setOptimizationBanner(null);
  }, [currentDayId]);

  const familyMembers = userProfiles?.members || ['אבא', 'אמא', 'בן משפחה 3', 'בן משפחה 4', 'בן משפחה 5', 'בן משפחה 6'];

  // Expense form & filter state
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseAmountJpy, setExpenseAmountJpy] = useState('');
  const [expensePaidBy, setExpensePaidBy] = useState<string>('משפחתי');
  const [expenseCategory, setExpenseCategory] = useState('אוכל');
  const [expenseDayId, setExpenseDayId] = useState<string>('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('הכל');

  const currentDay = days.find((d) => d.id === currentDayId) || days[0];
  const currentDayIndex = days.findIndex((d) => d.id === currentDay?.id);
  const isFirstDay = currentDayIndex <= 0;
  const isLastDay = currentDayIndex === -1 || currentDayIndex >= days.length - 1;

  const dayItems = items
    .filter((it) => it.day_id === currentDay?.id)
    .sort((a, b) => a.order_index - b.order_index);

  const currentDayHotelName =
    currentDay?.hotel_name ||
    savedHotels.find((h) => h.assigned_day_numbers?.includes(currentDay?.day_number || -1))?.name;

  const dayRouteMetrics = calculateDayRouteMetrics(
    dayItems,
    currentDayHotelName,
    currentDay?.city
  );
  const hasHotelStartLeg = Boolean(currentDayHotelName && currentDayHotelName.trim());

  const completedCount = dayItems.filter((it) => it.is_completed).length;
  const dayTotalJpy = dayItems.reduce((acc, it) => acc + (it.cost_jpy || 0), 0);

  // Expense Calculations (Family Total & Breakdown by Category & City - No Splitting)
  const totalExpensesJpy = expenses.reduce((acc, e) => acc + (e.amount_jpy || 0), 0);
  const totalExpensesIls = expenses.reduce((acc, e) => acc + (e.amount_ils || (e.amount_jpy * defaultRate)), 0);

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountJpy = parseInt(expenseAmountJpy, 10);
    if (!expenseTitle.trim() || !amountJpy || amountJpy <= 0) return;

    if (onAddExpense) {
      onAddExpense({
        trip_id: currentDay?.trip_id || '99th2026-4417-4834-8839-8486e53453f1',
        day_id: expenseDayId || undefined,
        title: expenseTitle.trim(),
        amount_jpy: amountJpy,
        amount_ils: Number((amountJpy * defaultRate).toFixed(2)),
        category: expenseCategory,
        paid_by: expensePaidBy,
        split_method: 'equal',
      });
    }

    setExpenseTitle('');
    setExpenseAmountJpy('');
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Sub-view Switcher: Itinerary vs Hotels Hub vs Catalog vs Expenses vs Deadlines vs Checklist vs Shopping */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5 bg-slate-900 border border-slate-800 p-1.5 rounded-2xl">
        <button
          onClick={() => setActiveTab('itinerary')}
          className={`py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            activeTab === 'itinerary'
              ? 'bg-gradient-to-r from-japan-red to-rose-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <CalendarDays className="w-3.5 h-3.5" />
          <span>מסלול יומי</span>
        </button>

        <button
          onClick={() => setActiveTab('hotels')}
          className={`py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            activeTab === 'hotels'
              ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Hotel className="w-3.5 h-3.5" />
          <span>מלונות Hub</span>
          {savedHotels.length > 0 && (
            <span className="text-[10px] bg-slate-950/80 px-1.5 py-0.2 rounded-full font-mono font-bold text-indigo-300">
              {savedHotels.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('catalog')}
          className={`py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            activeTab === 'catalog'
              ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>קטלוג יעדים</span>
          {items.filter((it) => !it.day_id).length > 0 && (
            <span className="text-[10px] bg-amber-950 px-1.5 py-0.2 rounded-full font-mono font-bold text-amber-300">
              {items.filter((it) => !it.day_id).length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('expenses')}
          className={`py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            activeTab === 'expenses'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Wallet className="w-3.5 h-3.5" />
          <span>הוצאות</span>
          {expenses.length > 0 && (
            <span className="text-[10px] bg-slate-950/80 px-1.5 py-0.2 rounded-full font-mono font-bold text-emerald-300">
              {expenses.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('deadlines')}
          className={`py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            activeTab === 'deadlines'
              ? 'bg-gradient-to-r from-amber-600 to-red-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <BellRing className="w-3.5 h-3.5" />
          <span>הזמנות</span>
          {deadlines && deadlines.filter((d) => !d.is_booked).length > 0 && (
            <span className="text-[10px] bg-amber-950 px-1.5 py-0.2 rounded-full font-mono font-bold text-amber-300">
              {deadlines.filter((d) => !d.is_booked).length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('checklist')}
          className={`py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            activeTab === 'checklist'
              ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>צ'ק-ליסט</span>
          {checklist && (
            <span className="text-[10px] bg-slate-950/80 px-1.5 py-0.2 rounded-full font-mono font-bold text-teal-300">
              {Math.round((checklist.filter((c) => c.is_completed).length / (checklist.length || 1)) * 100)}%
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('shopping')}
          className={`py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            activeTab === 'shopping'
              ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>קניות ופטור ממס</span>
          {wishlistItems && wishlistItems.length > 0 && (
            <span className="text-[10px] bg-slate-950/80 px-1.5 py-0.2 rounded-full font-mono font-bold text-pink-300">
              {wishlistItems.filter((w) => !w.is_purchased).length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'itinerary' && (
        <>
          {/* 1. Days & Cities Horizontal Scrollable Pill Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
            {days.map((day, index) => {
              const isSelected = day.id === currentDay?.id;
              const dayItemsCount = items.filter((it) => it.day_id === day.id).length;
              const dayDoneCount = items.filter((it) => it.day_id === day.id && it.is_completed).length;
              const isBeingDragged = draggedDayIndex === index || touchDraggedDayIndex === index;
              const isDropTarget = dragOverDayIndex === index && (draggedDayIndex !== null || touchDraggedDayIndex !== null);

              return (
                <div
                  key={day.id}
                  data-day-index={index}
                  draggable={!!onReorderDays}
                  onDragStart={(e) => {
                    setDraggedDayIndex(index);
                    e.dataTransfer.setData('text/plain', String(index));
                    e.dataTransfer.effectAllowed = 'move';
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                  }}
                  onDragEnter={() => setDragOverDayIndex(index)}
                  onDragLeave={() => {
                    if (dragOverDayIndex === index) setDragOverDayIndex(null);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (draggedDayIndex !== null && draggedDayIndex !== index && onReorderDays) {
                      onReorderDays(draggedDayIndex, index);
                    }
                    setDraggedDayIndex(null);
                    setDragOverDayIndex(null);
                  }}
                  onDragEnd={() => {
                    setDraggedDayIndex(null);
                    setDragOverDayIndex(null);
                  }}
                  onTouchStart={() => {
                    setTouchDraggedDayIndex(index);
                  }}
                  onTouchMove={(e) => {
                    const touch = e.touches[0];
                    const elem = document.elementFromPoint(touch.clientX, touch.clientY);
                    const targetPill = elem?.closest('[data-day-index]');
                    if (targetPill) {
                      const targetIdx = Number(targetPill.getAttribute('data-day-index'));
                      if (!isNaN(targetIdx) && targetIdx !== dragOverDayIndex) {
                        setDragOverDayIndex(targetIdx);
                      }
                    }
                  }}
                  onTouchEnd={() => {
                    if (
                      touchDraggedDayIndex !== null &&
                      dragOverDayIndex !== null &&
                      touchDraggedDayIndex !== dragOverDayIndex &&
                      onReorderDays
                    ) {
                      onReorderDays(touchDraggedDayIndex, dragOverDayIndex);
                    }
                    setTouchDraggedDayIndex(null);
                    setDragOverDayIndex(null);
                  }}
                  className={`shrink-0 transition-all duration-200 ${
                    isBeingDragged ? 'opacity-40 scale-95 border-dashed border-red-500' : ''
                  } ${isDropTarget ? 'ring-2 ring-japan-red scale-105 shadow-xl' : ''}`}
                >
                  <button
                    type="button"
                    onClick={() => setCurrentDayId(day.id)}
                    className={`w-full py-2.5 px-3.5 rounded-2xl text-right border transition-all duration-200 cursor-grab active:cursor-grabbing select-none ${
                      isSelected
                        ? 'bg-gradient-to-br from-japan-red to-rose-700 text-white border-red-500 shadow-lg shadow-red-950/40 ring-1 ring-red-400/40'
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                    }`}
                    title="לחץ לבחירת יום, או גרור ושחרר כדי לשנות את סדר הימים"
                  >
                    <div className="flex items-center gap-1.5 justify-between">
                      <span className="text-[11px] font-bold opacity-80">
                        יום {day.day_number}
                      </span>
                      {dayDoneCount === dayItemsCount && dayItemsCount > 0 && (
                        <span className="text-[10px] bg-emerald-500/30 text-emerald-300 px-1.5 py-0.2 rounded-full font-bold">
                          ✓
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-black truncate max-w-[90px]">
                      {day.city}
                    </div>
                    <div className="text-[10px] opacity-70 mt-0.5">
                      {new Date(day.date).toLocaleDateString('he-IL', { day: 'numeric', month: 'numeric' })}
                    </div>
                  </button>
                </div>
              );
            })}

            {/* Add Day Button */}
            {onAddDay && (
              <button
                type="button"
                onClick={onAddDay}
                className="shrink-0 flex flex-col items-center justify-center py-2.5 px-3.5 rounded-2xl border border-dashed border-slate-700 hover:border-japan-red/80 hover:bg-japan-red/10 text-slate-400 hover:text-white transition-all duration-200 group min-w-[70px] self-stretch"
                title="הוסף יום חדש לטיול"
              >
                <Plus className="w-4 h-4 text-japan-red group-hover:scale-110 transition-transform mb-0.5" />
                <span className="text-[11px] font-bold">הוסף יום</span>
              </button>
            )}
          </div>

          {/* 2. City & Day Banner */}
          {currentDay && (
            <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="text-xs font-black text-japan-sakura bg-pink-950/50 border border-pink-900/40 px-2 py-0.5 rounded-full">
                      יום {currentDay.day_number} · {currentDay.city}
                    </span>
                    {currentDay.city_ja && (
                      <span className="text-xs text-slate-400 font-japanese">
                        {currentDay.city_ja}
                      </span>
                    )}
                  </div>
                  <h2 className="text-lg sm:text-xl font-black text-white leading-tight">
                    {currentDay.title}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    {formatHebrewDate(currentDay.date)}
                  </p>
                </div>

                {/* Daily summary badge */}
                <div className="text-left shrink-0 bg-slate-950/80 border border-slate-800 p-2.5 rounded-2xl">
                  <span className="text-[10px] font-bold text-slate-400 block">הוצאה משוערת:</span>
                  <span className="text-xs font-bold text-amber-400 font-mono">
                    {formatJPY(dayTotalJpy)}
                  </span>
                  <span className="text-[10px] text-slate-400 block font-mono">
                    ({formatILS(dayTotalJpy * defaultRate)})
                  </span>
                </div>
              </div>

              {currentDay.notes && (
                <p className="text-xs text-slate-300 mt-3 pt-3 border-t border-slate-800/80 leading-relaxed">
                  💡 {currentDay.notes}
                </p>
              )}

              {/* Hotel snippet with Taxi button */}
              {currentDay.hotel_name && (
                <div className="mt-3.5 flex items-center justify-between p-3 bg-slate-950/70 rounded-2xl border border-slate-800/70 text-xs">
                  <div className="flex items-center gap-2">
                    <Hotel className="w-4 h-4 text-indigo-400 shrink-0" />
                    <div className="truncate">
                      <span className="text-slate-400 font-medium">לינה: </span>
                      <span className="text-white font-bold">{currentDay.hotel_name}</span>
                    </div>
                  </div>
                  <button
                    onClick={onOpenTaxiCard}
                    className="shrink-0 flex items-center gap-1 text-[11px] font-bold text-indigo-300 hover:text-indigo-200 bg-indigo-500/10 hover:bg-indigo-500/20 px-2 py-1 rounded-lg border border-indigo-500/30 transition"
                  >
                    <Car className="w-3 h-3" />
                    <span>מונית</span>
                  </button>
                </div>
              )}

              {/* Day Management Toolbar (Shift Earlier / Later, Edit Day, Delete Day) */}
              <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2.5">
                {/* Reorder / Shift buttons */}
                <div className="flex items-center gap-1.5 bg-slate-950/60 p-1 rounded-2xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 font-bold px-2 hidden sm:inline">
                    סדר ימים:
                  </span>
                  <button
                    type="button"
                    onClick={() => onReorderDays && !isFirstDay && onReorderDays(currentDayIndex, currentDayIndex - 1)}
                    disabled={!onReorderDays || isFirstDay}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition disabled:opacity-30 disabled:cursor-not-allowed"
                    title={isFirstDay ? 'זהו היום הראשון בטיול' : 'הזז יום זה שלב אחד מוקדם יותר'}
                  >
                    <ChevronRight className="w-4 h-4" />
                    <span>הזז אחורה</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onReorderDays && !isLastDay && onReorderDays(currentDayIndex, currentDayIndex + 1)}
                    disabled={!onReorderDays || isLastDay}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition disabled:opacity-30 disabled:cursor-not-allowed"
                    title={isLastDay ? 'זהו היום האחרון בטיול' : 'הזז יום זה שלב אחד מאוחר יותר'}
                  >
                    <span>הזז קדימה</span>
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>

                {/* Edit & Delete Day Buttons */}
                <div className="flex items-center gap-2">
                  {onEditDay && (
                    <button
                      type="button"
                      onClick={() => onEditDay(currentDay)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 hover:text-white text-xs font-bold border border-slate-700/80 hover:border-japan-sakura/50 shadow-sm transition"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-japan-sakura" />
                      <span>ערוך יום ומלון</span>
                    </button>
                  )}

                  {onDeleteDay && (
                    <button
                      type="button"
                      onClick={() => onDeleteDay(currentDay.id)}
                      disabled={days.length <= 1}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 hover:text-rose-100 text-xs font-bold border border-rose-900/50 disabled:opacity-30 disabled:cursor-not-allowed transition"
                      title={days.length <= 1 ? 'לא ניתן למחוק את היום האחרון' : 'מחק יום זה מהמסלול'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">מחק יום</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 3. Itinerary Items Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-white">
                  רשימת יעדים ואטרקציות
                </h3>
                <span className="text-xs font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                  {completedCount}/{dayItems.length} בוצעו
                </span>
              </div>

              <div className="flex items-center gap-2">
                {dayItems.length >= 2 && onOptimizeDayItems && currentDay && (
                  <button
                    type="button"
                    onClick={async () => {
                      const res = await onOptimizeDayItems(currentDay.id);
                      if (!res) return;
                      if (res.orderChanged && res.savedKm > 0) {
                        setOptimizationBanner(
                          `✨ המסלול סודר גיאוגרפית! אורך המסלול כעת ${res.newDistanceKm} ק"מ (נחסכו ${res.savedKm} ק"מ וכ-${res.savedMinutes} דק' נסיעה) והשעות עודכנו ברצף.`
                        );
                      } else if (res.orderChanged) {
                        setOptimizationBanner(
                          `✨ סדר היעדים והשעות עודכנו ברצף הגיוני (${res.newDistanceKm} ק"מ סה"כ, כ-${res.newTransitMinutes} דק' מעברים).`
                        );
                      } else {
                        setOptimizationBanner(
                          `✅ סדר היעדים ביום זה כבר אופטימלי גיאוגרפית (${res.newDistanceKm} ק"מ)! שעות הביקור עודכנו ברצף לפי זמני המעבר.`
                        );
                      }
                    }}
                    className="flex items-center gap-1.5 py-2 px-3 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-200 text-xs font-bold rounded-xl shadow-sm transition active:scale-95"
                    title="סדר אוטומטית את אטרקציות היום במסלול הקצר ביותר מהמלון ועד הערב"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    <span>סדר מסלול גיאוגרפית</span>
                  </button>
                )}

                <button
                  onClick={onOpenAddItem}
                  className="flex items-center gap-1.5 py-2 px-3.5 bg-gradient-to-r from-japan-red to-rose-600 hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-md transition active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>הוסף יעד</span>
                </button>
              </div>
            </div>

            {/* Daily Route Distance & Transit Summary Bar */}
            {dayItems.length > 0 && dayRouteMetrics.legs.length > 0 && (
              <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl px-3.5 py-2.5 flex items-center justify-between flex-wrap gap-2 text-xs">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-slate-300 font-bold flex items-center gap-1">
                    <span>🧭</span>
                    <span>סה"כ מסלול יומי:</span>
                    <strong className="text-white font-mono">{dayRouteMetrics.totalDistanceKm} ק"מ</strong>
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-300 font-bold flex items-center gap-1">
                    <span>🚇</span>
                    <span>זמן הליכה ורכבות משוער:</span>
                    <strong className="text-sky-300 font-mono">כ-{dayRouteMetrics.totalTransitMinutes} דק'</strong>
                  </span>
                </div>

                {dayRouteMetrics.hasFarWarning && (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 font-bold text-[11px] flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    <span>כולל מעבר בין-עירוני ארוך</span>
                  </span>
                )}
              </div>
            )}

            {/* Route Optimization Feedback Banner */}
            {optimizationBanner && (
              <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-2xl p-3 text-xs text-emerald-200 flex items-center justify-between gap-2 animate-fadeIn">
                <span>{optimizationBanner}</span>
                <button
                  type="button"
                  onClick={() => setOptimizationBanner(null)}
                  className="text-emerald-400 hover:text-white font-bold px-1.5"
                >
                  ✕
                </button>
              </div>
            )}

            {/* List of items */}
            {dayItems.length === 0 ? (
              <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-3xl">
                <p className="text-slate-400 text-xs mb-3">עדיין לא הוספתם אטרקציות ליום זה</p>
                <button
                  onClick={onOpenAddItem}
                  className="py-2 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition"
                >
                  + הוסף נקודת עניין ראשונה
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {dayItems.map((item, index) => {
                  const isBeingDragged = draggedItemIndex === index || touchDraggedItemIndex === index;
                  const isDropTarget = dragOverItemIndex === index && (draggedItemIndex !== null || touchDraggedItemIndex !== null);
                  const incomingLegIndex = hasHotelStartLeg ? index : index - 1;
                  const incomingLeg =
                    incomingLegIndex >= 0 ? dayRouteMetrics.legs[incomingLegIndex] : null;
                  const isFromHotel = hasHotelStartLeg && index === 0;

                  return (
                    <React.Fragment key={item.id}>
                      {incomingLeg && (
                        <div className="flex flex-col items-stretch px-3">
                          <div className="flex items-center justify-between gap-2 py-1.5 px-3 rounded-2xl bg-slate-900/70 border border-slate-800/80 text-[11px]">
                            <div className="flex items-center gap-2 min-w-0 flex-wrap">
                              <span
                                className={`px-2 py-0.5 rounded-lg font-bold flex items-center gap-1 ${
                                  incomingLeg.mode === 'walk'
                                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                    : incomingLeg.mode === 'train'
                                    ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                                    : 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                                }`}
                              >
                                <span>{incomingLeg.icon}</span>
                                <span>{incomingLeg.durationMinutes} דק'</span>
                                <span className="opacity-80">({incomingLeg.distanceLabel})</span>
                              </span>

                              <span className="text-slate-400 truncate">
                                {isFromHotel
                                  ? `יציאה מהמלון (${currentDayHotelName})`
                                  : `מ-${dayItems[index - 1]?.title} • ${incomingLeg.modeLabel}`}
                              </span>
                            </div>

                            <a
                              href={incomingLeg.directionsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sky-400 hover:text-sky-300 font-bold whitespace-nowrap flex items-center gap-1 shrink-0"
                              title="פתח הוראות הגעה ב-Google Maps"
                            >
                              <span>מסלול</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>

                          {incomingLeg.isFarWarning && incomingLeg.warningText && (
                            <div className="mt-1 px-3 py-1.5 rounded-xl bg-amber-950/50 border border-amber-700/40 text-[11px] text-amber-300 flex items-center gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              <span>{incomingLeg.warningText}</span>
                            </div>
                          )}
                        </div>
                      )}

                      <div
                        data-item-index={index}
                        draggable={!!onReorderItems}
                        onDragStart={(e) => {
                          setDraggedItemIndex(index);
                          e.dataTransfer.setData('text/plain', String(index));
                          e.dataTransfer.effectAllowed = 'move';
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.dataTransfer.dropEffect = 'move';
                        }}
                        onDragEnter={() => setDragOverItemIndex(index)}
                        onDragLeave={() => {
                          if (dragOverItemIndex === index) setDragOverItemIndex(null);
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          if (
                            draggedItemIndex !== null &&
                            draggedItemIndex !== index &&
                            onReorderItems &&
                            currentDay
                          ) {
                            onReorderItems(currentDay.id, draggedItemIndex, index);
                          }
                          setDraggedItemIndex(null);
                          setDragOverItemIndex(null);
                        }}
                        onDragEnd={() => {
                          setDraggedItemIndex(null);
                          setDragOverItemIndex(null);
                        }}
                        className={`bg-slate-900 border rounded-3xl p-4 transition-all duration-200 relative ${
                          item.is_completed
                            ? 'border-slate-800/60 bg-slate-900/50 opacity-70'
                            : 'border-slate-800 hover:border-slate-700 shadow-md'
                        } ${
                          isBeingDragged ? 'opacity-40 scale-[0.98] border-dashed border-red-500' : ''
                        } ${
                          isDropTarget ? 'ring-2 ring-japan-red border-red-500 bg-slate-800/90 scale-[1.01] shadow-xl' : ''
                        }`}
                      >
                        <div className="flex items-start gap-2.5 sm:gap-3.5">
                        {/* Drag Handle with touch tracking */}
                        {onReorderItems && (
                          <div
                            className="mt-1 text-slate-500 hover:text-white cursor-grab active:cursor-grabbing p-1 -mr-1 touch-none select-none rounded-lg hover:bg-slate-800/80 transition shrink-0"
                            title="גרור כדי לשנות את סדר הפעילויות ביום זה"
                            onTouchStart={() => {
                              setTouchDraggedItemIndex(index);
                              setDragOverItemIndex(index);
                            }}
                            onTouchMove={(e) => {
                              const touch = e.touches[0];
                              const elem = document.elementFromPoint(touch.clientX, touch.clientY);
                              const card = elem?.closest('[data-item-index]');
                              if (card) {
                                const idx = Number(card.getAttribute('data-item-index'));
                                if (!isNaN(idx) && idx !== dragOverItemIndex) {
                                  setDragOverItemIndex(idx);
                                }
                              }
                            }}
                            onTouchEnd={() => {
                              if (
                                touchDraggedItemIndex !== null &&
                                dragOverItemIndex !== null &&
                                touchDraggedItemIndex !== dragOverItemIndex &&
                                currentDay
                              ) {
                                onReorderItems(currentDay.id, touchDraggedItemIndex, dragOverItemIndex);
                              }
                              setTouchDraggedItemIndex(null);
                              setDragOverItemIndex(null);
                            }}
                          >
                            <GripVertical className="w-5 h-5" />
                          </div>
                        )}

                        {/* Completion Toggle */}
                        <button
                          onClick={() => onToggleCompleted(item.id, item.is_completed)}
                          className="mt-1 text-slate-400 hover:text-emerald-400 transition shrink-0"
                          title={item.is_completed ? 'בטל ביצוע' : 'סמן כבוצע'}
                        >
                          {item.is_completed ? (
                            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                          ) : (
                            <Circle className="w-6 h-6 hover:text-red-400" />
                          )}
                        </button>

                        {/* Item Content */}
                        <div className="flex-1 min-w-0">
                          {/* Time & Category */}
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <span className="text-xs font-bold text-red-400 bg-red-950/80 px-2 py-0.5 rounded-lg border border-red-900/40 font-mono flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{item.time_slot}</span>
                            </span>

                            <span className={`text-[11px] px-2.5 py-0.5 rounded-lg font-semibold border ${CATEGORY_INFO[item.category]?.badgeBg} ${CATEGORY_INFO[item.category]?.badgeText} ${CATEGORY_INFO[item.category]?.borderColor}`}>
                              {CATEGORY_INFO[item.category]?.label}
                            </span>

                            {item.cost_jpy && item.cost_jpy > 0 ? (
                              <span className="text-[11px] text-amber-400 font-mono">
                                {formatJPY(item.cost_jpy)}
                              </span>
                            ) : null}

                            {item.requires_advance_booking && (
                              <span className="text-[10px] bg-red-950/90 text-rose-300 border border-red-800/60 px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
                                <BellRing className="w-3 h-3 text-rose-400" />
                                <span>שריון מראש</span>
                              </span>
                            )}

                            {item.estimated_duration_mins && (
                              <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded-md font-mono">
                                ⏱️ {item.estimated_duration_mins} דק'
                              </span>
                            )}

                            {item.nearest_station && (
                              <span className="text-[10px] bg-indigo-950/60 text-indigo-300 border border-indigo-800/40 px-1.5 py-0.5 rounded-md">
                                🚉 {item.nearest_station}
                              </span>
                            )}
                          </div>

                          {/* Title */}
                          <h4 className={`text-base font-black text-white leading-snug ${item.is_completed ? 'line-through text-slate-400' : ''}`}>
                            {item.title}
                          </h4>

                          {item.title_ja && (
                            <p className="text-xs text-slate-400 font-japanese mt-0.5">
                              {item.title_ja}
                            </p>
                          )}

                          {/* Location */}
                          <div className="flex items-center gap-1 text-xs text-slate-300 mt-1.5">
                            <MapPin className="w-3.5 h-3.5 text-japan-red shrink-0" />
                            <span className="truncate">{item.location_name}</span>
                            {item.district && (
                              <span className="text-slate-400 mr-1">({item.district})</span>
                            )}
                          </div>

                          {/* Pro Tips / Booking Window alert if present */}
                          {item.booking_window_rule && (
                            <div className="mt-2 p-2 bg-amber-950/40 border border-amber-800/40 rounded-xl text-[11px] text-amber-300 flex items-center gap-1.5">
                              <BellRing className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              <span>הזמנה מראש: {item.booking_window_rule}</span>
                            </div>
                          )}

                          {/* Notes */}
                          {item.notes && (
                            <div className="mt-2.5 p-2.5 bg-slate-950/70 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
                              {item.notes}
                            </div>
                          )}

                          {/* Pro Tips */}
                          {item.pro_tips && (
                            <div className="mt-2 p-2 bg-indigo-950/30 border border-indigo-800/30 rounded-xl text-[11px] text-indigo-200">
                              💡 <strong>טיפ חכם:</strong> {item.pro_tips}
                            </div>
                          )}

                          {/* Ticket button / details */}
                          {(item.ticket_info || item.ticket_url) && (
                            <div className="mt-2.5 flex items-center gap-2">
                              <button
                                onClick={() => onOpenTicket(item)}
                                className="flex items-center gap-1.5 text-xs font-bold text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 px-3 py-1.5 rounded-xl border border-indigo-500/30 transition active:scale-95"
                              >
                                <Ticket className="w-3.5 h-3.5 text-indigo-400" />
                                <span>כרטיס / שובר כניסה</span>
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Actions Column: Maps, Edit, Unassign, Delete */}
                        <div className="flex flex-col gap-1 shrink-0">
                        <a
                          href={
                            item.google_maps_url ||
                            `https://maps.google.com/?q=${encodeURIComponent(item.location_name || item.title)}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                          title="ניווט ב-Google Maps"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>

                        <button
                          onClick={() => onEditItem(item)}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                          title="ערוך יעד"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {onUnassignItem && (
                          <button
                            onClick={() => onUnassignItem(item.id)}
                            className="p-2 rounded-xl bg-slate-800 hover:bg-amber-500/20 text-amber-400/80 hover:text-amber-300 transition"
                            title="הסר מהיום והחזר למאגר אטרקציות (ללא מחיקה)"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => {
                            if (window.confirm(`למחוק לצמיתות את "${item.title}"? (להסרה מהיום בלבד לחץ על כפתור ההחזרה למאגר)`)) {
                              onDeleteItem(item.id);
                            }
                          }}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition"
                          title="מחק יעד לצמיתות"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </React.Fragment>
                );
              })}
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'expenses' && (
        /* ========================================================
           Family Expenses & Category / City Breakdown Dashboard (ללא התחשבנות)
           ======================================================== */
        <div className="space-y-5 animate-fadeIn">
          {/* 1. Family Total Summary Card (ללא התחשבנות - כמה יוצא על כל דבר) */}
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 border-2 border-emerald-500/40 rounded-3xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg">
                  🇹🇭
                </div>
                <div>
                  <h3 className="text-base font-black text-white">מעקב הוצאות משפחתי (6 נפשות)</h3>
                  <p className="text-[11px] text-slate-400">ללא התחשבנות — פירוט מדויק כמה כסף יוצא על כל דבר בטיול</p>
                </div>
              </div>
              <span className="text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 px-2.5 py-1 rounded-full">
                ללא התחשבנות • מעקב בלבד
              </span>
            </div>

            {/* Grand Total & Averages */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-950/80 border border-emerald-500/40 p-4 rounded-2xl text-center">
                <span className="text-xs font-bold text-emerald-400 block mb-1">סה"כ הוצאות שנרשמו</span>
                <span className="text-2xl sm:text-3xl font-black text-white font-mono block">
                  {formatJPY(totalExpensesJpy)}
                </span>
                <span className="text-sm font-bold text-emerald-300 font-mono mt-0.5 block">
                  {formatILS(totalExpensesIls)}
                </span>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-2xl text-center">
                <span className="text-xs font-bold text-slate-400 block mb-1">ממוצע לנפש (6 במשפחה)</span>
                <span className="text-lg sm:text-xl font-extrabold text-amber-300 font-mono block">
                  {formatJPY(Math.round(totalExpensesJpy / 6))}
                </span>
                <span className="text-xs text-slate-400 font-mono mt-0.5 block">
                  {formatILS(totalExpensesIls / 6)} לאדם
                </span>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-2xl text-center">
                <span className="text-xs font-bold text-slate-400 block mb-1">ממוצע ליום ({days.length || 16} ימים)</span>
                <span className="text-lg sm:text-xl font-extrabold text-sky-300 font-mono block">
                  {formatJPY(Math.round(totalExpensesJpy / (days.length || 16)))}
                </span>
                <span className="text-xs text-slate-400 font-mono mt-0.5 block">
                  {formatILS(totalExpensesIls / (days.length || 16))} ליום
                </span>
              </div>
            </div>

            {/* Category Breakdown Bars (כמה כסף יוצא על כל דבר) */}
            <div className="mt-5 pt-4 border-t border-slate-800/80">
              <h4 className="text-xs font-black text-slate-200 mb-3 flex items-center justify-between">
                <span>📊 לאן הולך הכסף? (פילוח לפי קטגוריה)</span>
                <span className="text-[11px] text-slate-400 font-normal">לחץ על קטגוריה לסינון</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {EXPENSE_CATEGORIES.map((cat) => {
                  const catTotalJpy = expenses
                    .filter((e) => e.category === cat.id)
                    .reduce((sum, e) => sum + (e.amount_jpy || 0), 0);
                  const catTotalIls = catTotalJpy * defaultRate;
                  const pct = totalExpensesJpy > 0 ? Math.round((catTotalJpy / totalExpensesJpy) * 100) : 0;
                  const isFiltered = selectedCategoryFilter === cat.id;

                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() =>
                        setSelectedCategoryFilter((prev) => (prev === cat.id ? 'הכל' : cat.id))
                      }
                      className={`p-3 rounded-2xl border text-right transition-all ${
                        isFiltered
                          ? 'bg-slate-800 border-emerald-500 ring-1 ring-emerald-500/40'
                          : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-bold text-white">{cat.label}</span>
                        <span className="font-mono font-bold text-amber-300">
                          {formatJPY(catTotalJpy)}{' '}
                          <span className="text-slate-400 text-[11px]">({formatILS(catTotalIls)})</span>
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden flex items-center">
                        <div
                          className={`bg-gradient-to-r ${cat.color} h-full rounded-full transition-all duration-500`}
                          style={{ width: `${Math.max(pct, catTotalJpy > 0 ? 4 : 0)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                        <span>{expenses.filter((e) => e.category === cat.id).length} רשומות</span>
                        <span className="font-mono font-bold text-slate-300">{pct}% מהתקציב</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* City Breakdown (פוקט, קוסמוי, בנגקוק) */}
            <div className="mt-4 pt-4 border-t border-slate-800/80">
              <h4 className="text-xs font-black text-slate-200 mb-2.5">
                🏝️ פילוח הוצאות לפי יעד (3 הערים בטיול)
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['פוקט', 'קוסמוי', 'בנגקוק'].map((cityName) => {
                  const cityDayIds = new Set(
                    days.filter((d) => d.city.includes(cityName)).map((d) => d.id)
                  );
                  const cityTotalJpy = expenses
                    .filter((e) => (e.day_id && cityDayIds.has(e.day_id)) || e.title.includes(cityName))
                    .reduce((sum, e) => sum + (e.amount_jpy || 0), 0);
                  return (
                    <div key={cityName} className="bg-slate-950/70 border border-slate-800 p-2.5 rounded-xl text-center">
                      <span className="text-[11px] font-bold text-teal-300 block">{cityName}</span>
                      <span className="text-xs font-black text-white font-mono block mt-0.5">
                        {formatJPY(cityTotalJpy)}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {formatILS(cityTotalJpy * defaultRate)}
                      </span>
                    </div>
                  );
                })}
                <div className="bg-slate-950/70 border border-slate-800 p-2.5 rounded-xl text-center">
                  <span className="text-[11px] font-bold text-slate-400 block">כללי / טיסות</span>
                  {(() => {
                    const generalTotal = expenses
                      .filter((e) => !e.day_id && !['פוקט', 'קוסמוי', 'בנגקוק'].some((c) => e.title.includes(c)))
                      .reduce((sum, e) => sum + (e.amount_jpy || 0), 0);
                    return (
                      <>
                        <span className="text-xs font-black text-white font-mono block mt-0.5">
                          {formatJPY(generalTotal)}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {formatILS(generalTotal * defaultRate)}
                        </span>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>

          {/* 2. Log New Expense Form */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg">
            <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-400" />
              <span>רישום הוצאה חדשה (למעקב משפחתי)</span>
            </h4>

            <form onSubmit={handleExpenseSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  על מה יצא הכסף? (תיאור ההוצאה) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="למשל: שייט 4 האיים בפוקט, ארוחת ערב בקוסמוי, מונית וואן לבנגקוק..."
                  value={expenseTitle}
                  onChange={(e) => setExpenseTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    סכום ב-฿ (באט תאילנדי) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="0"
                    value={expenseAmountJpy}
                    onChange={(e) => setExpenseAmountJpy(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none font-mono"
                  />
                  {expenseAmountJpy && (
                    <span className="text-[11px] text-emerald-400 mt-1 block font-mono">
                      ≈ {formatILS((parseInt(expenseAmountJpy, 10) || 0) * defaultRate)}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    קטגוריית הוצאה
                  </label>
                  <select
                    value={expenseCategory}
                    onChange={(e) => setExpenseCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none"
                  >
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Day / City Association */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    שיוך ליום / עיר (אופציונלי)
                  </label>
                  <select
                    value={expenseDayId}
                    onChange={(e) => setExpenseDayId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="">הוצאה כללית לכל הטיול</option>
                    {days.map((d) => (
                      <option key={d.id} value={d.id}>
                        יום {d.day_number} · {d.city} ({d.date})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Optional: Note which family member logged it */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    נרשם ע"י (אופציונלי)
                  </label>
                  <select
                    value={expensePaidBy}
                    onChange={(e) => setExpensePaidBy(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="משפחתי">👨‍👩‍👧‍👦 קופה משפחתית משותפת</option>
                    {familyMembers.map((memberName, idx) => (
                      <option key={idx} value={memberName}>
                        👤 {memberName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-lg transition active:scale-95 flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>הוסף הוצאה למעקב התקציב</span>
              </button>
            </form>
          </div>

          {/* 3. Expenses List with Category Filter */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-1 flex-wrap gap-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                פירוט כל ההוצאות ({selectedCategoryFilter === 'הכל' ? expenses.length : expenses.filter((e) => e.category === selectedCategoryFilter).length})
              </h4>
              {selectedCategoryFilter !== 'הכל' && (
                <button
                  type="button"
                  onClick={() => setSelectedCategoryFilter('הכל')}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-bold"
                >
                  הצג את כל הקטגוריות ✕
                </button>
              )}
            </div>

            {expenses.length === 0 ? (
              <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-3xl">
                <p className="text-slate-400 text-xs">עדיין לא נרשמו הוצאות לטיול</p>
              </div>
            ) : (
              expenses
                .filter((exp) => selectedCategoryFilter === 'הכל' || exp.category === selectedCategoryFilter)
                .map((exp) => {
                  const catInfo = EXPENSE_CATEGORIES.find((c) => c.id === exp.category);
                  const expDay = days.find((d) => d.id === exp.day_id);
                  return (
                    <div
                      key={exp.id}
                      className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between gap-3 shadow-sm hover:border-slate-700 transition"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold border ${catInfo?.badge || 'bg-slate-800 text-slate-300 border-slate-700'}`}>
                            {catInfo?.label || exp.category}
                          </span>

                          {expDay && (
                            <span className="text-[10px] bg-teal-950/70 text-teal-300 border border-teal-800/50 px-2 py-0.5 rounded-md font-semibold">
                              יום {expDay.day_number} · {expDay.city}
                            </span>
                          )}

                          {exp.paid_by && exp.paid_by !== 'משפחתי' && (
                            <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-md">
                              {exp.paid_by}
                            </span>
                          )}
                        </div>

                        <h5 className="text-sm font-bold text-white truncate">{exp.title}</h5>
                        <span className="text-[10px] text-slate-400">
                          {new Date(exp.created_at || Date.now()).toLocaleDateString('he-IL')}
                        </span>
                      </div>

                      <div className="text-left shrink-0">
                        <span className="text-sm font-black text-amber-300 font-mono block">
                          {formatJPY(exp.amount_jpy)}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono block">
                          {formatILS(exp.amount_ils || exp.amount_jpy * defaultRate)}
                        </span>
                      </div>

                      {onDeleteExpense && (
                        <button
                          onClick={() => {
                            if (window.confirm(`למחוק את ההוצאה "${exp.title}"?`)) {
                              onDeleteExpense(exp.id);
                            }
                          }}
                          className="p-2 text-slate-400 hover:text-red-400 rounded-xl hover:bg-slate-800 transition shrink-0"
                          title="מחק הוצאה"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })
            )}
          </div>
        </div>
      )}

      {activeTab === 'deadlines' && (
        <DeadlinesView
          deadlines={deadlines}
          onToggleBooked={onToggleDeadlineBooked || (() => {})}
          onAddDeadline={onAddDeadline || (() => {})}
          onDeleteDeadline={onDeleteDeadline || (() => {})}
        />
      )}

      {activeTab === 'hotels' && (
        <HotelsHubView
          days={days}
          savedHotels={savedHotels}
          defaultRate={defaultRate}
          onAddHotel={onAddHotel || (() => {})}
          onUpdateHotel={onUpdateHotel || (() => {})}
          onDeleteHotel={onDeleteHotel || (() => {})}
          onAssignHotelToDays={onAssignHotelToDays || (() => {})}
          onOpenAiPlacement={onOpenAiPlacementForHotel || (() => {})}
          onJumpToDay={(dayId) => {
            setCurrentDayId(dayId);
            setActiveTab('itinerary');
          }}
        />
      )}

      {activeTab === 'catalog' && (
        <AttractionsCatalogView
          days={days}
          items={items}
          defaultRate={defaultRate}
          onAddItem={onAddItemToCatalog || onOpenAddItem}
          onEditItem={onEditItem}
          onDeleteItem={onDeleteItem}
          onAssignItemToDay={onAssignItemToDay || (() => {})}
          onUnassignItem={onUnassignItem || (() => {})}
          onOpenAiPlacement={onOpenAiPlacementForItem || (() => {})}
          onJumpToDay={(dayId) => {
            setCurrentDayId(dayId);
            setActiveTab('itinerary');
          }}
          onAddDeadline={onAddDeadline}
        />
      )}

      {activeTab === 'checklist' && (
        <ChecklistView
          checklist={checklist}
          onToggleCompleted={onToggleChecklistCompleted || (() => {})}
          onAddChecklistItem={onAddChecklistItem || (() => {})}
          onDeleteChecklistItem={onDeleteChecklistItem || (() => {})}
        />
      )}

      {activeTab === 'shopping' && (
        <ShoppingWishlistView
          items={wishlistItems}
          defaultRate={defaultRate}
          onAddItem={onAddWishlistItem || (() => {})}
          onTogglePurchased={onToggleWishlistItemPurchased || (() => {})}
          onDeleteItem={onDeleteWishlistItem || (() => {})}
        />
      )}
    </div>
  );
};

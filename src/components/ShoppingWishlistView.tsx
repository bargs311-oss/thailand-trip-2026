import React, { useState } from 'react';
import { WishlistItem } from '../types';
import { 
  ShoppingBag, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  ExternalLink, 
  Percent, 
  Store, 
  X, 
  ChevronUp
} from 'lucide-react';
import { formatJPY, formatILS } from '../lib/utils';

interface ShoppingWishlistViewProps {
  items: WishlistItem[];
  defaultRate?: number;
  onAddItem: (item: Omit<WishlistItem, 'id'>) => void;
  onTogglePurchased: (itemId: string, currentStatus: boolean) => void;
  onDeleteItem: (itemId: string) => void;
}

const POPULAR_STORES = [
  'ICONSIAM (אייקון סיאם - בנגקוק)',
  'Siam Paragon (סיאם פרגון - בנגקוק)',
  'MBK Center (קניון MBK - בנגקוק)',
  'CentralWorld (סנטרל וורלד - בנגקוק)',
  'Chatuchak Market (שוק סוף השבוע צ\'אטוצ\'אק)',
  'Pratunam / Platinum Mall (פרטונם - אופנה)',
  'Central Phuket Floresta (סנטרל פוקט)',
  'Central Samui (סנטרל קוסמוי)',
  'Big C Supercenter (ביג C - חטיפים ומזכרות)',
  '7-Eleven (סבן אילבן)',
  'Boots / Watsons (פארם וקוסמטיקה)',
  'שוק לילה / דוכן רחוב',
];

const TAX_FREE_MINIMUM_JPY = 2000;

export const ShoppingWishlistView: React.FC<ShoppingWishlistViewProps> = ({
  items,
  defaultRate = 0.11,
  onAddItem,
  onTogglePurchased,
  onDeleteItem,
}) => {
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [selectedStoreFilter, setSelectedStoreFilter] = useState<string>('הכל');

  // Form State
  const [title, setTitle] = useState('');
  const [storeName, setStoreName] = useState(POPULAR_STORES[0]);
  const [customStore, setCustomStore] = useState('');
  const [priceJpy, setPriceJpy] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [notes, setNotes] = useState('');

  // Calculations
  const totalWishlistJpy = items.reduce((acc, it) => acc + (it.price_jpy || 0), 0);
  const purchasedJpy = items.filter((it) => it.is_purchased).reduce((acc, it) => acc + (it.price_jpy || 0), 0);
  const taxSavingsJpy = Math.round(purchasedJpy * 0.07);

  // Group items by store for the Thailand VAT Refund 2,000 THB calculator
  const storeGroups = items.reduce((acc, item) => {
    const s = item.store_name || 'אחר';
    if (!acc[s]) {
      acc[s] = [];
    }
    acc[s].push(item);
    return acc;
  }, {} as Record<string, WishlistItem[]>);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const chosenStore = storeName === 'שוק לילה / דוכן רחוב' && customStore.trim() 
      ? customStore.trim() 
      : storeName;

    onAddItem({
      trip_id: '88ab9584-2d4e-4834-8839-8486e53453f1',
      title: title.trim(),
      store_name: chosenStore,
      price_jpy: priceJpy ? parseInt(priceJpy, 10) : 0,
      image_url: imageUrl.trim() || undefined,
      notes: notes.trim() || undefined,
      is_purchased: false,
    });

    setTitle('');
    setCustomStore('');
    setPriceJpy('');
    setImageUrl('');
    setNotes('');
    setIsAddFormOpen(false);
  };

  const filteredItems = items.filter((it) => {
    if (selectedStoreFilter !== 'הכל' && it.store_name !== selectedStoreFilter) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* 1. VAT Refund & Wishlist Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-pink-950/40 to-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-pink-500/20 text-pink-400 flex items-center justify-center font-bold border border-pink-500/30 shadow-md">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white">קניות והחזר מס בתאילנד (VAT Refund)</h3>
                <span className="text-[10px] font-bold bg-pink-950 text-pink-300 border border-pink-800/60 px-2 py-0.5 rounded-full">
                  7% VAT Refund
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                רשימת קניות משותפת למשפחה (6 נפשות) ומחשבון זכאות להחזר מס (מינימום 2,000฿ לחנות/יום)
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAddFormOpen(!isAddFormOpen)}
            className="flex items-center justify-center gap-1.5 py-2.5 px-4 bg-gradient-to-r from-pink-600 to-rose-600 hover:opacity-95 text-white text-xs font-black rounded-xl shadow-md transition active:scale-95"
          >
            {isAddFormOpen ? <ChevronUp className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{isAddFormOpen ? 'סגור טופס' : '+ הוסף פריט לקניות'}</span>
          </button>
        </div>

        {/* Counter Summary */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-800/80 text-center">
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
            <span className="text-[10px] text-slate-400 block">סה"כ פריטים בווישליסט</span>
            <span className="text-sm font-black text-white font-mono">{items.length}</span>
            <span className="text-[10px] text-slate-500 block font-mono">
              ({formatJPY(totalWishlistJpy)})
            </span>
          </div>

          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-emerald-900/40">
            <span className="text-[10px] text-emerald-400 block">כבר נרכשו בטיול</span>
            <span className="text-sm font-black text-emerald-300 font-mono">
              {items.filter((it) => it.is_purchased).length}
            </span>
            <span className="text-[10px] text-emerald-400/80 block font-mono">
              ({formatJPY(purchasedJpy)})
            </span>
          </div>

          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-pink-900/40">
            <span className="text-[10px] text-pink-400 block">החזר מע"מ משוער (7%)</span>
            <span className="text-sm font-black text-pink-300 font-mono">
              {formatJPY(taxSavingsJpy)}
            </span>
            <span className="text-[10px] text-pink-400/80 block font-mono">
              ({formatILS(taxSavingsJpy * defaultRate)})
            </span>
          </div>
        </div>
      </div>

      {/* 2. VAT Refund Store Threshold Tracker (2,000 THB threshold per store) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <Percent className="w-4 h-4 text-pink-400" />
            <h4 className="text-sm font-black text-white">
              מחשבון זכאות ל-VAT Refund (מינימום 2,000฿ לחנות ביום, טופס צהוב PP10)
            </h4>
          </div>
          <span className="text-[10px] text-slate-400">להציג דרכון בקופה</span>
        </div>

        <div className="space-y-3">
          {Object.entries(storeGroups).map(([store, storeItems]) => {
            const storeTotal = storeItems.reduce((acc, it) => acc + (it.price_jpy || 0), 0);
            const isEligible = storeTotal >= TAX_FREE_MINIMUM_JPY;
            const progressPercent = Math.min(100, Math.round((storeTotal / TAX_FREE_MINIMUM_JPY) * 100));
            const remainingToThreshold = Math.max(0, TAX_FREE_MINIMUM_JPY - storeTotal);

            return (
              <div
                key={store}
                className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Store className="w-4 h-4 text-pink-400" />
                    <span className="text-xs font-bold text-white">{store}</span>
                    <span className="text-[10px] text-slate-400">({storeItems.length} פריטים)</span>
                  </div>

                  <div className="text-left">
                    <span className="text-xs font-black font-mono text-white">
                      {formatJPY(storeTotal)}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono block">
                      ({formatILS(storeTotal * defaultRate)})
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-850 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      isEligible
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                        : 'bg-gradient-to-r from-pink-500 to-amber-500'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  {isEligible ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <span>✓</span>
                      <span>זכאים לטופס VAT Refund בשדה התעופה! (החזר משוער: {formatJPY(Math.round(storeTotal * 0.07))})</span>
                    </span>
                  ) : (
                    <span className="text-amber-400 font-medium">
                      חסרים עוד {formatJPY(remainingToThreshold)} לזכאות להחזר מס בחנות זו
                    </span>
                  )}
                  <span className="text-slate-400 font-mono font-bold">{progressPercent}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Collapsible Add Item Form */}
      {isAddFormOpen && (
        <form
          onSubmit={handleSubmit}
          className="bg-slate-900 border border-pink-500/40 rounded-3xl p-5 shadow-xl space-y-3.5 animate-fadeIn"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <h4 className="text-sm font-black text-white flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-pink-400" />
              <span>הוספת פריט חדש לרשימת הקניות המשפחתית</span>
            </h4>
            <button
              type="button"
              onClick={() => setIsAddFormOpen(false)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                שם המוצר / פריט *
              </label>
              <input
                type="text"
                required
                placeholder="למשל: משאפים תאילנדיים, חטיפי אצות, בגדי קיץ, מתנות..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-pink-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">קניון / שוק יעד *</label>
              <select
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-pink-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              >
                {POPULAR_STORES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {storeName === 'שוק לילה / דוכן רחוב' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                שם השוק / החנות המותאמת
              </label>
              <input
                type="text"
                placeholder="הקלד את שם השוק או החנות..."
                value={customStore}
                onChange={(e) => setCustomStore(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-pink-500 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                מחיר משוער ב-฿ (באט)
              </label>
              <input
                type="number"
                placeholder="0"
                value={priceJpy}
                onChange={(e) => setPriceJpy(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-pink-500 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none font-mono"
              />
              {priceJpy && (
                <span className="text-[10px] text-pink-400 mt-1 block font-mono">
                  ≈ {formatILS((parseInt(priceJpy, 10) || 0) * defaultRate)}
                </span>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                קישור לתמונה / אתר מוצר
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-pink-500 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              הערות ומידות (עבור מי מהמשפחה, כמות, קומה בקניון)
            </label>
            <input
              type="text"
              placeholder="למשל: 6 יחידות לכל המשפחה, קומה 3 באגף האלקטרוניקה..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-pink-500 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddFormOpen(false)}
              className="py-2 px-3.5 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl text-xs font-bold transition"
            >
              ביטול
            </button>
            <button
              type="submit"
              className="py-2 px-5 bg-gradient-to-r from-pink-600 to-rose-600 hover:opacity-95 text-white rounded-xl text-xs font-bold transition shadow-md flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>הוסף לווישליסט</span>
            </button>
          </div>
        </form>
      )}

      {/* 4. Store Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
        <button
          onClick={() => setSelectedStoreFilter('הכל')}
          className={`shrink-0 py-1.5 px-3 rounded-xl text-xs font-bold transition border ${
            selectedStoreFilter === 'הכל'
              ? 'bg-pink-600 text-white border-pink-500 shadow-sm'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border-slate-800'
          }`}
        >
          כל החנויות ({items.length})
        </button>

        {Object.keys(storeGroups).map((store) => (
          <button
            key={store}
            onClick={() => setSelectedStoreFilter(store)}
            className={`shrink-0 py-1.5 px-3 rounded-xl text-xs font-bold transition border ${
              selectedStoreFilter === store
                ? 'bg-pink-600 text-white border-pink-500 shadow-sm'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border-slate-800'
            }`}
          >
            <span>{store}</span>
            <span className="mr-1 text-[10px] opacity-70 font-mono">
              ({storeGroups[store].length})
            </span>
          </button>
        ))}
      </div>

      {/* 5. Wishlist Items List */}
      <div className="space-y-2.5">
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-3xl">
            <ShoppingBag className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-slate-300 text-xs font-bold">אין פריטים בווישליסט לחנות זו</p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 shadow-sm ${
                item.is_purchased
                  ? 'bg-slate-900/50 border-slate-800/60 opacity-60'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {/* Purchased Checkbox */}
                <button
                  type="button"
                  onClick={() => onTogglePurchased(item.id, item.is_purchased)}
                  className="text-slate-400 hover:text-emerald-400 transition shrink-0"
                  title={item.is_purchased ? 'סמן כלא נרכש' : 'סמן כנרכש'}
                >
                  {item.is_purchased ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  ) : (
                    <Circle className="w-6 h-6 hover:text-pink-400" />
                  )}
                </button>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-[10px] bg-pink-950/70 border border-pink-800/60 text-pink-300 px-2 py-0.5 rounded-md font-semibold flex items-center gap-1">
                      <Store className="w-3 h-3 text-pink-400" />
                      <span>{item.store_name}</span>
                    </span>

                    {item.is_purchased && (
                      <span className="text-[10px] bg-emerald-950/70 text-emerald-400 border border-emerald-800/60 px-2 py-0.5 rounded-md font-bold">
                        נרכש ✓
                      </span>
                    )}
                  </div>

                  <h5
                    className={`text-sm font-bold text-white leading-snug truncate ${
                      item.is_purchased ? 'line-through text-slate-400' : ''
                    }`}
                  >
                    {item.title}
                  </h5>

                  {item.notes && (
                    <p className="text-[11px] text-slate-400 mt-0.5 truncate">{item.notes}</p>
                  )}
                </div>
              </div>

              {/* Price & Actions */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-left">
                  <span className="text-sm font-black text-amber-300 font-mono block">
                    {formatJPY(item.price_jpy)}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono block">
                    {formatILS(item.price_jpy * defaultRate)}
                  </span>
                </div>

                {item.image_url && (
                  <a
                    href={item.image_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                    title="קישור למוצר"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`האם למחוק את "${item.title}" מהרשימה?`)) {
                      onDeleteItem(item.id);
                    }
                  }}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 transition"
                  title="מחק מוצר"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

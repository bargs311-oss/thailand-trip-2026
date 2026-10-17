import React, { useState } from 'react';
import { TripDay, ItineraryItem, ItemCategory, BookingDeadline, BestTimeOfDay } from '../types';
import { 
  Sparkles, 
  Plus, 
  MapPin, 
  Clock, 
  ExternalLink, 
  Trash2, 
  CheckCircle2, 
  CircleDashed,
  Edit3,
  Compass,
  X,
  ChevronDown,
  ChevronUp,
  ArrowRightLeft,
  Loader2,
  BellRing,
  AlertCircle,
  Search
} from 'lucide-react';
import { CATEGORY_INFO, formatJPY, formatILS } from '../lib/utils';
import { CityCombobox } from './CityCombobox';
import { AttractionCombobox } from './AttractionCombobox';
import {
  JapanDestination,
  normalizeSearchText,
  inferCityFromItemText,
  searchJapanDestinations,
} from '../lib/japanLocationsData';
import { enrichAttractionWithAi, calculateEstimatedDeadlineIso } from '../lib/gemini';

interface AttractionsCatalogViewProps {
  days: TripDay[];
  items: ItineraryItem[];
  defaultRate?: number;
  onAddItem: (item: Omit<ItineraryItem, 'id'>) => void;
  onEditItem: (item: ItineraryItem) => void;
  onDeleteItem: (itemId: string) => void;
  onAssignItemToDay: (itemId: string, dayId: string, timeSlot?: string) => void;
  onUnassignItem: (itemId: string) => void;
  onOpenAiPlacement: (item: ItineraryItem) => void;
  onJumpToDay?: (dayId: string) => void;
  onAddDeadline?: (deadline: Omit<BookingDeadline, 'id'>) => void;
}

export const AttractionsCatalogView: React.FC<AttractionsCatalogViewProps> = ({
  days,
  items,
  defaultRate = 0.11,
  onAddItem,
  onEditItem,
  onDeleteItem,
  onAssignItemToDay,
  onUnassignItem,
  onOpenAiPlacement,
  onJumpToDay,
  onAddDeadline,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('הכל');
  const [selectedCategory, setSelectedCategory] = useState<string>('הכל');
  const [filterMode, setFilterMode] = useState<'all' | 'assigned' | 'unassigned'>('all');
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [manualAssignItemId, setManualAssignItemId] = useState<string | null>(null);

  // New Attraction Form State
  const [newTitle, setNewTitle] = useState('');
  const [newTitleJa, setNewTitleJa] = useState('');
  const [newCity, setNewCity] = useState('פוקט');
  const [newCategory, setNewCategory] = useState<ItemCategory>('attraction');
  const [newLocationName, setNewLocationName] = useState('');
  const [newCostJpy, setNewCostJpy] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newMapsUrl, setNewMapsUrl] = useState('');

  // AI Enrichment State
  const [isEnriching, setIsEnriching] = useState(false);
  const [enrichSuccess, setEnrichSuccess] = useState(false);
  const [enrichError, setEnrichError] = useState<string | null>(null);
  const [addedDeadlineSuccess, setAddedDeadlineSuccess] = useState(false);
  const [newDistrict, setNewDistrict] = useState('');
  const [newNearestStation, setNewNearestStation] = useState('');
  const [newDurationMins, setNewDurationMins] = useState<number | ''>('');
  const [newBestTimeOfDay, setNewBestTimeOfDay] = useState<BestTimeOfDay | ''>('');
  const [newProTips, setNewProTips] = useState('');
  const [requiresAdvanceBooking, setRequiresAdvanceBooking] = useState(false);
  const [bookingWindowRule, setBookingWindowRule] = useState('');
  const [estimatedDeadlineIso, setEstimatedDeadlineIso] = useState<string | undefined>(undefined);
  const [bookingUrl, setBookingUrl] = useState('');

  // Helper to determine the item's city (directly on item, via day, or inferred from title/location)
  const getItemCity = (item: ItineraryItem): string => {
    if (item.city && item.city.trim()) return item.city;
    if (item.day_id) {
      const parentDay = days.find((d) => d.id === item.day_id);
      if (parentDay) return parentDay.city;
    }
    const inferred = inferCityFromItemText(
      `${item.title} ${item.location_name || ''} ${item.google_maps_url || ''}`
    );
    if (inferred) return inferred;
    return 'פוקט';
  };

  // Dynamic aggregation of all cities from itinerary days and items
  const cityOptions = [
    'הכל',
    ...Array.from(
      new Set([
        ...days.map((d) => d.city),
        ...items.map((it) => getItemCity(it)),
      ].filter(Boolean))
    ),
  ];

  const categoryOptions: { key: string; label: string }[] = [
    { key: 'הכל', label: 'כל הקטגוריות' },
    { key: 'attraction', label: '🏝️ אטרקציה וחופים' },
    { key: 'food', label: '🍜 אוכל ומסעדות' },
    { key: 'shopping', label: '🛍️ שווקים וקניות' },
    { key: 'activity', label: '💆‍♂️ מסאז\'ים ופעילויות' },
    { key: 'transport', label: '✈️ טיסות פנים והסעות' },
  ];

  const filteredItems = items.filter((item) => {
    const itemCity = getItemCity(item);

    // Free-text Search Query (normalized Hebrew/English/Thai)
    if (searchQuery.trim()) {
      const normQ = normalizeSearchText(searchQuery);
      const rawQ = searchQuery.trim().toLowerCase();
      const tokens = normQ.split(' ').filter(Boolean);
      const combinedRaw = [
        item.title,
        item.title_ja || '',
        item.location_name || '',
        item.notes || '',
        item.pro_tips || '',
        item.nearest_station || '',
        item.district || '',
        itemCity,
      ]
        .join(' ')
        .toLowerCase();
      const combinedNorm = normalizeSearchText(combinedRaw);

      const matchesSearch =
        combinedRaw.includes(rawQ) ||
        combinedNorm.includes(normQ) ||
        (tokens.length > 0 && tokens.every((tok) => combinedNorm.includes(tok)));

      if (!matchesSearch) return false;
    }

    // City filter
    if (
      selectedCity !== 'הכל' &&
      !normalizeSearchText(itemCity).includes(normalizeSearchText(selectedCity)) &&
      !normalizeSearchText(selectedCity).includes(normalizeSearchText(itemCity))
    ) {
      return false;
    }

    // Category filter
    if (selectedCategory !== 'הכל' && item.category !== selectedCategory) {
      return false;
    }

    // Assignment filter
    const isAssigned = Boolean(item.day_id);
    if (filterMode === 'assigned' && !isAssigned) return false;
    if (filterMode === 'unassigned' && isAssigned) return false;

    return true;
  });

  // Also find matching destinations from the broader Thailand Database that aren't in user's personal items yet
  const externalJapanMatches: JapanDestination[] =
    searchQuery.trim().length >= 2
      ? searchJapanDestinations(searchQuery.trim(), 6).filter((dest) => {
          const destHeNorm = normalizeSearchText(dest.nameHe);
          const destEnNorm = normalizeSearchText(dest.nameEn);
          return !items.some((it) => {
            const itNorm = normalizeSearchText(`${it.title} ${it.location_name || ''}`);
            return itNorm.includes(destHeNorm) || itNorm.includes(destEnNorm);
          });
        })
      : [];

  const totalAssigned = items.filter((it) => Boolean(it.day_id)).length;
  const totalUnassigned = items.filter((it) => !it.day_id).length;

  const handleAutoEnrich = async () => {
    if (!newTitle.trim()) return;

    setIsEnriching(true);
    setEnrichSuccess(false);
    setEnrichError(null);
    setAddedDeadlineSuccess(false);

    try {
      const enriched = await enrichAttractionWithAi(
        newTitle.trim(),
        newCity,
        days[0]?.date
      );

      setNewTitleJa(enriched.title_ja);
      setNewCategory(enriched.category);
      if (enriched.city) setNewCity(enriched.city);
      if (enriched.district) setNewDistrict(enriched.district);
      if (enriched.nearest_station) setNewNearestStation(enriched.nearest_station);
      if (enriched.location_name) setNewLocationName(enriched.location_name);
      if (enriched.google_maps_url) setNewMapsUrl(enriched.google_maps_url);
      if (enriched.cost_jpy !== undefined) setNewCostJpy(enriched.cost_jpy.toString());
      if (enriched.estimated_duration_mins) setNewDurationMins(enriched.estimated_duration_mins);
      if (enriched.best_time_of_day) setNewBestTimeOfDay(enriched.best_time_of_day);
      if (enriched.pro_tips) setNewProTips(enriched.pro_tips);
      if (enriched.notes && !newNotes) setNewNotes(enriched.notes);
      if (enriched.booking_url) setBookingUrl(enriched.booking_url);

      // Advance booking detection
      setRequiresAdvanceBooking(enriched.requires_advance_booking);
      if (enriched.booking_window_rule) setBookingWindowRule(enriched.booking_window_rule);
      if (enriched.estimated_deadline_iso) setEstimatedDeadlineIso(enriched.estimated_deadline_iso);

      setEnrichSuccess(true);
      setTimeout(() => setEnrichSuccess(false), 3000);
    } catch (err: any) {
      console.warn('Auto enrich error:', err);
      setEnrichError(err instanceof Error ? err.message : 'נא להגדיר מפתח Gemini API פעיל בהגדרות כדי להפעיל את הבינה המלאכותית');
      setTimeout(() => setEnrichError(null), 8000);
    } finally {
      setIsEnriching(false);
    }
  };

  const handleSelectDestination = (dest: JapanDestination) => {
    setNewTitle(dest.nameHe);
    setNewTitleJa(`${dest.nameJa} (${dest.romaji})`);
    setNewCategory(dest.category);
    setNewCity(dest.city);
    setNewDistrict(dest.district || '');
    setNewNearestStation(dest.nearest_station || '');
    setNewLocationName(`${dest.nameEn}, ${dest.cityEn || dest.city}`);
    setNewMapsUrl(dest.google_maps_url || '');
    setNewCostJpy(dest.cost_jpy.toString());
    setNewDurationMins(dest.estimated_duration_mins);
    setNewBestTimeOfDay(dest.best_time_of_day);
    setNewProTips(dest.pro_tips || '');
    if (!newNotes && dest.notes) setNewNotes(dest.notes);
    if (dest.booking_url) setBookingUrl(dest.booking_url);

    // Advance booking detection
    setRequiresAdvanceBooking(dest.requires_advance_booking);
    if (dest.booking_window_rule) setBookingWindowRule(dest.booking_window_rule);

    if (dest.requires_advance_booking) {
      const deadlineIso = calculateEstimatedDeadlineIso(dest.booking_window_rule, days[0]?.date);
      setEstimatedDeadlineIso(deadlineIso);
    }

    setEnrichSuccess(true);
    setTimeout(() => setEnrichSuccess(false), 3000);
  };

  const handleAddBookingReminder = () => {
    if (!onAddDeadline) return;

    const targetDate = estimatedDeadlineIso || days[0]?.date || '2026-10-15T10:00:00Z';

    onAddDeadline({
      trip_id: days[0]?.trip_id || '88ab9584-2d4e-4834-8839-8486e53453f1',
      title: `הזמנת כרטיסים: ${newTitle.trim()}`,
      title_ja: newTitleJa || undefined,
      target_date: targetDate,
      category: newCategory,
      description: `${bookingWindowRule || 'נדרשת הזמנה מראש למשפחה (6 נפשות)'}. יעד: ${newTitle.trim()} (${newCity}). ${newProTips ? `טיפ: ${newProTips}` : ''}`,
      booking_url: bookingUrl || newMapsUrl || undefined,
      is_booked: false,
    });

    setAddedDeadlineSuccess(true);
  };

  const handleCreateAttraction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddItem({
      trip_id: days[0]?.trip_id || '88ab9584-2d4e-4834-8839-8486e53453f1',
      day_id: null, // Saved to master catalog / unassigned wishlist
      city: newCity,
      title: newTitle.trim(),
      title_ja: newTitleJa.trim() || undefined,
      category: newCategory,
      time_slot: 'גמיש',
      location_name: newLocationName.trim() || newTitle.trim(),
      google_maps_url: newMapsUrl.trim() || undefined,
      cost_jpy: newCostJpy ? parseInt(newCostJpy, 10) : undefined,
      notes: newNotes.trim() || undefined,
      is_completed: false,
      order_index: 99,
      district: newDistrict.trim() || undefined,
      nearest_station: newNearestStation.trim() || undefined,
      estimated_duration_mins: newDurationMins ? Number(newDurationMins) : undefined,
      best_time_of_day: newBestTimeOfDay || undefined,
      pro_tips: newProTips.trim() || undefined,
      requires_advance_booking: requiresAdvanceBooking,
      booking_window_rule: bookingWindowRule.trim() || undefined,
    });

    setNewTitle('');
    setNewTitleJa('');
    setNewLocationName('');
    setNewCostJpy('');
    setNewNotes('');
    setNewMapsUrl('');
    setNewDistrict('');
    setNewNearestStation('');
    setNewDurationMins('');
    setNewBestTimeOfDay('');
    setNewProTips('');
    setRequiresAdvanceBooking(false);
    setBookingWindowRule('');
    setEstimatedDeadlineIso(undefined);
    setBookingUrl('');
    setIsAddFormOpen(false);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* 1. Header & Summary Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-rose-950/40 to-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold border border-rose-500/30 shadow-md">
              <Compass className="w-6 h-6 text-japan-sakura" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white">קטלוג אטרקציות ומשאלות לתאילנד</h3>
                <span className="text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800/60 px-2 py-0.5 rounded-full">
                  Attractions Catalog
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                איסוף המלצות לפוקט, קוסמוי ובנגקוק, סינון לפי עיר וקטגוריה, ושיבוץ חכם ללו"ז בלחיצה אחת
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAddFormOpen(!isAddFormOpen)}
            className="flex items-center justify-center gap-1.5 py-2.5 px-4 bg-gradient-to-r from-japan-red to-rose-600 hover:opacity-95 text-white text-xs font-black rounded-xl shadow-md transition active:scale-95"
          >
            {isAddFormOpen ? <ChevronUp className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{isAddFormOpen ? 'סגור טופס' : '+ הוסף אטרקציה למאגר'}</span>
          </button>
        </div>

        {/* Counters */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-800/80 text-center">
          <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800/60">
            <span className="text-[10px] text-slate-400 block">סה"כ יעדים במאגר</span>
            <span className="text-sm font-black text-white font-mono">{items.length}</span>
          </div>

          <div className="bg-slate-950/60 p-2 rounded-xl border border-emerald-900/40">
            <span className="text-[10px] text-emerald-400 block">משובצים בלו"ז</span>
            <span className="text-sm font-black text-emerald-300 font-mono">{totalAssigned}</span>
          </div>

          <div className="bg-slate-950/60 p-2 rounded-xl border border-amber-900/40">
            <span className="text-[10px] text-amber-400 block">רשימת משאלות (גמיש)</span>
            <span className="text-sm font-black text-amber-300 font-mono">{totalUnassigned}</span>
          </div>
        </div>
      </div>

      {/* 2. Collapsible Add New Attraction Form */}
      {isAddFormOpen && (
        <form
          onSubmit={handleCreateAttraction}
          className="bg-slate-900 border border-japan-red/40 rounded-3xl p-5 shadow-xl space-y-3.5 animate-fadeIn"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <h4 className="text-sm font-black text-white flex items-center gap-2">
              <Compass className="w-4 h-4 text-japan-sakura" />
              <span>הוספת נקודת עניין חדשה למאגר תאילנד</span>
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
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-300">
                  שם האטרקציה / המקום בעברית או אנגלית *
                </label>
                <button
                  type="button"
                  onClick={handleAutoEnrich}
                  disabled={!newTitle.trim() || isEnriching}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-gradient-to-r from-purple-600/30 to-pink-600/30 hover:from-purple-600/50 hover:to-pink-600/50 border border-purple-500/40 text-[11px] font-bold text-pink-200 transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                  title="השלם אוטומטית שם בתאית, קטגוריה, אזור, טיפים, עלות בבאט ובדיקת צורך בהזמנה מראש"
                >
                  {isEnriching ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-pink-300" />
                      <span>מעשיר...</span>
                    </>
                  ) : enrichSuccess ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>הועשר בהצלחה!</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-pink-300 animate-pulse" />
                      <span>✨ העשר בעזרת AI</span>
                    </>
                  )}
                </button>
              </div>
              <AttractionCombobox
                value={newTitle}
                onChange={setNewTitle}
                onSelectDestination={handleSelectDestination}
                onTriggerAiEnrich={handleAutoEnrich}
                isEnriching={isEnriching}
                placeholder="הקלד כל יעד בתאילנד (למשל: איי פי פי, שמורת פילים, קניון אייקון סיאם, חוף קאטה...)"
                required
              />

              {enrichError && (
                <div className="p-2.5 rounded-xl bg-amber-950/60 border border-amber-500/50 text-amber-200 text-xs flex items-center gap-2 mt-2 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>{enrichError}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                שם בתאית (או באנגלית לנהג מונית)
              </label>
              <input
                type="text"
                placeholder="למשל: ไอคอนสยาม (ICONSIAM)"
                value={newTitleJa}
                onChange={(e) => setNewTitleJa(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none font-japanese"
              />
            </div>
          </div>

          {/* Advance Reservation Alert Banner */}
          {requiresAdvanceBooking && (
            <div className="p-3.5 bg-gradient-to-r from-amber-950/60 via-red-950/50 to-amber-950/60 border border-amber-600/50 rounded-2xl space-y-2 animate-fadeIn">
              <div className="flex items-start gap-2.5">
                <BellRing className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 animate-bounce" />
                <div className="flex-1 min-w-0">
                  <h5 className="text-xs font-black text-amber-200 flex items-center gap-1.5">
                    <span>🎟️ נדרשת הזמנה מראש למשפחה (6 נפשות)!</span>
                  </h5>
                  <p className="text-[11px] text-amber-300/90 mt-0.5 leading-relaxed">
                    {bookingWindowRule || 'מומלץ לשריין מקומות או סירה פרטית מראש עבור 6 בני משפחה.'}
                  </p>
                  {estimatedDeadlineIso && (
                    <p className="text-[10px] text-amber-400 font-mono mt-1">
                      תאריך מומלץ להזמנה: {new Date(estimatedDeadlineIso).toLocaleDateString('he-IL')} {new Date(estimatedDeadlineIso).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                </div>
              </div>

              {onAddDeadline && (
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={handleAddBookingReminder}
                    disabled={addedDeadlineSuccess}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-sm ${
                      addedDeadlineSuccess
                        ? 'bg-emerald-600/40 text-emerald-300 border border-emerald-500/50 cursor-default'
                        : 'bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white active:scale-95'
                    }`}
                  >
                    {addedDeadlineSuccess ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                        <span>נוספה תזכורת ללוח הזמנות!</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ הוסף תזכורת ללוח הזמנות מראש</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">עיר בתאילנד *</label>
              <CityCombobox
                value={newCity}
                onChange={setNewCity}
                existingCities={cityOptions}
                placeholder="בחר עיר או הקלד עיר חדשה..."
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">קטגוריה *</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as ItemCategory)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="attraction">🏝️ אטרקציה / חוף / שייט</option>
                <option value="food">🍜 אוכל ומסעדות</option>
                <option value="shopping">🛍️ קניות ושווקי לילה</option>
                <option value="activity">💆‍♂️ מסאז'ים / פעילות</option>
                <option value="transport">✈️ טיסות פנים / מעבורות / הסעות</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                עלות משוערת (לכל המשפחה) ב-฿ (באט)
              </label>
              <input
                type="number"
                placeholder="0"
                value={newCostJpy}
                onChange={(e) => setNewCostJpy(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                מיקום / כתובת / חוף או תחנה קרובה
              </label>
              <input
                type="text"
                placeholder="למשל: Chaweng Beach, Koh Samui"
                value={newLocationName}
                onChange={(e) => setNewLocationName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                קישור ל-Google Maps
              </label>
              <input
                type="url"
                placeholder="https://maps.google.com/?q=..."
                value={newMapsUrl}
                onChange={(e) => setNewMapsUrl(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              טיפים והערות חשובות (התאמה ל-6 אנשים, מה להביא, הזמנת ואן/סירה)
            </label>
            <textarea
              rows={2}
              placeholder="למשל: לקחת סירת מנוע פרטית למשפחה, להביא בגדי ים וקרם הגנה..."
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none resize-none"
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
              className="py-2 px-5 bg-gradient-to-r from-japan-red to-rose-600 hover:opacity-95 text-white rounded-xl text-xs font-bold transition shadow-md flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>שמור במאגר</span>
            </button>
          </div>
        </form>
      )}

      {/* 3. Filters: Search Bar, Assignment toggle, City chips, Category chips */}
      <div className="space-y-3">
        {/* Free-text Search Bar */}
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="חפש אטרקציה במאגר או בכל תאילנד (למשל: קופיפי, אנג תונג, פילים, אייקון סיאם, פוקט...)"
            className="w-full bg-slate-900 border border-slate-800 focus:border-rose-500 rounded-2xl pr-10 pl-9 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition shadow-sm"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute left-3 p-1 text-slate-400 hover:text-white transition"
              title="נקה חיפוש"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Assignment toggle */}
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-2xl w-full sm:w-fit">
          <button
            type="button"
            onClick={() => setFilterMode('all')}
            className={`flex-1 sm:flex-initial py-1.5 px-3 rounded-xl text-xs font-bold transition ${
              filterMode === 'all'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            הכל ({items.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('assigned')}
            className={`flex-1 sm:flex-initial py-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
              filterMode === 'assigned'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>משויכים במסלול ({totalAssigned})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('unassigned')}
            className={`flex-1 sm:flex-initial py-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
              filterMode === 'unassigned'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CircleDashed className="w-3.5 h-3.5" />
            <span>רשימת משאלות ({totalUnassigned})</span>
          </button>
        </div>

        {/* City Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
          {cityOptions.map((city) => {
            const isSelected = selectedCity === city;
            const count = items.filter(
              (it) =>
                city === 'הכל' ||
                normalizeSearchText(getItemCity(it)).includes(normalizeSearchText(city)) ||
                normalizeSearchText(city).includes(normalizeSearchText(getItemCity(it)))
            ).length;

            return (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`shrink-0 py-1.5 px-3 rounded-xl text-xs font-bold transition border ${
                  isSelected
                    ? 'bg-slate-100 text-slate-900 border-white shadow-sm'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border-slate-800'
                }`}
              >
                <span>{city}</span>
                <span className="mr-1 text-[10px] opacity-70 font-mono">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
          {categoryOptions.map((cat) => {
            const isSelected = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`shrink-0 py-1 px-2.5 rounded-lg text-[11px] font-bold transition border ${
                  isSelected
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border-slate-800'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3.5 External Thailand Database Quick-Add Matches when searching */}
      {externalJapanMatches.length > 0 && (
        <div className="bg-gradient-to-r from-slate-900 via-rose-950/30 to-slate-900 border border-rose-500/30 rounded-3xl p-4 space-y-2.5 animate-fadeIn">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-japan-sakura flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-japan-sakura animate-pulse" />
              <span>נמצאו במאגר יעדי תאילנד (עדיין לא בקטלוג האישי שלך):</span>
            </span>
            <span className="text-[10px] text-slate-400">לחץ להוספה מהירה למאגר</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {externalJapanMatches.map((dest) => (
              <div
                key={dest.id}
                className="bg-slate-950/80 border border-slate-800 hover:border-rose-500/50 rounded-2xl p-3 flex items-start justify-between gap-2.5 transition"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-black text-white truncate">{dest.nameHe}</div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">{dest.nameEn}</div>
                  <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                    <span className="text-[10px] bg-red-950/80 text-red-300 border border-red-800/60 px-1.5 py-0.5 rounded font-bold">
                      📍 {dest.city}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold border ${CATEGORY_INFO[dest.category]?.badgeBg} ${CATEGORY_INFO[dest.category]?.badgeText} ${CATEGORY_INFO[dest.category]?.borderColor}`}>
                      {CATEGORY_INFO[dest.category]?.label}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onAddItem({
                      trip_id: days[0]?.trip_id || '88ab9584-2d4e-4834-8839-8486e53453f1',
                      day_id: null,
                      city: dest.city,
                      title: dest.nameHe,
                      title_ja: `${dest.nameJa} (${dest.romaji})`,
                      category: dest.category,
                      time_slot: 'גמיש',
                      location_name: `${dest.nameEn}, ${dest.cityEn || dest.city}`,
                      google_maps_url: dest.google_maps_url,
                      cost_jpy: dest.cost_jpy,
                      notes: dest.notes,
                      is_completed: false,
                      order_index: 99,
                      district: dest.district,
                      nearest_station: dest.nearest_station,
                      estimated_duration_mins: dest.estimated_duration_mins,
                      best_time_of_day: dest.best_time_of_day,
                      pro_tips: dest.pro_tips,
                      requires_advance_booking: dest.requires_advance_booking,
                      booking_window_rule: dest.booking_window_rule,
                    });
                  }}
                  className="shrink-0 py-1.5 px-2.5 bg-gradient-to-r from-japan-red to-rose-600 hover:opacity-95 text-white rounded-xl text-[11px] font-bold flex items-center gap-1 shadow-sm transition active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>הוסף למאגר</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Attractions List */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
            <Compass className="w-8 h-8 text-slate-600 mx-auto mb-1" />
            <p className="text-slate-300 text-xs font-bold">
              {searchQuery.trim()
                ? `לא נמצאו יעדים שמורים במאגר שלך עבור "${searchQuery}"`
                : 'לא נמצאו יעדים תחת סינון זה'}
            </p>
            <p className="text-slate-500 text-[11px]">
              {searchQuery.trim()
                ? 'רוצה להוסיף את היעד הזה למאגר האטרקציות עם השלמה חכמה של AI ומפות תאילנד?'
                : 'נסה לבחור עיר או קטגוריה אחרת, או נקה את הסינון'}
            </p>
            {searchQuery.trim() && (
              <button
                type="button"
                onClick={() => {
                  setNewTitle(searchQuery.trim());
                  setIsAddFormOpen(true);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-1.5 py-2 px-4 bg-gradient-to-r from-japan-red to-rose-600 text-white rounded-xl text-xs font-bold shadow-md transition hover:opacity-95"
              >
                <Plus className="w-4 h-4" />
                <span>+ הוסף את "{searchQuery.trim()}" למאגר האטרקציות</span>
              </button>
            )}
          </div>
        ) : (
          filteredItems.map((item) => {
            const isAssigned = Boolean(item.day_id);
            const parentDay = isAssigned ? days.find((d) => d.id === item.day_id) : null;
            const itemCity = getItemCity(item);
            const isManualPickerOpen = manualAssignItemId === item.id;

            return (
              <div
                key={item.id}
                className={`bg-slate-900 border rounded-3xl p-4 sm:p-5 transition-all shadow-md relative ${
                  isAssigned
                    ? 'border-emerald-500/30 hover:border-emerald-500/50'
                    : 'border-slate-800 hover:border-amber-500/40'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {/* Status & Category Badges */}
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {isAssigned && parentDay ? (
                        <div className="flex items-center gap-1.5 bg-emerald-950/70 border border-emerald-800/60 text-emerald-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>
                            משויך ליום {parentDay.day_number} ({parentDay.city}) · {item.time_slot}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 bg-amber-950/70 border border-amber-800/60 text-amber-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                          <CircleDashed className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>רשימת משאלות (לא משויך)</span>
                        </div>
                      )}

                      <span className={`text-[11px] px-2.5 py-0.5 rounded-lg font-semibold border ${CATEGORY_INFO[item.category]?.badgeBg} ${CATEGORY_INFO[item.category]?.badgeText} ${CATEGORY_INFO[item.category]?.borderColor}`}>
                        {CATEGORY_INFO[item.category]?.label}
                      </span>

                      <span className="text-[11px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-lg font-semibold flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-japan-red" />
                        <span>{itemCity}</span>
                      </span>

                      {item.cost_jpy && item.cost_jpy > 0 ? (
                        <span className="text-[11px] text-amber-400 font-mono font-bold">
                          {formatJPY(item.cost_jpy)}
                          <span className="text-slate-400 font-normal mr-1">
                            ({formatILS(item.cost_jpy * defaultRate)})
                          </span>
                        </span>
                      ) : null}

                      {item.requires_advance_booking && (
                        <span className="text-[10px] bg-red-950/80 text-rose-300 border border-red-800/60 px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
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

                    {/* Title & Japanese Name */}
                    <h4 className="text-base sm:text-lg font-black text-white leading-tight">
                      {item.title}
                    </h4>
                    {item.title_ja && (
                      <p className="text-xs text-slate-400 font-japanese mt-0.5">
                        {item.title_ja}
                      </p>
                    )}

                    {/* Location */}
                    {item.location_name && (
                      <div className="flex items-center gap-1 text-xs text-slate-300 mt-1.5">
                        <MapPin className="w-3.5 h-3.5 text-japan-red shrink-0" />
                        <span className="truncate">{item.location_name}</span>
                      </div>
                    )}

                    {/* Notes */}
                    {item.notes && (
                      <p className="text-xs text-slate-300 mt-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 leading-relaxed">
                        {item.notes}
                      </p>
                    )}

                    {/* Click-to-view / Jump to Day action */}
                    {isAssigned && parentDay && onJumpToDay && (
                      <div className="mt-2.5">
                        <button
                          type="button"
                          onClick={() => onJumpToDay(parentDay.id)}
                          className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-950/50 hover:bg-emerald-900/50 px-2.5 py-1 rounded-lg border border-emerald-800/40 transition inline-flex items-center gap-1"
                        >
                          <span>צפה במסלול יום {parentDay.day_number} ({parentDay.city})</span>
                          <span className="text-[9px]">←</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Actions Column */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                    {/* Prominent AI Placement Button for unassigned items */}
                    {!isAssigned && (
                      <button
                        type="button"
                        onClick={() => onOpenAiPlacement(item)}
                        className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-gradient-to-r from-purple-600 via-rose-600 to-amber-600 hover:opacity-95 text-white text-xs font-black shadow-md transition active:scale-95 animate-pulse"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>✨ שבץ בלו"ז עם AI</span>
                      </button>
                    )}

                    <div className="flex items-center gap-1.5">
                      {/* Manual Assignment Dropdown Button */}
                      <button
                        type="button"
                        onClick={() =>
                          setManualAssignItemId(isManualPickerOpen ? null : item.id)
                        }
                        className={`flex items-center gap-1 py-1.5 px-2.5 rounded-xl text-xs font-bold border transition ${
                          isManualPickerOpen
                            ? 'bg-rose-600 text-white border-rose-500'
                            : 'bg-slate-800 hover:bg-slate-750 text-slate-300 border-slate-700'
                        }`}
                        title="שייך ליום במסלול או העבר למשאלות"
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5 text-rose-400" />
                        <span>{isAssigned ? 'החלף יום' : 'שבץ ליום'}</span>
                        <ChevronDown className={`w-3 h-3 transition-transform ${isManualPickerOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {/* External Maps link */}
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

                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => onEditItem(item)}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                        title="ערוך אטרקציה"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`האם למחוק את "${item.title}" ממאגר האטרקציות?`)) {
                            onDeleteItem(item.id);
                          }
                        }}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 transition"
                        title="מחק אטרקציה"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Day Selection Drawer */}
                {isManualPickerOpen && (
                  <div className="mt-4 pt-3.5 border-t border-slate-800 bg-slate-950/70 -mx-4 -mb-4 sm:-mx-5 sm:-mb-5 p-4 rounded-b-3xl space-y-2.5 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-rose-400" />
                        <span>בחר לאיזה יום לשבץ את "{item.title}":</span>
                      </span>

                      {isAssigned && (
                        <button
                          type="button"
                          onClick={() => {
                            onUnassignItem(item.id);
                            setManualAssignItemId(null);
                          }}
                          className="text-[11px] font-bold text-amber-400 hover:text-amber-300 bg-amber-950/40 px-2 py-0.5 rounded-lg border border-amber-900/50"
                        >
                          הסר שיוך (העבר למשאלות)
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 max-h-48 overflow-y-auto p-1">
                      {days.map((day) => {
                        const isCurrentDay = item.day_id === day.id;
                        const isMatchingCity = day.city.includes(itemCity) || itemCity.includes(day.city);

                        return (
                          <button
                            key={day.id}
                            type="button"
                            onClick={() => {
                              onAssignItemToDay(item.id, day.id);
                              setManualAssignItemId(null);
                            }}
                            className={`p-2 rounded-xl text-right text-xs font-bold border transition ${
                              isCurrentDay
                                ? 'bg-emerald-600 text-white border-emerald-400 shadow-sm'
                                : isMatchingCity
                                ? 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-rose-900/50'
                                : 'bg-slate-950/50 hover:bg-slate-900 text-slate-400 border-slate-800'
                            }`}
                          >
                            <span className="block text-[11px] font-black">
                              יום {day.day_number}
                            </span>
                            <span className="block text-[10px] text-slate-400 truncate mt-0.5">
                              {day.city}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { TripDay, SavedHotel } from '../types';
import { 
  Hotel, 
  Plus, 
  MapPin, 
  ExternalLink, 
  Trash2, 
  Sparkles, 
  CheckCircle2, 
  CircleDashed,
  Calendar,
  X,
  ChevronDown,
  ChevronUp,
  Bookmark
} from 'lucide-react';
import { formatJPY, formatILS } from '../lib/utils';
import { CityCombobox } from './CityCombobox';

interface HotelsHubViewProps {
  days: TripDay[];
  savedHotels: SavedHotel[];
  defaultRate?: number;
  onAddHotel: (hotel: Omit<SavedHotel, 'id'>) => void;
  onUpdateHotel: (hotel: SavedHotel) => void;
  onDeleteHotel: (hotelId: string) => void;
  onAssignHotelToDays: (hotelId: string, dayNumbers: number[]) => void;
  onOpenAiPlacement: (hotel: SavedHotel) => void;
  onJumpToDay?: (dayId: string) => void;
}

export const HotelsHubView: React.FC<HotelsHubViewProps> = ({
  days,
  savedHotels,
  defaultRate = 0.11,
  onAddHotel,
  onDeleteHotel,
  onAssignHotelToDays,
  onOpenAiPlacement,
  onJumpToDay,
}) => {
  const [selectedCity, setSelectedCity] = useState<string>('הכל');
  const [filterMode, setFilterMode] = useState<'all' | 'assigned' | 'unassigned'>('all');
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [assigningHotelId, setAssigningHotelId] = useState<string | null>(null);

  // New Hotel Form State
  const [newName, setNewName] = useState('');
  const [newNameJa, setNewNameJa] = useState('');
  const [newCity, setNewCity] = useState('פוקט');
  const [newPriceJpy, setNewPriceJpy] = useState('');
  const [newBookingUrl, setNewBookingUrl] = useState('');
  const [newNotes, setNewNotes] = useState('');

  // Dynamic aggregation of all cities from itinerary days and saved hotels
  const cityOptions = [
    'הכל',
    ...Array.from(
      new Set([
        ...days.map((d) => d.city),
        ...savedHotels.map((h) => h.city),
      ].filter(Boolean))
    ),
  ];

  // Helper to determine which day numbers a hotel is assigned to
  const getAssignedDaysForHotel = (hotel: SavedHotel): number[] => {
    // 1. Direct assigned_day_numbers property if present
    if (hotel.assigned_day_numbers && hotel.assigned_day_numbers.length > 0) {
      return hotel.assigned_day_numbers;
    }
    // 2. Check which days in `days` have this hotel's name
    const cleanHotelName = hotel.name.trim().toLowerCase();
    const matchedDays = days.filter((d) => {
      const dayHotel = (d.hotel_name || '').trim().toLowerCase();
      return dayHotel && (dayHotel.includes(cleanHotelName) || cleanHotelName.includes(dayHotel));
    });
    return matchedDays.map((d) => d.day_number);
  };

  // Filtered hotels
  const filteredHotels = savedHotels.filter((hotel) => {
    // City filter
    if (selectedCity !== 'הכל' && !hotel.city.includes(selectedCity)) {
      return false;
    }
    const assignedDays = getAssignedDaysForHotel(hotel);
    const isAssigned = assignedDays.length > 0;

    if (filterMode === 'assigned' && !isAssigned) return false;
    if (filterMode === 'unassigned' && isAssigned) return false;

    return true;
  });

  const totalAssignedCount = savedHotels.filter((h) => getAssignedDaysForHotel(h).length > 0).length;
  const totalUnassignedCount = savedHotels.length - totalAssignedCount;

  const handleCreateHotel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    onAddHotel({
      trip_id: days[0]?.trip_id || '88ab9584-2d4e-4834-8839-8486e53453f1',
      name: newName.trim(),
      name_ja: newNameJa.trim() || undefined,
      city: newCity,
      price_jpy: newPriceJpy ? parseInt(newPriceJpy, 10) : undefined,
      booking_url: newBookingUrl.trim() || undefined,
      notes: newNotes.trim() || undefined,
      assigned_day_numbers: null,
    });

    setNewName('');
    setNewNameJa('');
    setNewPriceJpy('');
    setNewBookingUrl('');
    setNewNotes('');
    setIsAddFormOpen(false);
  };

  const handleToggleDayAssignment = (hotel: SavedHotel, dayNumber: number) => {
    const current = getAssignedDaysForHotel(hotel);
    const nextDays = current.includes(dayNumber)
      ? current.filter((n) => n !== dayNumber)
      : [...current, dayNumber].sort((a, b) => a - b);

    onAssignHotelToDays(hotel.id, nextDays);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* 1. Hub Header & Quick Summary */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold border border-indigo-500/30 shadow-md">
              <Hotel className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white">מאגר ריזורטים ומלונות למשפחה</h3>
                <span className="text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-800/60 px-2 py-0.5 rounded-full">
                  Hotels Hub
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                ניהול מלונות, ריזורטים ווילות משפחתיות (6 נפשות) בפוקט, קוסמוי ובנגקוק
              </p>
            </div>
          </div>

          {/* Quick Add Button */}
          <button
            onClick={() => setIsAddFormOpen(!isAddFormOpen)}
            className="flex items-center justify-center gap-1.5 py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:opacity-95 text-white text-xs font-black rounded-xl shadow-md transition active:scale-95"
          >
            {isAddFormOpen ? <ChevronUp className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{isAddFormOpen ? 'סגור טופס' : '+ הוסף מלון / ריזורט חדש'}</span>
          </button>
        </div>

        {/* Counter Pills */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-800/80 text-center">
          <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800/60">
            <span className="text-[10px] text-slate-400 block">סה"כ מלונות שמורים</span>
            <span className="text-sm font-black text-white font-mono">{savedHotels.length}</span>
          </div>

          <div className="bg-slate-950/60 p-2 rounded-xl border border-emerald-900/40">
            <span className="text-[10px] text-emerald-400 block">משויכים ללילות במסלול</span>
            <span className="text-sm font-black text-emerald-300 font-mono">{totalAssignedCount}</span>
          </div>

          <div className="bg-slate-950/60 p-2 rounded-xl border border-amber-900/40">
            <span className="text-[10px] text-amber-400 block">רעיונות ומשאלות (לא משויך)</span>
            <span className="text-sm font-black text-amber-300 font-mono">{totalUnassignedCount}</span>
          </div>
        </div>
      </div>

      {/* 2. Collapsible Add New Hotel Form */}
      {isAddFormOpen && (
        <form
          onSubmit={handleCreateHotel}
          className="bg-slate-900 border border-indigo-500/40 rounded-3xl p-5 shadow-xl space-y-3.5 animate-fadeIn"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <h4 className="text-sm font-black text-white flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-indigo-400" />
              <span>שמירת מלון / ריזורט חדש</span>
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
                שם המלון / הריזורט (באנגלית / עברית) *
              </label>
              <input
                type="text"
                required
                placeholder="למשל: Katathani Phuket Beach Resort"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                שם בתאית (אופציונלי - לנהג מונית)
              </label>
              <input
                type="text"
                placeholder="למשל: กะตะธานี ภูเก็ต บีช รีสอร์ท"
                value={newNameJa}
                onChange={(e) => setNewNameJa(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none font-japanese"
              />
            </div>
          </div>

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
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                מחיר משוער ללילה (לכל המשפחה) ב-฿ (באט)
              </label>
              <input
                type="number"
                placeholder="למשל: 12000"
                value={newPriceJpy}
                onChange={(e) => setNewPriceJpy(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                קישור להזמנה / אתר
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={newBookingUrl}
                onChange={(e) => setNewBookingUrl(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              הערות, יתרונות ומאפיינים מיוחדים (ל-6 נפשות)
            </label>
            <textarea
              rows={2}
              placeholder="למשל: על קו החוף בקאטה נוי, 2 חדרים מחוברים / וילה משפחתית, בריכה ענקית וארוחת בוקר עשירה..."
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none resize-none"
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
              className="py-2 px-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-md flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>שמור מלון במאגר</span>
            </button>
          </div>
        </form>
      )}

      {/* 3. Filters: City Chips & Assignment Status Toggle */}
      <div className="space-y-2.5">
        {/* Assignment toggle */}
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-2xl w-full sm:w-fit">
          <button
            type="button"
            onClick={() => setFilterMode('all')}
            className={`flex-1 sm:flex-initial py-1.5 px-3 rounded-xl text-xs font-bold transition ${
              filterMode === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            הכל ({savedHotels.length})
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
            <span>משויכים במסלול ({totalAssignedCount})</span>
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
            <span>טרם שויכו ({totalUnassignedCount})</span>
          </button>
        </div>

        {/* City Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
          {cityOptions.map((city) => {
            const isSelected = selectedCity === city;
            const count = savedHotels.filter((h) => city === 'הכל' || h.city.includes(city)).length;

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
      </div>

      {/* 4. Hotels List */}
      <div className="space-y-3.5">
        {filteredHotels.length === 0 ? (
          <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-3xl">
            <Hotel className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-slate-300 text-xs font-bold">לא נמצאו מלונות תחת סינון זה</p>
            <p className="text-slate-500 text-[11px] mt-1">נסה לשנות את העיר או סטטוס השיבוץ</p>
          </div>
        ) : (
          filteredHotels.map((hotel) => {
            const assignedDays = getAssignedDaysForHotel(hotel);
            const isAssigned = assignedDays.length > 0;
            const isAssigningOpen = assigningHotelId === hotel.id;

            return (
              <div
                key={hotel.id}
                className={`bg-slate-900 border rounded-3xl p-4 sm:p-5 transition-all shadow-md relative ${
                  isAssigned
                    ? 'border-emerald-500/30 hover:border-emerald-500/50'
                    : 'border-slate-800 hover:border-amber-500/40'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {/* Status & City Badges */}
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {isAssigned ? (
                        <div className="flex items-center gap-1.5 bg-emerald-950/70 border border-emerald-800/60 text-emerald-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>
                            משויך ללילות [ימים {assignedDays.join(', ')}]
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 bg-amber-950/70 border border-amber-800/60 text-amber-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                          <CircleDashed className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>רעיון למלון (טרם שויך)</span>
                        </div>
                      )}

                      <span className="text-[11px] bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-japan-red" />
                        <span>{hotel.city}</span>
                      </span>

                      {hotel.price_jpy && hotel.price_jpy > 0 && (
                        <span className="text-[11px] text-amber-400 font-mono font-bold">
                          {formatJPY(hotel.price_jpy)}
                          <span className="text-slate-400 font-normal mr-1">
                            ({formatILS(hotel.price_jpy * defaultRate)})
                          </span>
                        </span>
                      )}
                    </div>

                    {/* Hotel Title & Japanese Name */}
                    <h4 className="text-base sm:text-lg font-black text-white leading-tight">
                      {hotel.name}
                    </h4>
                    {hotel.name_ja && (
                      <p className="text-xs text-slate-400 font-japanese mt-0.5">
                        {hotel.name_ja}
                      </p>
                    )}

                    {/* Notes */}
                    {hotel.notes && (
                      <p className="text-xs text-slate-300 mt-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 leading-relaxed">
                        {hotel.notes}
                      </p>
                    )}

                    {/* Quick jump to days in itinerary if assigned */}
                    {isAssigned && onJumpToDay && (
                      <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
                        <span className="text-[11px] text-slate-400">צפה ביום:</span>
                        {assignedDays.map((dNum) => {
                          const targetDay = days.find((d) => d.day_number === dNum);
                          if (!targetDay) return null;
                          return (
                            <button
                              key={dNum}
                              type="button"
                              onClick={() => onJumpToDay(targetDay.id)}
                              className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-950/50 hover:bg-emerald-900/50 px-2 py-0.5 rounded-lg border border-emerald-800/40 transition"
                            >
                              יום {dNum}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Right Action buttons */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                    {/* AI Placement Button for unassigned */}
                    {!isAssigned && (
                      <button
                        type="button"
                        onClick={() => onOpenAiPlacement(hotel)}
                        className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-gradient-to-r from-purple-600 via-rose-600 to-amber-600 hover:opacity-95 text-white text-xs font-black shadow-md transition active:scale-95 animate-pulse"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>✨ שבץ בלו"ז עם AI</span>
                      </button>
                    )}

                    <div className="flex items-center gap-1.5">
                      {/* Manual Assign Days Picker Button */}
                      <button
                        type="button"
                        onClick={() =>
                          setAssigningHotelId(isAssigningOpen ? null : hotel.id)
                        }
                        className={`flex items-center gap-1 py-1.5 px-2.5 rounded-xl text-xs font-bold border transition ${
                          isAssigningOpen
                            ? 'bg-indigo-600 text-white border-indigo-500'
                            : 'bg-slate-800 hover:bg-slate-750 text-slate-300 border-slate-700'
                        }`}
                        title="בחר לילות לשיוך מלון זה"
                      >
                        <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                        <span>שייך לילות</span>
                        <ChevronDown className={`w-3 h-3 transition-transform ${isAssigningOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {hotel.booking_url && (
                        <a
                          href={hotel.booking_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                          title="פתיחת קישור למלון"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`האם למחוק את "${hotel.name}" ממאגר המלונות?`)) {
                            onDeleteHotel(hotel.id);
                          }
                        }}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 transition"
                        title="מחק מלון"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Day Selection Drawer */}
                {isAssigningOpen && (
                  <div className="mt-4 pt-3.5 border-t border-slate-800 bg-slate-950/70 -mx-4 -mb-4 sm:-mx-5 sm:-mb-5 p-4 rounded-b-3xl space-y-2.5 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                        <span>סמן את הלילות שבהם תלונו במלון זה:</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setAssigningHotelId(null)}
                        className="text-[11px] font-bold text-slate-400 hover:text-white"
                      >
                        סיום
                      </button>
                    </div>

                    <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 max-h-48 overflow-y-auto p-1">
                      {days.map((day) => {
                        const isDaySelected = assignedDays.includes(day.day_number);
                        const isMatchingCity = day.city.includes(hotel.city) || hotel.city.includes(day.city);

                        return (
                          <button
                            key={day.id}
                            type="button"
                            onClick={() => handleToggleDayAssignment(hotel, day.day_number)}
                            className={`py-1.5 px-1 rounded-xl text-center text-xs font-bold border transition ${
                              isDaySelected
                                ? 'bg-emerald-600 text-white border-emerald-400 shadow-sm'
                                : isMatchingCity
                                ? 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-indigo-900/50'
                                : 'bg-slate-950/50 hover:bg-slate-900 text-slate-500 border-slate-800'
                            }`}
                            title={`יום ${day.day_number} (${day.city})`}
                          >
                            <span className="block text-[10px] font-mono leading-none">
                              יום {day.day_number}
                            </span>
                            <span className="block text-[9px] truncate opacity-70 mt-0.5">
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

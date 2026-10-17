import React, { useState } from 'react';
import { TripDay, ItineraryItem, MeetupPin, UserProfiles } from '../types';
import { 
  Navigation, 
  Ticket, 
  CheckCircle2, 
  Circle, 
  MapPin, 
  Clock, 
  ExternalLink, 
  Car, 
  Coins, 
  ChevronLeft, 
  ChevronRight, 
  Hotel, 
  Info,
  GripVertical,
  Sparkles
} from 'lucide-react';
import { CATEGORY_INFO, formatJPY, formatILS, formatHebrewDate } from '../lib/utils';
import { calculateDayRouteMetrics, DayRouteOptimizationResult } from '../lib/geoData';
import { MeetupPinCard } from './MeetupPinCard';

interface DashboardViewProps {
  days: TripDay[];
  currentDayId: string;
  setCurrentDayId: (id: string) => void;
  items: ItineraryItem[];
  onToggleCompleted: (itemId: string, currentStatus: boolean) => void;
  onOpenTicket: (item: ItineraryItem) => void;
  onOpenTaxiCard: () => void;
  onOpenCurrency: () => void;
  onOpenAddItem: () => void;
  meetupPin?: MeetupPin | null;
  onUpdateMeetupPin?: (pin: MeetupPin) => void;
  onOpenAiConciergeWithPrompt?: (prompt: string) => void;
  userProfiles?: UserProfiles;
  onReorderItems?: (dayId: string, fromIndex: number, toIndex: number) => void;
  onOptimizeDayItems?: (dayId: string) => Promise<DayRouteOptimizationResult | null>;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  days,
  currentDayId,
  setCurrentDayId,
  items,
  onToggleCompleted,
  onOpenTicket,
  onOpenTaxiCard,
  onOpenCurrency,
  onOpenAddItem,
  meetupPin,
  onUpdateMeetupPin,
  userProfiles,
  onReorderItems,
  onOptimizeDayItems,
}) => {
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
  const [dragOverItemIndex, setDragOverItemIndex] = useState<number | null>(null);
  const [touchDraggedItemIndex, setTouchDraggedItemIndex] = useState<number | null>(null);
  const [optimizationBanner, setOptimizationBanner] = useState<string | null>(null);

  const currentDay = days.find((d) => d.id === currentDayId) || days[0];
  const todayItems = items
    .filter((it) => it.day_id === currentDay?.id)
    .sort((a, b) => a.order_index - b.order_index);

  const dayRouteMetrics = calculateDayRouteMetrics(
    todayItems,
    currentDay?.hotel_name,
    currentDay?.city
  );
  const hasHotelStartLeg = Boolean(currentDay?.hotel_name && currentDay.hotel_name.trim());

  // The "Next Destination": first item not completed, or the last one if all completed
  const nextItem = todayItems.find((it) => !it.is_completed) || todayItems[todayItems.length - 1];
  const completedCount = todayItems.filter((it) => it.is_completed).length;
  const totalCount = todayItems.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const currentDayIndex = days.findIndex((d) => d.id === currentDay?.id);
  const prevDay = currentDayIndex > 0 ? days[currentDayIndex - 1] : null;
  const nextDay = currentDayIndex < days.length - 1 ? days[currentDayIndex + 1] : null;

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Day Selector Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow-md flex items-center justify-between gap-2">
        <button
          disabled={!prevDay}
          onClick={() => prevDay && setCurrentDayId(prevDay.id)}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-750 disabled:opacity-30 disabled:pointer-events-none text-slate-300 transition"
          title="יום קודם"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-red-400 bg-red-950/80 px-2 py-0.5 rounded-full border border-red-900/60">
              יום {currentDay?.day_number}
            </span>
            <span className="text-sm font-black text-white">
              {currentDay?.city}
            </span>
            {currentDay?.city_ja && (
              <span className="text-xs text-slate-400 font-japanese">
                ({currentDay.city_ja})
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {currentDay ? formatHebrewDate(currentDay.date) : ''}
          </p>
        </div>

        <button
          disabled={!nextDay}
          onClick={() => nextDay && setCurrentDayId(nextDay.id)}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-750 disabled:opacity-30 disabled:pointer-events-none text-slate-300 transition"
          title="יום הבא"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Family Meetup Pin */}
      <MeetupPinCard
        pin={meetupPin || null}
        onUpdatePin={onUpdateMeetupPin || (() => {})}
        userProfiles={userProfiles}
      />

      {/* Progress Bar for the day */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-2.5 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-300 font-semibold">התקדמות היום:</span>
          <span className="text-emerald-400 font-mono font-bold">
            {completedCount}/{totalCount} יעדים
          </span>
        </div>
        <div className="flex-1 max-w-xs bg-slate-800 h-2 rounded-full overflow-hidden">
          <div 
            className="bg-gradient-to-r from-red-500 to-emerald-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <span className="text-slate-400 font-mono text-[11px]">{progressPercent}%</span>
      </div>

      {/* ========================================================
          1. כרטיס היעד הבא (Next Destination Card)
          ======================================================== */}
      {nextItem ? (
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border-2 border-red-500/50 rounded-3xl p-5 shadow-2xl shadow-red-950/20">
          {/* Top highlight banner */}
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-japan-red"></span>
              </span>
              <span className="text-xs font-black uppercase tracking-wider text-red-400">
                {nextItem.is_completed ? 'כל היעדים להיום הושלמו!' : 'היעד הבא בשטח'}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full flex items-center gap-1 border border-slate-700">
                <Clock className="w-3 h-3 text-red-400" />
                <span>{nextItem.time_slot}</span>
              </span>
            </div>
          </div>

          {/* Main Title & Japanese */}
          <div className="mb-4">
            <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
              {nextItem.title}
            </h3>
            {nextItem.title_ja && (
              <p className="text-sm font-semibold text-slate-400 font-japanese mt-0.5">
                {nextItem.title_ja}
              </p>
            )}
          </div>

          {/* Location & Category */}
          <div className="flex flex-wrap items-center gap-2 mb-4 text-xs">
            <span className={`px-2.5 py-1 rounded-lg font-semibold border ${CATEGORY_INFO[nextItem.category]?.badgeBg} ${CATEGORY_INFO[nextItem.category]?.badgeText} ${CATEGORY_INFO[nextItem.category]?.borderColor}`}>
              {CATEGORY_INFO[nextItem.category]?.label}
            </span>

            <span className="flex items-center gap-1 text-slate-300 bg-slate-800/80 px-2.5 py-1 rounded-lg">
              <MapPin className="w-3.5 h-3.5 text-japan-red" />
              <span>{nextItem.location_name}</span>
            </span>

            {nextItem.cost_jpy && nextItem.cost_jpy > 0 ? (
              <span className="text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-lg font-mono">
                {formatJPY(nextItem.cost_jpy)} ({formatILS(nextItem.cost_jpy * 0.11)})
              </span>
            ) : null}
          </div>

          {/* Notes / Tips */}
          {nextItem.notes && (
            <div className="mb-5 p-3.5 bg-slate-950/80 border border-slate-800/90 rounded-2xl text-xs text-slate-300 leading-relaxed flex items-start gap-2">
              <Info className="w-4 h-4 text-japan-sakura shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-200 block mb-0.5">פתק / הנחיות שטח:</span>
                <p>{nextItem.notes}</p>
              </div>
            </div>
          )}

          {/* Action Buttons: Direct Google Maps Navigation & Ticket & Complete */}
          <div className="space-y-2.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Direct Navigation Button */}
              <a
                href={
                  nextItem.google_maps_url ||
                  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                    nextItem.location_name + ' ' + (nextItem.title_ja || nextItem.title)
                  )}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3.5 px-4 bg-gradient-to-r from-japan-red to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-red-950/40 transition active:scale-[0.98]"
              >
                <Navigation className="w-4 h-4" />
                <span>נווט עכשיו ב-Google Maps</span>
              </a>

              {/* Ticket / Voucher Button */}
              {nextItem.ticket_info || nextItem.ticket_url ? (
                <button
                  onClick={() => onOpenTicket(nextItem)}
                  className="flex items-center justify-center gap-2 py-3.5 px-4 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-200 border border-indigo-500/40 font-bold text-sm rounded-2xl transition active:scale-[0.98]"
                >
                  <Ticket className="w-4 h-4 text-indigo-400" />
                  <span>פתח כרטיס / קוד כניסה</span>
                </button>
              ) : (
                <button
                  onClick={onOpenCurrency}
                  className="flex items-center justify-center gap-2 py-3.5 px-4 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold text-sm rounded-2xl transition active:scale-[0.98]"
                >
                  <Coins className="w-4 h-4 text-amber-400" />
                  <span>מחשבון באט מהיר</span>
                </button>
              )}
            </div>

            {/* Toggle Done Button */}
            <button
              onClick={() => onToggleCompleted(nextItem.id, nextItem.is_completed)}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition border ${
                nextItem.is_completed
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-800 hover:bg-slate-750 text-slate-300 border-slate-700'
              }`}
            >
              {nextItem.is_completed ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>יעד זה כבר סומן כהושלם (לחץ לביטול)</span>
                </>
              ) : (
                <>
                  <Circle className="w-4 h-4 text-slate-400" />
                  <span>סמן כיעד שהושלם והמשך לבא בתור ✓</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-3xl">
          <p className="text-slate-400 text-sm mb-3">אין יעדים מתוכננים להיום</p>
          <button
            onClick={onOpenAddItem}
            className="py-2.5 px-5 bg-japan-red hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow transition"
          >
            + הוסף יעד ראשון להיום
          </button>
        </div>
      )}

      {/* ========================================================
          2. כרטיס מלון עם כתובת ביפנית לנהג מונית (Hotel Card)
          ======================================================== */}
      {currentDay?.hotel_name && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Hotel className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">מלון הלילה ({currentDay.city})</h4>
                <p className="text-[11px] text-slate-400">כתובת מוכנה להצגה לנהג מונית</p>
              </div>
            </div>

            <button
              onClick={onOpenTaxiCard}
              className="py-1.5 px-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-md transition active:scale-95 flex items-center gap-1.5"
            >
              <Car className="w-3.5 h-3.5" />
              <span>הצג לנהג מונית</span>
            </button>
          </div>

          <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800/80 space-y-1.5">
            <div className="flex items-baseline justify-between">
              <span className="text-base font-extrabold text-white font-japanese">
                {currentDay.hotel_name_ja || currentDay.hotel_name}
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium">{currentDay.hotel_name}</p>
            <p className="text-xs text-slate-400 font-japanese dir-ltr text-left">
              {currentDay.hotel_address_ja}
            </p>
          </div>
        </div>
      )}

      {/* ========================================================
          3. לו״ז היום המלא (Today's Timeline)
          ======================================================== */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              כל היעדים של יום {currentDay?.day_number} ({todayItems.length})
            </h4>
            {todayItems.length > 0 && dayRouteMetrics.legs.length > 0 && (
              <span className="text-[11px] font-mono text-sky-300 bg-sky-950/60 border border-sky-800/40 px-2 py-0.5 rounded-full">
                🧭 {dayRouteMetrics.totalDistanceKm} ק"מ • כ-{dayRouteMetrics.totalTransitMinutes} דק' מעברים
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {todayItems.length >= 2 && onOptimizeDayItems && currentDay && (
              <button
                type="button"
                onClick={async () => {
                  const res = await onOptimizeDayItems(currentDay.id);
                  if (!res) return;
                  if (res.orderChanged && res.savedKm > 0) {
                    setOptimizationBanner(
                      `✨ המסלול סודר גיאוגרפית! נחסכו ${res.savedKm} ק"מ וכ-${res.savedMinutes} דק' מעבר.`
                    );
                  } else {
                    setOptimizationBanner(
                      `✅ המסלול והשעות סודרו ברצף גיאוגרפי אופטימלי (${res.newDistanceKm} ק"מ).`
                    );
                  }
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-200 text-xs font-bold transition active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>סדר מסלול</span>
              </button>
            )}
            <button
              onClick={onOpenAddItem}
              className="text-xs text-red-400 hover:text-red-300 font-bold"
            >
              + הוסף יעד
            </button>
          </div>
        </div>

        {optimizationBanner && (
          <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-2xl p-2.5 text-xs text-emerald-200 flex items-center justify-between gap-2 animate-fadeIn">
            <span>{optimizationBanner}</span>
            <button
              type="button"
              onClick={() => setOptimizationBanner(null)}
              className="text-emerald-400 hover:text-white font-bold px-1"
            >
              ✕
            </button>
          </div>
        )}

        <div className="space-y-2.5">
          {todayItems.map((item, index) => {
            const isBeingDragged = draggedItemIndex === index || touchDraggedItemIndex === index;
            const isDropTarget = dragOverItemIndex === index && (draggedItemIndex !== null || touchDraggedItemIndex !== null);
            const incomingLegIndex = hasHotelStartLeg ? index : index - 1;
            const incomingLeg =
              incomingLegIndex >= 0 ? dayRouteMetrics.legs[incomingLegIndex] : null;
            const isFromHotel = hasHotelStartLeg && index === 0;

            return (
              <React.Fragment key={item.id}>
                {incomingLeg && (
                  <div className="flex items-center justify-between gap-2 px-3 py-1 rounded-xl bg-slate-900/60 border border-slate-800/70 text-[11px]">
                    <div className="flex items-center gap-1.5 min-w-0 truncate">
                      <span className="font-bold text-sky-300">
                        {incomingLeg.icon} {incomingLeg.durationMinutes} דק' ({incomingLeg.distanceLabel})
                      </span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-400 truncate">
                        {isFromHotel ? 'יציאה מהמלון' : incomingLeg.modeLabel}
                      </span>
                    </div>
                    <a
                      href={incomingLeg.directionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-400 hover:text-sky-300 font-bold shrink-0"
                    >
                      מסלול ↗
                    </a>
                  </div>
                )}

                <div
                  data-dashboard-item-index={index}
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
                  className={`p-3.5 rounded-2xl border transition-all duration-200 ${
                    item.is_completed
                      ? 'bg-slate-900/40 border-slate-800/60 opacity-60'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700 shadow-sm'
                  } ${
                    isBeingDragged ? 'opacity-40 scale-[0.98] border-dashed border-red-500' : ''
                  } ${
                    isDropTarget ? 'ring-2 ring-japan-red border-red-500 bg-slate-800/90 scale-[1.01] shadow-xl' : ''
                  }`}
                >
                  <div className="flex items-start gap-2.5 sm:gap-3">
                    {/* Grip Handle for reordering */}
                    {onReorderItems && (
                      <div
                        className="mt-0.5 text-slate-500 hover:text-white cursor-grab active:cursor-grabbing p-1 -mr-1.5 touch-none select-none rounded-lg hover:bg-slate-800 transition shrink-0"
                        title="גרור כדי לשנות סדר"
                        onTouchStart={() => {
                          setTouchDraggedItemIndex(index);
                          setDragOverItemIndex(index);
                        }}
                        onTouchMove={(e) => {
                          const touch = e.touches[0];
                          const elem = document.elementFromPoint(touch.clientX, touch.clientY);
                          const card = elem?.closest('[data-dashboard-item-index]');
                          if (card) {
                            const idx = Number(card.getAttribute('data-dashboard-item-index'));
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
                        <GripVertical className="w-4 h-4" />
                      </div>
                    )}

                    {/* Complete Checkbox */}
                    <button
                      onClick={() => onToggleCompleted(item.id, item.is_completed)}
                      className="mt-0.5 text-slate-400 hover:text-emerald-400 transition shrink-0"
                      title="סמן כהושלם"
                    >
                      {item.is_completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-[11px] font-bold text-red-400 bg-red-950/80 px-2 py-0.5 rounded-md border border-red-900/40 font-mono">
                        {item.time_slot}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${CATEGORY_INFO[item.category]?.badgeBg} ${CATEGORY_INFO[item.category]?.badgeText}`}>
                        {CATEGORY_INFO[item.category]?.label}
                      </span>
                    </div>

                    <h5 className={`text-sm font-bold text-white truncate ${item.is_completed ? 'line-through text-slate-400' : ''}`}>
                      {item.title}
                    </h5>

                    {item.title_ja && (
                      <p className="text-xs text-slate-400 font-japanese">{item.title_ja}</p>
                    )}

                    {item.notes && (
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{item.notes}</p>
                    )}
                  </div>

                  {/* Quick Navigation Pin */}
                  <div className="flex flex-col gap-1.5 shrink-0">
                    <a
                      href={
                        item.google_maps_url ||
                        `https://maps.google.com/?q=${encodeURIComponent(item.location_name || item.title)}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                      title="פתח ב-Maps"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>

                    {(item.ticket_info || item.ticket_url) && (
                      <button
                        onClick={() => onOpenTicket(item)}
                        className="p-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 transition"
                        title="כרטיס"
                      >
                        <Ticket className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </React.Fragment>
          );
        })}
        </div>
      </div>
    </div>
  );
};

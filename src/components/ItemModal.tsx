import React, { useState, useEffect } from 'react';
import { ItineraryItem, ItemCategory, TripDay, BookingDeadline, BestTimeOfDay } from '../types';
import { 
  X, 
  Save, 
  Trash2, 
  MapPin, 
  Clock, 
  JapaneseYen, 
  Ticket, 
  Upload, 
  FileText, 
  Image as ImageIcon, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  BellRing,
  ExternalLink,
  Compass
} from 'lucide-react';
import { uploadTripDocument, getDocumentType } from '../lib/storage';
import { enrichAttractionWithAi, calculateEstimatedDeadlineIso } from '../lib/gemini';
import { CityCombobox } from './CityCombobox';
import { AttractionCombobox } from './AttractionCombobox';
import { JapanDestination } from '../lib/japanLocationsData';

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Partial<ItineraryItem>) => void;
  onDelete?: (id: string) => void;
  dayId?: string | null;
  tripId: string;
  itemToEdit?: ItineraryItem | null;
  days?: TripDay[];
  onAddDeadline?: (deadline: Omit<BookingDeadline, 'id'>) => void;
}

export const ItemModal: React.FC<ItemModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  dayId,
  tripId,
  itemToEdit,
  days = [],
  onAddDeadline,
}) => {
  const [title, setTitle] = useState('');
  const [titleJa, setTitleJa] = useState('');
  const [category, setCategory] = useState<ItemCategory>('attraction');
  const [city, setCity] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [locationName, setLocationName] = useState('');
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [ticketInfo, setTicketInfo] = useState('');
  const [ticketUrl, setTicketUrl] = useState('');
  const [costJpy, setCostJpy] = useState<string>('0');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // New Deep Enrichment & Booking Detection State
  const [isEnriching, setIsEnriching] = useState(false);
  const [enrichSuccess, setEnrichSuccess] = useState(false);
  const [enrichError, setEnrichError] = useState<string | null>(null);
  const [district, setDistrict] = useState('');
  const [nearestStation, setNearestStation] = useState('');
  const [estimatedDurationMins, setEstimatedDurationMins] = useState<number | undefined>(undefined);
  const [bestTimeOfDay, setBestTimeOfDay] = useState<BestTimeOfDay>('afternoon');
  const [proTips, setProTips] = useState('');
  const [requiresAdvanceBooking, setRequiresAdvanceBooking] = useState(false);
  const [bookingWindowRule, setBookingWindowRule] = useState('');
  const [estimatedDeadlineIso, setEstimatedDeadlineIso] = useState<string | undefined>(undefined);
  const [addedDeadlineSuccess, setAddedDeadlineSuccess] = useState(false);

  // Find parent day if assigned
  const effectiveDayId = itemToEdit ? itemToEdit.day_id : dayId || null;
  const parentDay = days.find((d) => d.id === effectiveDayId);
  const distinctCities = Array.from(new Set(days.map((d) => d.city).filter(Boolean)));

  useEffect(() => {
    if (itemToEdit) {
      setTitle(itemToEdit.title);
      setTitleJa(itemToEdit.title_ja || '');
      setCategory(itemToEdit.category);
      setCity(itemToEdit.city || parentDay?.city || 'טוקיו');
      setTimeSlot(itemToEdit.time_slot);
      setLocationName(itemToEdit.location_name);
      setGoogleMapsUrl(itemToEdit.google_maps_url || '');
      setNotes(itemToEdit.notes || '');
      setTicketInfo(itemToEdit.ticket_info || '');
      setTicketUrl(itemToEdit.ticket_url || '');
      setCostJpy(itemToEdit.cost_jpy?.toString() || '0');
      setDistrict(itemToEdit.district || '');
      setNearestStation(itemToEdit.nearest_station || '');
      setEstimatedDurationMins(itemToEdit.estimated_duration_mins);
      setBestTimeOfDay(itemToEdit.best_time_of_day || 'afternoon');
      setProTips(itemToEdit.pro_tips || '');
      setRequiresAdvanceBooking(Boolean(itemToEdit.requires_advance_booking));
      setBookingWindowRule(itemToEdit.booking_window_rule || '');
    } else {
      setTitle('');
      setTitleJa('');
      setCategory('attraction');
      setCity(parentDay?.city || (days[0]?.city || 'טוקיו'));
      setTimeSlot('10:00 - 12:00');
      setLocationName('');
      setGoogleMapsUrl('');
      setNotes('');
      setTicketInfo('');
      setTicketUrl('');
      setCostJpy('0');
      setDistrict('');
      setNearestStation('');
      setEstimatedDurationMins(undefined);
      setBestTimeOfDay('afternoon');
      setProTips('');
      setRequiresAdvanceBooking(false);
      setBookingWindowRule('');
      setEstimatedDeadlineIso(undefined);
    }
    setIsEnriching(false);
    setEnrichSuccess(false);
    setEnrichError(null);
    setAddedDeadlineSuccess(false);
  }, [itemToEdit, isOpen, parentDay, days]);

  if (!isOpen) return null;

  // Handle AI Auto-Enrichment
  const handleAutoEnrich = async () => {
    if (!title.trim()) return;

    setIsEnriching(true);
    setEnrichSuccess(false);
    setEnrichError(null);
    setAddedDeadlineSuccess(false);

    try {
      const enriched = await enrichAttractionWithAi(
        title.trim(),
        city || parentDay?.city,
        parentDay?.date
      );

      setTitleJa(enriched.title_ja);
      setCategory(enriched.category);
      if (enriched.city) setCity(enriched.city);
      if (enriched.district) setDistrict(enriched.district);
      if (enriched.nearest_station) setNearestStation(enriched.nearest_station);
      if (enriched.location_name) setLocationName(enriched.location_name);
      if (enriched.google_maps_url) setGoogleMapsUrl(enriched.google_maps_url);
      if (enriched.cost_jpy !== undefined) setCostJpy(enriched.cost_jpy.toString());
      if (enriched.estimated_duration_mins) setEstimatedDurationMins(enriched.estimated_duration_mins);
      if (enriched.best_time_of_day) setBestTimeOfDay(enriched.best_time_of_day);
      if (enriched.pro_tips) setProTips(enriched.pro_tips);
      if (enriched.notes && !notes) setNotes(enriched.notes);
      if (enriched.booking_url && !ticketUrl) setTicketUrl(enriched.booking_url);

      // Advance booking detection
      setRequiresAdvanceBooking(enriched.requires_advance_booking);
      if (enriched.booking_window_rule) setBookingWindowRule(enriched.booking_window_rule);
      if (enriched.estimated_deadline_iso) setEstimatedDeadlineIso(enriched.estimated_deadline_iso);

      // Auto-set time slot based on best time of day and duration
      if (!itemToEdit || timeSlot === 'כל היום' || timeSlot === 'גמיש') {
        const dur = enriched.estimated_duration_mins || 90;
        if (enriched.best_time_of_day === 'sunset') {
          setTimeSlot('16:30 - 18:00');
        } else if (enriched.best_time_of_day === 'morning') {
          setTimeSlot('09:00 - 11:00');
        } else if (enriched.best_time_of_day === 'evening' || enriched.best_time_of_day === 'night') {
          setTimeSlot('18:30 - 20:30');
        } else {
          setTimeSlot(dur >= 180 ? '13:00 - 16:30' : '14:00 - 15:30');
        }
      }

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

  // Handle Autocomplete Selection from Japan Destinations Database
  const handleSelectDestination = (dest: JapanDestination) => {
    setTitle(dest.nameHe);
    setTitleJa(`${dest.nameJa} (${dest.romaji})`);
    setCategory(dest.category);
    setCity(dest.city); // Real city (e.g. Himeji, Kyoto, Osaka, etc.) - never default to Tokyo!
    setDistrict(dest.district || '');
    setNearestStation(dest.nearest_station || '');
    setLocationName(`${dest.nameEn}, ${dest.cityEn || dest.city}`);
    setGoogleMapsUrl(dest.google_maps_url || '');
    setCostJpy(dest.cost_jpy.toString());
    setEstimatedDurationMins(dest.estimated_duration_mins);
    setBestTimeOfDay(dest.best_time_of_day);
    setProTips(dest.pro_tips || '');
    if (!notes && dest.notes) setNotes(dest.notes);
    if (dest.booking_url && !ticketUrl) setTicketUrl(dest.booking_url);

    // Advance booking detection
    setRequiresAdvanceBooking(dest.requires_advance_booking);
    if (dest.booking_window_rule) setBookingWindowRule(dest.booking_window_rule);

    if (dest.requires_advance_booking) {
      const deadlineIso = calculateEstimatedDeadlineIso(dest.booking_window_rule, parentDay?.date);
      setEstimatedDeadlineIso(deadlineIso);
    }

    // Auto-set time slot based on best time of day and duration
    if (!itemToEdit || timeSlot === 'כל היום' || timeSlot === 'גמיש') {
      const dur = dest.estimated_duration_mins || 90;
      if (dest.best_time_of_day === 'sunset') {
        setTimeSlot('16:30 - 18:00');
      } else if (dest.best_time_of_day === 'morning') {
        setTimeSlot('09:00 - 11:00');
      } else if (dest.best_time_of_day === 'evening' || dest.best_time_of_day === 'night') {
        setTimeSlot('18:30 - 20:30');
      } else {
        setTimeSlot(dur >= 180 ? '13:00 - 16:30' : '14:00 - 15:30');
      }
    }

    setEnrichSuccess(true);
    setTimeout(() => setEnrichSuccess(false), 3000);
  };

  // Add reminder to Deadlines tab
  const handleAddBookingReminder = () => {
    if (!onAddDeadline) return;

    const targetDate = estimatedDeadlineIso || parentDay?.date || '2027-09-18T10:00:00Z';

    onAddDeadline({
      trip_id: tripId,
      title: `הזמנת כרטיסים: ${title.trim()}`,
      title_ja: titleJa || undefined,
      target_date: targetDate,
      category: category,
      description: `${bookingWindowRule || 'נדרשת הזמנת כרטיסים מראש'}. יעד: ${title.trim()} (${city}). ${proTips ? `טיפ: ${proTips}` : ''}`,
      booking_url: ticketUrl || googleMapsUrl || undefined,
      is_booked: false,
    });

    setAddedDeadlineSuccess(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    let mapsUrl = googleMapsUrl.trim();
    if (!mapsUrl && locationName) {
      mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(locationName + ' ' + (city || ''))}`;
    }

    onSave({
      ...(itemToEdit ? { id: itemToEdit.id } : {}),
      trip_id: tripId,
      day_id: effectiveDayId,
      city: city.trim() || parentDay?.city || 'טוקיו',
      title: title.trim(),
      title_ja: titleJa.trim() || undefined,
      category,
      time_slot: timeSlot.trim() || 'כל היום',
      location_name: locationName.trim() || title.trim(),
      google_maps_url: mapsUrl || undefined,
      notes: notes.trim() || undefined,
      ticket_info: ticketInfo.trim() || undefined,
      ticket_url: ticketUrl.trim() || undefined,
      cost_jpy: parseInt(costJpy, 10) || 0,
      is_completed: itemToEdit ? itemToEdit.is_completed : false,
      order_index: itemToEdit ? itemToEdit.order_index : 99,
      // Enriched fields
      estimated_duration_mins: estimatedDurationMins,
      best_time_of_day: bestTimeOfDay,
      district: district.trim() || undefined,
      nearest_station: nearestStation.trim() || undefined,
      pro_tips: proTips.trim() || undefined,
      requires_advance_booking: requiresAdvanceBooking,
      booking_window_rule: bookingWindowRule.trim() || undefined,
    });
    onClose();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);
    setUploadMessage(null);

    try {
      const result = await uploadTripDocument(file, 'tickets');
      setTicketUrl(result.url);
      setUploadMessage(result.isOffline ? 'הקובץ נשמר מקומית (Offline)' : 'הקובץ הועלה בהצלחה!');
      setTimeout(() => setUploadMessage(null), 3000);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'שגיאה בהעלאת הקובץ');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-full sm:max-w-xl bg-slate-900 border-t sm:border border-slate-800 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[92dvh] sm:h-auto sm:max-h-[92vh] box-border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-800 bg-slate-950/80 gap-2 shrink-0">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center font-bold text-xs shrink-0">
              <Compass className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-sm sm:text-base text-white truncate">
                {itemToEdit ? 'עריכת נקודת עניין' : 'הוספת נקודת עניין / אטרקציה'}
              </h3>
              <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">
                {parentDay ? `יום ${parentDay.day_number} (${parentDay.city}) · ${parentDay.date}` : 'אטרקציה בקטלוג ללא שיבוץ'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition shrink-0"
            title="סגור"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 touch-scroll">
          {/* Title Hebrew & AI Auto-Enrich Button */}
          <div>
            <div className="flex items-center justify-between mb-1.5 gap-2">
              <label className="block text-xs font-semibold text-slate-300">
                שם האטרקציה / היעד *
              </label>
              <button
                type="button"
                onClick={handleAutoEnrich}
                disabled={isEnriching || !title.trim()}
                className="flex items-center gap-1.5 text-[11px] font-bold text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 px-2.5 py-1 rounded-xl transition active:scale-95 disabled:opacity-40 disabled:pointer-events-none shadow-sm shrink-0"
                title="ניתוח עמוק באמצעות Gemini: שם ביפנית, רובע, תחנה, משך ביקור ובדיקת צורך בהזמנה מראש"
              >
                {isEnriching ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                    <span>מעשיר נתונים ב-AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>✨ העשר בעזרת AI</span>
                  </>
                )}
              </button>
            </div>

            <AttractionCombobox
              value={title}
              onChange={setTitle}
              onSelectDestination={handleSelectDestination}
              onTriggerAiEnrich={handleAutoEnrich}
              isEnriching={isEnriching}
              placeholder="הקלד כל יעד בתאילנד (למשל: איי פי פי, שמורת פילים, אנג תונג, אייקון סיאם...)"
              required
            />

            {enrichSuccess && (
              <p className="text-[11px] text-emerald-400 font-bold mt-1 flex items-center gap-1 animate-fadeIn">
                <CheckCircle2 className="w-3 h-3" />
                <span>הנתונים הועשרו בהצלחה על ידי ה-AI!</span>
              </p>
            )}

            {enrichError && (
              <div className="p-2.5 rounded-xl bg-amber-950/60 border border-amber-500/50 text-amber-200 text-xs flex items-center gap-2 mt-2 animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                <span>{enrichError}</span>
              </div>
            )}
          </div>

          {/* Advance Booking Alert Card (Automated Detection) */}
          {requiresAdvanceBooking && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/60 via-amber-900/30 to-amber-950/60 border border-amber-500/50 space-y-2.5 animate-fadeIn shadow-lg">
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Ticket className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <span>נדרשת הזמנת כרטיסים מראש! 🎟️</span>
                  </h5>
                  <p className="text-[11px] text-slate-200 mt-0.5 leading-relaxed">
                    {bookingWindowRule || 'כרטיסים לאטרקציה זו אוזלים במהירות ויש להזמינם מראש.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-amber-800/40 flex-wrap">
                {addedDeadlineSuccess ? (
                  <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded-xl">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>נוספה תזכורת ללוח ההזמנות!</span>
                  </span>
                ) : onAddDeadline ? (
                  <button
                    type="button"
                    onClick={handleAddBookingReminder}
                    className="flex items-center gap-1.5 text-[11px] font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 px-3 py-1.5 rounded-xl transition shadow-md active:scale-95"
                  >
                    <BellRing className="w-3.5 h-3.5" />
                    <span>+ הוסף תזכורת ללוח הזמנות מראש</span>
                  </button>
                ) : null}

                {ticketUrl && (
                  <a
                    href={ticketUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-amber-300 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <span>אתר הזמנות רשמי</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Thai / English Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              שם בתאית / אנגלית
            </label>
            <input
              type="text"
              placeholder="למשל: หมู่เกาะพีพี (Phi Phi Islands) / ICONSIAM"
              value={titleJa}
              onChange={(e) => setTitleJa(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-red-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition font-japanese dir-ltr text-left"
            />
          </div>

          {/* Dynamic City Selector & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                עיר / אי
              </label>
              <CityCombobox
                value={city}
                onChange={setCity}
                existingCities={distinctCities}
                placeholder="בחר פוקט, קוסמוי או בנגקוק..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                חוף / שכונה / אזור
              </label>
              <input
                type="text"
                placeholder="למשל: חוף צ'אוונג, פטונג, סיאם..."
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-red-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition"
              />
            </div>
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              קטגוריה
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'attraction', label: '🏝️ אטרקציה' },
                { id: 'food', label: '🍜 אוכל' },
                { id: 'transport', label: '✈️ תחבורה/טיסה' },
                { id: 'activity', label: '🐘 פעילות/שייט' },
                { id: 'shopping', label: '🛍️ קניות' },
                { id: 'hotel', label: '🏨 מלון/ריזורט' },
              ].map((c) => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => setCategory(c.id as ItemCategory)}
                  className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition ${
                    category === c.id
                      ? 'bg-red-500/20 text-red-300 border-red-500/60 shadow-sm'
                      : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:bg-slate-850'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Time Slot, Cost & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                שעות מתוכננות
              </label>
              <div className="relative">
                <Clock className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3" />
                <input
                  type="text"
                  placeholder="09:00 - 11:30"
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-red-500 rounded-xl pr-8 pl-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                משך ביקור משוער (דק')
              </label>
              <input
                type="number"
                placeholder="90"
                value={estimatedDurationMins || ''}
                onChange={(e) => setEstimatedDurationMins(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-red-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                עלות משוערת בבאט (฿)
              </label>
              <div className="relative">
                <JapaneseYen className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3" />
                <input
                  type="number"
                  placeholder="0"
                  value={costJpy}
                  onChange={(e) => setCostJpy(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-red-500 rounded-xl pr-8 pl-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition"
                />
              </div>
            </div>
          </div>

          {/* Location & Nearest Station */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                שם המיקום / יעד בגוגל מפות
              </label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3" />
                <input
                  type="text"
                  placeholder="למשל: Patong Beach, Fisherman's Village, ICONSIAM"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-red-500 rounded-xl pr-8 pl-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                מזח / תחנת BTS / נקודת איסוף
              </label>
              <input
                type="text"
                placeholder="למשל: איסוף מהמלון / BTS Siam / Rassada Pier"
                value={nearestStation}
                onChange={(e) => setNearestStation(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-red-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition"
              />
            </div>
          </div>

          {/* Pro Tips from AI */}
          {proTips && (
            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl text-xs text-slate-300 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-japan-sakura shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block mb-0.5">טיפים בשטח (AI):</span>
                <p className="text-[11px] text-slate-300 leading-relaxed">{proTips}</p>
              </div>
            </div>
          )}

          {/* Ticket Info & URL & Document Upload */}
          <div className="p-3.5 bg-slate-950/70 rounded-2xl border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <div className="flex items-center gap-1.5">
                <Ticket className="w-4 h-4 text-red-400" />
                <span>פרטי כרטיס ומסמך כניסה (PDF / תמונה)</span>
              </div>
              {ticketUrl && (
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  מצורף מסמך/קישור
                </span>
              )}
            </div>

            <input
              type="text"
              placeholder="מס' הזמנה / קוד שובר (למשל: #TK-88319 או קוד כניסה)"
              value={ticketInfo}
              onChange={(e) => setTicketInfo(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
            />

            {/* File Upload Zone */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white border border-dashed border-slate-700 hover:border-red-500/70 rounded-xl text-xs font-bold cursor-pointer transition">
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-red-400" />
                      <span>מעלה קובץ ל-Supabase...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 text-red-400" />
                      <span>העלה כרטיס או שובר</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept=".pdf,image/png,image/jpeg,image/jpg,image/webp"
                    onChange={handleFileChange}
                    disabled={isUploading}
                    className="hidden"
                  />
                </label>

                {ticketUrl && (
                  <button
                    type="button"
                    onClick={() => setTicketUrl('')}
                    className="p-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 rounded-xl border border-rose-900/50 text-xs transition"
                    title="הסר קובץ/קישור"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {uploadMessage && (
                <p className="text-[11px] text-emerald-400 font-medium">{uploadMessage}</p>
              )}
              {uploadError && (
                <p className="text-[11px] text-rose-400 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {uploadError}
                </p>
              )}

              {ticketUrl && (
                <div className="p-2.5 bg-slate-900/90 rounded-xl border border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 truncate">
                    {getDocumentType(ticketUrl) === 'image' ? (
                      <ImageIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <FileText className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                    <span className="text-xs text-slate-200 truncate font-mono">
                      {ticketUrl.startsWith('data:') ? 'קובץ שמור מקומית (Offline)' : ticketUrl.split('/').pop()}
                    </span>
                  </div>

                  <a
                    href={ticketUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 text-[11px] text-japan-red hover:underline font-bold px-2 py-0.5 rounded bg-japan-red/10"
                  >
                    צפייה בקובץ
                  </a>
                </div>
              )}

              <input
                type="url"
                placeholder="או הדבק קישור ישיר לכרטיס (https://...)"
                value={ticketUrl}
                onChange={(e) => setTicketUrl(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-[11px] text-white placeholder-slate-500 focus:outline-none dir-ltr text-left"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              פתקים והנחיות שטח
            </label>
            <textarea
              rows={3}
              placeholder="טיפ מהאחים, שעות פתיחה, הנחיות הגעה, הזמנת מקום..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-red-500 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none transition resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-between gap-3">
            {itemToEdit && onDelete && (
              <button
                type="button"
                onClick={() => {
                  onDelete(itemToEdit.id);
                  onClose();
                }}
                className="p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl border border-red-500/30 transition flex items-center gap-1.5 text-xs font-bold"
              >
                <Trash2 className="w-4 h-4" />
                <span>מחק</span>
              </button>
            )}

            <div className="flex items-center gap-2 mr-auto">
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
              >
                ביטול
              </button>
              <button
                type="submit"
                className="py-2.5 px-6 bg-gradient-to-r from-japan-red to-rose-600 hover:opacity-95 text-white rounded-xl text-xs font-bold shadow-lg transition active:scale-95 flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>שמור שינויים</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

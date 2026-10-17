import React, { useState, useEffect } from 'react';
import { TripDay } from '../types';
import { X, Save, Building2, Phone, FileText, Globe, ExternalLink, Upload, Loader2, CheckCircle2 } from 'lucide-react';
import { uploadTripDocument } from '../lib/storage';
import { CityCombobox } from './CityCombobox';

interface DayModalProps {
  isOpen: boolean;
  onClose: () => void;
  day: TripDay | null;
  onSaveDay: (updatedDay: TripDay, applyHotelToSameCity?: boolean) => void;
  existingCities?: string[];
}

export const DayModal: React.FC<DayModalProps> = ({
  isOpen,
  onClose,
  day,
  onSaveDay,
  existingCities = [],
}) => {
  const [city, setCity] = useState('');
  const [cityJa, setCityJa] = useState('');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [hotelName, setHotelName] = useState('');
  const [hotelNameJa, setHotelNameJa] = useState('');
  const [hotelAddressEn, setHotelAddressEn] = useState('');
  const [hotelAddressJa, setHotelAddressJa] = useState('');
  const [hotelPhone, setHotelPhone] = useState('');
  const [hotelBookingRef, setHotelBookingRef] = useState('');
  const [hotelMapsUrl, setHotelMapsUrl] = useState('');
  const [applyHotelToCity, setApplyHotelToCity] = useState(true);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [uploadMsg, setUploadMsg] = useState<string | null>(null);

  useEffect(() => {
    if (day) {
      setCity(day.city || '');
      setCityJa(day.city_ja || '');
      setTitle(day.title || '');
      setNotes(day.notes || '');
      setHotelName(day.hotel_name || '');
      setHotelNameJa(day.hotel_name_ja || '');
      setHotelAddressEn(day.hotel_address_en || '');
      setHotelAddressJa(day.hotel_address_ja || '');
      setHotelPhone(day.hotel_phone || '');
      setHotelBookingRef(day.hotel_booking_ref || '');
      setHotelMapsUrl(day.hotel_maps_url || '');
    }
  }, [day, isOpen]);

  if (!isOpen || !day) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!city.trim() || !title.trim()) return;

    let mapsUrl = hotelMapsUrl.trim();
    if (!mapsUrl && hotelName) {
      mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(hotelAddressJa || hotelName)}`;
    }

    const updated: TripDay = {
      ...day,
      city: city.trim(),
      city_ja: cityJa.trim() || undefined,
      title: title.trim(),
      notes: notes.trim() || undefined,
      hotel_name: hotelName.trim() || undefined,
      hotel_name_ja: hotelNameJa.trim() || undefined,
      hotel_address_en: hotelAddressEn.trim() || undefined,
      hotel_address_ja: hotelAddressJa.trim() || undefined,
      hotel_phone: hotelPhone.trim() || undefined,
      hotel_booking_ref: hotelBookingRef.trim() || undefined,
      hotel_maps_url: mapsUrl || undefined,
    };

    onSaveDay(updated, applyHotelToCity);
    onClose();
  };

  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingDoc(true);
    setUploadMsg(null);
    try {
      const result = await uploadTripDocument(file, 'hotels');
      setHotelBookingRef(result.url);
      setUploadMsg(result.isOffline ? 'הקובץ נשמר מקומית' : 'הקובץ הועלה בהצלחה!');
      setTimeout(() => setUploadMsg(null), 3000);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'שגיאה בהעלאה');
    } finally {
      setIsUploadingDoc(false);
      e.target.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-full sm:max-w-xl bg-slate-900 border-t sm:border border-slate-800 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[90dvh] sm:h-auto sm:max-h-[92vh] box-border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-800 bg-slate-950/80 gap-2 shrink-0">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center font-bold text-xs shrink-0">
              יום {day.day_number}
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-sm sm:text-base text-white truncate">עריכת פרטי יום ומלון</h3>
              <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">{day.date} · {day.city}</p>
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
          {/* Section 1: City & Title */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-red-400 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" />
              <span>יעד וכותרת היום</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  שם העיר / אי (עברית) *
                </label>
                <CityCombobox
                  value={city}
                  onChange={(val) => setCity(val)}
                  onSelectCityJa={(ja) => setCityJa(ja)}
                  existingCities={existingCities}
                  placeholder="פוקט, קוסמוי או בנגקוק..."
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  שם העיר בתאית / אנגלית (אופציונלי)
                </label>
                <input
                  type="text"
                  placeholder="למשל: ภูเก็ต (Phuket) / กรุงเทพฯ"
                  value={cityJa}
                  onChange={(e) => setCityJa(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-red-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition font-japanese dir-ltr text-left"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                כותרת היום במסלול *
              </label>
              <input
                type="text"
                required
                placeholder="למשל: שייט לאיי פי פי או טיסה לקוסמוי"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-red-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                פתקים וטיפים ליום זה
              </label>
              <textarea
                rows={2}
                placeholder="הערות למשפחה, שעות איסוף מהמלון, כרטיסים..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-red-500 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none transition resize-none"
              />
            </div>
          </div>

          {/* Section 2: Hotel Details for Taxi Card */}
          <div className="pt-3 border-t border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                <span>פרטי מלון / ריזורט לכרטיס מונית</span>
              </h4>
              <span className="text-[10px] text-slate-400 font-japanese">ข้อมูลโรงแรม</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  שם המלון (אנגלית / עברית)
                </label>
                <input
                  type="text"
                  placeholder="JW Marriott Phuket Resort & Spa"
                  value={hotelName}
                  onChange={(e) => setHotelName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  שם המלון בתאית (להצגה לנהג!)
                </label>
                <input
                  type="text"
                  placeholder="เจดับบลิว แมริออท ภูเก็ต รีสอร์ท"
                  value={hotelNameJa}
                  onChange={(e) => setHotelNameJa(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition font-japanese dir-ltr text-left"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                כתובת בתאית (תוצג לנהג מונית / טוק-טוק)
              </label>
              <input
                type="text"
                placeholder="231 ตำบลไม้ขาว อำเภอถลาง ภูเก็ต 83110"
                value={hotelAddressJa}
                onChange={(e) => setHotelAddressJa(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition font-japanese dir-ltr text-left"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                כתובת באנגלית (אופציונלי)
              </label>
              <input
                type="text"
                placeholder="231 Mai Khao, Thalang District, Phuket 83110"
                value={hotelAddressEn}
                onChange={(e) => setHotelAddressEn(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition dir-ltr text-left"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-emerald-400" />
                  <span>טלפון המלון</span>
                </label>
                <input
                  type="text"
                  placeholder="+66 76-338-000"
                  value={hotelPhone}
                  onChange={(e) => setHotelPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition font-mono dir-ltr text-left"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                    <FileText className="w-3 h-3 text-slate-400" />
                    <span>הזמנה / שובר מלון</span>
                  </label>
                  <label className="text-[11px] text-indigo-400 hover:text-indigo-300 cursor-pointer flex items-center gap-1">
                    {isUploadingDoc ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Upload className="w-3 h-3" />
                    )}
                    <span>{isUploadingDoc ? 'מעלה...' : 'העלה מסמך/שובר'}</span>
                    <input
                      type="file"
                      accept=".pdf,image/png,image/jpeg,image/jpg,image/webp"
                      onChange={handleDocUpload}
                      disabled={isUploadingDoc}
                      className="hidden"
                    />
                  </label>
                </div>
                <input
                  type="text"
                  placeholder="מספר הזמנה או קישור לשובר"
                  value={hotelBookingRef}
                  onChange={(e) => setHotelBookingRef(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition font-mono"
                />
                {uploadMsg && (
                  <p className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    {uploadMsg}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1">
                <ExternalLink className="w-3 h-3 text-slate-400" />
                <span>קישור ישיר ל-Google Maps של המלון</span>
              </label>
              <input
                type="url"
                placeholder="https://maps.google.com/?q=..."
                value={hotelMapsUrl}
                onChange={(e) => setHotelMapsUrl(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition font-mono dir-ltr text-left"
              />
            </div>

            {/* Checkbox: apply hotel details to all days in the same city */}
            <div className="pt-1">
              <label className="flex items-center gap-2 p-2.5 bg-indigo-950/30 border border-indigo-900/40 rounded-xl cursor-pointer hover:bg-indigo-950/50 transition">
                <input
                  type="checkbox"
                  checked={applyHotelToCity}
                  onChange={(e) => setApplyHotelToCity(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded bg-slate-900 border-slate-700 focus:ring-0 cursor-pointer"
                />
                <span className="text-xs text-indigo-200 font-medium">
                  החל מלון זה על כל שאר ימי השהייה ב{city || 'אותה עיר'}
                </span>
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-2 flex items-center justify-end gap-2">
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
              <span>שמור פרטי יום</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

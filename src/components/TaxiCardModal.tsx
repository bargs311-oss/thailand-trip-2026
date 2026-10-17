import React, { useState } from 'react';
import { TripDay } from '../types';
import { X, Copy, Check, Phone, MapPin, ExternalLink, Sun } from 'lucide-react';

interface TaxiCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  day: TripDay;
}

export const TaxiCardModal: React.FC<TaxiCardModalProps> = ({
  isOpen,
  onClose,
  day,
}) => {
  const [copied, setCopied] = useState(false);
  const [highContrast, setHighContrast] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    const textToCopy = `${day.hotel_name_ja || day.hotel_name}\n${day.hotel_address_ja || day.hotel_address_en}\nTEL: ${day.hotel_phone || ''}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div 
        className={`w-full max-w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 border box-border max-h-[92dvh] sm:max-h-none overflow-y-auto touch-scroll ${
          highContrast 
            ? 'bg-white text-black border-yellow-400 ring-4 ring-yellow-400' 
            : 'bg-slate-900 text-white border-t sm:border border-slate-700'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header / Mode Switcher */}
        <div className={`flex items-center justify-between px-5 py-3.5 border-b ${
          highContrast ? 'border-neutral-200 bg-neutral-100' : 'border-slate-800 bg-slate-950/80'
        }`}>
          <div className="flex items-center gap-2">
            <span className="text-xl">🚕</span>
            <div>
              <h3 className={`font-bold text-sm ${highContrast ? 'text-black' : 'text-white'}`}>
                כרטיס נהג מונית / טוק-טוק בתאית
              </h3>
              <p className={`text-[11px] ${highContrast ? 'text-neutral-600' : 'text-slate-400'}`}>
                {day.city} · יום {day.day_number}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* High Contrast / Night Mode Toggle */}
            <button
              onClick={() => setHighContrast(!highContrast)}
              className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition ${
                highContrast
                  ? 'bg-black text-white hover:bg-neutral-800'
                  : 'bg-yellow-500/10 text-yellow-300 border border-yellow-500/30 hover:bg-yellow-500/20'
              }`}
              title="מצב קריאות גבוהה / ניגודיות מלאה"
            >
              <Sun className="w-4 h-4" />
              <span className="text-[11px] font-bold">
                {highContrast ? 'מצב רגיל' : 'מסך בהיר לנהג'}
              </span>
            </button>

            <button
              onClick={onClose}
              className={`p-1.5 rounded-lg transition ${
                highContrast ? 'text-neutral-500 hover:text-black hover:bg-neutral-200' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* The Taxi Card Content: Designed specifically to be shown to Thai Taxi / Grab / Tuk-Tuk Drivers */}
        <div className="p-6 text-center space-y-5">
          {/* Polite Driver Header in Thai */}
          <div className={`py-2.5 px-3 rounded-xl border ${
            highContrast
              ? 'bg-yellow-100 text-yellow-950 border-yellow-300 font-bold'
              : 'bg-teal-950/50 text-teal-200 border-teal-800/50'
          }`}>
            <p className="text-sm font-semibold tracking-wide">
              พี่ครับ/ค่ะ ช่วยไปส่งที่โรงแรมนี้หน่อยครับ (กรุณาเปิดมิเตอร์)
            </p>
            <p className="text-[11px] opacity-80 mt-0.5">
              (נהג יקר, בבקשה קח אותנו למלון זה • נא להפעיל מונה)
            </p>
          </div>

          {/* Hotel Name in Big Thai / English */}
          <div>
            <span className={`text-[11px] font-bold uppercase tracking-wider block mb-1 ${
              highContrast ? 'text-neutral-600' : 'text-slate-400'
            }`}>
              שם המלון / โรงแรมจุดหมาย
            </span>
            <div className={`text-2xl sm:text-3xl font-extrabold tracking-tight font-japanese leading-tight ${
              highContrast ? 'text-black' : 'text-white'
            }`}>
              {day.hotel_name_ja || day.hotel_name}
            </div>
            {day.hotel_name_ja && (
              <p className={`text-sm mt-1 font-medium ${
                highContrast ? 'text-neutral-700' : 'text-slate-300'
              }`}>
                {day.hotel_name}
              </p>
            )}
          </div>

          {/* Hotel Address in Large Thai/English */}
          <div className={`p-4 rounded-2xl border text-right ${
            highContrast
              ? 'bg-neutral-50 border-neutral-300'
              : 'bg-slate-950/80 border-slate-800'
          }`}>
            <div className="flex items-start gap-2.5">
              <MapPin className="w-5 h-5 text-japan-red shrink-0 mt-0.5" />
              <div className="w-full">
                <span className={`text-[10px] font-bold block mb-1 ${
                  highContrast ? 'text-neutral-500' : 'text-slate-400'
                }`}>
                  כתובת בתאית / אנגלית (לניווט):
                </span>
                <p className={`text-lg sm:text-xl font-bold leading-relaxed font-japanese dir-ltr text-left ${
                  highContrast ? 'text-black' : 'text-slate-100'
                }`}>
                  {day.hotel_address_ja || 'ประเทศไทย (Thailand)'}
                </p>
                <p className={`text-xs mt-1 text-left dir-ltr ${
                  highContrast ? 'text-neutral-600' : 'text-slate-400'
                }`}>
                  {day.hotel_address_en}
                </p>
              </div>
            </div>
          </div>

          {/* Hotel Phone Number */}
          {day.hotel_phone && (
            <div className={`p-3 rounded-2xl border flex items-center justify-between ${
              highContrast
                ? 'bg-neutral-50 border-neutral-300'
                : 'bg-slate-950/80 border-slate-800'
            }`}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="text-right">
                  <span className={`text-[10px] font-bold block ${
                    highContrast ? 'text-neutral-500' : 'text-slate-400'
                  }`}>
                    טלפון המלון (לבירור הגעה של הנהג):
                  </span>
                  <a 
                    href={`tel:${day.hotel_phone}`}
                    className={`font-mono text-base font-bold dir-ltr ${
                      highContrast ? 'text-black hover:underline' : 'text-emerald-400'
                    }`}
                  >
                    {day.hotel_phone}
                  </a>
                </div>
              </div>

              {day.hotel_booking_ref && (
                <div className="text-left">
                  <span className={`text-[10px] font-bold block ${
                    highContrast ? 'text-neutral-500' : 'text-slate-400'
                  }`}>
                    מס' הזמנה:
                  </span>
                  <span className="font-mono text-xs font-semibold text-slate-300">
                    {day.hotel_booking_ref}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons: Copy Address & Open Maps */}
          <div className="grid grid-cols-2 gap-2.5 pt-2">
            <button
              onClick={handleCopy}
              className={`flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl font-bold text-xs transition active:scale-95 ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : highContrast
                  ? 'bg-black text-white hover:bg-neutral-800'
                  : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>הועתק בהצלחה!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>העתק כתובת מלאה</span>
                </>
              )}
            </button>

            {day.hotel_maps_url ? (
              <a
                href={day.hotel_maps_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-japan-red to-rose-600 text-white shadow hover:opacity-95 transition active:scale-95"
              >
                <ExternalLink className="w-4 h-4" />
                <span>נווט ב-Google Maps</span>
              </a>
            ) : (
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent((day.hotel_address_ja || day.hotel_name) ?? '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-japan-red to-rose-600 text-white shadow hover:opacity-95 transition active:scale-95"
              >
                <ExternalLink className="w-4 h-4" />
                <span>פתח ב-Google Maps</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

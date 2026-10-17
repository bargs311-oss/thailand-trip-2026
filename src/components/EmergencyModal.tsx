import React, { useState, useEffect } from 'react';
import { 
  X, 
  PhoneCall, 
  ShieldAlert, 
  UtensilsCrossed, 
  Copy, 
  Check, 
  Save, 
  Maximize2, 
  Minimize2,
  Building2,
  AlertTriangle,
  FileText,
  Plus
} from 'lucide-react';
import { EmergencyInfo, UserProfiles } from '../types';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfiles?: UserProfiles;
}

const STORAGE_KEY_EMERGENCY = 'thaitrip_emergency_info';

const INITIAL_EMERGENCY_INFO: EmergencyInfo = {
  insurance_company: 'פספורטכארד / הראל חו"ל',
  insurance_policy: 'THAI-2026-66120',
  insurance_phone: '+972 9-892-0930',
  passport_me: '',
  passport_brother: '',
  passports: ['', '', '', '', '', ''],
  emergency_contact_name: 'משפחה בארץ',
  emergency_contact_phone: '+972 50-000-0000',
  custom_allergies: [],
};

interface DietaryCardData {
  id: string;
  titleHe: string;
  titleEn: string;
  japaneseText: string;
  romaji: string;
  icon: string;
  tagColor: string;
  subNoteHe: string;
}

const DIETARY_PRESETS: DietaryCardData[] = [
  {
    id: 'no_spicy',
    titleHe: 'לא חריף בכלל (ללא צ׳ילי - מותאם למשפחה וילדים)',
    titleEn: 'Not Spicy at All (No Chili Peppers Please)',
    japaneseText: 'กรุณาไม่ใส่พริกเลย ไม่เผ็ดเลยครับ/ค่ะ (ทานเผ็ดไม่ได้เลย)',
    romaji: 'Karuna mai sai prik loei, mai phet loei krap/ka',
    icon: '🌶️🚫',
    tagColor: 'border-rose-500 bg-rose-950/40 text-rose-300',
    subNoteHe: 'חשוב בתאילנד: "קצת חריף" בתאילנד יכול להיות חריף מאוד. כרטיס זה מבקש להכין את המנה ללא פלפל צ׳ילי בכלל.',
  },
  {
    id: 'peanuts',
    titleHe: 'ללא בוטנים או אגוזים (אלרגיה לבוטנים)',
    titleEn: 'No Peanuts or Tree Nuts (Allergy)',
    japaneseText: 'แพ้ถั่วลิสงและถั่วทุกชนิดรุนแรง กรุณาห้ามใส่ถั่วและน้ำมันถั่วเด็ดขาด',
    romaji: 'Phae thua-li-song lae thua thuk cha-nit, ham sai thua det-khat',
    icon: '🥜🚫',
    tagColor: 'border-amber-500 bg-amber-950/40 text-amber-300',
    subNoteHe: 'בפאד תאי, סום טאם ומנות תאילנדיות רבות מוסיפים בוטנים גרוסים מעל או ברוטב — הציגו כרטיס זה מראש.',
  },
  {
    id: 'pork',
    titleHe: 'ללא חזיר או שומן חזיר',
    titleEn: 'No Pork, Bacon or Pork Broth',
    japaneseText: 'ไม่ทานเนื้อหมู เบคอน น้ำมันหมู และน้ำซุปกระดูกหมูครับ/ค่ะ',
    romaji: 'Mai than nuea-mu, be-khon, nam-man-mu lae nam-sup kra-duk-mu',
    icon: '🚫🐖',
    tagColor: 'border-pink-500 bg-pink-950/40 text-pink-300',
    subNoteHe: 'מבקש להחליף בשר חזיר בעוף (Gai), בקר (Nuea), דג (Pla) או טופו, וללא ציר חזיר.',
  },
  {
    id: 'shellfish',
    titleHe: 'ללא פירות ים, שרימפס או צדפות',
    titleEn: 'No Shellfish / Prawns / Crabs / Squid',
    japaneseText: 'แพ้อาหารทะเล (กุ้ง ปู ปลาหมึก หอย) กรุณาไม่ใส่อาหารทะเลและกะปิ',
    romaji: 'Phae a-han tha-le (kung, pu, pla-muek, hoi), mai sai kapi',
    icon: '🦐🚫',
    tagColor: 'border-emerald-500 bg-emerald-950/40 text-emerald-300',
    subNoteHe: 'כולל איסור על שרימפס, סרטנים, קלמרי, צדפות ומחית שרימפס (Kapi).',
  },
];

export const EmergencyModal: React.FC<EmergencyModalProps> = ({ isOpen, onClose, userProfiles }) => {
  const [activeTab, setActiveTab] = useState<'dietary' | 'emergency'>('dietary');
  const [expandedCard, setExpandedCard] = useState<DietaryCardData | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Persistent Emergency Info State
  const [info, setInfo] = useState<EmergencyInfo>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_EMERGENCY);
    return saved ? JSON.parse(saved) : INITIAL_EMERGENCY_INFO;
  });

  const [customAllergyInput, setCustomAllergyInput] = useState('');
  const [isSavedAlert, setIsSavedAlert] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_EMERGENCY, JSON.stringify(info));
  }, [info]);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSaveInfo = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem(STORAGE_KEY_EMERGENCY, JSON.stringify(info));
    setIsSavedAlert(true);
    setTimeout(() => setIsSavedAlert(false), 2500);
  };

  const handleAddCustomAllergy = () => {
    if (!customAllergyInput.trim()) return;
    setInfo((prev) => ({
      ...prev,
      custom_allergies: [...(prev.custom_allergies || []), customAllergyInput.trim()],
    }));
    setCustomAllergyInput('');
  };

  const handleRemoveCustomAllergy = (index: number) => {
    setInfo((prev) => ({
      ...prev,
      custom_allergies: prev.custom_allergies.filter((_, idx) => idx !== index),
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      {/* Fullscreen Waiter High-Contrast Card View */}
      {expandedCard ? (
        <div 
          className="fixed inset-0 z-60 bg-white text-black p-6 sm:p-10 flex flex-col justify-between items-center text-center animate-fadeIn select-none"
          onClick={() => setExpandedCard(null)}
        >
          <div className="w-full flex justify-between items-center border-b-2 border-red-600 pb-3">
            <span className="text-sm font-bold text-red-600 uppercase tracking-widest flex items-center gap-1.5">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span>DIETARY REQUEST / ข้อจำกัดด้านอาหาร</span>
            </span>
            <button
              onClick={() => setExpandedCard(null)}
              className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 rounded-xl text-xs font-black text-slate-800 flex items-center gap-1"
            >
              <Minimize2 className="w-4 h-4" />
              <span>סגור מסך מלא</span>
            </button>
          </div>

          <div className="my-auto max-w-xl space-y-6">
            <div className="text-5xl sm:text-6xl">{expandedCard.icon}</div>
            
            {/* Thai phrase in huge, clear script */}
            <div className="p-6 bg-slate-50 border-4 border-red-600 rounded-3xl shadow-xl">
              <p className="text-2xl sm:text-4xl font-black text-red-700 font-japanese leading-relaxed tracking-wide">
                {expandedCard.japaneseText}
              </p>
              <p className="text-xs sm:text-sm text-slate-600 font-mono mt-3 italic">
                {expandedCard.romaji}
              </p>
            </div>

            <div className="space-y-1">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                {expandedCard.titleHe}
              </h3>
              <p className="text-base text-slate-600 font-bold">
                {expandedCard.titleEn}
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-500 font-bold pb-2">
            הקש בכל מקום על המסך כדי לסגור · แตะเพื่อปิด
          </p>
        </div>
      ) : (
        <div 
          className="bg-slate-900 border-t sm:border border-slate-700/80 rounded-t-3xl sm:rounded-3xl w-full max-w-full sm:max-w-xl overflow-hidden shadow-2xl relative flex flex-col h-[92dvh] sm:h-auto sm:max-h-[92vh] box-border"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-3.5 sm:p-5 bg-gradient-to-r from-red-950 via-slate-900 to-rose-950 border-b border-slate-800 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-red-600/20 text-red-400 flex items-center justify-center font-bold border border-red-500/40 shadow-md shrink-0">
                <ShieldAlert className="w-5 h-5 text-japan-red" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm sm:text-lg font-black text-white truncate">
                  חירום, בריאות וכרטיסי מסעדה בתאילנד
                </h3>
                <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">
                  כרטיסי אוכל בתאית למלצר, משטרת התיירות 1155 וביטוח
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/80 hover:bg-slate-700 transition shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Sub-Tabs: Dietary Cards vs Emergency & Insurance */}
          <div className="grid grid-cols-2 p-1.5 bg-slate-950/80 border-b border-slate-800 text-xs font-bold shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('dietary')}
              className={`py-2 px-2 sm:px-3 rounded-xl transition flex items-center justify-center gap-1.5 text-xs ${
                activeTab === 'dietary'
                  ? 'bg-gradient-to-r from-japan-red to-rose-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span>כרטיסי מסעדה (תאית)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('emergency')}
              className={`py-2 px-2 sm:px-3 rounded-xl transition flex items-center justify-center gap-1.5 text-xs ${
                activeTab === 'emergency'
                  ? 'bg-gradient-to-r from-red-600 to-rose-700 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>מוקדי חירום בתאילנד</span>
            </button>
          </div>

          {/* Tab 1: Dietary & Restaurant Cards in High Contrast Thai */}
          {activeTab === 'dietary' && (
            <div className="p-3.5 sm:p-5 overflow-y-auto space-y-4 text-right flex-1 touch-scroll">
              <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
                <span className="text-base shrink-0">💡</span>
                <p className="leading-relaxed">
                  הציגו כרטיסים אלו למלצרים או בדוכני אוכל בתאילנד. לחיצה על <strong>"הצג למלצר"</strong> פותחת מסך מלא וברור בכתב תאי!
                </p>
              </div>

              <div className="space-y-3">
                {DIETARY_PRESETS.map((card) => (
                  <div
                    key={card.id}
                    className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 hover:border-slate-700 transition space-y-2.5 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{card.icon}</span>
                        <div>
                          <h4 className="text-sm font-bold text-white">{card.titleHe}</h4>
                          <span className="text-[10px] text-slate-400 font-mono">{card.titleEn}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setExpandedCard(card)}
                        className="flex items-center gap-1 py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition shadow-sm"
                        title="הצג בגודל ענק למלצר"
                      >
                        <Maximize2 className="w-3 h-3 text-japan-sakura" />
                        <span>הצג למלצר</span>
                      </button>
                    </div>

                    {/* Thai text snippet */}
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800/80 font-japanese text-sm text-amber-200 leading-relaxed text-right">
                      {card.japaneseText}
                    </div>

                    <p className="text-[11px] text-slate-400">{card.subNoteHe}</p>
                  </div>
                ))}
              </div>

              {/* Custom Allergies Section */}
              <div className="pt-3 border-t border-slate-800 space-y-2.5">
                <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>אלרגיות ורגישויות במשפחה:</span>
                </h4>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="למשל: בוטנים, גלוטן, לקטוז, כוסברה..."
                    value={customAllergyInput}
                    onChange={(e) => setCustomAllergyInput(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 focus:border-red-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomAllergy}
                    className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>הוסף</span>
                  </button>
                </div>

                {info.custom_allergies && info.custom_allergies.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {info.custom_allergies.map((allergy, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 bg-amber-950/60 border border-amber-800/60 text-amber-300 text-xs px-2.5 py-1 rounded-xl"
                      >
                        <span>{allergy}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCustomAllergy(idx)}
                          className="text-amber-400 hover:text-white"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 2: Emergency Dialers, Embassy & Insurance Fields */}
          {activeTab === 'emergency' && (
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-right">
              {/* 1. Quick One-Tap Calling for Thailand Emergency Numbers */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <PhoneCall className="w-3.5 h-3.5 text-japan-red" />
                  <span>מספרי חירום בתאילנד (חיוג בלחיצה אחת):</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {/* Tourist Police 1155 */}
                  <a
                    href="tel:1155"
                    className="p-3 bg-slate-950 border border-blue-500/40 hover:border-blue-500 rounded-2xl flex items-center justify-between gap-2 transition hover:bg-blue-950/20 group"
                  >
                    <div>
                      <span className="text-[10px] text-slate-400 block">משטרת התיירות (אנגלית)</span>
                      <span className="text-xl font-black text-blue-400 font-mono">1155</span>
                    </div>
                    <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <PhoneCall className="w-4 h-4" />
                    </div>
                  </a>

                  {/* Ambulance & Medical 1669 */}
                  <a
                    href="tel:1669"
                    className="p-3 bg-slate-950 border border-red-500/40 hover:border-red-500 rounded-2xl flex items-center justify-between gap-2 transition hover:bg-red-950/20 group"
                  >
                    <div>
                      <span className="text-[10px] text-slate-400 block">אמבולנס ורפואה דחופה</span>
                      <span className="text-xl font-black text-red-400 font-mono">1669</span>
                    </div>
                    <div className="w-8 h-8 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <PhoneCall className="w-4 h-4" />
                    </div>
                  </a>

                  {/* General Police 191 */}
                  <a
                    href="tel:191"
                    className="p-3 bg-slate-950 border border-emerald-500/40 hover:border-emerald-500 rounded-2xl flex items-center justify-between gap-2 transition hover:bg-emerald-950/20 group"
                  >
                    <div>
                      <span className="text-[10px] text-slate-400 block">משטרה מקומית</span>
                      <span className="text-xl font-black text-emerald-400 font-mono">191</span>
                    </div>
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <PhoneCall className="w-4 h-4" />
                    </div>
                  </a>
                </div>
              </div>

              {/* 2. Embassy of Israel in Bangkok */}
              <div className="p-4 bg-slate-950 border border-blue-900/50 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-400" />
                    <h5 className="text-xs font-bold text-white">
                      שגרירות ישראל בבנגקוק (Embassy of Israel Bangkok)
                    </h5>
                  </div>
                  <span className="text-[10px] bg-blue-950 text-blue-300 border border-blue-800/60 px-2 py-0.5 rounded-full">
                    סיוע לאזרחים
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  כתובת: Ocean Tower 2, 25th Floor, 75 Sukhumvit Soi 19, Asok, Bangkok 10110
                </p>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-mono font-bold text-slate-200" dir="ltr">
                    +66 2-204-9200
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleCopy('+6622049200', 'embassy')}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                      title="העתק טלפון"
                    >
                      {copiedKey === 'embassy' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <a
                      href="tel:+6622049200"
                      className="py-1 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1"
                    >
                      <PhoneCall className="w-3 h-3" />
                      <span>חייג לשגרירות</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* 3. Local Insurance & Passport Details Form */}
              <form onSubmit={handleSaveInfo} className="space-y-3 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-indigo-400" />
                    <span>פרטי ביטוח נסיעות ודרכונים (שמורים אופליין):</span>
                  </h4>
                  {isSavedAlert && (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-md animate-fadeIn">
                      נשמר בהצלחה! ✓
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">חברת ביטוח</label>
                    <input
                      type="text"
                      value={info.insurance_company}
                      onChange={(e) => setInfo({ ...info, insurance_company: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">מספר פוליסה</label>
                    <input
                      type="text"
                      value={info.insurance_policy}
                      onChange={(e) => setInfo({ ...info, insurance_policy: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-red-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">טלפון מוקד רפואי ביטוח</label>
                    <input
                      type="text"
                      dir="ltr"
                      value={info.insurance_phone}
                      onChange={(e) => setInfo({ ...info, insurance_phone: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-red-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">איש קשר לחירום בארץ</label>
                    <input
                      type="text"
                      value={info.emergency_contact_phone}
                      onChange={(e) => setInfo({ ...info, emergency_contact_phone: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-red-500 font-mono"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1 truncate">
                      מספר דרכון ({userProfiles?.userAName || 'אח 1'})
                    </label>
                    <input
                      type="text"
                      placeholder="99999999"
                      value={info.passport_me}
                      onChange={(e) => setInfo({ ...info, passport_me: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-red-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1 truncate">
                      מספר דרכון ({userProfiles?.userBName || 'אח 2'})
                    </label>
                    <input
                      type="text"
                      placeholder="88888888"
                      value={info.passport_brother}
                      onChange={(e) => setInfo({ ...info, passport_brother: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-red-500 font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-red-600 to-rose-700 hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>שמור פרטי ביטוח בטלפון</span>
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { getStoredSupabaseConfig, saveSupabaseConfig } from '../lib/supabase';
import { getStoredGeminiApiKey, saveGeminiApiKey } from '../lib/gemini';
import { UserProfiles, DeviceUser } from '../types';
import { X, Database, Check, RefreshCw, Key, Globe, HelpCircle, Sparkles, Users, Smartphone, RotateCcw } from 'lucide-react';

interface SupabaseSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSupabaseConnected: boolean;
  realtimeStatus: string;
  lastSyncedAt: Date | null;
  onRefresh: () => void;
  onClearSchedule?: () => Promise<void> | void;
  userProfiles: UserProfiles;
  onUpdateUserProfiles: (names: { userAName: string; userBName: string; members?: string[] }) => void;
  onSetCurrentDeviceUser: (user: DeviceUser) => void;
}

const DEFAULT_6_MEMBERS = ['אבא', 'אמא', 'בן משפחה 3', 'בן משפחה 4', 'בן משפחה 5', 'בן משפחה 6'];

export const SupabaseSettingsModal: React.FC<SupabaseSettingsModalProps> = ({
  isOpen,
  onClose,
  isSupabaseConnected,
  realtimeStatus,
  lastSyncedAt,
  onRefresh,
  onClearSchedule,
  userProfiles,
  onUpdateUserProfiles,
  onSetCurrentDeviceUser,
}) => {
  const currentConfig = getStoredSupabaseConfig();
  const [url, setUrl] = useState(currentConfig.url);
  const [anonKey, setAnonKey] = useState(currentConfig.anonKey);
  const [geminiKey, setGeminiKey] = useState(getStoredGeminiApiKey());
  const [members, setMembers] = useState<string[]>(
    userProfiles.members && userProfiles.members.length === 6
      ? userProfiles.members
      : DEFAULT_6_MEMBERS
  );
  const [deviceOwner, setDeviceOwner] = useState<DeviceUser>(userProfiles.currentDeviceUser || 'user_1');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMembers(
        userProfiles.members && userProfiles.members.length === 6
          ? userProfiles.members
          : DEFAULT_6_MEMBERS
      );
      setDeviceOwner(userProfiles.currentDeviceUser || 'user_1');
      setGeminiKey(getStoredGeminiApiKey());
    }
  }, [userProfiles, isOpen]);

  if (!isOpen) return null;

  const handleMemberNameChange = (idx: number, val: string) => {
    setMembers((prev) => {
      const next = [...prev];
      next[idx] = val;
      return next;
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedMembers = members.map((m, i) => m.trim() || DEFAULT_6_MEMBERS[i]);
    onUpdateUserProfiles({
      userAName: cleanedMembers[0],
      userBName: cleanedMembers[1],
      members: cleanedMembers,
    });
    onSetCurrentDeviceUser(deviceOwner);
    saveSupabaseConfig(url, anonKey);
    saveGeminiApiKey(geminiKey);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onRefresh();
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-full sm:max-w-lg bg-slate-900 border-t sm:border border-slate-800 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[90dvh] sm:h-auto sm:max-h-[90vh] box-border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-800 bg-slate-950/80 gap-2 shrink-0">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Database className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-sm sm:text-base text-white truncate">הגדרות משפחה וסנכרון ענן</h3>
              <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">סנכרון מיידי בין כל 6 הטלפונים של המשפחה בתאילנד</p>
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

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1 touch-scroll">
          {/* Connection Status Box */}
          <div className={`p-4 rounded-2xl border flex items-center justify-between ${
            isSupabaseConnected
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isSupabaseConnected ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
              <div>
                <p className="text-xs font-bold">
                  {isSupabaseConnected ? `מחובר לענן ThaiTrip (${realtimeStatus})` : 'מצב אופליין / שמירה מקומית'}
                </p>
                <p className="text-[11px] opacity-80">
                  {isSupabaseConnected
                    ? 'כל שינוי מתעדכן בזמן אמת אצל כל 6 בני המשפחה!'
                    : 'האפליקציה שומרת הכל מקומית בטלפון (עובדת מלאה ללא אינטרנט).'}
                </p>
              </div>
            </div>

            {lastSyncedAt && (
              <span className="text-[10px] opacity-70">
                סנכרון: {lastSyncedAt.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="space-y-4">
            {/* 6 Family Member Profiles & Device Switcher Section */}
            <div className="p-4 bg-slate-950/90 rounded-2xl border border-teal-500/40 space-y-3.5 shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-xs">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">6 משתתפי הטיול במשפחה</h4>
                    <p className="text-[10px] text-slate-400">ערכו את שמות 6 בני המשפחה ובחרו מי מחזיק במכשיר זה</p>
                  </div>
                </div>
                <span className="text-[10px] bg-teal-950 text-teal-300 border border-teal-800/60 px-2 py-0.5 rounded-full font-bold">
                  6 משתמשים
                </span>
              </div>

              {/* 6 Name Inputs */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {members.map((memberName, idx) => (
                  <div key={idx}>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-0.5">
                      משתתף {idx + 1}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={`בן משפחה ${idx + 1}`}
                      value={memberName}
                      onChange={(e) => handleMemberNameChange(idx, e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-teal-500 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none"
                    />
                  </div>
                ))}
              </div>

              {/* Who is using this phone selector */}
              <div>
                <label className="block text-[11px] font-bold text-amber-300 mb-1.5 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>מי מחזיק בטלפון זה כעת?</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {members.map((memberName, idx) => {
                    const userKey = `user_${idx + 1}` as DeviceUser;
                    const isSelected = deviceOwner === userKey || (idx === 0 && deviceOwner === 'user_a') || (idx === 1 && deviceOwner === 'user_b');
                    return (
                      <button
                        key={userKey}
                        type="button"
                        onClick={() => setDeviceOwner(userKey)}
                        className={`p-2 rounded-xl border text-right transition flex flex-col justify-between ${
                          isSelected
                            ? 'bg-teal-600/25 border-teal-500 ring-2 ring-teal-500/50 shadow-md'
                            : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-0.5">
                          <span className="text-xs font-black text-white truncate">
                            {memberName.trim() || `משתתף ${idx + 1}`}
                          </span>
                          <span className={`w-2 h-2 rounded-full shrink-0 ${isSelected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-700'}`} />
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {isSelected ? '✓ המכשיר שלי' : 'בחר מכשיר זה'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                <span>Supabase Project URL</span>
              </label>
              <input
                type="url"
                placeholder="https://xyzcompany.supabase.co"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none transition font-mono dir-ltr text-left"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-slate-400" />
                <span>Supabase Anon Public Key</span>
              </label>
              <textarea
                rows={2}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none transition font-mono dir-ltr text-left resize-none"
              />
            </div>

            {/* Gemini API Key for AI Travel Concierge */}
            <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2">
              <label className="block text-xs font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-japan-sakura" />
                <span>Google Gemini API Key (קונסיירז' AI)</span>
              </label>
              <p className="text-[11px] text-slate-400">
                מאפשר לעוזר הטיולים (AI Concierge) לספק המלצות חיות מותאמות אישית. אם מושאר ריק, המערכת תספק המלצות גיבוי חכמות ומובנות מראש.
              </p>
              <input
                type="password"
                placeholder="AIzaSy..."
                value={geminiKey}
                onChange={(e) => {
                  setGeminiKey(e.target.value);
                  saveGeminiApiKey(e.target.value);
                }}
                className="w-full bg-slate-900 border border-slate-800 focus:border-red-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none transition font-mono dir-ltr text-left"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="submit"
                className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition active:scale-95 flex items-center justify-center gap-1.5"
              >
                {savedSuccess ? <Check className="w-4 h-4" /> : <RefreshCw className="w-4 h-4" />}
                <span>{savedSuccess ? 'ההגדרות נשמרו!' : 'שמור והתחבר'}</span>
              </button>
            </div>
          </form>

          {/* Help box */}
          <div className="p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800/80 text-[11px] text-slate-400 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-300">
              <HelpCircle className="w-3.5 h-3.5 text-japan-sakura" />
              <span>כיצד להפעיל מסד נתונים חדש?</span>
            </div>
            <p>
              1. צור פרויקט חינמי ב-supabase.com.
            </p>
            <p>
              2. פתח את SQL Editor והדבק את תוכן הקובץ <code className="text-red-400 bg-slate-900 px-1 py-0.5 rounded">supabase/schema.sql</code>.
            </p>
            <p>
              3. העתק את ה-Project URL וה-anon key לכאן – והאפליקציה תסנכרן בין שניכם אוטומטית!
            </p>
          </div>

          {/* Clear Schedule (Preserves all attractions & hotels into catalogs) */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <div className="p-3 bg-rose-950/20 border border-rose-900/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 font-bold text-xs text-rose-300">
                  <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                  <span>איפוס וריקון שיבוצי הלו"ז</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  מנקה את כל הימים משיבוצים ומחזיר את כל האטרקציות והמלונות לרשימות שלהם (שום יעד לא נמחק!).
                </p>
              </div>

              <button
                type="button"
                disabled={isClearing}
                onClick={async () => {
                  const confirmed = window.confirm(
                    'האם לרוקן את כל הימים בלוח הזמנים?\n\n' +
                    '✓ שום אטרקציה או מלון לא יימחקו!\n' +
                    '✓ כל האטרקציות והמלונות יחזרו למאגר (כאטרקציות גמישות ומלונות שמורים).\n' +
                    '✓ פרטי האחים, הוצאות כספיות וצ\'קליסט נשמרים ללא שינוי.'
                  );
                  if (confirmed && onClearSchedule) {
                    setIsClearing(true);
                    try {
                      await onClearSchedule();
                      onClose();
                    } finally {
                      setIsClearing(false);
                    }
                  }
                }}
                className="px-3.5 py-2 bg-rose-600/25 hover:bg-rose-600/40 border border-rose-500/50 text-rose-200 text-xs font-bold rounded-xl transition active:scale-95 shrink-0 text-center flex items-center justify-center gap-1.5"
              >
                {isClearing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>מרוקן ימים...</span>
                  </>
                ) : (
                  <span>רוקן את הימים בלו"ז</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

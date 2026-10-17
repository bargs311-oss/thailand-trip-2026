import React, { useState } from 'react';
import { ViewMode, UserProfiles } from '../types';
import { 
  CalendarDays, 
  Compass, 
  Coins, 
  Car, 
  Wifi, 
  WifiOff,
  HeartPulse,
  User,
  RefreshCw,
  Map
} from 'lucide-react';

interface HeaderProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  onOpenCurrency: () => void;
  onOpenTaxiCard: () => void;
  onOpenEmergency: () => void;
  onOpenSettings: () => void;
  isSupabaseConnected: boolean;
  realtimeStatus: string;
  userProfiles?: UserProfiles;
  onRefresh?: () => void;
  lastSyncedAt?: Date | null;
}

export const Header: React.FC<HeaderProps> = ({
  viewMode,
  setViewMode,
  onOpenCurrency,
  onOpenTaxiCard,
  onOpenEmergency,
  onOpenSettings,
  isSupabaseConnected,
  realtimeStatus,
  userProfiles,
  onRefresh,
  lastSyncedAt,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshClick = () => {
    setIsRefreshing(true);
    if (onRefresh) {
      onRefresh();
    }
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  return (
    <header 
      className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-lg w-full max-w-full overflow-hidden box-border"
      style={{ paddingTop: 'max(12px, calc(env(safe-area-inset-top, 0px) + 6px))' }}
    >
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-2 sm:py-2.5 w-full box-border">
        {/* Top Bar: Title & Quick Floating Actions */}
        <div className="flex items-center justify-between gap-1.5 sm:gap-2 mb-2 sm:mb-3 w-full">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center shadow-md shadow-teal-900/40 text-base sm:text-lg select-none ring-1 ring-teal-400/30 shrink-0">
              🇹🇭
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-white leading-none truncate">
                  ThaiTrip
                </h1>
                <span className="text-[9px] sm:text-[10px] bg-teal-950/80 text-teal-300 border border-teal-800/60 font-semibold px-1.5 py-0.2 rounded-full shrink-0">
                  משפחה (6)
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium truncate hidden min-[360px]:block">
                פוקט • קוסמוי • בנגקוק (06.11 - 21.11)
              </p>
            </div>
          </div>

          {/* Quick Action Badges */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* Quick Currency Converter */}
            <button
              onClick={onOpenCurrency}
              className="flex items-center justify-center gap-1 p-2 sm:px-2.5 sm:py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-semibold transition active:scale-95 shadow-sm"
              title="ממיר באט/שקל מהיר"
            >
              <Coins className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-amber-400" />
              <span className="hidden sm:inline">ממיר ฿</span>
            </button>

            {/* Quick Taxi Card */}
            <button
              onClick={onOpenTaxiCard}
              className="flex items-center justify-center gap-1 p-2 sm:px-2.5 sm:py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-semibold transition active:scale-95 shadow-sm"
              title="כתובת בתאית לנהג מונית / טוק-טוק"
            >
              <Car className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">מונית</span>
            </button>

            {/* Quick Emergency & Dietary Card Button */}
            <button
              onClick={onOpenEmergency}
              className="flex items-center justify-center gap-1 p-2 sm:px-2.5 sm:py-1.5 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/40 rounded-xl text-xs font-bold transition active:scale-95 shadow-sm"
              title="כרטיס אלרגיות, אוכל ומספרי חירום בתאילנד"
            >
              <HeartPulse className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-rose-400" />
              <span className="hidden sm:inline">חירום</span>
            </button>

            {/* Active Device Profile Switcher Pill */}
            <button
              onClick={onOpenSettings}
              className="flex items-center justify-center gap-1.5 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-bold border transition active:scale-95 shadow-sm shrink-0 bg-teal-500/15 border-teal-500/40 text-teal-300 hover:bg-teal-500/25"
              title="מי מחזיק בטלפון? לחץ להחלפת בן משפחה / עריכת שמות"
            >
              <User className="w-3.5 h-3.5" />
              <span className="max-w-[65px] sm:max-w-none truncate text-[10px] sm:text-xs">
                {(() => {
                  const members = userProfiles?.members || ['אבא', 'אמא', 'בן משפחה 3', 'בן משפחה 4', 'בן משפחה 5', 'בן משפחה 6'];
                  const dev = userProfiles?.currentDeviceUser || 'user_1';
                  const match = dev.match(/^user_([1-6])$/);
                  if (match) return members[parseInt(match[1], 10) - 1] || members[0];
                  if (dev === 'user_b') return members[1] || 'אמא';
                  return members[0] || 'אבא';
                })()}
              </span>
            </button>

            {/* Supabase Status & Instant Sync Refresh Button */}
            <button
              onClick={handleRefreshClick}
              className={`flex items-center justify-center gap-1.5 p-2 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-semibold border transition active:scale-95 shadow-sm ${
                isSupabaseConnected
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-750'
              }`}
              title={
                isSupabaseConnected
                  ? `סנכרון ענן פעיל (${realtimeStatus})${lastSyncedAt ? ` • סנכרון אחרון: ${lastSyncedAt.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}` : ''}. לחץ לרענון נתונים מיידי`
                  : 'שמירה מקומית בטלפון. לחץ לניסיון התחברות מחודש'
              }
            >
              {isRefreshing ? (
                <>
                  <RefreshCw className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-cyan-400 animate-spin" />
                  <span className="hidden md:inline text-[11px] font-bold text-cyan-400">מרענן...</span>
                </>
              ) : isSupabaseConnected ? (
                <>
                  <Wifi className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-emerald-400 animate-pulse" />
                  <span className="hidden md:inline text-[11px] font-bold">מסונכרן</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-slate-400" />
                  <span className="hidden md:inline text-[11px]">מקומי</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* View Mode Switcher (Tab Toggle) */}
        <div className="grid grid-cols-3 p-1 bg-slate-950/70 border border-slate-800/80 rounded-2xl shadow-inner">
          <button
            onClick={() => setViewMode('dashboard')}
            className={`flex items-center justify-center gap-1.5 sm:gap-2 py-2 px-2 sm:px-3 rounded-xl text-xs font-bold transition-all duration-200 ${
              viewMode === 'dashboard'
                ? 'bg-gradient-to-r from-japan-red to-rose-600 text-white shadow-md shadow-red-950'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <Compass className="w-4 h-4 shrink-0" />
            <span className="truncate">מצב שטח</span>
          </button>

          <button
            onClick={() => setViewMode('planning')}
            className={`flex items-center justify-center gap-1.5 sm:gap-2 py-2 px-2 sm:px-3 rounded-xl text-xs font-bold transition-all duration-200 ${
              viewMode === 'planning'
                ? 'bg-gradient-to-r from-japan-red to-rose-600 text-white shadow-md shadow-red-950'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <CalendarDays className="w-4 h-4 shrink-0" />
            <span className="truncate">תכנון לו"ז</span>
          </button>

          <button
            onClick={() => setViewMode('map')}
            className={`flex items-center justify-center gap-1.5 sm:gap-2 py-2 px-2 sm:px-3 rounded-xl text-xs font-bold transition-all duration-200 ${
              viewMode === 'map'
                ? 'bg-gradient-to-r from-japan-red to-rose-600 text-white shadow-md shadow-red-950'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <Map className="w-4 h-4 shrink-0 text-amber-300" />
            <span className="truncate">מפת מסלול</span>
          </button>
        </div>
      </div>
    </header>
  );
};

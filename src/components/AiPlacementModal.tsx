import React from 'react';
import { TripDay, AiPlacementProposal } from '../types';
import { Sparkles, Calendar, Clock, MapPin, Check, X, Loader2, Compass } from 'lucide-react';
import { formatHebrewDate } from '../lib/utils';

interface AiPlacementModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposal: AiPlacementProposal | null;
  isLoading: boolean;
  days: TripDay[];
  itemTitle: string;
  itemTitleJa?: string;
  itemCity?: string;
  onAccept: (proposal: AiPlacementProposal) => void;
}

export const AiPlacementModal: React.FC<AiPlacementModalProps> = ({
  isOpen,
  onClose,
  proposal,
  isLoading,
  days,
  itemTitle,
  itemTitleJa,
  itemCity,
  onAccept,
}) => {
  if (!isOpen) return null;

  const targetDay = proposal
    ? days.find((d) => d.day_number === proposal.recommended_day_number)
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-slate-900 border-t sm:border border-slate-700/80 rounded-t-3xl sm:rounded-3xl w-full max-w-full sm:max-w-lg overflow-hidden shadow-2xl relative flex flex-col h-[90dvh] sm:h-auto sm:max-h-[90vh] box-border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-5 bg-gradient-to-r from-purple-900/60 via-slate-900 to-rose-900/60 border-b border-slate-800 shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/80 hover:bg-slate-700 transition"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-500 to-rose-500 flex items-center justify-center text-white shadow-lg shrink-0">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="text-[11px] font-black tracking-wider uppercase text-purple-300">
                AI Smart Placement
              </span>
              <h3 className="text-lg font-black text-white">הצעת שיבוץ חכמה בלוח הזמנים</h3>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto touch-scroll flex-1 space-y-4 text-right">
          {/* Target Item summary */}
          <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 block mb-0.5">
              היעד לשיבוץ:
            </span>
            <h4 className="text-base font-black text-white">{itemTitle}</h4>
            <div className="flex items-center gap-2 mt-1">
              {itemTitleJa && (
                <span className="text-xs text-slate-400 font-japanese">{itemTitleJa}</span>
              )}
              {itemCity && (
                <span className="text-[11px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-japan-red" />
                  <span>{itemCity}</span>
                </span>
              )}
            </div>
          </div>

          {/* Loading state */}
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-center">
              <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
              <p className="text-sm font-bold text-slate-200">
                ה-AI מנתח את 16 ימי המסלול בתאילנד...
              </p>
              <p className="text-xs text-slate-400 max-w-xs">
                בודק התאמת עיר (פוקט / קוסמוי / בנגקוק), פערי זמנים וקרבה גיאוגרפית.
              </p>
            </div>
          ) : proposal ? (
            <div className="space-y-4">
              {/* Placement Target Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-950/40 via-slate-900 to-rose-950/40 border border-purple-500/40 shadow-lg">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-purple-400" />
                    <span>שיבוץ מומלץ על פי ניתוח AI</span>
                  </span>
                  <span className="text-xs font-mono font-bold bg-purple-500/20 text-purple-200 px-2.5 py-0.5 rounded-full border border-purple-500/30">
                    יום {proposal.recommended_day_number}
                  </span>
                </div>

                {targetDay ? (
                  <div className="mt-2 space-y-1.5">
                    <div className="text-base font-black text-white flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-japan-sakura" />
                      <span>{targetDay.title}</span>
                    </div>
                    <div className="text-xs text-slate-300 flex items-center gap-3">
                      <span>{formatHebrewDate(targetDay.date)}</span>
                      <span>·</span>
                      <span className="text-japan-sakura font-bold">{targetDay.city}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm font-bold text-white">
                    יום {proposal.recommended_day_number} בטיול
                  </div>
                )}

                {proposal.recommended_time_slot && (
                  <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span className="text-xs text-slate-300">שעת פעילות מוצעת:</span>
                    <span className="text-xs font-black text-amber-300 font-mono bg-amber-950/60 px-2 py-0.5 rounded-lg border border-amber-900/50">
                      {proposal.recommended_time_slot}
                    </span>
                  </div>
                )}
              </div>

              {/* Reasoning Explanation */}
              <div className="p-4 bg-slate-950/90 rounded-2xl border border-slate-800 space-y-1.5">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  💡 <span>נימוק המומחה לבחירת יום ושעה אלו:</span>
                </span>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-hebrew">
                  {proposal.reasoning}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-slate-400 text-xs">
              לא נמצאה הצעת שיבוץ עבור יעד זה.
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition flex items-center justify-center gap-1.5"
          >
            <X className="w-4 h-4" />
            <span>דחה / השאר במשאלות</span>
          </button>

          {proposal && !isLoading && (
            <button
              type="button"
              onClick={() => onAccept(proposal)}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:opacity-95 text-white text-xs font-black shadow-lg transition active:scale-95 flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>אשר ושבץ בלוח הזמנים</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

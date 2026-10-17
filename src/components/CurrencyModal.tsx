import React, { useState } from 'react';
import { X, ArrowRightLeft, Delete, RotateCcw } from 'lucide-react';
import { formatJPY, formatILS } from '../lib/utils';

interface CurrencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRate?: number;
}

export const CurrencyModal: React.FC<CurrencyModalProps> = ({
  isOpen,
  onClose,
  defaultRate = 0.11,
}) => {
  const [jpyInput, setJpyInput] = useState<string>('500');
  const [rate, setRate] = useState<number>(defaultRate);

  if (!isOpen) return null;

  const jpyValue = parseFloat(jpyInput) || 0;
  const ilsValue = Number((jpyValue * rate).toFixed(2));

  const handleNumClick = (digit: string) => {
    setJpyInput((prev) => {
      if (prev === '0') return digit;
      if (prev.length >= 8) return prev;
      return prev + digit;
    });
  };

  const handleBackspace = () => {
    setJpyInput((prev) => (prev.length > 1 ? prev.slice(0, -1) : '0'));
  };

  const handleClear = () => {
    setJpyInput('0');
  };

  const setPreset = (amount: number) => {
    setJpyInput(amount.toString());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-md bg-slate-900 border-t sm:border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92dvh] sm:max-h-[92vh] box-border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/80 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              ฿
            </div>
            <div>
              <h2 className="text-base font-bold text-white">ממיר באט תאילנדי לשקל</h2>
              <p className="text-[11px] text-slate-400">100฿ ≈ {(rate * 100).toFixed(1)} ₪</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Big Conversion Display */}
        <div className="p-5 bg-gradient-to-b from-slate-950 to-slate-900 flex flex-col gap-3">
          {/* THB Card */}
          <div className="bg-slate-850/90 border border-amber-500/30 rounded-2xl p-4 shadow-inner relative">
            <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider block mb-1">
              באט תאילנדי (THB)
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-black text-amber-300 tracking-tight font-mono">
                {formatJPY(jpyValue)}
              </span>
              <span className="text-sm text-amber-500/80 font-bold">฿</span>
            </div>
          </div>

          {/* Equal Arrow */}
          <div className="flex justify-center -my-1 z-10">
            <div className="bg-slate-800 border border-slate-700 text-slate-300 p-1.5 rounded-full shadow">
              <ArrowRightLeft className="w-4 h-4 text-emerald-400" />
            </div>
          </div>

          {/* ILS Result Card */}
          <div className="bg-slate-850/90 border border-emerald-500/30 rounded-2xl p-4 shadow-inner">
            <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block mb-1">
              שקל חדש (ILS)
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-black text-emerald-300 tracking-tight font-mono">
                {formatILS(ilsValue)}
              </span>
              <span className="text-sm text-emerald-500/80 font-bold">₪</span>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="grid grid-cols-3 gap-1.5 pt-1">
            {[
              { amount: 60, label: '60฿ שייק פירות' },
              { amount: 150, label: '150฿ פאד תאי' },
              { amount: 300, label: '300฿ מונית/טוקטוק' },
              { amount: 400, label: '400฿ מסאז׳ תאילנדי' },
              { amount: 1500, label: '1,500฿ אטרקציה' },
              { amount: 3500, label: '3,500฿ טיסת פנים' },
            ].map((p) => (
              <button
                key={p.amount}
                onClick={() => setPreset(p.amount)}
                className="py-1.5 px-2 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white rounded-xl text-[11px] font-medium border border-slate-700/60 transition active:scale-95"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile-Friendly Quick NumPad */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 grid grid-cols-3 gap-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              onClick={() => handleNumClick(digit)}
              className="h-12 bg-slate-850 hover:bg-slate-800 active:bg-slate-700 text-white text-xl font-bold rounded-xl border border-slate-800 transition active:scale-95"
            >
              {digit}
            </button>
          ))}
          <button
            onClick={handleClear}
            className="h-12 bg-red-950/40 hover:bg-red-900/40 text-red-400 text-sm font-bold rounded-xl border border-red-900/40 transition active:scale-95"
          >
            איפוס
          </button>
          <button
            onClick={() => handleNumClick('0')}
            className="h-12 bg-slate-850 hover:bg-slate-800 active:bg-slate-700 text-white text-xl font-bold rounded-xl border border-slate-800 transition active:scale-95"
          >
            0
          </button>
          <button
            onClick={handleBackspace}
            className="h-12 bg-slate-850 hover:bg-slate-800 active:bg-slate-700 text-slate-300 flex items-center justify-center rounded-xl border border-slate-800 transition active:scale-95"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Rate Adjuster Footer */}
        <div className="px-5 py-3 bg-slate-900/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <span>שער חליפין:</span>
            <input
              type="number"
              step="0.005"
              value={rate}
              onChange={(e) => setRate(parseFloat(e.target.value) || 0.11)}
              className="w-20 bg-slate-800 border border-slate-700 text-white px-2 py-0.5 rounded text-left font-mono"
            />
          </div>
          <button
            onClick={() => setRate(defaultRate)}
            className="flex items-center gap-1 text-slate-400 hover:text-slate-200"
          >
            <RotateCcw className="w-3 h-3" />
            <span>ברירת מחדל</span>
          </button>
        </div>
      </div>
    </div>
  );
};

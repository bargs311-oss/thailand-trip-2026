import React, { useState, useRef, useEffect } from 'react';
import { TripDay, ItineraryItem } from '../types';
import { 
  X, 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Plus, 
  Check, 
  JapaneseYen, 
  MapPin, 
  Clock, 
  Key, 
  Compass, 
  Utensils, 
  SlidersHorizontal 
} from 'lucide-react';
import { 
  askAiTravelConcierge, 
  AiChatMessage, 
  AiSuggestedItem, 
  ConciergeDayContext,
  getStoredGeminiApiKey 
} from '../lib/gemini';
import { CATEGORY_INFO, formatJPY } from '../lib/utils';

interface AiConciergeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDay: TripDay;
  items: ItineraryItem[];
  onAddItem: (item: Omit<ItineraryItem, 'id'>) => Promise<ItineraryItem | void>;
  onOpenSettings: () => void;
  initialPrompt?: string;
}

export const AiConciergeModal: React.FC<AiConciergeModalProps> = ({
  isOpen,
  onClose,
  currentDay,
  items,
  onAddItem,
  onOpenSettings,
  initialPrompt,
}) => {
  const [messages, setMessages] = useState<AiChatMessage[]>(() => [
    {
      id: 'welcome-msg',
      role: 'assistant',
      text: `שלום משפחה יקרה! 🇹🇭 אני הקונסיירז' המשפחתי האישי שלכם לטיול בתאילנד (6 נפשות).
אני מכיר את התוכנית שלכם ליום ${currentDay?.day_number || 1} ב${currentDay?.city || 'פוקט'}${
        currentDay?.hotel_name ? ` (לינה ב-${currentDay.hotel_name})` : ''
      }.
במה אוכל לסייע לכם עכשיו?`,
      timestamp: new Date(),
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [addedItemIds, setAddedItemIds] = useState<Record<string, boolean>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const hasApiKey = Boolean(getStoredGeminiApiKey());

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      if (initialPrompt) {
        setInput(initialPrompt);
      }
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, messages, initialPrompt]);

  if (!isOpen) return null;

  const dayItems = items.filter((it) => it.day_id === currentDay?.id);
  const incompleteItems = dayItems.filter((it) => !it.is_completed);
  const completedCount = dayItems.length - incompleteItems.length;

  const context: ConciergeDayContext = {
    dayNumber: currentDay?.day_number || 1,
    date: currentDay?.date || '2026-11-06',
    city: currentDay?.city || 'פוקט',
    cityJa: currentDay?.city_ja,
    hotelName: currentDay?.hotel_name,
    hotelAddressJa: currentDay?.hotel_address_ja,
    notes: currentDay?.notes,
    incompleteItems,
    completedCount,
  };

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMessage: AiChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: query,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      const response = await askAiTravelConcierge(query, context);
      const assistantMessage: AiChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        text: response.text,
        suggestedItems: response.suggestedItems,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          role: 'assistant',
          text: 'מצטער, חלה שגיאה בעת ניסיון יצירת קשר עם מנוע ה-AI. אנא נסה שוב או בדוק את הגדרות ה-API.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSuggestedItem = async (item: AiSuggestedItem, index: number, msgId: string) => {
    const key = `${msgId}-${index}`;
    if (addedItemIds[key]) return;

    await onAddItem({
      trip_id: currentDay?.trip_id || '88ab9584-2d4e-4834-8839-8486e53453f1',
      day_id: currentDay?.id,
      title: item.title,
      title_ja: item.title_ja,
      category: item.category || 'attraction',
      time_slot: item.time_slot || '14:00 - 15:30',
      location_name: item.location_name || currentDay?.city || 'פוקט',
      notes: item.notes,
      cost_jpy: item.cost_jpy || 0,
      is_completed: false,
      order_index: dayItems.length + 1,
    });

    setAddedItemIds((prev) => ({ ...prev, [key]: true }));
  };

  const quickSuggestionChips = [
    {
      icon: <Utensils className="w-3.5 h-3.5 text-amber-400" />,
      text: 'המלץ על מסעדות מעולות ומתאימות למשפחה (6 נפשות) ליד המלון שלנו',
      label: '🍜 מסעדות למשפחה ליד המלון',
    },
    {
      icon: <Compass className="w-3.5 h-3.5 text-japan-sakura" />,
      text: 'הצע אטרקציות וחופים מומלצים באזור זה שמתאימים לכל המשפחה',
      label: '🏝️ חופים ואטרקציות באזור',
    },
    {
      icon: <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />,
      text: 'בדוק את הלוז של היום ותן אופטימיזציה לזמנים ולהסעות ל-6 אנשים',
      label: '⏱️ אופטימיזציית לו"ז והסעות',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div 
        className="w-full max-w-full sm:max-w-2xl bg-slate-900 border-t sm:border border-slate-700/80 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[92dvh] sm:h-[85vh] box-border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3.5 sm:px-6 py-3 sm:py-3.5 border-b border-slate-800 bg-slate-950/90 gap-2 shrink-0">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-gradient-to-br from-japan-red via-rose-600 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-red-950/50 shrink-0">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="font-black text-xs sm:text-base text-white truncate">
                  קונסיירז' טיול אישי
                </h3>
                <span className="text-[9px] sm:text-[10px] bg-red-500/20 text-japan-sakura border border-red-500/30 px-1.5 py-0.2 rounded-full font-bold shrink-0">
                  Gemini
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 flex items-center gap-1 truncate">
                <span>יום {currentDay?.day_number} · {currentDay?.city}</span>
                {currentDay?.city_ja && (
                  <span className="text-slate-500 font-japanese hidden min-[360px]:inline">({currentDay.city_ja})</span>
                )}
                {currentDay?.hotel_name && (
                  <span className="truncate max-w-[120px] hidden sm:inline text-indigo-300">
                    · {currentDay.hotel_name}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {!hasApiKey && (
              <button
                type="button"
                onClick={onOpenSettings}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-bold transition"
                title="הגדר מפתח Gemini API לשימוש מלא במודל"
              >
                <Key className="w-3 h-3 text-amber-400" />
                <span>מפתח API</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
              title="סגור"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Suggestion Chips Bar */}
        <div className="bg-slate-950/70 border-b border-slate-800/80 px-3 py-2 overflow-x-auto scrollbar-none flex items-center gap-2 shrink-0 touch-scroll">
          <span className="text-[10px] font-black text-slate-400 shrink-0 ml-1">
            הצעות מהירות:
          </span>
          {quickSuggestionChips.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              disabled={isLoading}
              onClick={() => handleSend(chip.text)}
              className="shrink-0 flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 text-xs font-bold transition active:scale-95 disabled:opacity-50"
            >
              {chip.icon}
              <span>{chip.label}</span>
            </button>
          ))}
        </div>

        {/* Chat History Messages */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-3.5 sm:space-y-4 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 touch-scroll">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';

            return (
              <div
                key={msg.id}
                className={`flex gap-3 animate-fadeIn ${
                  isUser ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${
                    isUser
                      ? 'bg-japan-red text-white'
                      : 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Bubble & Suggestions */}
                <div className={`space-y-3 max-w-[85%] sm:max-w-[78%] ${isUser ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`p-3.5 sm:p-4 rounded-3xl text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? 'bg-gradient-to-br from-japan-red to-rose-700 text-white rounded-tr-sm shadow-md'
                        : 'bg-slate-850 border border-slate-750 text-slate-100 rounded-tl-sm shadow-lg whitespace-pre-wrap'
                    }`}
                  >
                    {msg.text}
                  </div>

                  {/* Actionable Suggested Item Cards (One-Click Add) */}
                  {msg.suggestedItems && msg.suggestedItems.length > 0 && (
                    <div className="space-y-2.5 w-full pt-1">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-japan-sakura">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>יעדים מומלצים להוספה בלחיצה אחת:</span>
                      </div>

                      {msg.suggestedItems.map((item, idx) => {
                        const itemKey = `${msg.id}-${idx}`;
                        const isAdded = addedItemIds[itemKey];
                        const catInfo = CATEGORY_INFO[item.category] || CATEGORY_INFO['attraction'];

                        return (
                          <div
                            key={idx}
                            className="p-3.5 rounded-2xl bg-slate-950 border border-slate-750 hover:border-japan-red/50 transition-all shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                          >
                            <div className="space-y-1 flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${catInfo.badgeBg} ${catInfo.badgeText} ${catInfo.borderColor}`}>
                                  {catInfo.label}
                                </span>
                                <h5 className="text-xs sm:text-sm font-black text-white truncate">
                                  {item.title}
                                </h5>
                                {item.title_ja && (
                                  <span className="text-xs text-slate-400 font-japanese">
                                    {item.title_ja}
                                  </span>
                                )}
                              </div>

                              <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-0.5">
                                {item.time_slot && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-slate-500" />
                                    <span>{item.time_slot}</span>
                                  </span>
                                )}
                                {item.location_name && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-slate-500" />
                                    <span className="truncate max-w-[160px]">{item.location_name}</span>
                                  </span>
                                )}
                                {item.cost_jpy !== undefined && item.cost_jpy > 0 && (
                                  <span className="flex items-center gap-1 text-amber-400 font-bold font-mono">
                                    <JapaneseYen className="w-3 h-3" />
                                    <span>{formatJPY(item.cost_jpy)}</span>
                                  </span>
                                )}
                              </div>

                              {item.notes && (
                                <p className="text-[11px] text-slate-300 leading-relaxed pt-0.5">
                                  💡 {item.notes}
                                </p>
                              )}
                            </div>

                            {/* Prominent Action Button: Add to Today's Schedule */}
                            <button
                              type="button"
                              onClick={() => handleAddSuggestedItem(item, idx, msg.id)}
                              disabled={isAdded}
                              className={`shrink-0 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl font-bold text-xs transition active:scale-95 shadow-md ${
                                isAdded
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default'
                                  : 'bg-gradient-to-r from-japan-red to-rose-600 hover:opacity-95 text-white border border-red-500/40'
                              }`}
                            >
                              {isAdded ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  <span>נוסף ללו"ז!</span>
                                </>
                              ) : (
                                <>
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>+ הוסף ללו"ז</span>
                                </>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 animate-fadeIn">
              <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 rounded-3xl bg-slate-850 border border-slate-750 text-slate-300 rounded-tl-sm flex items-center gap-2 text-xs">
                <Loader2 className="w-4 h-4 animate-spin text-japan-sakura" />
                <span>הקונסיירז' מעבד את השאלה ומכין המלצות מותאמות...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              placeholder="שאל כל דבר על תאילנד, חופים, מסעדות, שווקים או בקש המלצה למשפחה..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              className="flex-1 bg-slate-900 border border-slate-700/80 focus:border-red-500 rounded-2xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none transition shadow-inner"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-3 bg-gradient-to-r from-japan-red to-rose-600 hover:opacity-95 text-white rounded-2xl shadow-lg transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              title="שלח הודעה"
            >
              <Send className="w-4 h-4 rotate-180" />
            </button>
          </form>

          <div className="flex items-center justify-between mt-2 px-1 text-[10px] text-slate-500">
            <span>מופעל ע"י Google Gemini 1.5 Flash</span>
            {!hasApiKey && (
              <span className="text-amber-400">
                פועל עם נתוני גיבוי מקומיים · הגדר מפתח ב-Settings
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

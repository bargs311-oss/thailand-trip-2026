import React, { useState } from 'react';
import { BookingDeadline } from '../types';
import { 
  Clock, 
  CheckCircle2, 
  Circle, 
  Calendar, 
  ExternalLink, 
  Plus, 
  Trash2, 
  Ticket, 
  BellRing
} from 'lucide-react';

interface DeadlinesViewProps {
  deadlines: BookingDeadline[];
  onToggleBooked: (id: string, isBooked: boolean) => void;
  onAddDeadline: (deadline: Omit<BookingDeadline, 'id'>) => void;
  onDeleteDeadline: (id: string) => void;
}

export const DeadlinesView: React.FC<DeadlinesViewProps> = ({
  deadlines,
  onToggleBooked,
  onAddDeadline,
  onDeleteDeadline,
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'booked'>('all');
  const [showAddForm, setShowAddForm] = useState(false);

  // Form state
  const [newTitle, setNewTitle] = useState('');
  const [newTitleJa, setNewTitleJa] = useState('');
  const [newTargetDate, setNewTargetDate] = useState('');
  const [newTargetTime, setNewTargetTime] = useState('10:00');
  const [newDescription, setNewDescription] = useState('');
  const [newBookingUrl, setNewBookingUrl] = useState('');
  const [newCategory, setNewCategory] = useState<'attraction' | 'transport' | 'hotel' | 'activity' | 'other'>('attraction');

  const filteredDeadlines = deadlines.filter((d) => {
    if (filter === 'pending') return !d.is_booked;
    if (filter === 'booked') return d.is_booked;
    return true;
  });

  const bookedCount = deadlines.filter((d) => d.is_booked).length;
  const pendingCount = deadlines.length - bookedCount;

  const handleCreateDeadline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newTargetDate) return;

    const fullIsoDate = new Date(`${newTargetDate}T${newTargetTime || '10:00'}:00`).toISOString();

    onAddDeadline({
      trip_id: '88ab9584-2d4e-4834-8839-8486e53453f1',
      title: newTitle.trim(),
      title_ja: newTitleJa.trim() || undefined,
      target_date: fullIsoDate,
      description: newDescription.trim() || 'תזכורת פתיחת הזמנות',
      booking_url: newBookingUrl.trim() || undefined,
      category: newCategory,
      is_booked: false,
    });

    setNewTitle('');
    setNewTitleJa('');
    setNewTargetDate('');
    setNewTargetTime('10:00');
    setNewDescription('');
    setNewBookingUrl('');
    setShowAddForm(false);
  };

  const getCountdown = (targetDateStr: string) => {
    const target = new Date(targetDateStr).getTime();
    const now = Date.now();
    const diff = target - now;

    if (diff <= 0) {
      return { isPast: true, text: 'המועד פתוח / עבר' };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return { isPast: false, text: `עוד ${days} ימים ו-${hours} שעות` };
    return { isPast: false, text: `עוד ${hours} שעות בלבד!` };
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Overview Banner */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-red-950/60 via-slate-900 to-amber-950/40 border border-slate-800 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BellRing className="w-4 h-4 text-japan-sakura" />
              <span className="text-xs font-black text-japan-sakura uppercase tracking-wider">
                מועדי שריון טיסות פנים, וילות ושייט בתאילנד
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white">
              ספירה לאחור להזמנות חובה למשפחה (6 נפשות)
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
              עבור 6 נוסעים מומלץ לשריין מראש טיסות פנים (Bangkok Airways מפוקט לקוסמוי ומקוסמוי לבנגקוק), שמורות פילים אתיות, סירות מנוע פרטיות וחדרים מחוברים.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-1.5 py-2 px-3.5 bg-gradient-to-r from-japan-red to-rose-600 hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-md transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>הוסף מועד</span>
            </button>
          </div>
        </div>

        {/* Counter Pills */}
        <div className="grid grid-cols-3 gap-2.5 mt-4 pt-3.5 border-t border-slate-800/80">
          <div className="bg-slate-950/60 p-2.5 rounded-2xl border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 font-bold block">סה"כ מועדים</span>
            <span className="text-base font-black text-white font-mono">{deadlines.length}</span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-2xl border border-slate-800 text-center">
            <span className="text-[10px] text-amber-400 font-bold block">פתוחים להזמנה</span>
            <span className="text-base font-black text-amber-300 font-mono">{pendingCount}</span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-2xl border border-slate-800 text-center">
            <span className="text-[10px] text-emerald-400 font-bold block">הוזמנו בהצלחה ✓</span>
            <span className="text-base font-black text-emerald-300 font-mono">{bookedCount}</span>
          </div>
        </div>
      </div>

      {/* Add Deadline Form */}
      {showAddForm && (
        <form onSubmit={handleCreateDeadline} className="p-4 bg-slate-900 border border-slate-700 rounded-3xl space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-white flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-japan-red" />
              <span>הוספת תזכורת הזמנה לתאילנד</span>
            </h4>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-slate-400 hover:text-white text-xs"
            >
              ביטול
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">שם האטרקציה / הטיסה / המלון *</label>
              <input
                type="text"
                required
                placeholder="למשל: טיסת Bangkok Airways מפוקט לקוסמוי (6 כרטיסים)..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-red-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">שם באנגלית / תאית (אופציונלי)</label>
              <input
                type="text"
                placeholder="למשל: Bangkok Airways HKT-USM"
                value={newTitleJa}
                onChange={(e) => setNewTitleJa(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-red-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none font-japanese dir-ltr text-left"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">תאריך יעד להזמנה *</label>
              <input
                type="date"
                required
                value={newTargetDate}
                onChange={(e) => setNewTargetDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-red-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none dir-ltr"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">שעה מדויקת</label>
              <input
                type="time"
                value={newTargetTime}
                onChange={(e) => setNewTargetTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-red-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none dir-ltr"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">קטגוריה</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-red-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="attraction">🏝️ אטרקציה / שייט פרטי</option>
                <option value="transport">✈️ טיסת פנים / ואן הסעות</option>
                <option value="hotel">🏨 מלון / ריזורט משפחתי</option>
                <option value="activity">🐘 שמורת פילים / פעילות</option>
                <option value="other">📌 אחר</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">קישור ישיר לאתר ההזמנה</label>
            <input
              type="url"
              placeholder="https://..."
              value={newBookingUrl}
              onChange={(e) => setNewBookingUrl(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-red-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none dir-ltr text-left"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">הוראות והערות (כבודה, שעות, מספרי דרכון ל-6 נוסעים)</label>
            <input
              type="text"
              placeholder="למשל: להזמין כרטיס כולל כבודה של 20 ק״ג לכל אחד מ-6 בני המשפחה..."
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-red-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-gradient-to-r from-japan-red to-rose-600 text-white font-bold text-xs rounded-xl shadow-lg transition active:scale-95"
          >
            שמור תזכורת פתיחת הזמנה
          </button>
        </form>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1 rounded-2xl">
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition ${
            filter === 'all'
              ? 'bg-slate-800 text-white shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          הכל ({deadlines.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            filter === 'pending'
              ? 'bg-amber-600/30 text-amber-200 border border-amber-500/40 shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>פתוחים להזמנה</span>
          <span className="text-[10px] bg-amber-950 px-1.5 py-0.2 rounded-full font-mono font-bold text-amber-300">
            {pendingCount}
          </span>
        </button>
        <button
          onClick={() => setFilter('booked')}
          className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            filter === 'booked'
              ? 'bg-emerald-600/30 text-emerald-200 border border-emerald-500/40 shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>הוזמנו בהצלחה</span>
          <span className="text-[10px] bg-emerald-950 px-1.5 py-0.2 rounded-full font-mono font-bold text-emerald-300">
            {bookedCount}
          </span>
        </button>
      </div>

      {/* Deadline Cards List */}
      <div className="space-y-3">
        {filteredDeadlines.map((dl) => {
          const countdown = getCountdown(dl.target_date);
          const formattedDate = new Date(dl.target_date).toLocaleDateString('he-IL', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <div
              key={dl.id}
              className={`p-4 rounded-3xl border transition-all duration-200 ${
                dl.is_booked
                  ? 'bg-slate-900/60 border-slate-800/80 opacity-80'
                  : 'bg-slate-900 border-slate-750 hover:border-slate-700 shadow-md'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {/* Checkbox toggle */}
                  <button
                    type="button"
                    onClick={() => onToggleBooked(dl.id, dl.is_booked)}
                    className="shrink-0 mt-0.5 text-slate-500 hover:text-emerald-400 transition"
                    title={dl.is_booked ? 'סמן כפתוח להזמנה' : 'סמן שהכרטיס הוזמן בהצלחה!'}
                  >
                    {dl.is_booked ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Circle className="w-5 h-5 hover:text-japan-sakura" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-sm font-black text-white">
                        {dl.title}
                      </span>
                      {dl.title_ja && (
                        <span className="text-xs text-slate-400 font-japanese">
                          {dl.title_ja}
                        </span>
                      )}
                      {dl.is_booked && (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                          הוזמן בהצלחה ✓
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {dl.description}
                    </p>

                    {/* Date and Countdown tags */}
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                      <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 px-2.5 py-1 rounded-xl text-slate-300">
                        <Calendar className="w-3.5 h-3.5 text-japan-sakura" />
                        <span className="font-medium">{formattedDate}</span>
                      </div>

                      {!dl.is_booked && (
                        <div
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl font-bold border ${
                            countdown.isPast
                              ? 'bg-amber-950/40 text-amber-300 border-amber-800/40'
                              : 'bg-red-950/40 text-red-300 border-red-800/40 animate-pulse'
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>{countdown.text}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  {dl.booking_url && (
                    <a
                      href={dl.booking_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 py-1.5 px-3 bg-japan-red/10 hover:bg-japan-red/20 text-japan-sakura hover:text-white rounded-xl text-xs font-bold border border-japan-red/30 transition"
                      title="עבור לאתר ההזמנה הרשמי"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>פתח אתר</span>
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`האם למחוק את התזכורת ל-${dl.title}?`)) {
                        onDeleteDeadline(dl.id);
                      }
                    }}
                    className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg transition"
                    title="מחק מועד"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredDeadlines.length === 0 && (
          <div className="text-center py-10 bg-slate-900/40 border border-dashed border-slate-800 rounded-3xl">
            <Ticket className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-400">אין תזכורות להצגה בסינון זה</p>
          </div>
        )}
      </div>
    </div>
  );
};

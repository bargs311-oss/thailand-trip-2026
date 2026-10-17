import React, { useState } from 'react';
import { MeetupPin, UserProfiles } from '../types';
import { 
  MapPin, 
  Clock, 
  ExternalLink, 
  CheckCircle2, 
  Plus, 
  Edit3, 
  Users, 
  MessageSquare, 
  X
} from 'lucide-react';

interface MeetupPinCardProps {
  pin: MeetupPin | null;
  onUpdatePin: (pin: MeetupPin) => void;
  userProfiles?: UserProfiles;
}

export const MeetupPinCard: React.FC<MeetupPinCardProps> = ({ pin, onUpdatePin, userProfiles }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const members = userProfiles?.members && userProfiles.members.length === 6
    ? userProfiles.members
    : ['אבא', 'אמא', 'בן משפחה 3', 'בן משפחה 4', 'בן משפחה 5', 'בן משפחה 6'];

  const getSenderName = (senderId?: string) => {
    if (!senderId) return members[0];
    const match = senderId.match(/^user_([1-6])$/);
    if (match) {
      return members[parseInt(match[1], 10) - 1] || members[0];
    }
    if (senderId === 'user_a' || senderId === 'אני') return members[0];
    if (senderId === 'user_b' || senderId === 'אחי') return members[1];
    return senderId;
  };

  // Form State
  const [spotName, setSpotName] = useState('');
  const [scheduledTime, setScheduledTime] = useState('17:00');
  const [mapsUrl, setMapsUrl] = useState('');
  const [note, setNote] = useState('');
  const [setBy, setSetBy] = useState<string>(userProfiles?.currentDeviceUser || 'user_1');

  const handleOpenEdit = () => {
    if (pin && pin.is_active) {
      setSpotName(pin.spot_name);
      setScheduledTime(pin.scheduled_time);
      setMapsUrl(pin.google_maps_url || '');
      setNote(pin.note || '');
      setSetBy(pin.set_by);
    } else {
      setSpotName('');
      setScheduledTime('18:00');
      setMapsUrl('');
      setNote('');
      setSetBy(userProfiles?.currentDeviceUser || 'user_1');
    }
    setIsModalOpen(true);
  };

  const handleSavePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!spotName.trim()) return;

    let finalMapsUrl = mapsUrl.trim();
    if (!finalMapsUrl && spotName) {
      finalMapsUrl = `https://maps.google.com/?q=${encodeURIComponent(spotName.trim())}`;
    }

    onUpdatePin({
      id: pin?.id || crypto.randomUUID(),
      trip_id: pin?.trip_id || '99th2026-4417-4834-8839-8486e53453f1',
      spot_name: spotName.trim(),
      scheduled_time: scheduledTime.trim() || '18:00',
      google_maps_url: finalMapsUrl || undefined,
      note: note.trim() || undefined,
      set_by: setBy,
      is_active: true,
      updated_at: new Date().toISOString(),
    });

    setIsModalOpen(false);
  };

  const handleMarkMetUp = () => {
    if (!pin) return;
    onUpdatePin({
      ...pin,
      is_active: false,
      updated_at: new Date().toISOString(),
    });
  };

  return (
    <>
      {pin && pin.is_active ? (
        /* Active Meetup Pin Banner */
        <div className="relative overflow-hidden bg-gradient-to-br from-amber-950/60 via-slate-900 to-rose-950/60 border-2 border-amber-500/50 rounded-3xl p-4 sm:p-5 shadow-xl animate-fadeIn">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold border border-amber-500/40 shadow-md animate-pulse">
                <MapPin className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full animate-pulse">
                    נקודת מפגש משפחתית
                  </span>
                  <span className="text-[11px] text-amber-300 font-bold">
                    נקבע ע"י {getSenderName(pin.set_by)}
                  </span>
                </div>
                <h4 className="text-base sm:text-lg font-black text-white mt-1">
                  {pin.spot_name}
                </h4>
              </div>
            </div>

            {/* Scheduled Time Badge */}
            <div className="text-left shrink-0 bg-slate-950/80 border border-amber-500/40 px-3 py-2 rounded-2xl">
              <span className="text-[10px] font-bold text-amber-300 block">זמן המפגש:</span>
              <span className="text-lg font-black text-white font-mono flex items-center gap-1">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>{pin.scheduled_time}</span>
              </span>
            </div>
          </div>

          {pin.note && (
            <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 text-xs text-slate-200 flex items-start gap-2 mb-3">
              <MessageSquare className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">{pin.note}</p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/80 flex-wrap">
            <div className="flex items-center gap-2">
              <a
                href={pin.google_maps_url || `https://maps.google.com/?q=${encodeURIComponent(pin.spot_name)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
              >
                <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                <span>ניווט לנקודה ב-Maps</span>
              </a>

              <button
                type="button"
                onClick={handleOpenEdit}
                className="py-1.5 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition flex items-center gap-1"
                title="ערוך נקודת מפגש"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>ערוך</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleMarkMetUp}
              className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white text-xs font-black transition flex items-center gap-1.5 shadow-md active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>נפגשנו כולם! (סגור פין)</span>
            </button>
          </div>
        </div>
      ) : (
        /* Inactive Meetup Pin Trigger Banner */
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 flex items-center justify-between gap-3 shadow-md hover:border-slate-700 transition">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">מתפצלים בקניון או בשוק?</h4>
              <p className="text-[11px] text-slate-400">
                קבעו נקודת מפגש ושעה שיסונכרנו מיידית אצל כל 6 בני המשפחה
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleOpenEdit}
            className="py-2 px-3.5 bg-gradient-to-r from-amber-600 to-rose-600 hover:opacity-95 text-white text-xs font-black rounded-xl shadow-md transition flex items-center gap-1.5 active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>הגדר פין מפגש</span>
          </button>
        </div>
      )}

      {/* Set / Edit Meetup Pin Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div
            className="bg-slate-900 border border-amber-500/40 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-950 via-slate-900 to-rose-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">נקודת מפגש משפחתית (Meetup Pin)</h3>
                  <p className="text-[10px] text-slate-400">מסנכרן בזמן אמת לכל 6 הטלפונים במשפחה</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSavePin} className="p-5 space-y-3.5 text-right">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  איפה נפגשים? (שם המקום / נקודת ציון) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="למשל: כניסה ראשית לקניון סיאם פרגון, לובי הריזורט בפוקט..."
                  value={spotName}
                  onChange={(e) => setSpotName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    שעת מפגש יעד *
                  </label>
                  <input
                    type="time"
                    required
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    מי מגדיר?
                  </label>
                  <select
                    value={setBy}
                    onChange={(e) => setSetBy(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    {members.map((memberName, idx) => {
                      const key = `user_${idx + 1}`;
                      return (
                        <option key={key} value={key}>
                          {memberName} {userProfiles?.currentDeviceUser === key ? '(מכשיר זה)' : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  קישור למיקום ב-Google Maps (אופציונלי)
                </label>
                <input
                  type="url"
                  placeholder="https://maps.google.com/?q=..."
                  value={mapsUrl}
                  onChange={(e) => setMapsUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  הודעה / הנחיות למשפחה
                </label>
                <textarea
                  rows={2}
                  placeholder="למשל: נפגשים ליד הקופות ב-18:00 לפני שממשיכים לארוחת ערב..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="py-2 px-3.5 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl text-xs font-bold transition"
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  className="py-2 px-5 bg-gradient-to-r from-amber-600 to-rose-600 hover:opacity-95 text-white rounded-xl text-xs font-bold transition shadow-md flex items-center gap-1.5"
                >
                  <MapPin className="w-4 h-4" />
                  <span>שדר פין מפגש למשפחה</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

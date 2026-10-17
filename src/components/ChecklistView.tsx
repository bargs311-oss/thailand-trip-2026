import React, { useState } from 'react';
import { ChecklistItem, ChecklistCategory } from '../types';
import { 
  CheckCircle2, 
  Circle, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  Smartphone, 
  Coins, 
  Luggage, 
  HeartPulse, 
  ListTodo
} from 'lucide-react';

interface ChecklistViewProps {
  checklist: ChecklistItem[];
  onToggleCompleted: (id: string, isCompleted: boolean) => void;
  onAddChecklistItem: (item: Omit<ChecklistItem, 'id'>) => void;
  onDeleteChecklistItem: (id: string) => void;
}

export const ChecklistView: React.FC<ChecklistViewProps> = ({
  checklist,
  onToggleCompleted,
  onAddChecklistItem,
  onDeleteChecklistItem,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);

  // Form state
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState<ChecklistCategory>('general');

  const categories: { id: string; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: 'הכל', icon: <ListTodo className="w-3.5 h-3.5" /> },
    { id: 'docs', label: '📄 מסמכים והגירה', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
    { id: 'tech', label: '📱 טכנולוגיה וחשמל', icon: <Smartphone className="w-3.5 h-3.5" /> },
    { id: 'finance', label: '💴 כסף ומט"ח', icon: <Coins className="w-3.5 h-3.5" /> },
    { id: 'packing', label: '🧳 אריזה וציוד', icon: <Luggage className="w-3.5 h-3.5" /> },
    { id: 'health', label: '💊 ביטוח ובריאות', icon: <HeartPulse className="w-3.5 h-3.5" /> },
  ];

  const filteredItems = checklist.filter((item) => {
    if (selectedCategory === 'all') return true;
    return item.category === selectedCategory;
  });

  const completedCount = checklist.filter((i) => i.is_completed).length;
  const progressPercent = checklist.length > 0 ? Math.round((completedCount / checklist.length) * 100) : 0;

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddChecklistItem({
      trip_id: '88ab9584-2d4e-4834-8839-8486e53453f1',
      title: newTitle.trim(),
      description: newDescription.trim() || undefined,
      category: newCategory,
      is_completed: false,
      order_index: checklist.length + 1,
    });

    setNewTitle('');
    setNewDescription('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Progress & Overview Banner */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-teal-950/60 via-slate-900 to-indigo-950/40 border border-slate-800 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-black text-emerald-400 uppercase tracking-wider">
                הכנות חובה לקראת תאילנד (6 נפשות)
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white">
              צ'ק-ליסט משפחתי לקראת הטיסה 🇹🇭
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
              הכנות חשובות לכל המשפחה: תוקף דרכונים, אפליקציית Grab & Bolt, חבילות eSIM, שטרות של 100$ חדשים להמרה לבאט, ותרסיס נגד יתושים.
            </p>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 py-2 px-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-md transition active:scale-95 self-start sm:self-center"
          >
            <Plus className="w-4 h-4" />
            <span>הוסף משימה</span>
          </button>
        </div>

        {/* Visual Progress Bar */}
        <div className="mt-4 pt-3.5 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-xs font-bold mb-1.5">
            <span className="text-slate-300">
              התקדמות הכנות: {completedCount} מתוך {checklist.length} משימות
            </span>
            <span className="text-emerald-400 font-mono text-sm">{progressPercent}%</span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-3 p-0.5 border border-slate-800 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Add Custom Item Form */}
      {showAddForm && (
        <form onSubmit={handleCreateItem} className="p-4 bg-slate-900 border border-slate-700 rounded-3xl space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-white flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>הוספת משימה חדשה לצ'ק-ליסט</span>
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
              <label className="block text-[11px] font-bold text-slate-300 mb-1">שם המשימה *</label>
              <input
                type="text"
                required
                placeholder="למשל: לבדוק תוקף דרכון, לקנות שקיות ואקום..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">קטגוריה</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as ChecklistCategory)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="docs">📄 מסמכים והגירה</option>
                <option value="tech">📱 טכנולוגיה וחשמל</option>
                <option value="finance">💴 כסף ומט"ח</option>
                <option value="packing">🧳 אריזה וציוד</option>
                <option value="health">💊 ביטוח ובריאות</option>
                <option value="general">📌 כללי</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">פירוט והנחיות (אופציונלי)</label>
            <input
              type="text"
              placeholder="למשל: תוקף של 6 חודשים לפחות מיום הנחיתה..."
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs rounded-xl shadow-lg transition active:scale-95"
          >
            שמור משימה
          </button>
        </form>
      )}

      {/* Category Pills Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`shrink-0 py-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
              selectedCategory === cat.id
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
            }`}
          >
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Checklist Items List */}
      <div className="space-y-2.5">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className={`p-3.5 rounded-2xl border transition-all duration-200 flex items-start justify-between gap-3 ${
              item.is_completed
                ? 'bg-slate-900/50 border-slate-800/80 text-slate-400'
                : 'bg-slate-900 border-slate-750 hover:border-slate-700 shadow-sm'
            }`}
          >
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <button
                type="button"
                onClick={() => onToggleCompleted(item.id, item.is_completed)}
                className="shrink-0 mt-0.5 text-slate-500 hover:text-emerald-400 transition"
                title={item.is_completed ? 'סמן כלא הושלם' : 'סמן כהושלם!'}
              >
                {item.is_completed ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Circle className="w-5 h-5 hover:text-emerald-300" />
                )}
              </button>

              <div className="flex-1 min-w-0">
                <span
                  className={`text-xs sm:text-sm font-bold block ${
                    item.is_completed ? 'line-through text-slate-500' : 'text-white'
                  }`}
                >
                  {item.title}
                </span>

                {item.description && (
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    {item.description}
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (window.confirm(`האם למחוק את "${item.title}"?`)) {
                  onDeleteChecklistItem(item.id);
                }
              }}
              className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg transition shrink-0"
              title="מחק משימה"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}

        {filteredItems.length === 0 && (
          <div className="text-center py-10 bg-slate-900/40 border border-dashed border-slate-800 rounded-3xl">
            <CheckCircle2 className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-400">אין משימות בקטגוריה זו</p>
          </div>
        )}
      </div>
    </div>
  );
};

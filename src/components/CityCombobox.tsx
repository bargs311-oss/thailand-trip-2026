import React, { useState, useRef, useEffect } from 'react';
import { MapPin, ChevronDown, Check, Plus, Globe } from 'lucide-react';
import { JAPAN_CITIES } from '../lib/japanLocationsData';

interface CityComboboxProps {
  value: string;
  onChange: (city: string) => void;
  onSelectCityJa?: (cityJa: string) => void;
  existingCities?: string[];
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export const CityCombobox: React.FC<CityComboboxProps> = ({
  value,
  onChange,
  onSelectCityJa,
  existingCities = [],
  placeholder = 'בחר עיר או הקלד יעד חדש...',
  required = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter lists based on input text
  const cleanQuery = value.trim().toLowerCase();

  const filteredExisting = existingCities.filter(
    (c) => c && c !== 'הכל' && (!cleanQuery || c.toLowerCase().includes(cleanQuery))
  );

  const filteredJapanCities = JAPAN_CITIES.filter(
    (item) =>
      !filteredExisting.includes(item.name) &&
      (!cleanQuery ||
        item.name.toLowerCase().includes(cleanQuery) ||
        item.nameEn.toLowerCase().includes(cleanQuery) ||
        item.nameJa.toLowerCase().includes(cleanQuery))
  );

  const handleSelect = (cityName: string, cityJa?: string) => {
    onChange(cityName);
    if (cityJa && onSelectCityJa) {
      onSelectCityJa(cityJa);
    } else if (onSelectCityJa) {
      const match = JAPAN_CITIES.find((p) => p.name === cityName || p.nameEn.toLowerCase() === cityName.toLowerCase());
      if (match) onSelectCityJa(match.nameJa);
    }
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative flex items-center">
        <input
          type="text"
          required={required}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full bg-slate-950 border border-slate-800 focus:border-red-500 rounded-xl px-3.5 py-2.5 pl-8 text-xs text-white placeholder-slate-500 focus:outline-none transition shadow-inner"
        />
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="absolute left-2.5 p-1 text-slate-400 hover:text-white transition"
          tabIndex={-1}
        >
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180 text-red-400' : ''}`} />
        </button>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full max-h-72 overflow-y-auto bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-1.5 space-y-1 text-xs">
          {/* Custom typed value prompt if not matching existing */}
          {cleanQuery && !existingCities.includes(value.trim()) && (
            <button
              type="button"
              onClick={() => handleSelect(value.trim())}
              className="w-full text-right p-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 font-bold flex items-center justify-between border border-red-800/50 transition mb-1"
            >
              <div className="flex items-center gap-1.5 truncate">
                <Plus className="w-3.5 h-3.5 text-japan-sakura shrink-0" />
                <span className="truncate">הוסף עיר חדשה: "{value.trim()}"</span>
              </div>
              <span className="text-[10px] bg-red-900/60 px-1.5 py-0.2 rounded font-mono">יעד חדש</span>
            </button>
          )}

          {/* Existing Trip Cities */}
          {filteredExisting.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <MapPin className="w-3 h-3 text-red-400" />
                <span>ערים קיימות בטיול</span>
              </div>
              {filteredExisting.map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => handleSelect(city)}
                  className={`w-full text-right px-2.5 py-1.5 rounded-xl flex items-center justify-between transition ${
                    value === city
                      ? 'bg-red-500/20 text-red-300 font-bold'
                      : 'hover:bg-slate-800 text-slate-200'
                  }`}
                >
                  <span>{city}</span>
                  {value === city && <Check className="w-3.5 h-3.5 text-red-400" />}
                </button>
              ))}
            </div>
          )}

          {/* Popular Travel Cities in Thailand */}
          {filteredJapanCities.length > 0 && (
            <div className="pt-1 border-t border-slate-800/80 mt-1">
              <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Globe className="w-3 h-3 text-indigo-400" />
                <span>ערי ויעדי תאילנד</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-0.5">
                {filteredJapanCities.map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => handleSelect(item.name, item.nameJa)}
                    className={`text-right px-2 py-1.5 rounded-xl flex items-center justify-between transition ${
                      value === item.name
                        ? 'bg-indigo-500/20 text-indigo-300 font-bold'
                        : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="truncate">
                      <span className="font-semibold text-white">{item.name}</span>
                      <span className="text-[10px] text-slate-400 mr-1.5 font-mono">({item.nameEn})</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-japanese truncate dir-ltr text-left">
                      {item.nameJa.split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

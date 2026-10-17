import React, { useState, useRef, useEffect } from 'react';
import { JapanDestination, searchJapanDestinations, inferCityFromItemText } from '../lib/japanLocationsData';
import { MapPin, Sparkles, Clock, BellRing, Compass, X, Globe, Loader2 } from 'lucide-react';
import { CATEGORY_INFO } from '../lib/utils';
import { ItemCategory } from '../types';

interface AttractionComboboxProps {
  value: string;
  onChange: (value: string) => void;
  onSelectDestination: (destination: JapanDestination) => void;
  onTriggerAiEnrich?: () => void;
  isEnriching?: boolean;
  placeholder?: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;
}

const PREFECTURE_TO_HEBREW_CITY: Record<string, string> = {
  phuket: 'פוקט',
  'koh samui': 'קוסמוי',
  'ko samui': 'קוסמוי',
  samui: 'קוסמוי',
  'surat thani': 'קוסמוי',
  bangkok: 'בנגקוק',
  'krung thep': 'בנגקוק',
  'krung thep maha nakhon': 'בנגקוק',
  krabi: 'פוקט',
  'phang nga': 'פוקט',
};

function mapNominatimResultToDestination(raw: any, index: number): JapanDestination {
  const addr = raw.address || {};
  const rawCityEn =
    addr.city ||
    addr.town ||
    addr.village ||
    addr.municipality ||
    addr.county ||
    addr.state ||
    'Thailand';

  const cleanCityKey = rawCityEn.toLowerCase().replace(/\s*(province|city|district|amphoe|tambon)\s*/g, '').trim();
  const inferredHe =
    PREFECTURE_TO_HEBREW_CITY[cleanCityKey] ||
    inferCityFromItemText(`${raw.display_name || ''} ${raw.name || ''}`) ||
    'פוקט';

  const typeStr = `${raw.class || ''} ${raw.type || ''}`.toLowerCase();
  let category: ItemCategory = 'attraction';
  if (typeStr.includes('restaurant') || typeStr.includes('cafe') || typeStr.includes('food') || typeStr.includes('bar') || typeStr.includes('fast_food')) {
    category = 'food';
  } else if (typeStr.includes('shop') || typeStr.includes('mall') || typeStr.includes('department_store') || typeStr.includes('market')) {
    category = 'shopping';
  } else if (typeStr.includes('theme_park') || typeStr.includes('zoo') || typeStr.includes('aquarium') || typeStr.includes('museum') || typeStr.includes('park') || typeStr.includes('spa')) {
    category = 'activity';
  } else if (typeStr.includes('station') || typeStr.includes('aerodrome') || typeStr.includes('ferry') || typeStr.includes('pier')) {
    category = 'transport';
  }

  const primaryName = raw.name || (raw.display_name ? raw.display_name.split(',')[0] : 'יעד בתאילנד');
  const displayParts = (raw.display_name || '').split(',').map((s: string) => s.trim());
  const shortLocation = displayParts.slice(0, 3).join(', ');

  return {
    id: `live-osm-${raw.place_id || index}`,
    nameHe: primaryName,
    nameEn: shortLocation || primaryName,
    nameJa: '',
    romaji: primaryName,
    city: inferredHe,
    cityEn: rawCityEn,
    prefecture: addr.state || addr.province || '',
    region: 'תאילנד (חיפוש חי)',
    category,
    estimated_duration_mins: 120,
    best_time_of_day: 'afternoon',
    cost_jpy: 0,
    district: addr.suburb || addr.quarter || addr.neighbourhood || '',
    nearest_station: '',
    google_maps_url:
      raw.lat && raw.lon
        ? `https://maps.google.com/?q=${encodeURIComponent(primaryName)}+${raw.lat},${raw.lon}`
        : `https://maps.google.com/?q=${encodeURIComponent(primaryName + ' Thailand')}`,
    notes: `נמצא בחיפוש מפות חי בתאילנד: ${shortLocation}`,
    pro_tips: 'לחץ על "✨ העשר בעזרת AI" כדי להשלים אוטומטית שם בתאית, אזור, עלויות בבאט וטיפים למשפחה.',
    requires_advance_booking: false,
  };
}

function mapPhotonResultToDestination(feat: any, index: number, originalQ: string): JapanDestination {
  const p = feat.properties || {};
  const rawCity = p.city || p.locality || p.district || p.state || 'תאילנד';
  const cleanCityKey = rawCity.toLowerCase().replace(/\s*(province|city|district|amphoe|tambon)\s*/g, '').trim();
  const inferredHe =
    PREFECTURE_TO_HEBREW_CITY[cleanCityKey] ||
    inferCityFromItemText(`${p.name || ''} ${p.district || ''} ${p.state || ''} ${rawCity}`) ||
    'פוקט';
  const name = p.name || originalQ;
  const locationParts = [name, p.district, p.city, p.state].filter(Boolean);
  const shortLocation = locationParts.join(', ');
  const [lon, lat] = feat.geometry?.coordinates || [undefined, undefined];

  let category: ItemCategory = 'attraction';
  const osmType = `${p.osm_key || ''} ${p.osm_value || ''}`.toLowerCase();
  if (osmType.includes('restaurant') || osmType.includes('cafe') || osmType.includes('food') || osmType.includes('bar')) {
    category = 'food';
  } else if (osmType.includes('shop') || osmType.includes('mall') || osmType.includes('market')) {
    category = 'shopping';
  } else if (osmType.includes('station') || osmType.includes('railway') || osmType.includes('stop') || osmType.includes('ferry')) {
    category = 'transport';
  } else if (osmType.includes('park') || osmType.includes('museum') || osmType.includes('tourism') || osmType.includes('leisure')) {
    category = 'activity';
  }

  return {
    id: `live-photon-${p.osm_id || index}`,
    nameHe: name,
    nameEn: shortLocation || name,
    nameJa: '',
    romaji: name,
    city: inferredHe,
    cityEn: rawCity,
    prefecture: p.state || '',
    region: 'תאילנד (מפות חיות)',
    category,
    estimated_duration_mins: 120,
    best_time_of_day: 'afternoon',
    cost_jpy: 0,
    district: p.district || p.locality || '',
    nearest_station: '',
    google_maps_url:
      lat && lon
        ? `https://maps.google.com/?q=${encodeURIComponent(name)}+${lat},${lon}`
        : `https://maps.google.com/?q=${encodeURIComponent(name + ' Thailand')}`,
    notes: `נמצא בחיפוש מפות תאילנד: ${shortLocation}`,
    pro_tips: 'לחץ על "✨ העשר בעזרת AI" כדי לקבל מידע מלא, עלויות וטיפים למשפחה.',
    requires_advance_booking: false,
  };
}

export const AttractionCombobox: React.FC<AttractionComboboxProps> = ({
  value,
  onChange,
  onSelectDestination,
  onTriggerAiEnrich,
  isEnriching = false,
  placeholder = 'הקלד כל יעד בתאילנד (עברית או אנגלית, למשל: איי פי פי, שמורת פילים, ICONSIAM...)',
  required = false,
  className = '',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [matches, setMatches] = useState<JapanDestination[]>([]);
  const [liveMatches, setLiveMatches] = useState<JapanDestination[]>([]);
  const [isSearchingLive, setIsSearchingLive] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 1. Instant offline search with Hebrew/English normalization
  useEffect(() => {
    if (value && value.trim().length >= 1) {
      const results = searchJapanDestinations(value.trim(), 8);
      setMatches(results);
    } else {
      setMatches([]);
      setLiveMatches([]);
      setIsOpen(false);
    }
  }, [value]);

  // 2. Debounced Live Multi-Source Search (Photon Komoot + OpenStreetMap Nominatim)
  useEffect(() => {
    const rawQ = value ? value.trim() : '';
    if (rawQ.length < 2 || disabled) {
      setLiveMatches([]);
      setIsSearchingLive(false);
      return;
    }

    const controller = new AbortController();
    const cleanQ = rawQ.replace(/[-_]/g, ' ').replace(/\s+/g, ' ').trim();

    const timer = setTimeout(async () => {
      try {
        setIsSearchingLive(true);
        const results: JapanDestination[] = [];
        const seenNames = new Set<string>();

        // Parallel fetch: Photon (Elasticsearch based) + Nominatim
        const photonPromise = fetch(
          `https://photon.komoot.io/api/?q=${encodeURIComponent(cleanQ)}&limit=8`,
          { signal: controller.signal }
        )
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null);

        const nominatimPromise = fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            cleanQ
          )}&countrycodes=th&addressdetails=1&accept-language=he,en,th&limit=6`,
          { signal: controller.signal, headers: { Accept: 'application/json' } }
        )
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null);

        const [photonData, nominatimData] = await Promise.all([photonPromise, nominatimPromise]);

        // Process Photon Results (Thailand countrycode filter)
        if (photonData?.features && Array.isArray(photonData.features)) {
          for (let i = 0; i < photonData.features.length; i++) {
            const feat = photonData.features[i];
            const cc = feat.properties?.countrycode;
            if (cc === 'TH' || cc === 'th') {
              const item = mapPhotonResultToDestination(feat, i, rawQ);
              const key = item.nameHe.toLowerCase();
              if (!seenNames.has(key)) {
                seenNames.add(key);
                results.push(item);
              }
            }
          }
        }

        // Process Nominatim Results
        if (Array.isArray(nominatimData)) {
          nominatimData.forEach((raw, idx) => {
            const item = mapNominatimResultToDestination(raw, idx);
            const key = item.nameHe.toLowerCase();
            if (!seenNames.has(key)) {
              seenNames.add(key);
              results.push(item);
            }
          });
        }

        setLiveMatches(results.slice(0, 7));
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          setLiveMatches([]);
        }
      } finally {
        setIsSearchingLive(false);
      }
    }, 320);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [value, disabled]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (dest: JapanDestination) => {
    onSelectDestination(dest);
    setIsOpen(false);
  };

  const showDropdown =
    isOpen &&
    !disabled &&
    value.trim().length >= 1 &&
    (matches.length > 0 || liveMatches.length > 0 || isSearchingLive || value.trim().length >= 2);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative flex items-center">
        <input
          type="text"
          required={required}
          disabled={disabled}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            if (value.trim().length >= 1) setIsOpen(true);
          }}
          placeholder={placeholder}
          className="w-full bg-slate-950 border border-slate-800 focus:border-red-500 rounded-xl px-3.5 py-2.5 pl-8 text-xs text-white placeholder-slate-500 focus:outline-none transition shadow-inner"
        />

        {value && !disabled && (
          <button
            type="button"
            onClick={() => {
              onChange('');
              setIsOpen(false);
            }}
            className="absolute left-2.5 p-1 text-slate-500 hover:text-white transition"
            title="נקה שדה"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {showDropdown && (
        <div className="absolute top-full right-0 left-0 mt-1.5 bg-slate-900/98 backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-2xl z-50 max-h-80 overflow-y-auto divide-y divide-slate-800/80 animate-fadeIn">
          {/* Curated Offline Catalog Matches */}
          {matches.length > 0 && (
            <>
              <div className="p-2 bg-slate-950/70 border-b border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-semibold px-3">
                <span className="flex items-center gap-1.5 text-japan-sakura">
                  <Sparkles className="w-3 h-3 text-japan-sakura animate-pulse" />
                  <span>יעדים מומלצים במאגר תאילנד:</span>
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {matches.length} תוצאות
                </span>
              </div>

              {matches.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item)}
                  className="w-full text-right p-3 hover:bg-slate-800/80 transition flex items-start gap-3 group active:bg-slate-750"
                >
                  <div className="w-8 h-8 rounded-xl bg-japan-red/10 border border-japan-red/20 text-japan-red flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                    <Compass className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-black text-white group-hover:text-japan-sakura transition-colors">
                        {item.nameHe}
                      </span>

                      {item.nameJa && (
                        <span className="text-[11px] text-slate-400 font-japanese">
                          ({item.nameJa})
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] text-slate-400 truncate mt-0.5">
                      {item.nameEn}
                    </div>

                    {/* Badges: True City, Prefecture, Category, Duration, Booking */}
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      <span className="text-[10px] bg-red-950/90 text-red-300 border border-red-800/80 font-black px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                        <MapPin className="w-2.5 h-2.5 text-japan-red" />
                        <span>עיר: {item.city}</span>
                      </span>

                      {item.prefecture && (
                        <span className="text-[10px] bg-slate-800/90 text-slate-300 px-1.5 py-0.5 rounded-md">
                          {item.prefecture}
                        </span>
                      )}

                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold border ${CATEGORY_INFO[item.category]?.badgeBg} ${CATEGORY_INFO[item.category]?.badgeText} ${CATEGORY_INFO[item.category]?.borderColor}`}>
                        {CATEGORY_INFO[item.category]?.label}
                      </span>

                      {item.estimated_duration_mins && (
                        <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded-md font-mono flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5" />
                          <span>{item.estimated_duration_mins} דק'</span>
                        </span>
                      )}

                      {item.requires_advance_booking && (
                        <span className="text-[10px] bg-amber-950/80 text-amber-300 border border-amber-700/60 font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1">
                          <BellRing className="w-2.5 h-2.5 text-amber-400" />
                          <span>שריון מראש!</span>
                        </span>
                      )}
                    </div>

                    {item.nearest_station && (
                      <p className="text-[10px] text-indigo-300/90 mt-1 truncate">
                        🚉 {item.nearest_station}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </>
          )}

          {/* Live OpenStreetMap & Photon Thailand Search Results */}
          {(liveMatches.length > 0 || isSearchingLive) && (
            <>
              <div className="p-2 bg-slate-950/90 border-b border-slate-800/80 flex items-center justify-between text-[11px] text-sky-300 font-semibold px-3">
                <span className="flex items-center gap-1.5">
                  <Globe className="w-3 h-3 text-sky-400" />
                  <span>תוצאות חיפוש חי במפות תאילנד:</span>
                </span>
                {isSearchingLive && (
                  <span className="flex items-center gap-1 text-[10px] text-sky-400 font-normal">
                    <Loader2 className="w-3 h-3 animate-spin text-sky-400" />
                    <span>מחפש...</span>
                  </span>
                )}
              </div>

              {liveMatches.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item)}
                  className="w-full text-right p-2.5 hover:bg-slate-800/80 transition flex items-start gap-2.5 group"
                >
                  <div className="w-7 h-7 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-white group-hover:text-sky-300 transition-colors truncate">
                      {item.nameHe}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5">
                      {item.nameEn}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <span className="text-[10px] bg-sky-950/80 text-sky-300 border border-sky-800/60 font-bold px-1.5 py-0.5 rounded">
                        עיר/אזור: {item.city}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold border ${CATEGORY_INFO[item.category]?.badgeBg} ${CATEGORY_INFO[item.category]?.badgeText} ${CATEGORY_INFO[item.category]?.borderColor}`}>
                        {CATEGORY_INFO[item.category]?.label}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </>
          )}

          {/* If no matches anywhere and not searching */}
          {matches.length === 0 && liveMatches.length === 0 && !isSearchingLive && value.trim().length >= 2 && (
            <div className="p-3 text-center bg-slate-950/70 border-b border-slate-800/80">
              <p className="text-xs text-slate-300 font-medium">
                לא נמצא יעד קיים בשם "{value.trim()}" במאגר המהיר
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                לחץ על הכפתור למטה כדי לאתר ולהשלים פרטים מלאים בעזרת בינה מלאכותית:
              </p>
            </div>
          )}

          {/* Direct 1-Click AI Lookup Action inside Dropdown */}
          {onTriggerAiEnrich && value.trim().length >= 2 && (
            <div className="p-2.5 bg-gradient-to-r from-purple-950/80 via-slate-900 to-rose-950/80">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onTriggerAiEnrich();
                }}
                disabled={isEnriching}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-purple-600/50 to-pink-600/50 hover:from-purple-600/70 hover:to-pink-600/70 border border-purple-500/60 text-xs font-bold text-pink-100 flex items-center justify-center gap-2 transition shadow-md active:scale-[0.99] disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {isEnriching ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-pink-300 shrink-0" />
                    <span>ה-AI מאתר מידע ברשת ומעשיר את היעד...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-pink-300 animate-pulse shrink-0" />
                    <span>
                      {matches.length > 0 || liveMatches.length > 0
                        ? `✨ לא מצאת בדיוק? השלם אוטומטית עם AI עבור "${value.trim()}"`
                        : `✨ לחץ להשלמה אוטומטית מלאה עם AI עבור "${value.trim()}"`}
                    </span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};


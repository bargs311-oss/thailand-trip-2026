import React, { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import { TripDay, ItineraryItem, SavedHotel } from '../types';
import { 
  resolveItemCoordinates, 
  resolveHotelCoordinates, 
  resolveCityCenter,
  isItemInCityRegion,
  calculateDayRouteMetrics,
  DayRouteOptimizationResult
} from '../lib/geoData';
import { 
  Play, 
  Pause, 
  ChevronRight, 
  ChevronLeft, 
  MapPin, 
  ExternalLink, 
  X, 
  Navigation,
  Clock,
  JapaneseYen,
  Building,
  Plus,
  RotateCcw,
  Sparkles,
  Sun,
  Moon,
  Layers
} from 'lucide-react';
import { formatJPY } from '../lib/utils';

interface TripMapViewProps {
  days: TripDay[];
  items: ItineraryItem[];
  savedHotels: SavedHotel[];
  currentDayId?: string;
  onSelectDay?: (dayId: string) => void;
  onOpenItemModal?: (item: ItineraryItem) => void;
  onAssignItemToDay?: (itemId: string, dayId: string, timeSlot?: string) => void;
  onUnassignItem?: (itemId: string) => void;
  onOptimizeDayItems?: (dayId: string) => Promise<DayRouteOptimizationResult | null>;
}

export const TripMapView: React.FC<TripMapViewProps> = ({
  days,
  items,
  savedHotels,
  currentDayId,
  onSelectDay,
  onOpenItemModal,
  onAssignItemToDay,
  onUnassignItem,
  onOptimizeDayItems,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const allRouteLayerRef = useRef<L.Polyline | null>(null);

  // Initial day index based on currentDayId
  const initialIndex = useMemo(() => {
    if (!currentDayId) return 0;
    const idx = days.findIndex((d) => d.id === currentDayId);
    return idx >= 0 ? idx : 0;
  }, [days, currentDayId]);

  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(initialIndex);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [viewScope, setViewScope] = useState<'day' | 'all' | 'catalog'>('day');
  const [mapTheme, setMapTheme] = useState<'dark' | 'street' | 'satellite'>('dark');
  const [mapToast, setMapToast] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<{
    type: 'attraction' | 'hotel';
    item?: ItineraryItem;
    hotel?: {
      name: string;
      nameJa?: string;
      city: string;
      bookingUrl?: string;
    };
  } | null>(null);

  // Keep selectedDayIndex in sync when currentDayId changes from outside
  useEffect(() => {
    if (!currentDayId) return;
    const idx = days.findIndex((d) => d.id === currentDayId);
    if (idx >= 0 && idx !== selectedDayIndex) {
      setSelectedDayIndex(idx);
    }
  }, [currentDayId, days]);

  const currentDay = days[selectedDayIndex] || days[0];

  // Attractions for the currently selected day, sorted chronologically
  const dayItems = useMemo(() => {
    if (!currentDay) return [];
    return items
      .filter((it) => it.day_id === currentDay.id)
      .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
  }, [items, currentDay]);

  // Unassigned catalog attractions genuinely located in the current day's city/region
  const unassignedCityItems = useMemo(() => {
    if (!currentDay) return [];
    return items.filter(
      (it) => !it.day_id && isItemInCityRegion(it, currentDay.city)
    );
  }, [items, currentDay]);

  // Current day hotel info
  const dayHotel = useMemo(() => {
    if (!currentDay) return null;
    if (currentDay.hotel_name && currentDay.hotel_name.trim()) {
      return {
        name: currentDay.hotel_name,
        nameJa: currentDay.hotel_name_ja,
        city: currentDay.city,
        bookingUrl: currentDay.hotel_maps_url,
      };
    }
    const matchingHotel = savedHotels.find((h) =>
      h.assigned_day_numbers?.includes(currentDay.day_number)
    );
    if (matchingHotel) {
      return {
        name: matchingHotel.name,
        nameJa: matchingHotel.name_ja,
        city: matchingHotel.city,
        bookingUrl: matchingHotel.booking_url,
      };
    }
    return null;
  }, [currentDay, savedHotels]);

  const dayRouteMetrics = useMemo(
    () => calculateDayRouteMetrics(dayItems, dayHotel?.name, currentDay?.city),
    [dayItems, dayHotel, currentDay]
  );

  // 1. Initialize Leaflet Map & ResizeObserver (100% Free Keyless OpenStreetMap Tiles)
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const initialCoords = resolveCityCenter(currentDay?.city || 'פוקט');
    const map = L.map(mapContainerRef.current, {
      center: initialCoords,
      zoom: 13,
      zoomControl: false,
    });

    const tileLayer = L.tileLayer(
      'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }
    ).addTo(map);

    tileLayerRef.current = tileLayer;
    markersLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    // Ensure Leaflet recalculates container dimensions after layout/tab transitions
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && mapContainerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        map.invalidateSize();
      });
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      clearTimeout(timer);
      if (resizeObserver) resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
      tileLayerRef.current = null;
    };
  }, []);

  // Switch tile URL when mapTheme changes between street/dark (OSM) and satellite (Esri)
  useEffect(() => {
    if (!tileLayerRef.current) return;
    if (mapTheme === 'satellite') {
      tileLayerRef.current.setUrl(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      );
    } else {
      tileLayerRef.current.setUrl('https://tile.openstreetmap.org/{z}/{x}/{y}.png');
    }
  }, [mapTheme]);

  // 2. Play / Auto-Scrubber timer
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setSelectedDayIndex((prev) => {
        const next = (prev + 1) % days.length;
        if (onSelectDay && days[next]) {
          onSelectDay(days[next].id);
        }
        return next;
      });
    }, 2400);

    return () => clearInterval(interval);
  }, [isPlaying, days, onSelectDay]);

  // 3. Update Markers & Route Polyline when Day or Scope changes
  useEffect(() => {
    const map = mapRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();
    if (routeLayerRef.current) {
      map.removeLayer(routeLayerRef.current);
      routeLayerRef.current = null;
    }
    if (allRouteLayerRef.current) {
      map.removeLayer(allRouteLayerRef.current);
      allRouteLayerRef.current = null;
    }

    // MODE 1: ALL JAPAN OVERVIEW
    if (viewScope === 'all') {
      const cityPoints: [number, number][] = [];
      const cityNamesSeen = new Set<string>();

      days.forEach((d) => {
        if (!cityNamesSeen.has(d.city)) {
          cityNamesSeen.add(d.city);
          const coords = resolveCityCenter(d.city);
          cityPoints.push(coords);

          const cityDays = days.filter((dayItem) => dayItem.city === d.city);
          const dayRangeLabel =
            cityDays.length > 1
              ? `ימים ${cityDays[0].day_number}-${cityDays[cityDays.length - 1].day_number}`
              : `יום ${d.day_number}`;

          const cityIcon = L.divIcon({
            className: 'custom-city-pin',
            html: `
              <div style="background: rgba(225, 29, 72, 0.92); border: 2px solid #fff; border-radius: 9999px; padding: 4px 10px; color: #fff; font-size: 11px; font-weight: bold; white-space: nowrap; box-shadow: 0 4px 14px rgba(0,0,0,0.65); display: flex; align-items: center; gap: 5px; cursor: pointer;">
                <span>🇹🇭</span>
                <span>${d.city}</span>
                <span style="opacity: 0.8; font-size: 9px;">(${dayRangeLabel})</span>
              </div>
            `,
            iconSize: [110, 28],
            iconAnchor: [55, 14],
          });

          L.marker(coords, { icon: cityIcon })
            .addTo(markersLayer)
            .on('click', () => {
              const firstDayIdx = days.findIndex((dayItem) => dayItem.city === d.city);
              if (firstDayIdx >= 0) {
                setSelectedDayIndex(firstDayIdx);
                setViewScope('day');
              }
            });
        }
      });

      if (cityPoints.length > 1) {
        allRouteLayerRef.current = L.polyline(cityPoints, {
          color: '#fb7185',
          weight: 4,
          dashArray: '8, 8',
          opacity: 0.85,
        }).addTo(map);

        map.flyToBounds(L.latLngBounds(cityPoints), {
          padding: [55, 55],
          duration: 1.1,
        });
      } else if (cityPoints.length === 1) {
        map.flyTo(cityPoints[0], 11, { duration: 1.0 });
      }
      return;
    }

    // MODE 2: CATALOG OVERVIEW (All saved hotels + all attractions, assigned or unassigned)
    if (viewScope === 'catalog') {
      const catalogPoints: [number, number][] = [];

      savedHotels.forEach((hotel) => {
        const coords = resolveHotelCoordinates(hotel.name, hotel.city);
        catalogPoints.push(coords);

        const hotelIcon = L.divIcon({
          className: 'custom-hotel-pin',
          html: `
            <div style="background: #eab308; border: 2px solid #fff; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-size: 14px; box-shadow: 0 4px 12px rgba(234,179,8,0.6); cursor: pointer;">
              🏨
            </div>
          `,
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        });

        L.marker(coords, { icon: hotelIcon })
          .addTo(markersLayer)
          .on('click', () => {
            setSelectedItem({
              type: 'hotel',
              hotel: {
                name: hotel.name,
                nameJa: hotel.name_ja,
                city: hotel.city,
                bookingUrl: hotel.booking_url,
              },
            });
          });
      });

      items.forEach((item, idx) => {
        const assignedDay = item.day_id ? days.find((d) => d.id === item.day_id) : null;
        const fallbackCity = item.city || assignedDay?.city || currentDay?.city || 'טוקיו';
        const coords = resolveItemCoordinates(item.title, fallbackCity, idx);
        catalogPoints.push(coords);

        const isAssigned = Boolean(item.day_id);
        const pinBg = isAssigned ? '#e11d48' : '#0ea5e9';
        const badgeText = assignedDay ? `D${assignedDay.day_number}` : '+';

        const catalogIcon = L.divIcon({
          className: 'custom-catalog-pin',
          html: `
            <div style="background: ${pinBg}; border: 2px solid #ffffff; border-radius: 9999px; min-width: 30px; height: 28px; padding: 0 6px; display: flex; align-items: center; justify-content: center; color: #ffffff; font-weight: 900; font-size: 11px; font-family: monospace; box-shadow: 0 4px 12px rgba(0,0,0,0.7); cursor: pointer;">
              ${badgeText}
            </div>
          `,
          iconSize: [32, 28],
          iconAnchor: [16, 14],
        });

        L.marker(coords, { icon: catalogIcon })
          .addTo(markersLayer)
          .on('click', () => {
            setSelectedItem({
              type: 'attraction',
              item,
            });
          });
      });

      if (catalogPoints.length > 0) {
        map.flyToBounds(L.latLngBounds(catalogPoints), {
          padding: [55, 55],
          maxZoom: 14,
          duration: 1.0,
        });
      }
      return;
    }

    // MODE 3: DAY FOCUSED MODE
    const routeCoords: [number, number][] = [];
    const allDayPoints: [number, number][] = [];

    // A. Hotel Marker
    if (dayHotel) {
      const hotelCoords = resolveHotelCoordinates(dayHotel.name, dayHotel.city);
      routeCoords.push(hotelCoords);
      allDayPoints.push(hotelCoords);

      const hotelIcon = L.divIcon({
        className: 'custom-hotel-pin',
        html: `
          <div style="background: #eab308; border: 2px solid #fff; border-radius: 50%; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; font-size: 16px; box-shadow: 0 4px 14px rgba(234,179,8,0.7); cursor: pointer;">
            🏨
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });

      L.marker(hotelCoords, { icon: hotelIcon })
        .addTo(markersLayer)
        .on('click', () => {
          setSelectedItem({
            type: 'hotel',
            hotel: dayHotel,
          });
        });
    }

    // B. Scheduled Attraction Markers for Selected Day
    dayItems.forEach((item, idx) => {
      const coords = resolveItemCoordinates(item.title, item.city || currentDay?.city, idx);
      routeCoords.push(coords);
      allDayPoints.push(coords);

      const badgeNumber = idx + 1;
      const categoryColor =
        item.category === 'food'
          ? '#f97316'
          : item.category === 'activity'
          ? '#a855f7'
          : item.category === 'shopping'
          ? '#ec4899'
          : '#e11d48';

      const attractionIcon = L.divIcon({
        className: 'custom-attraction-pin',
        html: `
          <div style="background: ${categoryColor}; border: 2px solid #ffffff; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; color: #ffffff; font-weight: 900; font-size: 13px; font-family: monospace; box-shadow: 0 4px 14px rgba(0,0,0,0.7); cursor: pointer;">
            ${badgeNumber}
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      L.marker(coords, { icon: attractionIcon })
        .addTo(markersLayer)
        .on('click', () => {
          setSelectedItem({
            type: 'attraction',
            item,
          });
        });
    });

    // B2. Also show unassigned catalog attractions in the same city as dashed/cyan pins so user can schedule them directly from the map
    unassignedCityItems.forEach((item, idx) => {
      const coords = resolveItemCoordinates(
        item.title,
        item.city || currentDay?.city,
        dayItems.length + idx
      );
      if (dayItems.length === 0) {
        allDayPoints.push(coords);
      }

      const suggestionIcon = L.divIcon({
        className: 'custom-unassigned-pin',
        html: `
          <div title="לא משובץ - לחץ לשיבוץ ביום זה" style="background: rgba(14, 165, 233, 0.88); border: 2px dashed #ffffff; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; color: #ffffff; font-weight: 900; font-size: 14px; box-shadow: 0 3px 10px rgba(0,0,0,0.6); cursor: pointer;">
            +
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      L.marker(coords, { icon: suggestionIcon })
        .addTo(markersLayer)
        .on('click', () => {
          setSelectedItem({
            type: 'attraction',
            item,
          });
        });
    });

    // C. Glowing Day Route Polyline & Midpoint Transit Badges
    if (routeCoords.length >= 2) {
      routeLayerRef.current = L.polyline(routeCoords, {
        color: '#f43f5e',
        weight: 3.5,
        dashArray: '6, 8',
        opacity: 0.85,
      }).addTo(map);

      dayRouteMetrics.legs.forEach((leg) => {
        const borderCol = leg.isFarWarning
          ? '#f59e0b'
          : leg.mode === 'walk'
          ? '#34d399'
          : '#38bdf8';

        const legIcon = L.divIcon({
          className: 'custom-transit-leg-pin',
          html: `
            <div title="לחץ לפתיחת הוראות הגעה ב-Google Maps" style="background: rgba(15, 23, 42, 0.92); border: 1.5px solid ${borderCol}; border-radius: 9999px; padding: 2px 7px; color: #f8fafc; font-size: 10px; font-weight: 800; white-space: nowrap; box-shadow: 0 3px 10px rgba(0,0,0,0.65); display: flex; align-items: center; gap: 3px; cursor: pointer;">
              <span>${leg.icon}</span>
              <span>${leg.durationMinutes} דק'</span>
            </div>
          `,
          iconSize: [64, 22],
          iconAnchor: [32, 11],
        });

        L.marker(leg.midpoint, { icon: legIcon })
          .addTo(markersLayer)
          .on('click', () => {
            window.open(leg.directionsUrl, '_blank', 'noopener,noreferrer');
          });
      });
    }

    // D. Smooth FlyTo Bounds
    if (allDayPoints.length > 0) {
      const bounds = L.latLngBounds(allDayPoints);
      map.flyToBounds(bounds, {
        padding: [65, 65],
        maxZoom: 15,
        duration: 0.9,
      });
    } else {
      const cityCenter = resolveCityCenter(currentDay?.city || 'טוקיו');
      map.flyTo(cityCenter, 13, { duration: 0.9 });
    }
  }, [
    selectedDayIndex,
    viewScope,
    dayItems,
    unassignedCityItems,
    dayHotel,
    dayRouteMetrics,
    currentDay,
    days,
    items,
    savedHotels,
  ]);

  const handleDayChange = (newIndex: number) => {
    setSelectedDayIndex(newIndex);
    setSelectedItem(null);
    if (onSelectDay && days[newIndex]) {
      onSelectDay(days[newIndex].id);
    }
  };

  const handleFocusStop = (
    coords: [number, number],
    payload: NonNullable<typeof selectedItem>
  ) => {
    setSelectedItem(payload);
    if (mapRef.current) {
      mapRef.current.flyTo(coords, 15, { duration: 0.7 });
    }
  };

  const selectedItemAssignedDay = useMemo(() => {
    if (selectedItem?.type !== 'attraction' || !selectedItem.item?.day_id) return null;
    return days.find((d) => d.id === selectedItem.item?.day_id) || null;
  }, [selectedItem, days]);

  return (
    <div className="relative w-full h-[calc(100vh-145px)] sm:h-[calc(100vh-155px)] flex flex-col bg-slate-950 overflow-hidden font-hebrew">
      {/* 1. Top Controls Bar (Responsive: stacked cleanly on mobile so city name never truncates) */}
      <div className="absolute top-2.5 left-3 right-3 z-[1000] flex flex-col sm:flex-row sm:items-center justify-between gap-2 pointer-events-none">
        {/* Day & City Badge */}
        <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 px-3.5 py-2 rounded-2xl shadow-xl flex items-center justify-between sm:justify-start gap-2.5 pointer-events-auto min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse shrink-0" />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-white whitespace-nowrap">
                  יום {currentDay?.day_number || 1}
                </span>
                <span className="text-[10px] text-slate-400">•</span>
                <span className="text-xs font-bold text-rose-300 truncate">
                  {currentDay?.city || 'טוקיו'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 truncate">
                {currentDay?.title || currentDay?.date || ''}
              </p>
            </div>
          </div>
        </div>

        {/* View Scope Toggle (Day Focus vs All Japan vs Full Catalog) */}
        <div className="flex items-center justify-between sm:justify-start gap-1 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 p-1 rounded-2xl shadow-xl pointer-events-auto shrink-0">
          <button
            onClick={() => {
              setViewScope('day');
              setSelectedItem(null);
            }}
            className={`flex-1 sm:flex-initial px-2.5 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition text-center ${
              viewScope === 'day'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            יום נבחר
          </button>
          <button
            onClick={() => {
              setViewScope('all');
              setIsPlaying(false);
              setSelectedItem(null);
            }}
            className={`flex-1 sm:flex-initial px-2.5 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition text-center ${
              viewScope === 'all'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            כל המסלול 🇹🇭
          </button>
          <button
            onClick={() => {
              setViewScope('catalog');
              setIsPlaying(false);
              setSelectedItem(null);
            }}
            className={`flex-1 sm:flex-initial px-2.5 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition text-center ${
              viewScope === 'catalog'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            מאגר ({items.length}) 📌
          </button>
        </div>
      </div>

      {/* Custom Map Zoom & Style Buttons (Left Side, clear of top/bottom bars) */}
      <div className="absolute top-28 sm:top-20 left-3 z-[1000] flex flex-col gap-1.5">
        <button
          onClick={() => mapRef.current?.zoomIn()}
          className="w-9 h-9 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-white font-black text-lg shadow-lg flex items-center justify-center transition active:scale-95"
          title="התקרב"
        >
          +
        </button>
        <button
          onClick={() => mapRef.current?.zoomOut()}
          className="w-9 h-9 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-white font-black text-lg shadow-lg flex items-center justify-center transition active:scale-95"
          title="התרחק"
        >
          −
        </button>
        <button
          onClick={() =>
            setMapTheme((prev) =>
              prev === 'dark' ? 'street' : prev === 'street' ? 'satellite' : 'dark'
            )
          }
          className="w-9 h-9 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-amber-300 shadow-lg flex items-center justify-center transition active:scale-95 mt-1"
          title={
            mapTheme === 'dark'
              ? 'עבור למפה בהירה'
              : mapTheme === 'street'
              ? 'עבור למפת לוויין'
              : 'עבור למפה כהה'
          }
        >
          {mapTheme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-300" />
          ) : mapTheme === 'street' ? (
            <Layers className="w-4 h-4 text-sky-300" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-300" />
          )}
        </button>
      </div>

      {/* 2. Leaflet Map View Container */}
      <div
        ref={mapContainerRef}
        className={`w-full h-full z-0 ${mapTheme === 'dark' ? 'map-tiles-dark' : ''}`}
      />

      {/* 3. Selected Item / Hotel Bottom Drawer Card */}
      {selectedItem && (
        <div className="absolute bottom-36 sm:bottom-32 left-3 right-3 sm:left-auto sm:right-4 sm:w-96 z-[1000] bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-3xl p-4 shadow-2xl animate-fadeIn">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  selectedItem.type === 'hotel'
                    ? 'bg-yellow-500/20 text-yellow-300'
                    : selectedItem.item?.day_id
                    ? 'bg-rose-500/20 text-rose-300'
                    : 'bg-sky-500/20 text-sky-300'
                }`}
              >
                {selectedItem.type === 'hotel' ? (
                  <Building className="w-4 h-4" />
                ) : (
                  <MapPin className="w-4 h-4" />
                )}
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {selectedItem.type === 'hotel'
                    ? 'מלון הלינה'
                    : selectedItemAssignedDay
                    ? `משובץ ביום ${selectedItemAssignedDay.day_number} (${selectedItemAssignedDay.city})`
                    : 'במאגר אטרקציות (טרם שובץ ליום)'}
                </span>
                <h4 className="text-sm font-black text-white truncate">
                  {selectedItem.type === 'hotel'
                    ? selectedItem.hotel?.name
                    : selectedItem.item?.title}
                </h4>
              </div>
            </div>

            <button
              onClick={() => setSelectedItem(null)}
              className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Details */}
          {selectedItem.type === 'attraction' && selectedItem.item && (
            <div className="space-y-2 mt-2 pt-2 border-t border-slate-800/80">
              {selectedItem.item.title_ja && (
                <p className="text-xs text-rose-300/90 font-japanese">
                  {selectedItem.item.title_ja}
                </p>
              )}

              <div className="flex items-center gap-3 text-xs text-slate-300 flex-wrap">
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{selectedItem.item.time_slot || 'גמיש'}</span>
                </div>
                {selectedItem.item.cost_jpy !== undefined && selectedItem.item.cost_jpy > 0 && (
                  <div className="flex items-center gap-1 font-mono text-amber-300">
                    <JapaneseYen className="w-3.5 h-3.5" />
                    <span>{formatJPY(selectedItem.item.cost_jpy)}</span>
                  </div>
                )}
              </div>

              {selectedItem.item.nearest_station && (
                <p className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Navigation className="w-3 h-3 text-sky-400 shrink-0" />
                  <span>תחנה: {selectedItem.item.nearest_station}</span>
                </p>
              )}

              {selectedItem.item.pro_tips && (
                <p className="text-[11px] text-amber-200/90 bg-amber-950/40 p-2 rounded-xl border border-amber-800/40 leading-relaxed">
                  💡 {selectedItem.item.pro_tips}
                </p>
              )}

              {/* Direct Map Scheduling Action */}
              {currentDay && onAssignItemToDay && !selectedItem.item.day_id && (
                <button
                  onClick={() => {
                    onAssignItemToDay(selectedItem.item!.id, currentDay.id);
                    setSelectedItem((prev) =>
                      prev && prev.item
                        ? { ...prev, item: { ...prev.item, day_id: currentDay.id } }
                        : null
                    );
                  }}
                  className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>שבץ ליום {currentDay.day_number} ({currentDay.city})</span>
                </button>
              )}

              {selectedItem.item.day_id && onUnassignItem && (
                <button
                  onClick={() => {
                    onUnassignItem(selectedItem.item!.id);
                    setSelectedItem((prev) =>
                      prev && prev.item
                        ? { ...prev, item: { ...prev.item, day_id: null } }
                        : null
                    );
                  }}
                  className="w-full py-1.5 px-3 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>הסר מהיום והחזר למאגר</span>
                </button>
              )}

              <div className="flex items-center gap-2 pt-1">
                <a
                  href={
                    selectedItem.item.google_maps_url ||
                    `https://maps.google.com/?q=${encodeURIComponent(
                      selectedItem.item.location_name || selectedItem.item.title
                    )}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-1.5 px-3 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1 shadow-md"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>ניווט ב-Google Maps</span>
                </a>
                {onOpenItemModal && (
                  <button
                    onClick={() => {
                      onOpenItemModal(selectedItem.item!);
                      setSelectedItem(null);
                    }}
                    className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition"
                  >
                    עריכה
                  </button>
                )}
              </div>
            </div>
          )}

          {selectedItem.type === 'hotel' && selectedItem.hotel && (
            <div className="space-y-2 mt-2 pt-2 border-t border-slate-800/80">
              {selectedItem.hotel.nameJa && (
                <p className="text-xs text-amber-300/90 font-japanese">
                  {selectedItem.hotel.nameJa}
                </p>
              )}
              <p className="text-xs text-slate-300">
                עיר: <span className="font-bold text-white">{selectedItem.hotel.city}</span>
              </p>
              {selectedItem.hotel.bookingUrl && (
                <a
                  href={selectedItem.hotel.bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-1.5 px-3 bg-yellow-600 hover:bg-yellow-500 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1 shadow-md mt-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>קישור לפרטי המלון</span>
                </a>
              )}
            </div>
          )}
        </div>
      )}

      {/* 4. Bottom Interactive Day Slider & Timeline Control */}
      <div className="absolute bottom-3 left-3 right-3 z-[1000] bg-slate-900/95 backdrop-blur-md border border-slate-800/90 rounded-3xl p-3 sm:p-4 shadow-2xl flex flex-col gap-2">
        {/* Quick-Jump Horizontal Stop Pills for Current Day */}
        {viewScope === 'day' && (dayHotel || dayItems.length > 0 || unassignedCityItems.length > 0) && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 border-b border-slate-800/80">
            {dayHotel && (
              <button
                onClick={() =>
                  handleFocusStop(resolveHotelCoordinates(dayHotel.name, dayHotel.city), {
                    type: 'hotel',
                    hotel: dayHotel,
                  })
                }
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-yellow-500/15 hover:bg-yellow-500/25 border border-yellow-500/30 text-yellow-200 text-[11px] font-bold whitespace-nowrap transition shrink-0"
              >
                <span>🏨</span>
                <span className="max-w-[110px] truncate">{dayHotel.name}</span>
              </button>
            )}
            {dayItems.map((it, idx) => (
              <button
                key={it.id}
                onClick={() =>
                  handleFocusStop(
                    resolveItemCoordinates(it.title, it.city || currentDay?.city, idx),
                    { type: 'attraction', item: it }
                  )
                }
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-200 text-[11px] font-bold whitespace-nowrap transition shrink-0"
              >
                <span className="w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] flex items-center justify-center font-mono">
                  {idx + 1}
                </span>
                <span className="max-w-[120px] truncate">{it.title}</span>
              </button>
            ))}
            {dayItems.length === 0 &&
              unassignedCityItems.slice(0, 6).map((it, idx) => (
                <button
                  key={it.id}
                  onClick={() =>
                    handleFocusStop(
                      resolveItemCoordinates(it.title, it.city || currentDay?.city, idx),
                      { type: 'attraction', item: it }
                    )
                  }
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-200 text-[11px] font-bold whitespace-nowrap transition shrink-0"
                >
                  <span className="text-sky-400 font-black">+</span>
                  <span className="max-w-[120px] truncate">{it.title}</span>
                </button>
              ))}
          </div>
        )}

        {mapToast && (
          <div className="bg-emerald-950/80 border border-emerald-500/40 rounded-2xl px-3 py-1.5 text-[11px] text-emerald-200 flex items-center justify-between gap-2 animate-fadeIn">
            <span>{mapToast}</span>
            <button
              type="button"
              onClick={() => setMapToast(null)}
              className="text-emerald-400 hover:text-white font-bold px-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* Slider Meta & Actions */}
        <div className="flex items-center justify-between gap-2">
          {/* Day Prev / Next / Play / Optimize Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                setViewScope('day');
                setMapToast(null);
                handleDayChange(Math.max(0, selectedDayIndex - 1));
              }}
              disabled={selectedDayIndex === 0}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-white transition active:scale-95"
              title="יום קודם"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                if (viewScope !== 'day') setViewScope('day');
                setIsPlaying(!isPlaying);
              }}
              className={`p-1.5 px-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1 active:scale-95 shadow-md ${
                isPlaying
                  ? 'bg-amber-600 text-white'
                  : 'bg-rose-600 hover:bg-rose-500 text-white'
              }`}
              title={isPlaying ? 'השהה' : 'נגן מסלול טיול'}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span className="text-[11px] hidden sm:inline">השהה</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span className="text-[11px] hidden sm:inline">נגן מסלול</span>
                </>
              )}
            </button>

            {dayItems.length >= 2 && onOptimizeDayItems && currentDay && (
              <button
                type="button"
                onClick={async () => {
                  setViewScope('day');
                  const res = await onOptimizeDayItems(currentDay.id);
                  if (!res) return;
                  if (res.orderChanged && res.savedKm > 0) {
                    setMapToast(
                      `✨ המסלול סודר! נחסכו ${res.savedKm} ק"מ וכ-${res.savedMinutes} דק' נסיעה.`
                    );
                  } else {
                    setMapToast(
                      `✅ סדר היעדים והשעות אופטימלי (${res.newDistanceKm} ק"מ, כ-${res.newTransitMinutes} דק').`
                    );
                  }
                }}
                className="p-1.5 px-2.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/45 border border-indigo-500/40 text-indigo-200 text-xs font-bold transition flex items-center gap-1 active:scale-95"
                title="סדר אוטומטית את אטרקציות היום במסלול הגיאוגרפי הקצר ביותר"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
                <span className="text-[11px] hidden sm:inline">סדר מסלול</span>
              </button>
            )}

            <button
              onClick={() => {
                setViewScope('day');
                setMapToast(null);
                handleDayChange(Math.min(days.length - 1, selectedDayIndex + 1));
              }}
              disabled={selectedDayIndex === days.length - 1}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-white transition active:scale-95"
              title="יום הבא"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Current Day Summary Badge */}
          <div className="text-left sm:text-right">
            <span className="text-xs font-black text-white">
              יום {currentDay?.day_number || 1} מתוך {days.length}
            </span>
            <span className="text-[11px] text-slate-400 block sm:inline sm:mr-2">
              {dayRouteMetrics.legs.length > 0
                ? `(${dayItems.length} יעדים • 📏 ${dayRouteMetrics.totalDistanceKm} ק"מ • 🚇 ${dayRouteMetrics.totalTransitMinutes} דק')`
                : `(${dayItems.length} משובצים${
                    unassignedCityItems.length > 0
                      ? ` • ${unassignedCityItems.length} במאגר העיר`
                      : ''
                  })`}
            </span>
          </div>
        </div>

        {/* Range Slider Scrubber */}
        <div className="flex items-center gap-3 pt-0.5">
          <input
            type="range"
            min={0}
            max={days.length - 1}
            value={selectedDayIndex}
            onChange={(e) => {
              if (viewScope !== 'day') setViewScope('day');
              handleDayChange(Number(e.target.value));
            }}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500 focus:outline-none transition"
          />
        </div>
      </div>
    </div>
  );
};

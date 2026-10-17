import { ItineraryItem } from '../types';

export interface LatLng {
  lat: number;
  lng: number;
}

export interface TransitLegEstimate {
  fromName: string;
  toName: string;
  fromCoord: [number, number];
  toCoord: [number, number];
  midpoint: [number, number];
  distanceKm: number;
  distanceLabel: string;
  durationMinutes: number;
  mode: 'walk' | 'train' | 'shinkansen';
  icon: string;
  modeLabel: string;
  shortLabel: string;
  isFarWarning: boolean;
  warningText?: string;
  directionsUrl: string;
}

export interface DayRouteMetrics {
  legs: TransitLegEstimate[];
  totalDistanceKm: number;
  totalTransitMinutes: number;
  hasFarWarning: boolean;
}

export interface DayRouteOptimizationResult {
  optimizedItems: ItineraryItem[];
  previousDistanceKm: number;
  newDistanceKm: number;
  savedKm: number;
  previousTransitMinutes: number;
  newTransitMinutes: number;
  savedMinutes: number;
  orderChanged: boolean;
}

// 1. Coordinates for Thailand's 3 Main Hubs (Phuket, Koh Samui, Bangkok) + Day Trip Islands
export const CITY_COORDINATES: Record<string, LatLng> = {
  'פוקט': { lat: 7.8804, lng: 98.3923 },
  'phuket': { lat: 7.8804, lng: 98.3923 },
  'קוסמוי': { lat: 9.5120, lng: 100.0136 },
  'קו סמוי': { lat: 9.5120, lng: 100.0136 },
  'koh samui': { lat: 9.5120, lng: 100.0136 },
  'samui': { lat: 9.5120, lng: 100.0136 },
  'בנגקוק': { lat: 13.7563, lng: 100.5018 },
  'bangkok': { lat: 13.7563, lng: 100.5018 },
  'קו פי פי': { lat: 7.7407, lng: 98.7784 },
  'phi phi': { lat: 7.7407, lng: 98.7784 },
  'פאנג נגה': { lat: 8.2746, lng: 98.5012 },
  'phang nga': { lat: 8.2746, lng: 98.5012 },
  'אנג תונג': { lat: 9.6215, lng: 99.6776 },
  'ang thong': { lat: 9.6215, lng: 99.6776 },
  'קו פנגן': { lat: 9.7319, lng: 100.0136 },
  'koh phangan': { lat: 9.7319, lng: 100.0136 },
};

// 2. Exact Coordinates for Destinations, Beaches, Malls & Hotels in Phuket, Koh Samui, and Bangkok
export const DESTINATION_COORDINATES: Record<string, LatLng> = {
  // Phuket
  'patong': { lat: 7.8965, lng: 98.2965 },
  'פאטונג': { lat: 7.8965, lng: 98.2965 },
  'חוף פאטונג': { lat: 7.8965, lng: 98.2965 },
  'jungceylon': { lat: 7.8916, lng: 98.3001 },
  'ג\'ונגסיילון': { lat: 7.8916, lng: 98.3001 },
  'bangla': { lat: 7.8935, lng: 98.2968 },
  'בנגלה': { lat: 7.8935, lng: 98.2968 },
  'kata': { lat: 7.8206, lng: 98.2982 },
  'קאטה': { lat: 7.8206, lng: 98.2982 },
  'חוף קאטה': { lat: 7.8206, lng: 98.2982 },
  'karon': { lat: 7.8439, lng: 98.2936 },
  'קארון': { lat: 7.8439, lng: 98.2936 },
  'חוף קארון': { lat: 7.8439, lng: 98.2936 },
  'old phuket town': { lat: 7.8848, lng: 98.3894 },
  'thalang': { lat: 7.8848, lng: 98.3894 },
  'העיירה העתיקה': { lat: 7.8848, lng: 98.3894 },
  'העיר העתיקה פוקט': { lat: 7.8848, lng: 98.3894 },
  'wat chalong': { lat: 7.8468, lng: 98.3369 },
  'צ\'אלונג': { lat: 7.8468, lng: 98.3369 },
  'big buddha phuket': { lat: 7.8276, lng: 98.3127 },
  'ביג בודהה פוקט': { lat: 7.8276, lng: 98.3127 },
  'promthep': { lat: 7.7618, lng: 98.3053 },
  'פרומתפ': { lat: 7.7618, lng: 98.3053 },
  'rawai': { lat: 7.7797, lng: 98.3253 },
  'ראוואי': { lat: 7.7797, lng: 98.3253 },
  'andamanda': { lat: 7.9029, lng: 98.3665 },
  'אנדמנדה': { lat: 7.9029, lng: 98.3665 },
  'central phuket': { lat: 7.8904, lng: 98.3676 },
  'סנטרל פוקט': { lat: 7.8904, lng: 98.3676 },
  'carnival magic': { lat: 7.9566, lng: 98.2846 },
  'קרניבל מג\'יק': { lat: 7.9566, lng: 98.2846 },
  'kamala': { lat: 7.9522, lng: 98.2812 },
  'קמאלה': { lat: 7.9522, lng: 98.2812 },
  'bang tao': { lat: 7.9974, lng: 98.2932 },
  'בנג טאו': { lat: 7.9974, lng: 98.2932 },
  'phi phi': { lat: 7.7407, lng: 98.7784 },
  'פי פי': { lat: 7.7407, lng: 98.7784 },
  'maya bay': { lat: 7.6783, lng: 98.7658 },
  'מאיה ביי': { lat: 7.6783, lng: 98.7658 },
  'james bond': { lat: 8.2746, lng: 98.5012 },
  'ג\'יימס בונד': { lat: 8.2746, lng: 98.5012 },
  'פאנג נגה': { lat: 8.2746, lng: 98.5012 },
  'elephant sanctuary': { lat: 8.0211, lng: 98.3965 },
  'חוות פילים': { lat: 8.0211, lng: 98.3965 },
  'שדה התעופה פוקט': { lat: 8.1111, lng: 98.3065 },
  'phuket airport': { lat: 8.1111, lng: 98.3065 },

  // Koh Samui
  'chaweng': { lat: 9.5318, lng: 100.0631 },
  'צ\'אוונג': { lat: 9.5318, lng: 100.0631 },
  'חוף צ\'אוונג': { lat: 9.5318, lng: 100.0631 },
  'central samui': { lat: 9.5326, lng: 100.0617 },
  'סנטרל סמוי': { lat: 9.5326, lng: 100.0617 },
  'fisherman': { lat: 9.5604, lng: 100.0305 },
  'bophut': { lat: 9.5604, lng: 100.0305 },
  'כפר הדייגים': { lat: 9.5604, lng: 100.0305 },
  'בוהפוט': { lat: 9.5604, lng: 100.0305 },
  'coco tam': { lat: 9.5612, lng: 100.0273 },
  'קוקו טאמס': { lat: 9.5612, lng: 100.0273 },
  'wat plai laem': { lat: 9.5715, lng: 100.0672 },
  'פלאי לאם': { lat: 9.5715, lng: 100.0672 },
  'big buddha samui': { lat: 9.5707, lng: 100.0600 },
  'wat phra yai': { lat: 9.5707, lng: 100.0600 },
  'ביג בודהה קוסמוי': { lat: 9.5707, lng: 100.0600 },
  'silver beach': { lat: 9.4827, lng: 100.0675 },
  'crystal bay': { lat: 9.4827, lng: 100.0675 },
  'סילבר ביץ': { lat: 9.4827, lng: 100.0675 },
  'קריסטל ביי': { lat: 9.4827, lng: 100.0675 },
  'lamai': { lat: 9.4628, lng: 100.0442 },
  'לאמאי': { lat: 9.4628, lng: 100.0442 },
  'חוף לאמאי': { lat: 9.4628, lng: 100.0442 },
  'hin ta': { lat: 9.4494, lng: 100.0369 },
  'na muang': { lat: 9.4675, lng: 99.9856 },
  'נאם מואנג': { lat: 9.4675, lng: 99.9856 },
  'מפלי נאם מואנג': { lat: 9.4675, lng: 99.9856 },
  'ang thong': { lat: 9.6215, lng: 99.6776 },
  'אנג תונג': { lat: 9.6215, lng: 99.6776 },
  'koh madsum': { lat: 9.3765, lng: 99.9723 },
  'אי החזירים': { lat: 9.3765, lng: 99.9723 },
  'שדה התעופה קוסמוי': { lat: 9.5478, lng: 100.0623 },
  'samui airport': { lat: 9.5478, lng: 100.0623 },

  // Bangkok
  'grand palace': { lat: 13.7500, lng: 100.4913 },
  'ארמון המלך': { lat: 13.7500, lng: 100.4913 },
  'הארמון הגדול': { lat: 13.7500, lng: 100.4913 },
  'wat pho': { lat: 13.7465, lng: 100.4933 },
  'וואט פו': { lat: 13.7465, lng: 100.4933 },
  'הבודהה השוכב': { lat: 13.7465, lng: 100.4933 },
  'wat arun': { lat: 13.7437, lng: 100.4888 },
  'וואט ארון': { lat: 13.7437, lng: 100.4888 },
  'מקדש השחר': { lat: 13.7437, lng: 100.4888 },
  'iconsiam': { lat: 13.7267, lng: 100.5105 },
  'icon siam': { lat: 13.7267, lng: 100.5105 },
  'אייקון סיאם': { lat: 13.7267, lng: 100.5105 },
  'siam paragon': { lat: 13.7462, lng: 100.5347 },
  'סיאם פרגון': { lat: 13.7462, lng: 100.5347 },
  'centralworld': { lat: 13.7466, lng: 100.5393 },
  'סנטרל וורלד': { lat: 13.7466, lng: 100.5393 },
  'mbk': { lat: 13.7444, lng: 100.5300 },
  'mahanakhon': { lat: 13.7235, lng: 100.5284 },
  'מהאנקון': { lat: 13.7235, lng: 100.5284 },
  'asiatique': { lat: 13.7046, lng: 100.5032 },
  'אסיאטיק': { lat: 13.7046, lng: 100.5032 },
  'jodd fairs': { lat: 13.7568, lng: 100.5678 },
  'ג\'וד פיירס': { lat: 13.7568, lng: 100.5678 },
  'chatuchak': { lat: 13.7999, lng: 100.5508 },
  'צ\'אטוצ\'אק': { lat: 13.7999, lng: 100.5508 },
  'chinatown': { lat: 13.7411, lng: 100.5083 },
  'yaowarat': { lat: 13.7411, lng: 100.5083 },
  'צ\'יינה טאון': { lat: 13.7411, lng: 100.5083 },
  'lumpini': { lat: 13.7314, lng: 100.5414 },
  'לומפיני': { lat: 13.7314, lng: 100.5414 },
  'terminal 21': { lat: 13.7378, lng: 100.5604 },
  'טרמינל 21': { lat: 13.7378, lng: 100.5604 },
  'sukhumvit': { lat: 13.7378, lng: 100.5604 },
  'סוקומוויט': { lat: 13.7378, lng: 100.5604 },
  'damnoen saduak': { lat: 13.5194, lng: 99.9592 },
  'השוק הצף': { lat: 13.5194, lng: 99.9592 },
  'suvarnabhumi': { lat: 13.6900, lng: 100.7501 },
  'סוברנבומי': { lat: 13.6900, lng: 100.7501 },
};

function getPseudoOffset(seed: string): { dLat: number; dLng: number } {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const dLat = ((hash % 100) / 1000) * 0.08;
  const dLng = (((hash >> 4) % 100) / 1000) * 0.08;
  return { dLat, dLng };
}

/**
 * Resolves exact or approximate coordinates for an itinerary item
 */
export function resolveItemCoordinates(
  title: string,
  cityName?: string,
  locationOrStation?: string | number
): [number, number] {
  const locText = typeof locationOrStation === 'string' ? locationOrStation : '';
  const combinedSearch = `${title || ''} ${locText}`.toLowerCase().trim();

  // 1. Check destination dictionary
  for (const [key, coords] of Object.entries(DESTINATION_COORDINATES)) {
    if (combinedSearch.includes(key)) {
      return [coords.lat, coords.lng];
    }
  }

  // 2. City base coordinates
  const cleanCity = `${cityName || ''} ${combinedSearch}`.toLowerCase().trim();
  for (const [key, coords] of Object.entries(CITY_COORDINATES)) {
    if (cleanCity.includes(key)) {
      const offset = getPseudoOffset(title || 'item');
      return [coords.lat + offset.dLat, coords.lng + offset.dLng];
    }
  }

  // 3. Fallback to Phuket center
  const phuket = CITY_COORDINATES['פוקט'];
  const offset = getPseudoOffset(title || 'general');
  return [phuket.lat + offset.dLat, phuket.lng + offset.dLng];
}

/**
 * Resolves hotel coordinates
 */
export function resolveHotelCoordinates(
  hotelName: string,
  cityName?: string
): [number, number] {
  const cleanHotel = (hotelName || '').toLowerCase().trim();
  if (cleanHotel) {
    for (const [key, coords] of Object.entries(DESTINATION_COORDINATES)) {
      if (cleanHotel.includes(key)) {
        return [coords.lat, coords.lng];
      }
    }
  }

  const cleanCity = (cityName || '').toLowerCase().trim();
  if (cleanCity) {
    for (const [key, coords] of Object.entries(CITY_COORDINATES)) {
      if (cleanCity.includes(key) || (cleanCity.length >= 2 && key.includes(cleanCity))) {
        const offset = getPseudoOffset(`hotel_${hotelName}`);
        return [coords.lat + offset.dLat * 0.4, coords.lng + offset.dLng * 0.4];
      }
    }
  }

  const phuket = CITY_COORDINATES['פוקט'];
  return [phuket.lat, phuket.lng];
}

/**
 * Resolves city center coordinates
 */
export function resolveCityCenter(cityName?: string): [number, number] {
  const cleanCity = (cityName || '').toLowerCase().trim();
  if (cleanCity) {
    for (const [key, coords] of Object.entries(CITY_COORDINATES)) {
      if (cleanCity.includes(key) || (cleanCity.length >= 2 && key.includes(cleanCity))) {
        return [coords.lat, coords.lng];
      }
    }
  }
  return [CITY_COORDINATES['פוקט'].lat, CITY_COORDINATES['פוקט'].lng];
}

/**
 * Checks whether an unassigned catalog item belongs to the given city/region
 */
export function isItemInCityRegion(item: ItineraryItem, targetCity?: string): boolean {
  if (!targetCity || !targetCity.trim()) return false;
  const targetCenter = resolveCityCenter(targetCity);

  if (item.city && item.city.trim()) {
    const itemCityCenter = resolveCityCenter(item.city);
    if (calculateDistanceKm(itemCityCenter, targetCenter) <= 65) {
      return true;
    }
    return false;
  }

  const combined = `${item.title || ''} ${item.location_name || ''} ${item.nearest_station || ''}`
    .toLowerCase()
    .trim();

  for (const [key, coords] of Object.entries(DESTINATION_COORDINATES)) {
    if (combined.includes(key)) {
      return calculateDistanceKm([coords.lat, coords.lng], targetCenter) <= 65;
    }
  }

  for (const [key, coords] of Object.entries(CITY_COORDINATES)) {
    if (combined.includes(key)) {
      return calculateDistanceKm([coords.lat, coords.lng], targetCenter) <= 65;
    }
  }

  return false;
}

/**
 * Haversine distance in kilometers between two [lat, lng] coordinates
 */
export function calculateDistanceKm(
  coordA: [number, number],
  coordB: [number, number]
): number {
  const R = 6371;
  const dLat = ((coordB[0] - coordA[0]) * Math.PI) / 180;
  const dLng = ((coordB[1] - coordA[1]) * Math.PI) / 180;
  const lat1 = (coordA[0] * Math.PI) / 180;
  const lat2 = (coordB[0] * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Estimates realistic travel mode, distance, and duration in Thailand between two points
 */
export function estimateTransitLeg(
  fromCoord: [number, number],
  toCoord: [number, number],
  fromName: string,
  toName: string
): TransitLegEstimate {
  const straightKm = calculateDistanceKm(fromCoord, toCoord);
  const effectiveKm = Math.max(0.1, Number((straightKm * 1.25).toFixed(1)));
  const midpoint: [number, number] = [
    (fromCoord[0] + toCoord[0]) / 2,
    (fromCoord[1] + toCoord[1]) / 2,
  ];

  let mode: 'walk' | 'train' | 'shinkansen' = 'walk';
  let icon = '🚶';
  let modeLabel = 'הליכה';
  let durationMinutes = 5;

  if (straightKm <= 1.2) {
    mode = 'walk';
    icon = '🚶';
    modeLabel = 'הליכה רגלית';
    durationMinutes = Math.max(3, Math.round((effectiveKm / 4.5) * 60));
  } else if (straightKm <= 35) {
    mode = 'train';
    icon = '🚕';
    modeLabel = 'מונית / Grab / ואן משפחתי';
    durationMinutes = Math.max(10, Math.round(6 + (effectiveKm / 30) * 60));
  } else {
    mode = 'shinkansen';
    icon = '🚤';
    modeLabel = 'סירת מנוע / מעבורת / טיסת פנים';
    durationMinutes = Math.max(35, Math.round(20 + (straightKm / 70) * 60));
  }

  const distanceLabel =
    effectiveKm < 1
      ? `${Math.round(effectiveKm * 1000)} מ'`
      : `${effectiveKm.toFixed(1)} ק"מ`;

  const shortLabel = `${icon} ${durationMinutes} דק' (${distanceLabel})`;
  const isFarWarning = straightKm > 85;
  const warningText = isFarWarning
    ? `מרחק גדול (${effectiveKm.toFixed(0)} ק"מ) בין "${fromName}" ל-"${toName}". ודאו שהיעד משובץ בעיר הנכונה (פוקט / קוסמוי / בנגקוק).`
    : undefined;

  const travelModeParam = mode === 'walk' ? 'walking' : 'driving';
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
    fromName
  )}&destination=${encodeURIComponent(toName)}&travelmode=${travelModeParam}`;

  return {
    fromName,
    toName,
    fromCoord,
    toCoord,
    midpoint,
    distanceKm: effectiveKm,
    distanceLabel,
    durationMinutes,
    mode,
    icon,
    modeLabel,
    shortLabel,
    isFarWarning,
    warningText,
    directionsUrl,
  };
}

/**
 * Calculates full daily route legs and totals (Hotel -> Stop 1 -> Stop 2 -> ...)
 */
export function calculateDayRouteMetrics(
  dayItems: ItineraryItem[],
  hotelName?: string,
  cityName?: string
): DayRouteMetrics {
  const legs: TransitLegEstimate[] = [];
  if (dayItems.length === 0) {
    return {
      legs: [],
      totalDistanceKm: 0,
      totalTransitMinutes: 0,
      hasFarWarning: false,
    };
  }

  const itemCoords = dayItems.map((it) =>
    resolveItemCoordinates(
      it.title,
      it.city || cityName,
      `${it.location_name || ''} ${it.nearest_station || ''}`
    )
  );

  if (hotelName && hotelName.trim()) {
    const hotelCoord = resolveHotelCoordinates(hotelName, cityName);
    legs.push(
      estimateTransitLeg(
        hotelCoord,
        itemCoords[0],
        hotelName,
        dayItems[0].location_name || dayItems[0].title
      )
    );
  }

  for (let i = 0; i < dayItems.length - 1; i++) {
    legs.push(
      estimateTransitLeg(
        itemCoords[i],
        itemCoords[i + 1],
        dayItems[i].location_name || dayItems[i].title,
        dayItems[i + 1].location_name || dayItems[i + 1].title
      )
    );
  }

  const totalDistanceKm = Number(
    legs.reduce((sum, leg) => sum + leg.distanceKm, 0).toFixed(1)
  );
  const totalTransitMinutes = legs.reduce((sum, leg) => sum + leg.durationMinutes, 0);
  const hasFarWarning = legs.some((leg) => leg.isFarWarning);

  return {
    legs,
    totalDistanceKm,
    totalTransitMinutes,
    hasFarWarning,
  };
}

function getTimeOfDayBucket(item: ItineraryItem): number {
  const tod = (item.best_time_of_day || '').toLowerCase();
  const titleAndNotes = `${item.title} ${item.notes || ''}`.toLowerCase();

  if (tod === 'night' || titleAndNotes.includes('לילה')) {
    return 3;
  }
  if (tod === 'evening' || tod === 'sunset' || titleAndNotes.includes('שקיעה') || titleAndNotes.includes('ערב')) {
    return 2;
  }
  if (tod === 'morning' || titleAndNotes.includes('שייט') || titleAndNotes.includes('בוקר')) {
    return 0;
  }
  return 1;
}

function formatMinutesToTime(totalMinutes: number): string {
  const clamped = Math.min(23 * 60 + 30, Math.max(7 * 60, totalMinutes));
  const rounded = Math.round(clamped / 15) * 15;
  const hh = Math.floor(rounded / 60)
    .toString()
    .padStart(2, '0');
  const mm = (rounded % 60).toString().padStart(2, '0');
  return `${hh}:${mm}`;
}

export function optimizeDayRouteOrder(
  dayItems: ItineraryItem[],
  hotelName?: string,
  cityName?: string
): DayRouteOptimizationResult {
  const beforeMetrics = calculateDayRouteMetrics(dayItems, hotelName, cityName);

  if (dayItems.length <= 1) {
    return {
      optimizedItems: dayItems,
      previousDistanceKm: beforeMetrics.totalDistanceKm,
      newDistanceKm: beforeMetrics.totalDistanceKm,
      savedKm: 0,
      previousTransitMinutes: beforeMetrics.totalTransitMinutes,
      newTransitMinutes: beforeMetrics.totalTransitMinutes,
      savedMinutes: 0,
      orderChanged: false,
    };
  }

  const startCoord =
    hotelName && hotelName.trim()
      ? resolveHotelCoordinates(hotelName, cityName)
      : resolveCityCenter(cityName);

  const itemsWithCoords = dayItems.map((item) => ({
    item,
    coord: resolveItemCoordinates(
      item.title,
      item.city || cityName,
      `${item.location_name || ''} ${item.nearest_station || ''}`
    ),
    bucket: getTimeOfDayBucket(item),
  }));

  const orderedEntries: typeof itemsWithCoords = [];
  let currentPos: [number, number] = startCoord;

  const daytimePool = itemsWithCoords.filter((e) => e.bucket <= 1);
  const eveningPool = itemsWithCoords.filter((e) => e.bucket === 2);
  const nightPool = itemsWithCoords.filter((e) => e.bucket === 3);

  const solvePoolRoute = (pool: typeof itemsWithCoords, initialCoord: [number, number]) => {
    if (pool.length <= 1) return pool;
    const remaining = [...pool];
    const route: typeof itemsWithCoords = [];
    let curr = initialCoord;

    while (remaining.length > 0) {
      let bestIdx = 0;
      let bestScore = Infinity;

      for (let i = 0; i < remaining.length; i++) {
        const candidate = remaining[i];
        const dist = calculateDistanceKm(curr, candidate.coord);
        const morningBonus = route.length === 0 && candidate.bucket === 0 ? -1.5 : 0;
        const score = dist + morningBonus;
        if (score < bestScore) {
          bestScore = score;
          bestIdx = i;
        }
      }

      const [chosen] = remaining.splice(bestIdx, 1);
      route.push(chosen);
      curr = chosen.coord;
    }

    let improved = true;
    while (improved && route.length >= 3) {
      improved = false;
      for (let i = 0; i < route.length - 1; i++) {
        for (let k = i + 1; k < route.length; k++) {
          const prevCoord = i === 0 ? initialCoord : route[i - 1].coord;
          const nextCoord = k + 1 < route.length ? route[k + 1].coord : null;

          if (i === 0 && route[0].bucket === 0 && route[k].bucket !== 0) continue;

          const currentSegmentDist =
            calculateDistanceKm(prevCoord, route[i].coord) +
            (nextCoord ? calculateDistanceKm(route[k].coord, nextCoord) : 0);

          const swappedSegmentDist =
            calculateDistanceKm(prevCoord, route[k].coord) +
            (nextCoord ? calculateDistanceKm(route[i].coord, nextCoord) : 0);

          if (swappedSegmentDist + 0.05 < currentSegmentDist) {
            const reversedSub = route.slice(i, k + 1).reverse();
            route.splice(i, k - i + 1, ...reversedSub);
            improved = true;
          }
        }
      }
    }

    return route;
  };

  for (const pool of [daytimePool, eveningPool, nightPool]) {
    if (pool.length > 0) {
      const solved = solvePoolRoute(pool, currentPos);
      orderedEntries.push(...solved);
      currentPos = solved[solved.length - 1].coord;
    }
  }

  let rawOrderedItems = orderedEntries.map((e) => e.item);
  const candidateMetrics = calculateDayRouteMetrics(rawOrderedItems, hotelName, cityName);

  if (candidateMetrics.totalDistanceKm > beforeMetrics.totalDistanceKm + 0.1) {
    rawOrderedItems = [...dayItems];
  }

  const finalMetrics = calculateDayRouteMetrics(rawOrderedItems, hotelName, cityName);
  const orderChanged = rawOrderedItems.some((it, idx) => it.id !== dayItems[idx]?.id);

  let currentClockMinutes = 9 * 60;
  const hasHotelStartLeg = Boolean(hotelName && hotelName.trim());

  const optimizedItems: ItineraryItem[] = rawOrderedItems.map((item, idx) => {
    const legIndex = hasHotelStartLeg ? idx : idx - 1;
    if (legIndex >= 0 && finalMetrics.legs[legIndex]) {
      currentClockMinutes += finalMetrics.legs[legIndex].durationMinutes;
    }

    const bucket = getTimeOfDayBucket(item);
    if (bucket === 2 && currentClockMinutes < 16 * 60 + 30) {
      currentClockMinutes = 16 * 60 + 30;
    } else if (bucket === 3 && currentClockMinutes < 19 * 60) {
      currentClockMinutes = 19 * 60;
    }

    const visitDuration =
      item.estimated_duration_mins && item.estimated_duration_mins >= 20
        ? item.estimated_duration_mins
        : item.category === 'food'
        ? 75
        : 90;

    const startStr = formatMinutesToTime(currentClockMinutes);
    currentClockMinutes += visitDuration;
    const endStr = formatMinutesToTime(currentClockMinutes);

    return {
      ...item,
      order_index: (idx + 1) * 10,
      time_slot: `${startStr} - ${endStr}`,
      updated_at: new Date().toISOString(),
    };
  });

  const savedKm = Math.max(
    0,
    Number((beforeMetrics.totalDistanceKm - finalMetrics.totalDistanceKm).toFixed(1))
  );
  const savedMinutes = Math.max(
    0,
    beforeMetrics.totalTransitMinutes - finalMetrics.totalTransitMinutes
  );

  return {
    optimizedItems,
    previousDistanceKm: beforeMetrics.totalDistanceKm,
    newDistanceKm: finalMetrics.totalDistanceKm,
    savedKm,
    previousTransitMinutes: beforeMetrics.totalTransitMinutes,
    newTransitMinutes: finalMetrics.totalTransitMinutes,
    savedMinutes,
    orderChanged,
  };
}

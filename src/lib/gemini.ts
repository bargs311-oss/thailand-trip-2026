import { ItineraryItem, ItemCategory, TripDay, AiPlacementProposal, EnrichedAttractionData } from '../types';
import { findKnownDestination, inferCityFromItemText } from './japanLocationsData';

export const STORAGE_KEY_GEMINI_KEY = 'thaitrip_gemini_api_key';

export function getStoredGeminiApiKey(): string {
  const localKey = localStorage.getItem(STORAGE_KEY_GEMINI_KEY) || '';
  const envKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || '';
  return (localKey || envKey).replace(/^["']|["']$/g, '').trim();
}

export function saveGeminiApiKey(key: string) {
  const cleaned = (key || '').replace(/^["']|["']$/g, '').trim();
  if (cleaned) {
    localStorage.setItem(STORAGE_KEY_GEMINI_KEY, cleaned);
  } else {
    localStorage.removeItem(STORAGE_KEY_GEMINI_KEY);
  }
}

export interface AiSuggestedItem {
  title: string;
  title_ja?: string;
  category: ItemCategory;
  time_slot: string;
  location_name: string;
  cost_jpy?: number;
  notes?: string;
  google_maps_url?: string;
}

export interface AiChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  suggestedItems?: AiSuggestedItem[];
  timestamp: Date;
}

export interface ConciergeDayContext {
  dayNumber: number;
  date: string;
  city: string;
  cityJa?: string;
  hotelName?: string;
  hotelAddressJa?: string;
  notes?: string;
  incompleteItems: ItineraryItem[];
  completedCount: number;
}

function buildSystemPrompt(context: ConciergeDayContext): string {
  const remainingList = context.incompleteItems
    .map(
      (it, idx) =>
        `${idx + 1}. ${it.title} (${it.title_ja || ''}) בשעה ${it.time_slot} במיקום: ${it.location_name}`
    )
    .join('\n');

  return `אתה קונסיירז' ומדריך טיולים פרטי מומחה לתאילנד (AI Thailand Family Travel Concierge), המלווה משפחה בת 6 נפשות בחופשה בתאילנד (6.11 עד 21.11) ב-3 יעדים: פוקט, קוסמוי ובנגקוק.
השפה שלך צריכה להיות חמה, מקצועית, משפחתית ובעברית טבעית וקולחת.
בכל פעם שאתה מציין שמות של מקומות, חופים, איים, קניונים או מאכלים, ציין אותם בעברית ובשמם באנגלית ובתאית.
כל המחירים הם בבאט תאילנדי (฿ / THB).

הקשר היום הנוכחי של המשפחה:
- יום בטיול: יום ${context.dayNumber} (${context.date})
- עיר/אי נוכחי: ${context.city} (${context.cityJa || ''})
- מלון הלינה של היום: ${context.hotelName || 'לא צוין מלון'} (כתובת בתאית/אנגלית: ${context.hotelAddressJa || 'לא צוינה'})
- הערות ליום זה: ${context.notes || 'אין הערות מיוחדות'}
- סטטוס יום: ${context.completedCount} יעדים כבר בוצעו בהצלחה.
- יעדים שנותרו לבצע היום:
${remainingList || 'כל יעדי היום כבר הושלמו! או שאין יעדים מוגדרים עדיין.'}

הנחיית פורמט קריטית:
אם המשתמש מבקש המלצות על מקומות, אטרקציות, חופים, מסעדות או פעילויות, בנוסף להסבר שלך, הוסף בסוף התשובה בלוק JSON מובנה בדיוק בפורמט הבא:
\`\`\`json
[
  {
    "title": "שם המקום בעברית",
    "title_ja": "שם המקום בתאית ואנגלית",
    "category": "attraction",
    "time_slot": "13:30 - 15:30",
    "location_name": "מיקום מדויק בעיר/אי",
    "cost_jpy": 500,
    "notes": "טיפ מיוחד למשפחה והמלצה"
  }
]
\`\`\`
חשוב: השדה cost_jpy מייצג עלות בבאט תאילנדי (THB ฿).`;
}

function generateFallbackResponse(
  prompt: string,
  context: ConciergeDayContext
): { text: string; suggestedItems?: AiSuggestedItem[] } {
  const p = prompt.toLowerCase();

  if (p.includes('אוכל') || p.includes('מסעדה') || p.includes('פאד תאי') || p.includes('שוק') || p.includes('food')) {
    if (context.city.includes('קוסמוי')) {
      return {
        text: `🍍 הנה המלצות קולינריות מעולות למשפחה בקוסמוי:
1. **כפר הדייגים בבוהפוט (Fisherman's Village)** – עשרות מסעדות על קו החוף ומופע להטוטני האש המפורסם ב-Coco Tam's.
2. **מתחם האוכל בקניון Central Samui בצ'אוונג** – אוכל תאילנדי ומערבי מעולה שמתאים לכל 6 בני המשפחה.`,
        suggestedItems: [
          {
            title: 'ערב בכפר הדייגים ומופע אש ב-Coco Tam\'s',
            title_ja: 'หมู่บ้านชาวประมงบ่อผุด (Fisherman\'s Village)',
            category: 'food',
            time_slot: '18:30 - 21:00',
            location_name: 'Bophut Beach, Koh Samui',
            cost_jpy: 2400,
            notes: 'מופע האש על החוף מתקיים ב-19:15 וב-21:00. מומלץ להגיע מוקדם לתפוס פופים על החול!',
          },
        ],
      };
    }

    if (context.city.includes('בנגקוק')) {
      return {
        text: `🍜 הנה שתי המלצות אוכל משפחתיות מעולות בבנגקוק:
1. **מתחם השוק הצף הממוזג SookSiam בקניון ICONSIAM** – חגיגה של דוכני אוכל נקיים וממוזגים מכל רחבי תאילנד על גדת הנהר.
2. **שוק הלילה Jodd Fairs או Asiatique** – מנגו סטיקי רייס, רוטי בננה שוקולד, שייקים טרופיים ואווירת ערב נהדרת.`,
        suggestedItems: [
          {
            title: 'שוק האוכל הממוזג SookSiam בקניון ICONSIAM',
            title_ja: 'สุขสยาม ไอคอนสยาม (SookSiam)',
            category: 'food',
            time_slot: '18:00 - 20:30',
            location_name: 'ICONSIAM, Ground Floor, Bangkok',
            cost_jpy: 1800,
            notes: 'ממוזג, נקי ומציע מנות מכל מחוזות תאילנד + מופע מזרקות מרהיב ב-19:00 בחוץ על הנהר.',
          },
        ],
      };
    }

    return {
      text: `🥥 הנה המלצות אוכל משפחתיות מעולות בפוקט:
1. **מדרחוב העיירה העתיקה של פוקט (Old Phuket Town)** – מסעדות תאילנדיות אותנטיות, בתי קפה מעוצבים וגלידריות.
2. **מתחם האוכל Tales of Thailand בקניון Central Phuket Floresta** – שוק אוכל תאילנדי ממוזג ואיכותי.`,
      suggestedItems: [
        {
          title: 'ארוחה וסיור בעיירה העתיקה של פוקט (Old Phuket Town)',
          title_ja: 'ย่านเมืองเก่าภูเก็ต (Old Phuket Town)',
          category: 'food',
          time_slot: '18:00 - 20:30',
          location_name: 'Thalang Road, Phuket Town',
          cost_jpy: 2000,
          notes: 'רחובות צבעוניים, רוטי בננה, גלידת קוקוס ומסעדות מעולות לכל המשפחה.',
        },
      ],
    };
  }

  return {
    text: `שלום משפחה יקרה! 🇹🇭 אני כאן ללוות אתכם ב${context.city} (יום ${context.dayNumber}).
נשארו לכם ${context.incompleteItems.length} יעדים להיום. הנה הצעה לפעילות מפנקת להמשך היום:`,
    suggestedItems: [
      {
        title: 'עצירת שייק מנגו/קוקוס טרי ומסאז\' תאילנדי משפחתי',
        title_ja: 'นวดแผนไทย & น้ำผลไม้ปั่น (Thai Massage & Shake)',
        category: 'activity',
        time_slot: '16:30 - 17:45',
        location_name: `${context.city}`,
        cost_jpy: 400,
        notes: 'התרעננות מושלמת עם מסאז\' רגליים או גוף ושייק פירות טרופיים קר.',
      },
    ],
  };
}

export async function askAiConcierge(
  userPrompt: string,
  context: ConciergeDayContext
): Promise<{ text: string; suggestedItems?: AiSuggestedItem[] }> {
  const apiKey = getStoredGeminiApiKey();

  if (!apiKey) {
    await new Promise((res) => setTimeout(res, 400));
    return generateFallbackResponse(userPrompt, context);
  }

  try {
    const systemInstruction = buildSystemPrompt(context);
    const models = ['gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-1.5-flash'];
    let rawText = '';

    const body = {
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemInstruction}\n\nשאלה/בקשה של המשפחה:\n${userPrompt}` }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        maxOutputTokens: 4096,
      },
    };

    for (const model of models) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        if (response.ok) {
          const data = await response.json();
          const parts = data?.candidates?.[0]?.content?.parts || [];
          const textParts = parts
            .filter((p: any) => !p.thought && typeof p.text === 'string')
            .map((p: any) => p.text);
          rawText = (textParts.length > 0 ? textParts.join('\n') : parts[0]?.text) || '';
          if (rawText) break;
        }
      } catch (e) {
        console.warn(`Gemini concierge model ${model} failed:`, e);
      }
    }

    if (!rawText) {
      return generateFallbackResponse(userPrompt, context);
    }

    let cleanText = rawText;
    let suggestedItems: AiSuggestedItem[] | undefined = undefined;

    const jsonMatch = rawText.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        if (Array.isArray(parsed)) {
          suggestedItems = parsed;
          cleanText = rawText.replace(/```json[\s\S]*?```/, '').trim();
        }
      } catch (jsonErr) {
        console.warn('Failed to parse AI suggested items JSON:', jsonErr);
      }
    }

    return {
      text: cleanText,
      suggestedItems,
    };
  } catch (error) {
    console.warn('Exception during Gemini call, using fallback:', error);
    return generateFallbackResponse(userPrompt, context);
  }
}

export interface PlacementContext {
  item: {
    id: string;
    title: string;
    title_ja?: string;
    city?: string;
    category?: string;
    notes?: string;
    cost_jpy?: number;
    type: 'attraction' | 'hotel';
    estimated_duration_mins?: number;
    best_time_of_day?: string;
    district?: string;
    nearest_station?: string;
    requires_advance_booking?: boolean;
    pro_tips?: string;
  };
  days: TripDay[];
  items: ItineraryItem[];
}

function generatePlacementFallback(context: PlacementContext): AiPlacementProposal {
  const { item, days, items } = context;
  const isHotel = item.type === 'hotel';

  const inferredCity = item.city || inferCityFromItemText(item.title) || '';
  const cityClean = inferredCity.trim().toLowerCase();

  const matchingDays = days.filter((d) => {
    const dCity = d.city.trim().toLowerCase();
    return cityClean && (dCity.includes(cityClean) || cityClean.includes(dCity));
  });

  if (isHotel) {
    const targetDay = matchingDays.length > 0 ? matchingDays[0] : days[0];
    const matchedDayNumbers = matchingDays.map((d) => d.day_number);
    const dayListStr =
      matchedDayNumbers.length > 0
        ? `ימים [${matchedDayNumbers.join(', ')}]`
        : `יום ${targetDay.day_number}`;

    return {
      item_id: item.id,
      item_type: 'hotel',
      recommended_day_number: targetDay.day_number,
      reasoning: `המלון שוכן ב${inferredCity || targetDay.city}. לפי מסלול החופשה המשפחתית אתם נמצאים ביעד זה ב-${dayListStr}. שיבוץ המלון לימים אלו ירכז את הלינה המשפחתית בצורה נוחה.`,
    };
  }

  const candidateDays = matchingDays.length > 0 ? matchingDays : days;
  let bestDay = candidateDays[0] || days[0];
  let minItemCount = Infinity;

  for (const d of candidateDays) {
    const count = items.filter((it) => it.day_id === d.id).length;
    if (count < minItemCount) {
      minItemCount = count;
      bestDay = d;
    }
  }

  const bestTime = (item.best_time_of_day || '').toLowerCase();
  const cat = (item.category || '').toLowerCase();

  let timeSlot = '11:00 - 14:00';
  let reasoningDetails = '';

  const cityContext =
    matchingDays.length > 0
      ? `שיבוץ ביום ${bestDay.day_number} (${bestDay.city}) מתאים לשהות שלכם ב${bestDay.city}`
      : `נבחר יום ${bestDay.day_number} (${bestDay.city}) כיוון שיש בו את הלו"ז הפנוי ביותר`;

  if (bestTime === 'sunset' || item.title.includes('שקיעה') || item.title.includes('SkyWalk')) {
    timeSlot = '16:45 - 18:30';
    reasoningDetails = `${cityContext}. שעת השקיעה המושלמת בתאילנד (16:45-18:30) לתצפית ואווירה נעימה.`;
  } else if (bestTime === 'morning' || item.title.includes('שייט')) {
    timeSlot = '08:30 - 15:30';
    reasoningDetails = `${cityContext}. מומלץ לצאת בבוקר כשהים שקט והראות מעולה לכל המשפחה.`;
  } else if (bestTime === 'evening' || bestTime === 'night' || cat.includes('food') || item.title.includes('שוק')) {
    timeSlot = '18:30 - 21:00';
    reasoningDetails = `${cityContext}. מושלם לבילוי ערב משפחתי, אוכל רחוב וקניות בשעות הקרירות יותר.`;
  } else {
    timeSlot = '11:00 - 14:00';
    reasoningDetails = `${cityContext}, ביום עם עומס נמוך שמאפשר בילוי משפחתי רגוע וללא לחץ.`;
  }

  return {
    item_id: item.id,
    item_type: 'attraction',
    recommended_day_number: bestDay.day_number,
    recommended_time_slot: timeSlot,
    reasoning: reasoningDetails,
  };
}

export async function askAiSmartPlacement(context: PlacementContext): Promise<AiPlacementProposal> {
  const apiKey = getStoredGeminiApiKey();
  if (!apiKey) {
    await new Promise((res) => setTimeout(res, 350));
    return generatePlacementFallback(context);
  }

  try {
    const daysSummary = context.days
      .map((d) => {
        const dayItems = context.items
          .filter((it) => it.day_id === d.id)
          .map((it) => `${it.time_slot}: ${it.title}`)
          .join(' | ');
        return `יום ${d.day_number} (${d.date}, עיר: ${d.city}): ${dayItems || 'פנוי'}`;
      })
      .join('\n');

    const promptText = `אתה מומחה תכנון מסלולים בתאילנד עבור משפחה בת 6 נפשות (פוקט, קוסמוי ובנגקוק).
לפניך יעד או מלון לשיבוץ:
- סוג: ${context.item.type === 'hotel' ? 'מלון / ריזורט' : 'אטרקציה / פעילות'}
- שם: ${context.item.title} (${context.item.title_ja || ''})
- עיר/אי: ${context.item.city || 'לא צוינה'}
- אזור: ${context.item.district || 'לא צוין'}
- משך משוער: ${context.item.estimated_duration_mins || 120} דקות
- זמן מומלץ ביום: ${context.item.best_time_of_day || 'גמיש'}

מסלול הטיול (6.11 עד 21.11):
${daysSummary}

שבץ את היעד ביום המתאים ביותר מבחינת העיר (פוקט / קוסמוי / בנגקוק) ואיזון העומס היומי.
החזר אך ורק JSON תקין:
\`\`\`json
{
  "recommended_day_number": 3,
  "recommended_time_slot": "09:30 - 13:00",
  "reasoning": "הסבר קצר וברור בעברית..."
}
\`\`\``;

    const models = ['gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-1.5-flash'];
    for (const model of models) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: promptText }] }],
            generationConfig: { temperature: 0.2, maxOutputTokens: 2048 },
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const parts = data?.candidates?.[0]?.content?.parts || [];
          const rawText = parts.map((p: any) => p.text || '').join('\n');
          const jsonMatch = rawText.match(/```json\s*([\s\S]*?)\s*```/) || rawText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[1] || jsonMatch[0]);
            if (parsed.recommended_day_number) {
              return {
                item_id: context.item.id,
                item_type: context.item.type,
                recommended_day_number: Number(parsed.recommended_day_number),
                recommended_time_slot: parsed.recommended_time_slot || '10:30 - 13:30',
                reasoning: parsed.reasoning || 'נמצא מתאים ליום זה במסלול.',
              };
            }
          }
        }
      } catch {}
    }

    return generatePlacementFallback(context);
  } catch {
    return generatePlacementFallback(context);
  }
}

export function calculateEstimatedDeadlineIso(_bookingRule?: string, targetDateStr?: string): string {
  const baseDate = targetDateStr ? new Date(targetDateStr) : new Date('2026-11-06T10:00:00Z');
  const d = new Date(baseDate);
  d.setDate(d.getDate() - 14);
  return d.toISOString();
}

function mapDestinationToEnriched(
  dest: any,
  targetDate?: string
): EnrichedAttractionData {
  const deadlineIso = dest.requires_advance_booking
    ? calculateEstimatedDeadlineIso(dest.booking_window_rule, targetDate)
    : undefined;

  return {
    title: dest.nameHe,
    title_ja: `${dest.nameJa} (${dest.romaji})`,
    category: dest.category,
    city: dest.city,
    district: dest.district || '',
    nearest_station: dest.nearest_station,
    estimated_duration_mins: dest.estimated_duration_mins,
    best_time_of_day: dest.best_time_of_day,
    cost_jpy: dest.cost_jpy,
    location_name: `${dest.nameEn}, ${dest.cityEn || dest.city}`,
    google_maps_url: dest.google_maps_url,
    pro_tips: dest.pro_tips || '',
    notes: dest.notes || '',
    requires_advance_booking: Boolean(dest.requires_advance_booking),
    booking_window_rule: dest.booking_window_rule,
    booking_url: dest.booking_url,
    estimated_deadline_iso: deadlineIso,
  };
}

export function generateEnrichmentFallback(
  title: string,
  _cityName?: string,
  targetDate?: string
): EnrichedAttractionData | null {
  const cleanTitle = title.trim().toLowerCase();
  const knownFromDb = findKnownDestination(cleanTitle);
  if (knownFromDb) {
    return mapDestinationToEnriched(knownFromDb, targetDate);
  }
  return null;
}

export async function fetchLiveWebDestinationInfo(
  query: string,
  cityHint?: string
): Promise<EnrichedAttractionData | null> {
  const cleanQ = query.trim();
  if (!cleanQ) return null;

  try {
    const osmUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      cleanQ
    )}&countrycodes=th&addressdetails=1&extratags=1&namedetails=1&accept-language=he,en,th&limit=3`;

    const osmRes = await fetch(osmUrl, {
      headers: { Accept: 'application/json' },
    });

    if (osmRes.ok) {
      const osmData = await osmRes.json();
      if (Array.isArray(osmData) && osmData.length > 0) {
        const top = osmData[0];
        const addr = top.address || {};
        const namedetails = top.namedetails || {};
        const extratags = top.extratags || {};

        const rawCity =
          addr.city ||
          addr.town ||
          addr.island ||
          addr.state ||
          cityHint ||
          'פוקט';

        const inferredCityHe = inferCityFromItemText(`${top.display_name} ${cleanQ}`) || cityHint || 'פוקט';
        const nameTh = namedetails['name:th'] || extratags['name:th'] || namedetails.name || '';
        const nameEn = namedetails['name:en'] || extratags['name:en'] || cleanQ;
        const nameHe = namedetails['name:he'] || cleanQ;

        const typeStr = `${top.class || ''} ${top.type || ''}`.toLowerCase();
        let category: ItemCategory = 'attraction';
        if (typeStr.includes('restaurant') || typeStr.includes('cafe') || typeStr.includes('food')) {
          category = 'food';
        } else if (typeStr.includes('shop') || typeStr.includes('mall') || typeStr.includes('market')) {
          category = 'shopping';
        } else if (typeStr.includes('theme_park') || typeStr.includes('water_park') || typeStr.includes('park')) {
          category = 'activity';
        }

        const lat = top.lat;
        const lon = top.lon;
        const mapsUrl = lat && lon
          ? `https://maps.google.com/?q=${encodeURIComponent(nameEn)}+${lat},${lon}`
          : `https://maps.google.com/?q=${encodeURIComponent(cleanQ + ' Thailand')}`;

        return {
          title: nameHe !== cleanQ ? `${nameHe} (${cleanQ})` : cleanQ,
          title_ja: nameTh || cleanQ,
          category,
          city: inferredCityHe,
          district: addr.suburb || addr.quarter || addr.state || '',
          nearest_station: '',
          estimated_duration_mins: category === 'activity' ? 210 : 120,
          best_time_of_day: 'afternoon',
          cost_jpy: 0,
          location_name: `${nameEn}, ${rawCity}`,
          google_maps_url: mapsUrl,
          pro_tips: `נמצא בחיפוש מפות בתאילנד (${inferredCityHe}).`,
          notes: `נקודת עניין ב${inferredCityHe}, תאילנד.`,
          requires_advance_booking: false,
          booking_url: extratags.website || undefined,
        };
      }
    }
  } catch (err) {
    console.warn('Live web search error:', err);
  }

  return null;
}

export async function enrichAttractionWithAi(
  attractionName: string,
  cityName?: string,
  targetDate?: string
): Promise<EnrichedAttractionData> {
  const offlineMatch = generateEnrichmentFallback(attractionName, cityName, targetDate);
  if (offlineMatch) {
    return offlineMatch;
  }

  let liveWebData: EnrichedAttractionData | null = null;
  try {
    liveWebData = await fetchLiveWebDestinationInfo(attractionName, cityName);
  } catch {}

  if (liveWebData) {
    return liveWebData;
  }

  const inferredCity = inferCityFromItemText(attractionName) || cityName || 'פוקט';
  const cleanTitle = attractionName.trim();

  return {
    title: cleanTitle,
    title_ja: cleanTitle,
    category: 'attraction',
    city: inferredCity,
    district: '',
    nearest_station: '',
    estimated_duration_mins: 120,
    best_time_of_day: 'afternoon',
    cost_jpy: 0,
    location_name: `${cleanTitle}, ${inferredCity}, Thailand`,
    google_maps_url: `https://maps.google.com/?q=${encodeURIComponent(cleanTitle + ' ' + inferredCity + ' Thailand')}`,
    pro_tips: 'מומלץ לבדוק שעות פעילות ומיקום בגוגל מפות.',
    notes: `יעד מותאם אישית ב${inferredCity}.`,
    requires_advance_booking: false,
  };
}

export const askAiTravelConcierge = askAiConcierge;

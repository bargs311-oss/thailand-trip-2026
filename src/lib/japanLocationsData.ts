import { ItemCategory, BestTimeOfDay } from '../types';

export interface JapanCity {
  name: string; // Hebrew name, e.g. "פוקט"
  nameEn: string; // English name, e.g. "Phuket"
  nameJa: string; // Thai with English, e.g. "ภูเก็ต (Phuket)"
  region: string; // e.g. "דרום תאילנד - ים אנדמן"
  prefecture: string; // e.g. "Phuket", "Surat Thani", "Bangkok"
  isShinkansenHub?: boolean;
}

export interface JapanDestination {
  id: string;
  nameHe: string;
  nameEn: string;
  nameJa: string; // Thai script name
  romaji: string;
  city: string; // "פוקט" | "קוסמוי" | "בנגקוק"
  cityEn: string;
  prefecture: string;
  region: string;
  category: ItemCategory;
  estimated_duration_mins: number;
  best_time_of_day: BestTimeOfDay;
  cost_jpy: number; // Cost in THB (฿)
  district?: string;
  nearest_station: string; // Area / Pier / BTS / MRT
  google_maps_url: string;
  notes?: string;
  pro_tips?: string;
  requires_advance_booking: boolean;
  booking_window_rule?: string;
  booking_url?: string;
  aliases?: string[];
}

/**
 * 3 הערים המרכזיות בטיול המשפחתי לתאילנד + יעדי טיולי יום צמודים
 */
export const JAPAN_CITIES: JapanCity[] = [
  { name: 'פוקט', nameEn: 'Phuket', nameJa: 'ภูเก็ต (Phuket)', region: 'דרום תאילנד (ים אנדמן)', prefecture: 'Phuket', isShinkansenHub: true },
  { name: 'קוסמוי', nameEn: 'Koh Samui', nameJa: 'เกาะสมุย (Koh Samui)', region: 'מפרץ תאילנד (האיים)', prefecture: 'Surat Thani', isShinkansenHub: true },
  { name: 'בנגקוק', nameEn: 'Bangkok', nameJa: 'กรุงเทพฯ (Bangkok)', region: 'מרכז תאילנד', prefecture: 'Bangkok', isShinkansenHub: true },
  { name: 'קו פי פי (טיול מפוקט)', nameEn: 'Phi Phi Islands', nameJa: 'หมู่เกาะพีพี (Phi Phi)', region: 'דרום תאילנד (ים אנדמן)', prefecture: 'Krabi / Phuket', isShinkansenHub: false },
  { name: 'מפרץ פאנג נגה (טיול מפוקט)', nameEn: 'Phang Nga Bay', nameJa: 'อ่าวพังงา (Phang Nga)', region: 'דרום תאילנד (ים אנדמן)', prefecture: 'Phang Nga', isShinkansenHub: false },
  { name: 'שמורת אנג תונג (טיול מקוסמוי)', nameEn: 'Ang Thong Marine Park', nameJa: 'หมู่เกาะอ่างทอง (Ang Thong)', region: 'מפרץ תאילנד', prefecture: 'Surat Thani', isShinkansenHub: false },
  { name: 'קו פנגן (טיול מקוסמוי)', nameEn: 'Koh Phangan', nameJa: 'เกาะพะงัน (Koh Phangan)', region: 'מפרץ תאילנד', prefecture: 'Surat Thani', isShinkansenHub: false },
];

/**
 * מאגר אטרקציות, חופים, שווקים, קניונים ומסעדות בפוקט, קוסמוי ובנגקוק
 */
export const JAPAN_DESTINATIONS: JapanDestination[] = [
  // ==========================================
  // 1. פוקט (PHUKET)
  // ==========================================
  {
    id: 'thai-phuket-phi-phi',
    nameHe: 'שייט סירת מנוע לאיי פי פי ומאיה ביי (Phi Phi & Maya Bay)',
    nameEn: 'Phi Phi Islands, Maya Bay & Pileh Lagoon Speedboat Tour',
    nameJa: 'หมู่เกาะพีพี & อ่าวมาหยา',
    romaji: 'Mu Ko Phi Phi & Ao Maya',
    city: 'פוקט',
    cityEn: 'Phuket',
    prefecture: 'פוקט / קראבי',
    region: 'דרום תאילנד',
    category: 'activity',
    estimated_duration_mins: 480,
    best_time_of_day: 'morning',
    cost_jpy: 2400,
    district: 'Royal Phuket Marina / Rassada Pier',
    nearest_station: 'איסוף מהמלון בפוקט למזח Royal Phuket Marina או Chalong Pier',
    google_maps_url: 'https://maps.google.com/?q=Maya+Bay+Phi+Phi+Islands',
    notes: 'שייט משפחתי מרהיב בסירת מנוע או קטמרן אל מפרץ מאיה המפורסם, לגונת פילה הטורקיזית, אי הקופים, שנורקלינג באלמוגים וארוחת צהריים בפי פי דון.',
    pro_tips: 'מומלץ לקחת סיור Early Bird (יציאה ב-07:00) או לשכור סירת מנוע פרטית למשפחה (6 אנשים) כדי להגיע למאיה ביי לפני העומס!',
    requires_advance_booking: true,
    booking_window_rule: 'מומלץ להזמין שבוע-שבועיים מראש לחודש נובמבר',
    aliases: ['phi phi', 'maya bay', 'פי פי', 'איי פי פי', 'מאיה ביי', 'לגונת פילה'],
  },
  {
    id: 'thai-phuket-phang-nga',
    nameHe: 'שייט למפרץ פאנג נגה והאי של ג\'יימס בונד (James Bond Island)',
    nameEn: 'Phang Nga Bay, James Bond Island & Hong Island Canoeing',
    nameJa: 'อ่าวพังงา & เกาะตะปู (เขาพิงกัน)',
    romaji: 'Ao Phang Nga & Ko Tapu',
    city: 'פוקט',
    cityEn: 'Phuket',
    prefecture: 'פאנג נגה / פוקט',
    region: 'דרום תאילנד',
    category: 'activity',
    estimated_duration_mins: 450,
    best_time_of_day: 'morning',
    cost_jpy: 2500,
    district: 'Ao Po Grand Marina',
    nearest_station: 'מזח Ao Po Grand Marina בצפון-מזרח פוקט',
    google_maps_url: 'https://maps.google.com/?q=James+Bond+Island+Phang+Nga',
    notes: 'שייט רגוע במים שקטים בין צוקי גיר אדירים המזדקרים מהים, שייט קיאקים בתוך מערות נטיפים ולגונות נסתרות (אי הונג) וכפר הדייגים הצף קו פאניי.',
    pro_tips: 'המים במפרץ פאנג נגה שקטים מאוד וללא גלים – אידיאלי לכל המשפחה! הקיאקים כוללים חותר מקומי שמוביל אתכם בתוך המערות.',
    requires_advance_booking: true,
    booking_window_rule: 'מומלץ להזמין מראש אונליין או דרך סוכנות מקומית',
    aliases: ['james bond', 'phang nga', 'גיימס בונד', 'ג\'יימס בונד', 'פאנג נגה', 'מפרץ פאנג נגה'],
  },
  {
    id: 'thai-phuket-old-town',
    nameHe: 'העיירה העתיקה של פוקט ושוק יום ראשון (Old Phuket Town & Lard Yai)',
    nameEn: 'Old Phuket Town, Thalang Road & Sunday Walking Street',
    nameJa: 'ย่านเมืองเก่าภูเก็ต & ถนนคนเดินหลาดใหญ่',
    romaji: 'Mueang Kao Phuket',
    city: 'פוקט',
    cityEn: 'Phuket',
    prefecture: 'פוקט',
    region: 'דרום תאילנד',
    category: 'shopping',
    estimated_duration_mins: 180,
    best_time_of_day: 'evening',
    cost_jpy: 400,
    district: 'Old Phuket Town (Thalang Rd & Soi Romanee)',
    nearest_station: 'מרכז העיר פוקט - Thalang Road',
    google_maps_url: 'https://maps.google.com/?q=Old+Phuket+Town+Thalang+Road',
    notes: 'רחובות צבעוניים בסגנון סינו-פורטוגזי מרהיב, סמטת Soi Romanee הפוטוגנית, בתי קפה מעוצבים, גלידריות ומדרחוב שוק הלילה התוסס בימי ראשון.',
    pro_tips: 'ביום ראשון החל מ-16:00 רחוב Thalang נסגר לתנועה והופך לשוק הלילה היפה ביותר בפוקט (Lard Yai).',
    requires_advance_booking: false,
    aliases: ['old phuket town', 'thalang road', 'sunday market', 'העיר העתיקה פוקט', 'פוקט העתיקה', 'שוק יום ראשון פוקט'],
  },
  {
    id: 'thai-phuket-elephant-sanctuary',
    nameHe: 'חוות פילים אתית בפוקט (Phuket Elephant Sanctuary / Green Elephant)',
    nameEn: 'Phuket Ethical Elephant Sanctuary',
    nameJa: 'ปางช้างอนุรักษ์ภูเก็ต',
    romaji: 'Pang Chang Phuket',
    city: 'פוקט',
    cityEn: 'Phuket',
    prefecture: 'פוקט',
    region: 'דרום תאילנד',
    category: 'activity',
    estimated_duration_mins: 210,
    best_time_of_day: 'morning',
    cost_jpy: 2500,
    district: 'Paklok / Thalang',
    nearest_station: 'כולל הסעה הלוך ושוב מהמלון בפוקט',
    google_maps_url: 'https://maps.google.com/?q=Phuket+Elephant+Sanctuary',
    notes: 'מפגש מרגש ומוסרי עם פילים שניצלו מעבודה קשה: האכלת פילים בפירות, הליכה לצידם בג\'ונגל וצפייה בהם משתכשכים בבוץ ובמים (ללא רכיבה).',
    pro_tips: 'חוויה בלתי נשכחת לכל 6 בני המשפחה! מומלץ להזמין את משבצת הבוקר (09:00) כשהפילים פעילים ומזג האוויר נעים.',
    requires_advance_booking: true,
    booking_window_rule: 'חובה להזמין מראש - מספר המקומות בכל סיור מוגבל',
    booking_url: 'https://www.phuketelephantsanctuary.org/',
    aliases: ['elephant', 'פילים', 'חוות פילים', 'פילים פוקט', 'מקלט פילים'],
  },
  {
    id: 'thai-phuket-patong-bangla',
    nameHe: 'חוף פאטונג, קניון ג\'ונגסיילון ורחוב בנגלה (Patong & Jungceylon)',
    nameEn: 'Patong Beach, Jungceylon Mall & Central Patong',
    nameJa: 'หาดป่าตอง & จังซีลอน',
    romaji: 'Hat Patong & Jungceylon',
    city: 'פוקט',
    cityEn: 'Phuket',
    prefecture: 'פוקט',
    region: 'דרום תאילנד',
    category: 'attraction',
    estimated_duration_mins: 240,
    best_time_of_day: 'afternoon',
    cost_jpy: 0,
    district: 'Patong',
    nearest_station: 'מרכז חוף פאטונג',
    google_maps_url: 'https://maps.google.com/?q=Jungceylon+Mall+Patong+Phuket',
    notes: 'החוף המרכזי והתוסס של פוקט עם ספורט ימי, לצד קניון Jungceylon המשופץ וקניון Central Patong עם שוק אוכל תחתון מעולה (Banzaan Market).',
    pro_tips: 'קומת האוכל במרתף של Central Patong וסופרמרקט Big C ב-Jungceylon מושלמים להצטיידות משפחתית ומזכרות.',
    requires_advance_booking: false,
    aliases: ['patong', 'jungceylon', 'bangla', 'פאטונג', 'חוף פאטונג', 'ג\'ונגסיילון', 'בנגלה'],
  },
  {
    id: 'thai-phuket-kata-karon',
    nameHe: 'חוף קאטה וחוף קארון (Kata & Karon Beach)',
    nameEn: 'Kata Beach, Karon Beach & Karon Viewpoint',
    nameJa: 'หาดกะตะ & หาดกะรน',
    romaji: 'Hat Kata & Hat Karon',
    city: 'פוקט',
    cityEn: 'Phuket',
    prefecture: 'פוקט',
    region: 'דרום תאילנד',
    category: 'attraction',
    estimated_duration_mins: 240,
    best_time_of_day: 'morning',
    cost_jpy: 0,
    district: 'Kata / Karon',
    nearest_station: 'דרום-מערב פוקט (15 דקות דרומית לפאטונג)',
    google_maps_url: 'https://maps.google.com/?q=Kata+Beach+Phuket',
    notes: 'החופים המשפחתיים היפים ביותר בפוקט: חול לבן ורך, מים צלולים בצבע טורקיז, מסעדות על החוף ונקודת התצפית Karon Viewpoint המשקיפה על 3 מפרצים.',
    pro_tips: 'בחוף קאטה נוי (Kata Noi) הצמוד המים שקטים וצלולים במיוחד.',
    requires_advance_booking: false,
    aliases: ['kata', 'karon', 'קאטה', 'קארון', 'חוף קאטה', 'חוף קארון'],
  },
  {
    id: 'thai-phuket-promthep-cape',
    nameHe: 'תצפית השקיעה בקייפ פרומתפ וחוף יאנואי (Promthep Cape)',
    nameEn: 'Promthep Cape Sunset Viewpoint & Windmill Viewpoint',
    nameJa: 'แหลมพรหมเทพ',
    romaji: 'Laem Phromthep',
    city: 'פוקט',
    cityEn: 'Phuket',
    prefecture: 'פוקט',
    region: 'דרום תאילנד',
    category: 'attraction',
    estimated_duration_mins: 90,
    best_time_of_day: 'sunset',
    cost_jpy: 0,
    district: 'Rawai (הקצה הדרומי של פוקט)',
    nearest_station: 'Rawai / Promthep Cape',
    google_maps_url: 'https://maps.google.com/?q=Promthep+Cape+Phuket',
    notes: 'הנקודה הדרומית ביותר בפוקט עם תצפית שקיעה אייקונית מעל ים אנדמן, מוקפת עצי דקל ומגדלור לבן.',
    pro_tips: 'הגיעו סביב 17:15 לתפוס מקום מעולה לשקיעה, ואחריה המשיכו לארוחת דגים ופירות ים בטיילת של חוף Rawai הסמוך.',
    requires_advance_booking: false,
    aliases: ['promthep', 'rawai', 'פרומתפ', 'קייפ פרומתפ', 'ראוואי'],
  },
  {
    id: 'thai-phuket-big-buddha-chalong',
    nameHe: 'מקדש וואט צ\'אלונג והביג בודהה של פוקט (Wat Chalong & Big Buddha)',
    nameEn: 'Wat Chalong Temple & Phuket Big Buddha Viewpoint',
    nameJa: 'วัดฉลอง & พระพุทธมิ่งมงคลเอกนาคคีรี',
    romaji: 'Wat Chalong & Phra Phuttha Ming Mongkhon',
    city: 'פוקט',
    cityEn: 'Phuket',
    prefecture: 'פוקט',
    region: 'דרום תאילנד',
    category: 'attraction',
    estimated_duration_mins: 150,
    best_time_of_day: 'morning',
    cost_jpy: 0,
    district: 'Chalong',
    nearest_station: 'Chalong, Phuket',
    google_maps_url: 'https://maps.google.com/?q=Wat+Chalong+Phuket',
    notes: 'המקדש הבודהיסטי המפואר והחשוב ביותר בפוקט (Wat Chalong) עם סטופה בת 3 קומות מוזהבת, לצד תצפית פנורמית 360 מעלות מהר Nakkerd.',
    pro_tips: 'יש להגיע בלבוש המכסה כתפיים וברכיים. שלבו עם עצירה במפעל הקשיו המקומי בדרך.',
    requires_advance_booking: false,
    aliases: ['wat chalong', 'big buddha phuket', 'וואט צאלונג', 'צ\'אלונג', 'ביג בודהה פוקט'],
  },
  {
    id: 'thai-phuket-andamanda-waterpark',
    nameHe: 'פארק המים הענק אנדמנדה פוקט (Andamanda Phuket Water Park)',
    nameEn: 'Andamanda Phuket Water Park',
    nameJa: 'อันดามันดา ภูเก็ต',
    romaji: 'Andamanda Phuket',
    city: 'פוקט',
    cityEn: 'Phuket',
    prefecture: 'פוקט',
    region: 'דרום תאילנד',
    category: 'activity',
    estimated_duration_mins: 300,
    best_time_of_day: 'morning',
    cost_jpy: 1500,
    district: 'Kathu (ליד קניון סנטרל פוקט)',
    nearest_station: 'Kathu, Phuket (15 דקות מפאטונג)',
    google_maps_url: 'https://maps.google.com/?q=Andamanda+Phuket',
    notes: 'פארק המים החדש, הגדול והמושקע ביותר בפוקט: בריכת גלים ענקית, עשרות מגלשות אקסטרים ומגלשות משפחתיות, נהר אבובים ארוך ומתחמי מנוחה מוצלים.',
    pro_tips: 'מושלם ליום כיף משפחתי! צמוד לקניון Central Phuket Floresta כך שאפשר לשלב קניות וארוחת ערב מיד אחרי.',
    requires_advance_booking: false,
    aliases: ['andamanda', 'water park phuket', 'אנדמנדה', 'פארק מים פוקט'],
  },
  {
    id: 'thai-phuket-central-floresta',
    nameHe: 'קניון סנטרל פוקט פלורסטה ואקווריום Aquaria (Central Phuket)',
    nameEn: 'Central Phuket Floresta & Festival Mall',
    nameJa: 'เซ็นทรัล ภูเก็ต ฟลอเรสต้า',
    romaji: 'Central Phuket Floresta',
    city: 'פוקט',
    cityEn: 'Phuket',
    prefecture: 'פוקט',
    region: 'דרום תאילנד',
    category: 'shopping',
    estimated_duration_mins: 210,
    best_time_of_day: 'afternoon',
    cost_jpy: 0,
    district: 'Phuket Town / Wichit',
    nearest_station: 'צומת Darasamuth, פוקט',
    google_maps_url: 'https://maps.google.com/?q=Central+Phuket+Floresta',
    notes: 'מתחם הקניות הגדול ביותר באי (שני קניוני ענק מחוברים בגשר ממוזג), שוק אוכל צף מקורה (Tales of Thailand) והאקווריום הענק Aquaria Phuket.',
    pro_tips: 'שוק האוכל בקומת הקרקע של אגף Floresta מעוצב כמו כפר תאילנדי מסורתי אבל ממוזג ונקי להפליא!',
    requires_advance_booking: false,
    aliases: ['central phuket', 'floresta', 'aquaria', 'סנטרל פוקט', 'אקווריום פוקט'],
  },
  {
    id: 'thai-phuket-carnival-magic',
    nameHe: 'פארק האורות ומופע הערב Carnival Magic & Phuket FantaSea',
    nameEn: 'Carnival Magic Phuket',
    nameJa: 'คาร์นิวัลเมจิก ภูเก็ต',
    romaji: 'Carnival Magic Phuket',
    city: 'פוקט',
    cityEn: 'Phuket',
    prefecture: 'פוקט',
    region: 'דרום תאילנד',
    category: 'activity',
    estimated_duration_mins: 240,
    best_time_of_day: 'evening',
    cost_jpy: 2100,
    district: 'Kamala Beach',
    nearest_station: 'Kamala Beach (15 דקות צפונית לפאטונג)',
    google_maps_url: 'https://maps.google.com/?q=Carnival+Magic+Phuket',
    notes: 'פארק לילה מרהיב המחזיק בשיאי גינס עם מעל 40 מיליון נורות LED, מצעד קרנבל ענק באולם ממוזג ובופה ארוחת ערב עשיר.',
    pro_tips: 'פתוח בימים שני, רביעי ושבת בערב. מומלץ להגיע ב-17:30 עם פתיחת השערים.',
    requires_advance_booking: true,
    aliases: ['carnival magic', 'fantasea', 'קרניבל מג\'יק', 'פנטזי פוקט'],
  },

  // ==========================================
  // 2. קוסמוי (KOH SAMUI)
  // ==========================================
  {
    id: 'thai-samui-ang-thong',
    nameHe: 'שייט לשמורת 42 האיים אנג תונג והלגונה הירוקה (Ang Thong Marine Park)',
    nameEn: 'Mu Ko Ang Thong National Marine Park Speedboat & Kayaking',
    nameJa: 'อุทยานแห่งชาติหมู่เกาะอ่างทอง',
    romaji: 'Utthayan Haeng Chat Mu Ko Ang Thong',
    city: 'קוסמוי',
    cityEn: 'Koh Samui',
    prefecture: 'סוראט תאני (קוסמוי)',
    region: 'מפרץ תאילנד',
    category: 'activity',
    estimated_duration_mins: 450,
    best_time_of_day: 'morning',
    cost_jpy: 2200,
    district: 'Bophut / Nathon Pier',
    nearest_station: 'איסוף מהמלון בקוסמוי למזח Bophut / Petcherat Marina',
    google_maps_url: 'https://maps.google.com/?q=Mu+Ko+Ang+Thong+National+Marine+Park',
    notes: 'ארכיפלג עוצר נשימה של 42 איים טרופיים ירוקים: תצפית על לגונת האזמרגד הפנימית (Talay Nai), שייט קיאקים, חופים בתוליים ושנורקלינג.',
    pro_tips: 'אטרקציית החובה של קוסמוי! מומלץ להביא נעלי הליכה נוחות או סנדלים סגורים לעלייה הקצרה לתצפית לגונת האזמרגד.',
    requires_advance_booking: true,
    booking_window_rule: 'מומלץ להזמין יומיים-שלושה מראש',
    aliases: ['ang thong', 'marine park', 'אנג תונג', 'שמורת אנג תונג', '42 האיים'],
  },
  {
    id: 'thai-samui-fishermans-village',
    nameHe: 'כפר הדייגים בבוהפוט ומופע האש ב-Coco Tam\'s (Fisherman\'s Village)',
    nameEn: 'Fisherman\'s Village Bophut & Coco Tam\'s Beach Bar',
    nameJa: 'หมู่บ้านชาวประมงบ่อผุด (Fisherman\'s Village)',
    romaji: 'Mu Ban Chao Pramong Bophut',
    city: 'קוסמוי',
    cityEn: 'Koh Samui',
    prefecture: 'סוראט תאני (קוסמוי)',
    region: 'מפרץ תאילנד',
    category: 'food',
    estimated_duration_mins: 210,
    best_time_of_day: 'evening',
    cost_jpy: 600,
    district: 'Bophut (צפון קוסמוי)',
    nearest_station: 'Bophut Beach, Koh Samui',
    google_maps_url: 'https://maps.google.com/?q=Fishermans+Village+Koh+Samui',
    notes: 'מדרחוב חוף קסום עם בתי עץ עתיקים, שוק לילה תוסס, מסעדות מעולות על המים ומופע להטוטני אש מרהיב על החוף ב-Coco Tam\'s.',
    pro_tips: 'מופע האש המפורסם על החוף מול Coco Tam\'s מתקיים מדי ערב ב-19:15 וב-21:00 – חוויה מדהימה לכל המשפחה!',
    requires_advance_booking: false,
    aliases: ['fisherman', 'fishermans village', 'bophut', 'coco tams', 'כפר הדייגים', 'בוהפוט', 'קוקו טאמס'],
  },
  {
    id: 'thai-samui-chaweng-central',
    nameHe: 'חוף צ\'אוונג וקניון סנטרל סמוי (Chaweng Beach & Central Samui)',
    nameEn: 'Chaweng Beach & Central Samui Shopping Center',
    nameJa: 'หาดเฉวง & เซ็นทรัล สมุย',
    romaji: 'Hat Chaweng & Central Samui',
    city: 'קוסמוי',
    cityEn: 'Koh Samui',
    prefecture: 'סוראט תאני (קוסמוי)',
    region: 'מפרץ תאילנד',
    category: 'attraction',
    estimated_duration_mins: 240,
    best_time_of_day: 'afternoon',
    cost_jpy: 0,
    district: 'Chaweng (מזרח קוסמוי)',
    nearest_station: 'Chaweng Beach Road',
    google_maps_url: 'https://maps.google.com/?q=Central+Samui+Chaweng',
    notes: 'החוף הארוך, הלבן והפופולרי ביותר בקוסמוי (7 ק"מ של חול רך ומים רדודים), לצד קניון Central Samui הפתוח עם מתחם דוכני אוכל וחנויות מותגים.',
    pro_tips: 'המים בצ\'אוונג רדודים ונעימים מאוד לשחייה משפחתית. בערב רחוב Chaweng מתעורר עם מסעדות ומכוני מסאז\' מעולים.',
    requires_advance_booking: false,
    aliases: ['chaweng', 'central samui', 'צ\'אוונג', 'צאוונג', 'חוף צ\'אוונג', 'סנטרל סמוי'],
  },
  {
    id: 'thai-samui-big-buddha-plai-laem',
    nameHe: 'מקדש ביג בודהה ומקדש וואט פלאי לאם הצף (Big Buddha & Wat Plai Laem)',
    nameEn: 'Big Buddha Temple (Wat Phra Yai) & Wat Plai Laem',
    nameJa: 'วัดพระใหญ่ & วัดปลายแหลม',
    romaji: 'Wat Phra Yai & Wat Plai Laem',
    city: 'קוסמוי',
    cityEn: 'Koh Samui',
    prefecture: 'סוראט תאני (קוסמוי)',
    region: 'מפרץ תאילנד',
    category: 'attraction',
    estimated_duration_mins: 120,
    best_time_of_day: 'morning',
    cost_jpy: 0,
    district: 'Bang Rak / Plai Laem (צפון-מזרח קוסמוי)',
    nearest_station: '5 דקות נסיעה בין שני המקדשים בצפון האי',
    google_maps_url: 'https://maps.google.com/?q=Wat+Plai+Laem+Koh+Samui',
    notes: 'פסל הבודהה המוזהב בגובה 12 מטר המשקיף על הים, ובמרחק 3 דקות ממנו מקדש Wat Plai Laem המרהיב הבנוי על אגם מים עם פסל האלה בעלת 18 הידיים.',
    pro_tips: 'ב-Wat Plai Laem אפשר לקנות שקית אוכל לדגים ב-10 באט ולהאכיל מאות דגי ענק באגם שמקיף את המקדש.',
    requires_advance_booking: false,
    aliases: ['big buddha samui', 'wat plai laem', 'ביג בודהה קוסמוי', 'וואט פלאי לאם', 'פלאי לאם'],
  },
  {
    id: 'thai-samui-silver-beach-lamai',
    nameHe: 'חוף סילבר ביץ\' (קריסטל ביי), חוף לאמאי וסלעי סבא וסבתא',
    nameEn: 'Silver Beach (Crystal Bay), Lamai Beach & Hin Ta Hin Yai',
    nameJa: 'หาดซิลเวอร์บีช (อ่าวท้องตะเคียน) & หาดละไม',
    romaji: 'Ao Thong Takhian & Hat Lamai',
    city: 'קוסמוי',
    cityEn: 'Koh Samui',
    prefecture: 'סוראט תאני (קוסמוי)',
    region: 'מפרץ תאילנד',
    category: 'attraction',
    estimated_duration_mins: 210,
    best_time_of_day: 'morning',
    cost_jpy: 0,
    district: 'Lamai (מזרח-דרום קוסמוי)',
    nearest_station: 'בין צ\'אוונג ללאמאי',
    google_maps_url: 'https://maps.google.com/?q=Silver+Beach+Crystal+Bay+Koh+Samui',
    notes: 'מפרץ קטן וציורי (Silver Beach / Crystal Bay) עם סלעי גרניט עגולים ומים שקופים לשנורקלינג מהחוף, לצד חוף לאמאי ותצורות הסלע המפורסמות Hin Ta & Hin Yai.',
    pro_tips: 'במתחם Hin Ta Hin Yai אל תפספסו את סוכריות הקוקוס החמות והטריות (Kalamae) שמכינים במקום!',
    requires_advance_booking: false,
    aliases: ['silver beach', 'crystal bay', 'lamai', 'hin ta', 'סילבר ביץ', 'קריסטל ביי', 'לאמאי', 'חוף לאמאי'],
  },
  {
    id: 'thai-samui-namuang-jungle',
    nameHe: 'טיול ג\'יפים בג\'ונגל, מפלי נאם מואנג ותצפית הקوه (Na Muang Waterfalls)',
    nameEn: 'Na Muang Waterfalls, Secret Buddha Garden & 4x4 Jungle Safari',
    nameJa: 'น้ำตกหน้าเมือง & สวนพุทธลับ',
    romaji: 'Namtok Na Mueang',
    city: 'קוסמוי',
    cityEn: 'Koh Samui',
    prefecture: 'סוראט תאני (קוסמוי)',
    region: 'מפרץ תאילנד',
    category: 'activity',
    estimated_duration_mins: 240,
    best_time_of_day: 'morning',
    cost_jpy: 1600,
    district: 'Na Muang (מרכז ודרום קוסמוי)',
    nearest_station: 'איסוף בג\'יפ 4x4 מהמלון',
    google_maps_url: 'https://maps.google.com/?q=Na+Muang+Waterfall+Koh+Samui',
    notes: 'סיור ג\'יפים בהרים הטרופיים של קוסמוי: רחצה בבריכות הטבעיות של מפלי נאם מואנג, גן הבודהה הנסתר בפסגת ההר ותצפית Jungle Club על כל המפרץ.',
    pro_tips: 'מסעדת The Jungle Club או Overlap Stone בדרך מציעות את הנוף הכי פוטוגני בקוסמוי.',
    requires_advance_booking: false,
    aliases: ['na muang', 'waterfall samui', 'jungle club', 'נאם מואנג', 'מפלי נאם מואנג', 'טיול גיפים קוסמוי'],
  },
  {
    id: 'thai-samui-pig-island-tan',
    nameHe: 'שייט חצי יום לאי החזירים (Koh Madsum) ושנורקלינג בקו טאן',
    nameEn: 'Koh Madsum (Pig Island) & Koh Tan Snorkeling Tour',
    nameJa: 'เกาะมัดสุม (เกาะหมู) & เกาะแตน',
    romaji: 'Ko Madsum & Ko Tan',
    city: 'קוסמוי',
    cityEn: 'Koh Samui',
    prefecture: 'סוראט תאני (קוסמוי)',
    region: 'מפרץ תאילנד',
    category: 'activity',
    estimated_duration_mins: 270,
    best_time_of_day: 'morning',
    cost_jpy: 1500,
    district: 'Thong Krut Pier (דרום קוסמוי)',
    nearest_station: '15 דקות הפלגה מדרום קוסמוי',
    google_maps_url: 'https://maps.google.com/?q=Koh+Madsum+Pig+Island+Samui',
    notes: 'שייט קצר ורגוע של 15 דקות בלבד לאי קו מאדסום עם חוף חולי לבן שבו מסתובבים חזירי בר ידידותיים על החוף, ושנורקלינג בשוניות של קו טאן.',
    pro_tips: 'מתאים מאוד למשפחות כי ההפלגה קצרה ורגועה מאוד במים שקטים!',
    requires_advance_booking: false,
    aliases: ['pig island', 'koh madsum', 'koh tan', 'אי החזירים', 'קו מאדסום', 'קו טאן'],
  },

  // ==========================================
  // 3. בנגקוק (BANGKOK)
  // ==========================================
  {
    id: 'thai-bkk-grand-palace-wat-pho',
    nameHe: 'ארמון המלך, מקדש הבודהה מאזמרגד ומקדש הבודהה השוכב (Grand Palace & Wat Pho)',
    nameEn: 'The Grand Palace, Wat Phra Kaew & Wat Pho (Reclining Buddha)',
    nameJa: 'พระบรมมหาราชวัง & วัดโพธิ์',
    romaji: 'Phra Borom Maha Ratchawang & Wat Pho',
    city: 'בנגקוק',
    cityEn: 'Bangkok',
    prefecture: 'בנגקוק',
    region: 'מרכז תאילנד',
    category: 'attraction',
    estimated_duration_mins: 210,
    best_time_of_day: 'morning',
    cost_jpy: 800,
    district: 'Phra Nakhon / Rattanakosin (העיר העתיקה)',
    nearest_station: 'Sanam Chai MRT Station / Tha Chang Pier (סירה בנהר הצ\'או פראיה)',
    google_maps_url: 'https://maps.google.com/?q=The+Grand+Palace+Bangkok',
    notes: 'מתחם הארמון המלכותי הנוצץ בזהב של מלכי תאילנד ובצמוד אליו מקדש Wat Pho עם פסל הבודהה השוכב המוזהב באורך 46 מטר.',
    pro_tips: 'חובה להגיע עם מכנסיים ארוכים וחולצה המכסה כתפיים! מומלץ להגיע ב-08:30 בבוקר לפני החום, ואל תאמינו לנוכלים ברחוב שאומרים ש"הארמון סגור היום".',
    requires_advance_booking: false,
    aliases: ['grand palace', 'wat pho', 'reclining buddha', 'ארמון המלך', 'הארמון הגדול', 'וואט פו', 'הבודהה השוכב'],
  },
  {
    id: 'thai-bkk-wat-arun',
    nameHe: 'מקדש השחר על נהר הצ\'או פראיה (Wat Arun)',
    nameEn: 'Wat Arun Ratchawararam (Temple of Dawn)',
    nameJa: 'วัดอรุณราชวราราม',
    romaji: 'Wat Arun',
    city: 'בנגקוק',
    cityEn: 'Bangkok',
    prefecture: 'בנגקוק',
    region: 'מרכז תאילנד',
    category: 'attraction',
    estimated_duration_mins: 90,
    best_time_of_day: 'afternoon',
    cost_jpy: 200,
    district: 'Bangkok Yai (הגדה המערבית של הנהר)',
    nearest_station: 'מעבורת חצייה של 5 באט ממזח Tha Tien (מול וואט פו)',
    google_maps_url: 'https://maps.google.com/?q=Wat+Arun+Bangkok',
    notes: 'אחד המקדשים היפים בתאילנד עם מגדלי פראנג לבנים המעוטרים במיליוני שברי פורצלן צבעוניים על שפת נהר הצ\'או פראיה.',
    pro_tips: 'חוצים במעבורת של 3 דקות ישירות מ-Wat Pho. בשעת השקיעה בתי הקפה בגדה ממול משקיפים על המקדש כשהוא נדלק בתאורת זהב.',
    requires_advance_booking: false,
    aliases: ['wat arun', 'temple of dawn', 'וואט ארון', 'מקדש השחר'],
  },
  {
    id: 'thai-bkk-iconsiam',
    nameHe: 'קניון הפאר אייקון סיאם ושוק המים הממוזג SookSiam (ICONSIAM)',
    nameEn: 'ICONSIAM & SookSiam Indoor Floating Market',
    nameJa: 'ไอคอนสยาม (ICONSIAM)',
    romaji: 'IconSiam',
    city: 'בנגקוק',
    cityEn: 'Bangkok',
    prefecture: 'בנגקוק',
    region: 'מרכז תאילנד',
    category: 'shopping',
    estimated_duration_mins: 240,
    best_time_of_day: 'evening',
    cost_jpy: 0,
    district: 'Khlong San (גדת נהר הצ\'או פראיה)',
    nearest_station: 'סירת שאטל מ-Saphan Taksin BTS או קו הזהב Charoen Nakhon',
    google_maps_url: 'https://maps.google.com/?q=ICONSIAM+Bangkok',
    notes: 'קניון העל המפואר ביותר בתאילנד על גדת הנהר: בקומת הקרקע שוכן SookSiam – שוק צף תאילנדי ענק וממוזג עם דוכני אוכל מכל 77 מחוזות תאילנד, ובחוץ מופע מזרקות מים ואור מדי ערב.',
    pro_tips: 'מופע המזרקות המרהיב על הנהר (Iconic Multimedia Water Features) מתקיים בחינם מדי ערב ב-19:00 וב-20:00!',
    requires_advance_booking: false,
    aliases: ['iconsiam', 'icon siam', 'sooksiam', 'אייקון סיאם', 'איקון סיאם', 'סוק סיאם'],
  },
  {
    id: 'thai-bkk-siam-paragon-sealife',
    nameHe: 'קניון סיאם פרגון, סיאם סנטר ואקווריום SEA LIFE Bangkok',
    nameEn: 'Siam Paragon, Siam Center, CentralWorld & SEA LIFE Bangkok Ocean World',
    nameJa: 'สยามพารากอน & ซีไลฟ์ แบงคอก',
    romaji: 'Siam Paragon & Sea Life',
    city: 'בנגקוק',
    cityEn: 'Bangkok',
    prefecture: 'בנגקוק',
    region: 'מרכז תאילנד',
    category: 'shopping',
    estimated_duration_mins: 270,
    best_time_of_day: 'afternoon',
    cost_jpy: 1100,
    district: 'Siam (לב בנגקוק)',
    nearest_station: 'Siam BTS Skytrain Station (יציאה ישירה לקניון)',
    google_maps_url: 'https://maps.google.com/?q=Siam+Paragon+Bangkok',
    notes: 'מרכז הקניות והבילוי הראשי של בנגקוק: קניוני סיאם פרגון, סיאם דיסקברי ו-CentralWorld המחוברים בגשר עילי, כולל אקווריום הענק SEA LIFE במרתף הפרגון.',
    pro_tips: 'מתחם האוכל בקומת הקרקע של Siam Paragon הוא גן עדן קולינרי שמתאים לכל טעם במשפחה.',
    requires_advance_booking: false,
    aliases: ['siam paragon', 'centralworld', 'central world', 'sea life', 'סיאם פרגון', 'סנטרל וורלד', 'אקווריום בנגקוק'],
  },
  {
    id: 'thai-bkk-mbk-center',
    nameHe: 'קניון המציאות והמזכרות MBK Center',
    nameEn: 'MBK Center (Mahboonkrong) Shopping Mall',
    nameJa: 'เอ็มบีเค เซ็นเตอร์ (มาบุญครอง)',
    romaji: 'MBK Center',
    city: 'בנגקוק',
    cityEn: 'Bangkok',
    prefecture: 'בנגקוק',
    region: 'מרכז תאילנד',
    category: 'shopping',
    estimated_duration_mins: 180,
    best_time_of_day: 'afternoon',
    cost_jpy: 0,
    district: 'Pathum Wan / Siam',
    nearest_station: 'National Stadium BTS Station (גשר הליכה ישיר מסיאם)',
    google_maps_url: 'https://maps.google.com/?q=MBK+Center+Bangkok',
    notes: 'קניון 8 הקומות האגדי של בנגקוק עם מעל 2,000 חנויות ודוכנים: בגדים, מזוודות, אלקטרוניקה, אביזרים לטלפון ומזכרות במחירים מעולים.',
    pro_tips: 'ב-MBK נהוג להתמקח בנימוס ובחיוך, במיוחד כשקונים מספר פריטים לכל המשפחה!',
    requires_advance_booking: false,
    aliases: ['mbk', 'mahboonkrong', 'אמ בי קיי', 'קניון mbk'],
  },
  {
    id: 'thai-bkk-mahanakhon-skywalk',
    nameHe: 'תצפית הזכוכית בגובה 314 מטר – King Power Mahanakhon SkyWalk',
    nameEn: 'King Power Mahanakhon SkyWalk (Glass Tray Observation Deck)',
    nameJa: 'คิง เพาเวอร์ มหานคร สกายวอล์ค',
    romaji: 'Mahanakhon SkyWalk',
    city: 'בנגקוק',
    cityEn: 'Bangkok',
    prefecture: 'בנגקוק',
    region: 'מרכז תאילנד',
    category: 'attraction',
    estimated_duration_mins: 120,
    best_time_of_day: 'sunset',
    cost_jpy: 1000,
    district: 'Silom / Sathorn',
    nearest_station: 'Chong Nonsi BTS Station (יציאה 3 ישירות למגדל)',
    google_maps_url: 'https://maps.google.com/?q=King+Power+Mahanakhon+Bangkok',
    notes: 'מרפסת התצפית הפתוחה הגבוהה ביותר בתאילנד בקומה ה-78 של "מגדל הפיקסלים", כולל רצפת זכוכית שקופה בגובה 310 מטר מעל רחובות בנגקוק.',
    pro_tips: 'מומלץ לעלות ב-16:45 כדי לראות את בנגקוק באור יום, בשקיעה ובאורות הלילה.',
    requires_advance_booking: false,
    aliases: ['mahanakhon', 'skywalk', 'pixel tower', 'מהאנקון', 'מגדל הפיקסלים', 'תצפית הזכוכית בנגקוק'],
  },
  {
    id: 'thai-bkk-jodd-fairs-asiatique',
    nameHe: 'שוק הלילה ג\'וד פיירס או אסיאטיק על הנהר (Jodd Fairs / Asiatique)',
    nameEn: 'Jodd Fairs Night Market & Asiatique The Riverfront',
    nameJa: 'จ๊อดแฟร์ & เอเชียทีค เดอะ ริเวอร์ฟร้อนท์',
    romaji: 'Jodd Fairs & Asiatique',
    city: 'בנגקוק',
    cityEn: 'Bangkok',
    prefecture: 'בנגקוק',
    region: 'מרכז תאילנד',
    category: 'food',
    estimated_duration_mins: 180,
    best_time_of_day: 'evening',
    cost_jpy: 500,
    district: 'Ratchada / Charoen Krung',
    nearest_station: 'MRT Phra Ram 9 / Thailand Cultural Centre או סירה חינם מ-Saphan Taksin ל-Asiatique',
    google_maps_url: 'https://maps.google.com/?q=Asiatique+The+Riverfront+Bangkok',
    notes: 'שווקי הערב האהובים בבנגקוק: דוכני מנגו סטיקי רייס, רוטי בננה שוקולד, שייקים טרופיים, בגדים ואווירה חגיגית (ב-Asiatique גם גלגל ענק מואר על שפת הנהר).',
    pro_tips: 'ל-Asiatique יוצאת סירת שאטל חינמית מרציף Saphan Taksin מדי 15 דקות החל מ-16:00.',
    requires_advance_booking: false,
    aliases: ['jodd fairs', 'asiatique', 'ג\'וד פיירס', 'גוד פיירס', 'אסיאטיק', 'שוק לילה בנגקוק'],
  },
  {
    id: 'thai-bkk-chatuchak-market',
    nameHe: 'שוק סוף השבוע הענק צ\'אטוצ\'אק (Chatuchak Weekend Market)',
    nameEn: 'Chatuchak Weekend Market (JJ Market)',
    nameJa: 'ตลาดนัดจตุจักร',
    romaji: 'Talat Nat Chatuchak',
    city: 'בנגקוק',
    cityEn: 'Bangkok',
    prefecture: 'בנגקוק',
    region: 'מרכז תאילנד',
    category: 'shopping',
    estimated_duration_mins: 210,
    best_time_of_day: 'morning',
    cost_jpy: 0,
    district: 'Chatuchak (צפון בנגקוק)',
    nearest_station: 'Mo Chit BTS Station / Kamphaeng Phet MRT Station',
    google_maps_url: 'https://maps.google.com/?q=Chatuchak+Weekend+Market+Bangkok',
    notes: 'השוק הפתוח הגדול בתאילנד עם מעל 15,000 דוכנים המחולקים ל-27 אזורים: בגדים, עבודות יד, תיקים, מזכרות, גלידת קוקוס באגוז קוקוס וקניון Mixt הממוזג הצמוד.',
    pro_tips: 'פעיל במלואו בשבת וראשון (למשל שבת 21.11!). אם חם מדי, קניון Mixt Chatuchak הצמוד ממוזג לחלוטין ומציע מאות חנויות דומות.',
    requires_advance_booking: false,
    aliases: ['chatuchak', 'jj market', 'צ\'אטוצ\'אק', 'צאטוצאק', 'שוק סוף השבוע'],
  },
  {
    id: 'thai-bkk-chinatown-yaowarat',
    nameHe: 'צ\'יינה טאון בנגקוק ומדרחוב האוכל יאווראט (Chinatown Yaowarat Road)',
    nameEn: 'Bangkok Chinatown (Yaowarat Road Night Street Food)',
    nameJa: 'เยาวราช (ไชน่าทาวน์)',
    romaji: 'Yaowarat Chinatown',
    city: 'בנגקוק',
    cityEn: 'Bangkok',
    prefecture: 'בנגקוק',
    region: 'מרכז תאילנד',
    category: 'food',
    estimated_duration_mins: 150,
    best_time_of_day: 'evening',
    cost_jpy: 400,
    district: 'Samphanthawong (Yaowarat)',
    nearest_station: 'Wat Mangkon MRT Station (יציאה ישירה ללב צ\'יינה טאון)',
    google_maps_url: 'https://maps.google.com/?q=Yaowarat+Road+Chinatown+Bangkok',
    notes: 'רחוב אורות הניאון הצבעוני של צ\'יינה טאון שהופך בערב לחגיגת קולינריה עצומה של דים סאם, ערמונים קלויים, פירות טרופיים וקינוחים חמים.',
    pro_tips: 'מומלץ להגיע ב-MRT לתחנת Wat Mangkon כדי לדלג על פקקי הערב של בנגקוק.',
    requires_advance_booking: false,
    aliases: ['chinatown', 'yaowarat', 'צ\'יינה טאון', 'ציינה טאון', 'יאווראט'],
  },
  {
    id: 'thai-bkk-floating-railway-markets',
    nameHe: 'שוק הרכבת המתקפל ושוק צף דמנואן סדואק (Maeklong & Damnoen Saduak)',
    nameEn: 'Maeklong Railway Market & Damnoen Saduak Floating Market',
    nameJa: 'ตลาดร่มหุบแม่กลอง & ตลาดน้ำดำเนินสะดวก',
    romaji: 'Talat Rom Hup & Damnoen Saduak',
    city: 'בנגקוק',
    cityEn: 'Bangkok',
    prefecture: 'סמוט סונגקראם / ראצ\'בורי (טיול מבנגקוק)',
    region: 'מרכז תאילנד',
    category: 'activity',
    estimated_duration_mins: 360,
    best_time_of_day: 'morning',
    cost_jpy: 1200,
    district: 'טיול בוקר מבנגקוק (כשעה ורבע נסיעה)',
    nearest_station: 'איסוף בואן פרטי מהמלון בבנגקוק',
    google_maps_url: 'https://maps.google.com/?q=Damnoen+Saduak+Floating+Market',
    notes: 'שילוב מנצח של שני השווקים המפורסמים ביותר: שוק הרכבת שבו הסוחרים מקפלים את הסככות בשניות כשהרכבת חולפת במרחק סנטימטרים, ושייט בסירות עץ בשוק הצף.',
    pro_tips: 'עבור 6 בני משפחה הכי משתלם ונוח לשכור ואן ממוזג (Toyota Commuter) עם נהג צמוד לחצי יום בוקר (07:30-14:00).',
    requires_advance_booking: false,
    aliases: ['floating market', 'damnoen saduak', 'maeklong', 'railway market', 'שוק צף', 'השוק הצף', 'שוק הרכבת', 'דמנואן סדואק'],
  },
  {
    id: 'thai-bkk-lumpini-park',
    nameHe: 'פארק לומפיני וקניון Terminal 21 (Lumpini Park & Terminal 21 Asok)',
    nameEn: 'Lumpini Park & Terminal 21 Asok Shopping Mall',
    nameJa: 'สวนลุมพินี & เทอร์มินอล 21 อโศก',
    romaji: 'Suan Lumphini & Terminal 21',
    city: 'בנגקוק',
    cityEn: 'Bangkok',
    prefecture: 'בנגקוק',
    region: 'מרכז תאילנד',
    category: 'attraction',
    estimated_duration_mins: 180,
    best_time_of_day: 'morning',
    cost_jpy: 0,
    district: 'Silom / Sukhumvit (Asok)',
    nearest_station: 'Si Lom MRT / Asok BTS Station',
    google_maps_url: 'https://maps.google.com/?q=Terminal+21+Asok+Bangkok',
    notes: 'הריאה הירוקה של בנגקוק עם אגמים, סירות פדלים ולטאות כוח ענקיות שמסתובבות חופשי, ובמרחק קצר קניון Terminal 21 המעוצב כשדה תעופה שבו כל קומה היא עיר אחרת בעולם.',
    pro_tips: 'מתחם האוכל Pier 21 בקומה ה-5 של קניון Terminal 21 מפורסם כמגוון, הנקי והמשתלם ביותר בבנגקוק!',
    requires_advance_booking: false,
    aliases: ['lumpini', 'terminal 21', 'asok', 'לומפיני', 'פארק לומפיני', 'טרמינל 21'],
  },
];

/**
 * Normalizes Hebrew and English strings for resilient fuzzy search
 */
export function normalizeSearchText(input: string): string {
  if (!input) return '';
  return input
    .toLowerCase()
    .replace(/['’׳"״`\-–—_.,()/\\]/g, ' ')
    .replace(/יי/g, 'י')
    .replace(/וו/g, 'ו')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Searches the offline database for destinations matching query (Hebrew, English, Thai).
 */
export function searchJapanDestinations(query: string, limit = 8): JapanDestination[] {
  if (!query || !query.trim()) return [];
  const rawQ = query.trim().toLowerCase();
  const normQ = normalizeSearchText(query);
  const tokens = normQ.split(' ').filter((t) => t.length > 0);

  const scored = JAPAN_DESTINATIONS.map((item) => {
    const searchableRaw = [
      item.nameHe,
      item.nameEn,
      item.nameJa,
      item.romaji,
      item.city,
      item.cityEn || '',
      item.prefecture || '',
      item.district || '',
      ...(item.aliases || []),
    ]
      .join(' ')
      .toLowerCase();

    const searchableNorm = normalizeSearchText(searchableRaw);
    const titleNorm = normalizeSearchText(`${item.nameHe} ${item.nameEn} ${item.romaji}`);

    let score = 0;

    if (titleNorm.includes(normQ) || searchableRaw.includes(rawQ)) {
      score += 50;
      if (normalizeSearchText(item.nameHe).startsWith(normQ) || normalizeSearchText(item.nameEn).startsWith(normQ)) {
        score += 30;
      }
    }

    if (normQ.length >= 2 && searchableNorm.includes(normQ)) {
      score += 35;
    }

    if (tokens.length > 0 && tokens.every((tok) => searchableNorm.includes(tok))) {
      score += 25;
    }

    return { item, score };
  })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((entry) => entry.item);
}

/**
 * Finds an exact or best match destination in the offline database.
 */
export function findKnownDestination(title: string): JapanDestination | undefined {
  if (!title) return undefined;
  const clean = title.trim().toLowerCase();
  const norm = normalizeSearchText(title);
  if (!norm) return undefined;

  return JAPAN_DESTINATIONS.find((item) => {
    const itemHeNorm = normalizeSearchText(item.nameHe);
    const itemEnNorm = normalizeSearchText(item.nameEn);
    return (
      norm.includes(itemHeNorm) ||
      itemHeNorm.includes(norm) ||
      norm.includes(itemEnNorm) ||
      itemEnNorm.includes(norm) ||
      clean.includes(item.nameJa) ||
      (item.aliases &&
        item.aliases.some((a) => {
          const aNorm = normalizeSearchText(a);
          return aNorm.length >= 3 && (norm.includes(aNorm) || aNorm.includes(norm));
        }))
    );
  });
}

/**
 * Infers the real Thai city (פוקט / קוסמוי / בנגקוק) from an item's title, location_name, or URL
 */
export function inferCityFromItemText(text: string): string | undefined {
  if (!text) return undefined;
  const known = findKnownDestination(text);
  if (known) return known.city;

  const norm = normalizeSearchText(text);
  const cityMatchers: { keywords: string[]; cityHe: string }[] = [
    {
      keywords: [
        'phuket', 'פוקט', 'patong', 'פאטונג', 'kata', 'קאטה', 'karon', 'קארון',
        'phi phi', 'פי פי', 'maya bay', 'מאיה', 'phang nga', 'פאנג נגה', 'james bond',
        'chalong', 'צאלונג', 'promthep', 'פרומתפ', 'rawai', 'ראוואי', 'kamala', 'קמאלה',
        'bang tao', 'בנג טאו', 'andamanda', 'אנדמנדה', 'jungceylon', 'thalang',
      ],
      cityHe: 'פוקט',
    },
    {
      keywords: [
        'samui', 'קוסמוי', 'קו סמוי', 'סמוי', 'chaweng', 'צאוונג', 'bophut', 'בוהפוט',
        'fisherman', 'כפר הדייגים', 'lamai', 'לאמאי', 'ang thong', 'אנג תונג',
        'plai laem', 'פלאי לאם', 'na muang', 'נאם מואנג', 'silver beach', 'סילבר ביץ',
        'crystal bay', 'קריסטל ביי', 'madsum', 'אי החזירים', 'phangan', 'פנגן', 'coco tam',
      ],
      cityHe: 'קוסמוי',
    },
    {
      keywords: [
        'bangkok', 'בנגקוק', 'siam', 'סיאם', 'iconsiam', 'אייקון סיאם', 'mbk',
        'wat pho', 'וואט פו', 'wat arun', 'וואט ארון', 'grand palace', 'ארמון המלך',
        'mahanakhon', 'מהאנקון', 'chatuchak', 'צאטוצאק', 'asiatique', 'אסיאטיק',
        'jodd fairs', 'גוד פיירס', 'sukhumvit', 'סוקומוויט', 'silom', 'סילום',
        'yaowarat', 'chinatown', 'ציינה טאון', 'lumpini', 'לומפיני', 'terminal 21',
        'damnoen', 'maeklong', 'שוק צף', 'שוק הרכבת', 'suvarnabhumi', 'סוברנבומי',
      ],
      cityHe: 'בנגקוק',
    },
  ];

  for (const matcher of cityMatchers) {
    if (matcher.keywords.some((kw) => norm.includes(normalizeSearchText(kw)))) {
      return matcher.cityHe;
    }
  }
  return undefined;
}

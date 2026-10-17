export type ItemCategory = 
  | 'attraction' 
  | 'food' 
  | 'transport' 
  | 'hotel' 
  | 'shopping' 
  | 'activity';

export type BestTimeOfDay = 'morning' | 'afternoon' | 'sunset' | 'evening' | 'night' | 'flexible';

export interface ItineraryItem {
  id: string;
  trip_id: string;
  day_id: string | null; // null indicates unassigned wishlist item
  city?: string; // used for filtering unassigned catalog items
  title: string;
  title_ja?: string; // stores Thai / English native script name
  category: ItemCategory;
  time_slot: string; // e.g. "09:30 - 11:30" or "גמיש" for unassigned
  location_name: string;
  google_maps_url?: string;
  notes?: string;
  ticket_info?: string;
  ticket_url?: string;
  is_completed: boolean;
  order_index: number;
  cost_jpy?: number; // stores cost in THB (Thai Baht ฿)
  // Deep AI enrichment fields
  estimated_duration_mins?: number;
  best_time_of_day?: BestTimeOfDay;
  district?: string;
  nearest_station?: string;
  pro_tips?: string;
  requires_advance_booking?: boolean;
  booking_window_rule?: string;
  created_at?: string;
  updated_at?: string;
}

export interface EnrichedAttractionData {
  title: string;
  title_ja: string;
  category: ItemCategory;
  city?: string;
  district?: string;
  nearest_station?: string;
  estimated_duration_mins: number;
  best_time_of_day: BestTimeOfDay;
  cost_jpy: number;
  location_name: string;
  google_maps_url: string;
  pro_tips: string;
  notes: string;
  requires_advance_booking: boolean;
  booking_window_rule?: string;
  booking_url?: string;
  estimated_deadline_iso?: string;
}

export interface SavedHotel {
  id: string;
  trip_id: string;
  name: string;
  name_ja?: string;
  city: string;
  price_jpy?: number; // price in THB (฿)
  booking_url?: string;
  notes?: string;
  assigned_day_numbers?: number[] | null; // e.g. [1, 2, 3, 4, 5, 6] or null
  created_at?: string;
}

export interface AiPlacementProposal {
  item_id: string;
  item_type: 'attraction' | 'hotel';
  recommended_day_number: number;
  recommended_time_slot?: string;
  reasoning: string;
}

export interface TripDay {
  id: string;
  trip_id: string;
  day_number: number;
  date: string; // YYYY-MM-DD
  city: string;
  city_ja?: string; // Thai name e.g. ภูเก็ต / เกาะสมุย / กรุงเทพฯ
  title: string;
  notes?: string;
  hotel_name?: string;
  hotel_name_ja?: string;
  hotel_address_en?: string;
  hotel_address_ja?: string;
  hotel_phone?: string;
  hotel_booking_ref?: string;
  hotel_maps_url?: string;
}

export interface WishlistItem {
  id: string;
  trip_id: string;
  title: string;
  store_name: string;
  price_jpy: number; // price in THB (฿)
  image_url?: string;
  is_purchased: boolean;
  notes?: string;
  created_at?: string;
}

export type DeviceUser =
  | 'user_1'
  | 'user_2'
  | 'user_3'
  | 'user_4'
  | 'user_5'
  | 'user_6'
  | 'user_a'
  | 'user_b';

export interface UserProfiles {
  members: string[]; // 6 family members
  userAName: string;
  userBName: string;
  currentDeviceUser: DeviceUser;
}

export interface MeetupPin {
  id: string;
  trip_id: string;
  spot_name: string;
  scheduled_time: string;
  google_maps_url?: string;
  note?: string;
  set_by: string; // 'user_1' .. 'user_6' or member name
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface EmergencyInfo {
  insurance_company: string;
  insurance_policy: string;
  insurance_phone: string;
  passports: string[]; // 6 family member passports
  passport_me?: string;
  passport_brother?: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  custom_allergies: string[];
}

export interface Trip {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  default_rate_jpy_ils: number; // THB to ILS rate (default 0.11)
  user_a_name?: string;
  user_b_name?: string;
  family_members?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface Expense {
  id: string;
  trip_id: string;
  day_id?: string;
  title: string;
  amount_jpy: number; // amount in THB (฿)
  amount_ils: number; // amount in ILS (₪)
  category: string;
  paid_by: string; // family member or 'family'
  split_method: 'equal' | 'custom';
  created_at?: string;
}

export interface BookingDeadline {
  id: string;
  trip_id: string;
  title: string;
  title_ja?: string;
  target_date: string; // ISO string
  description: string;
  booking_url?: string;
  category: ItemCategory | 'other';
  is_booked: boolean;
  booked_at?: string;
  created_at?: string;
}

export type ChecklistCategory = 'docs' | 'tech' | 'finance' | 'packing' | 'health' | 'general';

export interface ChecklistItem {
  id: string;
  trip_id: string;
  title: string;
  description?: string;
  category: ChecklistCategory;
  is_completed: boolean;
  order_index: number;
  created_at?: string;
}

export type ViewMode = 'dashboard' | 'planning' | 'map';

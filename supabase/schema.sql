-- ========================================================
-- ThaiTrip Family PWA - Supabase Schema (rueafcgkztptmueelnhy)
-- תכנון וניהול טיול משפחתי לתאילנד (6 נפשות) בזמן אמת (Realtime enabled)
-- ========================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Trips Table
CREATE TABLE IF NOT EXISTS trips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL DEFAULT 'טיול המשפחה לתאילנד 🇹🇭',
    start_date DATE NOT NULL DEFAULT '2026-11-06',
    end_date DATE NOT NULL DEFAULT '2026-11-21',
    default_rate_jpy_ils NUMERIC(8, 4) DEFAULT 0.1100,
    user_a_name TEXT DEFAULT 'משתתף 1',
    user_b_name TEXT DEFAULT 'משתתף 2',
    family_members JSONB DEFAULT '["משתתף 1", "משתתף 2", "משתתף 3", "משתתף 4", "משתתף 5", "משתתף 6"]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Trip Days Table (חלוקה לפי ימים וערים: פוקט, קוסמוי, בנגקוק)
CREATE TABLE IF NOT EXISTS trip_days (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
    day_number INTEGER NOT NULL,
    date DATE NOT NULL,
    city TEXT NOT NULL,
    city_ja TEXT,
    title TEXT NOT NULL,
    notes TEXT,
    hotel_name TEXT,
    hotel_name_ja TEXT,
    hotel_address_en TEXT,
    hotel_address_ja TEXT,
    hotel_phone TEXT,
    hotel_booking_ref TEXT,
    hotel_maps_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(trip_id, day_number)
);

-- 3. Itinerary Items Table (נקודות עניין, אטרקציות, מאגר לא משובץ ולו"ז יומי)
CREATE TABLE IF NOT EXISTS itinerary_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
    day_id UUID REFERENCES trip_days(id) ON DELETE SET NULL,
    city TEXT,
    title TEXT NOT NULL,
    title_ja TEXT,
    category TEXT NOT NULL DEFAULT 'attraction', -- 'attraction', 'food', 'transport', 'hotel', 'shopping', 'activity'
    time_slot TEXT, -- e.g. "09:00 - 11:30" or "גמיש"
    location_name TEXT,
    google_maps_url TEXT,
    notes TEXT,
    ticket_info TEXT,
    ticket_url TEXT,
    is_completed BOOLEAN DEFAULT FALSE,
    order_index INTEGER DEFAULT 0,
    cost_jpy INTEGER DEFAULT 0,
    duration_minutes INTEGER,
    nearest_station TEXT,
    pro_tips TEXT,
    best_time_of_day TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Saved Hotels Table (מאגר מלונות וריזורטים שמורים ושיבוץ לימים)
CREATE TABLE IF NOT EXISTS saved_hotels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    name_ja TEXT,
    city TEXT NOT NULL,
    area_or_station TEXT,
    price_per_night_jpy INTEGER DEFAULT 0,
    total_price_jpy INTEGER,
    rating NUMERIC(3, 1),
    booking_url TEXT,
    notes TEXT,
    pros TEXT,
    is_selected BOOLEAN DEFAULT FALSE,
    assigned_day_numbers INTEGER[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Expenses Table (מעקב הוצאות משפחתי מרוכז ללא התחשבנות)
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
    day_id UUID REFERENCES trip_days(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    amount_jpy INTEGER NOT NULL,
    amount_ils NUMERIC(10, 2),
    category TEXT DEFAULT 'general',
    paid_by TEXT NOT NULL DEFAULT 'user_1',
    split_method TEXT DEFAULT 'equal',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Booking Deadlines Table (מועדי פתיחת הזמנות וספירה לאחור)
CREATE TABLE IF NOT EXISTS booking_deadlines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    title_ja TEXT,
    target_date TIMESTAMPTZ NOT NULL,
    description TEXT,
    booking_url TEXT,
    category TEXT DEFAULT 'attraction',
    is_booked BOOLEAN DEFAULT FALSE,
    booked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Trip Checklist Table (צ'ק-ליסט הכנות לקראת הטיסה לתאילנד)
CREATE TABLE IF NOT EXISTS trip_checklist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'general',
    is_completed BOOLEAN DEFAULT FALSE,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Shopping Wishlist Table (רשימת קניות והחזר מע"מ בתאילנד)
CREATE TABLE IF NOT EXISTS wishlist_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT DEFAULT 'other',
    store_name TEXT,
    estimated_jpy INTEGER DEFAULT 0,
    owner TEXT DEFAULT 'shared',
    is_purchased BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Meetup Pins Table (נקודת מפגש חיה בשטח ל-6 בני משפחה)
CREATE TABLE IF NOT EXISTS meetup_pins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
    location_text TEXT NOT NULL,
    google_maps_url TEXT,
    updated_by TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE itinerary_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_deadlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_checklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetup_pins ENABLE ROW LEVEL SECURITY;

-- Anonymous public access policies (allows immediate shared use for the 6 family members)
CREATE POLICY "Public read/write access for trips" ON trips
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public read/write access for trip_days" ON trip_days
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public read/write access for itinerary_items" ON itinerary_items
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public read/write access for saved_hotels" ON saved_hotels
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public read/write access for expenses" ON expenses
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public read/write access for booking_deadlines" ON booking_deadlines
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public read/write access for trip_checklist" ON trip_checklist
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public read/write access for wishlist_items" ON wishlist_items
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public read/write access for meetup_pins" ON meetup_pins
    FOR ALL USING (true) WITH CHECK (true);

-- Enable Realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE trips;
ALTER PUBLICATION supabase_realtime ADD TABLE trip_days;
ALTER PUBLICATION supabase_realtime ADD TABLE itinerary_items;
ALTER PUBLICATION supabase_realtime ADD TABLE saved_hotels;
ALTER PUBLICATION supabase_realtime ADD TABLE expenses;
ALTER PUBLICATION supabase_realtime ADD TABLE booking_deadlines;
ALTER PUBLICATION supabase_realtime ADD TABLE trip_checklist;
ALTER PUBLICATION supabase_realtime ADD TABLE wishlist_items;
ALTER PUBLICATION supabase_realtime ADD TABLE meetup_pins;

-- Storage Setup (trip-documents bucket)
INSERT INTO storage.buckets (id, name, public)
VALUES ('trip-documents', 'trip-documents', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Access for trip-documents" ON storage.objects
    FOR ALL USING (bucket_id = 'trip-documents') WITH CHECK (bucket_id = 'trip-documents');

-- Indexes for lightning fast queries
CREATE INDEX IF NOT EXISTS idx_trip_days_trip ON trip_days(trip_id, day_number);
CREATE INDEX IF NOT EXISTS idx_itinerary_items_day ON itinerary_items(day_id, order_index);
CREATE INDEX IF NOT EXISTS idx_itinerary_items_trip ON itinerary_items(trip_id);
CREATE INDEX IF NOT EXISTS idx_saved_hotels_trip ON saved_hotels(trip_id);
CREATE INDEX IF NOT EXISTS idx_expenses_trip ON expenses(trip_id);
CREATE INDEX IF NOT EXISTS idx_booking_deadlines_trip ON booking_deadlines(trip_id, target_date);
CREATE INDEX IF NOT EXISTS idx_trip_checklist_trip ON trip_checklist(trip_id, order_index);
CREATE INDEX IF NOT EXISTS idx_wishlist_items_trip ON wishlist_items(trip_id);

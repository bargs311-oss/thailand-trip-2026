import { useState, useEffect, useCallback, useRef } from 'react';
import { Trip, TripDay, ItineraryItem, Expense, BookingDeadline, ChecklistItem, SavedHotel, WishlistItem, MeetupPin, UserProfiles, DeviceUser } from '../types';
import { INITIAL_TRIP, INITIAL_DAYS, INITIAL_ITEMS, INITIAL_EXPENSES, INITIAL_DEADLINES, INITIAL_CHECKLIST, INITIAL_SAVED_HOTELS, INITIAL_WISHLIST_ITEMS, INITIAL_MEETUP_PIN } from '../lib/mockData';
import { getSupabaseClient } from '../lib/supabase';
import { optimizeDayRouteOrder, DayRouteOptimizationResult } from '../lib/geoData';
import { inferCityFromItemText } from '../lib/japanLocationsData';
import type { RealtimeChannel } from '@supabase/supabase-js';

const STORAGE_KEY_TRIP = 'thaitrip_trip';
const STORAGE_KEY_DAYS = 'thaitrip_days';
const STORAGE_KEY_ITEMS = 'thaitrip_items';
const STORAGE_KEY_EXPENSES = 'thaitrip_expenses';
const STORAGE_KEY_DEADLINES = 'thaitrip_deadlines';
const STORAGE_KEY_CHECKLIST = 'thaitrip_checklist';
const STORAGE_KEY_SAVED_HOTELS = 'thaitrip_saved_hotels';
const STORAGE_KEY_WISHLIST = 'thaitrip_wishlist';
const STORAGE_KEY_MEETUP_PIN = 'thaitrip_meetup_pin';
const STORAGE_KEY_USER_PROFILES = 'thaitrip_user_profiles';
const STORAGE_KEY_DEVICE_USER = 'thaitrip_device_user';

export const DEFAULT_FAMILY_MEMBERS = [
  'בן משפחה 1',
  'בן משפחה 2',
  'בן משפחה 3',
  'בן משפחה 4',
  'בן משפחה 5',
  'בן משפחה 6',
];

function normalizeMembers(raw?: string[]): string[] {
  const result = [...DEFAULT_FAMILY_MEMBERS];
  if (Array.isArray(raw)) {
    for (let i = 0; i < 6; i++) {
      if (raw[i] && typeof raw[i] === 'string' && raw[i].trim()) {
        result[i] = raw[i].trim();
      }
    }
  }
  return result;
}

export function useItineraryRealtime() {
  const [userProfiles, setUserProfilesState] = useState<UserProfiles>(() => {
    let members = [...DEFAULT_FAMILY_MEMBERS];
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USER_PROFILES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.members)) {
          members = normalizeMembers(parsed.members);
        } else if (parsed.userAName || parsed.userBName) {
          members[0] = parsed.userAName || members[0];
          members[1] = parsed.userBName || members[1];
        }
      }
    } catch {}

    let deviceUser: DeviceUser = 'user_1';
    try {
      const savedDevice = localStorage.getItem(STORAGE_KEY_DEVICE_USER) as DeviceUser;
      if (savedDevice) {
        deviceUser = savedDevice;
      }
    } catch {}

    return {
      members,
      userAName: members[0],
      userBName: members[1],
      currentDeviceUser: deviceUser,
    };
  });

  const [trip, setTrip] = useState<Trip>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_TRIP);
    return saved ? JSON.parse(saved) : INITIAL_TRIP;
  });

  const [days, setDays] = useState<TripDay[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_DAYS);
    return saved ? JSON.parse(saved) : INITIAL_DAYS;
  });

  const [items, setItems] = useState<ItineraryItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_ITEMS);
    return saved ? JSON.parse(saved) : INITIAL_ITEMS;
  });

  const [savedHotels, setSavedHotels] = useState<SavedHotel[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_SAVED_HOTELS);
    return saved ? JSON.parse(saved) : INITIAL_SAVED_HOTELS;
  });

  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_WISHLIST);
    return saved ? JSON.parse(saved) : INITIAL_WISHLIST_ITEMS;
  });

  const [meetupPin, setMeetupPin] = useState<MeetupPin | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_MEETUP_PIN);
    return saved ? JSON.parse(saved) : INITIAL_MEETUP_PIN;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_EXPENSES);
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  const [deadlines, setDeadlines] = useState<BookingDeadline[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_DEADLINES);
    return saved ? JSON.parse(saved) : INITIAL_DEADLINES;
  });

  const [checklist, setChecklist] = useState<ChecklistItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_CHECKLIST);
    return saved ? JSON.parse(saved) : INITIAL_CHECKLIST;
  });

  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean>(false);
  const [realtimeStatus, setRealtimeStatus] = useState<string>('local');
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

  const channelRef = useRef<RealtimeChannel | null>(null);

  // Save to LocalStorage whenever state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TRIP, JSON.stringify(trip));
  }, [trip]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_DAYS, JSON.stringify(days));
  }, [days]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_EXPENSES, JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_DEADLINES, JSON.stringify(deadlines));
  }, [deadlines]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CHECKLIST, JSON.stringify(checklist));
  }, [checklist]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SAVED_HOTELS, JSON.stringify(savedHotels));
  }, [savedHotels]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_WISHLIST, JSON.stringify(wishlistItems));
  }, [wishlistItems]);

  useEffect(() => {
    if (meetupPin) {
      localStorage.setItem(STORAGE_KEY_MEETUP_PIN, JSON.stringify(meetupPin));
    } else {
      localStorage.removeItem(STORAGE_KEY_MEETUP_PIN);
    }
  }, [meetupPin]);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY_USER_PROFILES,
      JSON.stringify({
        members: userProfiles.members,
        userAName: userProfiles.members[0],
        userBName: userProfiles.members[1],
      })
    );
  }, [userProfiles.members]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_DEVICE_USER, userProfiles.currentDeviceUser);
  }, [userProfiles.currentDeviceUser]);

  // Synchronize across browser tabs/windows locally
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY_USER_PROFILES && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          const nextMembers = normalizeMembers(parsed.members);
          setUserProfilesState((prev) => ({
            ...prev,
            members: nextMembers,
            userAName: nextMembers[0],
            userBName: nextMembers[1],
          }));
        } catch {}
      }
      if (e.key === STORAGE_KEY_DEVICE_USER && e.newValue) {
        setUserProfilesState((prev) => ({
          ...prev,
          currentDeviceUser: e.newValue as DeviceUser,
        }));
      }
      if (e.key === STORAGE_KEY_ITEMS && e.newValue) {
        try { setItems(JSON.parse(e.newValue)); } catch {}
      }
      if (e.key === STORAGE_KEY_SAVED_HOTELS && e.newValue) {
        try { setSavedHotels(JSON.parse(e.newValue)); } catch {}
      }
      if (e.key === STORAGE_KEY_WISHLIST && e.newValue) {
        try { setWishlistItems(JSON.parse(e.newValue)); } catch {}
      }
      if (e.key === STORAGE_KEY_MEETUP_PIN && e.newValue) {
        try { setMeetupPin(JSON.parse(e.newValue)); } catch {}
      }
      if (e.key === STORAGE_KEY_DAYS && e.newValue) {
        try { setDays(JSON.parse(e.newValue)); } catch {}
      }
      if (e.key === STORAGE_KEY_TRIP && e.newValue) {
        try { setTrip(JSON.parse(e.newValue)); } catch {}
      }
      if (e.key === STORAGE_KEY_EXPENSES && e.newValue) {
        try { setExpenses(JSON.parse(e.newValue)); } catch {}
      }
      if (e.key === STORAGE_KEY_DEADLINES && e.newValue) {
        try { setDeadlines(JSON.parse(e.newValue)); } catch {}
      }
      if (e.key === STORAGE_KEY_CHECKLIST && e.newValue) {
        try { setChecklist(JSON.parse(e.newValue)); } catch {}
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Fetch from Supabase and listen to Realtime changes
  const connectSupabase = useCallback(async () => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      setIsSupabaseConnected(false);
      setRealtimeStatus('local');
      return;
    }

    try {
      setRealtimeStatus('connecting');

      // 0. Fetch trip metadata & shared family member names
      let hasRemoteTripRow = false;
      try {
        const { data: remoteTrip } = await supabase
          .from('trips')
          .select('*')
          .limit(1)
          .maybeSingle();

        if (remoteTrip) {
          hasRemoteTripRow = true;
          setTrip((prev) => ({ ...prev, ...remoteTrip }));
          if (Array.isArray(remoteTrip.family_members) && remoteTrip.family_members.length > 0) {
            const nextMembers = normalizeMembers(remoteTrip.family_members);
            setUserProfilesState((prev) => ({
              ...prev,
              members: nextMembers,
              userAName: nextMembers[0],
              userBName: nextMembers[1],
            }));
          }
        } else {
          await supabase.from('trips').upsert([INITIAL_TRIP]);
        }
      } catch (err) {
        console.warn('Supabase trips query:', err);
      }

      // 1. Fetch days
      const { data: remoteDays, error: daysError } = await supabase
        .from('trip_days')
        .select('*')
        .order('day_number', { ascending: true });

      if (daysError) {
        console.warn('Supabase query error (will use local fallback):', daysError.message);
        setIsSupabaseConnected(false);
        setRealtimeStatus('fallback');
        return;
      }

      const hasRemoteTrip = Boolean(remoteDays && remoteDays.length > 0);

      if (hasRemoteTrip && remoteDays) {
        setDays(remoteDays as TripDay[]);
      } else if (!hasRemoteTrip) {
        await supabase.from('trip_days').upsert(INITIAL_DAYS);
      }

      // 2. Fetch items
      const { data: remoteItems } = await supabase
        .from('itinerary_items')
        .select('*')
        .order('order_index', { ascending: true });

      if (remoteItems && (remoteItems.length > 0 || hasRemoteTrip)) {
        setItems(remoteItems as ItineraryItem[]);
      } else if (!hasRemoteTrip) {
        await supabase.from('itinerary_items').upsert(INITIAL_ITEMS);
      }

      // 3. Fetch expenses
      const { data: remoteExpenses } = await supabase
        .from('expenses')
        .select('*')
        .order('created_at', { ascending: false });

      if (remoteExpenses && (remoteExpenses.length > 0 || hasRemoteTrip)) {
        setExpenses(remoteExpenses as Expense[]);
      } else if (!hasRemoteTrip) {
        await supabase.from('expenses').upsert(INITIAL_EXPENSES);
      }

      // 4. Fetch deadlines
      const { data: remoteDeadlines } = await supabase
        .from('booking_deadlines')
        .select('*')
        .order('target_date', { ascending: true });

      if (remoteDeadlines && (remoteDeadlines.length > 0 || hasRemoteTrip)) {
        setDeadlines(remoteDeadlines as BookingDeadline[]);
      } else if (!hasRemoteTrip) {
        await supabase.from('booking_deadlines').upsert(INITIAL_DEADLINES);
      }

      // 5. Fetch checklist
      const { data: remoteChecklist } = await supabase
        .from('trip_checklist')
        .select('*')
        .order('order_index', { ascending: true });

      if (remoteChecklist && (remoteChecklist.length > 0 || hasRemoteTrip)) {
        setChecklist(remoteChecklist as ChecklistItem[]);
      } else if (!hasRemoteTrip) {
        await supabase.from('trip_checklist').upsert(INITIAL_CHECKLIST);
      }

      // 6. Fetch saved hotels
      try {
        const { data: remoteHotels } = await supabase
          .from('saved_hotels')
          .select('*');

        if (remoteHotels && (remoteHotels.length > 0 || hasRemoteTrip)) {
          setSavedHotels(remoteHotels as SavedHotel[]);
        } else if (!hasRemoteTrip) {
          await supabase.from('saved_hotels').upsert(INITIAL_SAVED_HOTELS);
        }
      } catch (err) {
        console.warn('Supabase saved_hotels table:', err);
      }

      // 7. Fetch wishlist items
      try {
        const { data: remoteWishlist } = await supabase
          .from('wishlist_items')
          .select('*')
          .order('created_at', { ascending: false });

        if (remoteWishlist && (remoteWishlist.length > 0 || hasRemoteTrip)) {
          setWishlistItems(remoteWishlist as WishlistItem[]);
        } else if (!hasRemoteTrip) {
          await supabase.from('wishlist_items').upsert(INITIAL_WISHLIST_ITEMS);
        }
      } catch (err) {
        console.warn('Supabase wishlist_items table:', err);
      }

      // 8. Fetch meetup pins
      try {
        const { data: remotePins } = await supabase
          .from('meetup_pins')
          .select('*')
          .order('updated_at', { ascending: false })
          .limit(1);

        if (remotePins && remotePins.length > 0) {
          setMeetupPin(remotePins[0] as MeetupPin);
        }
      } catch (err) {
        console.warn('Supabase meetup_pins table:', err);
      }

      void hasRemoteTripRow;
      setIsSupabaseConnected(true);
      setRealtimeStatus('connected');
      setLastSyncedAt(new Date());

      // Setup Realtime Channel to sync across all 6 family members' phones
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }

      const channel = supabase
        .channel('thaitrip-family-sync-room')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'trips' },
          (payload) => {
            setLastSyncedAt(new Date());
            if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
              const updatedTrip = payload.new as Trip;
              setTrip((prev) => ({ ...prev, ...updatedTrip }));
              if (Array.isArray(updatedTrip.family_members)) {
                const nextMembers = normalizeMembers(updatedTrip.family_members);
                setUserProfilesState((prev) => ({
                  ...prev,
                  members: nextMembers,
                  userAName: nextMembers[0],
                  userBName: nextMembers[1],
                }));
              }
            }
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'itinerary_items' },
          (payload) => {
            setLastSyncedAt(new Date());
            if (payload.eventType === 'INSERT') {
              const newItem = payload.new as ItineraryItem;
              setItems((prev) => {
                if (prev.some((it) => it.id === newItem.id)) return prev;
                return [...prev, newItem];
              });
            } else if (payload.eventType === 'UPDATE') {
              const updatedItem = payload.new as ItineraryItem;
              setItems((prev) =>
                prev.map((it) => (it.id === updatedItem.id ? { ...it, ...updatedItem } : it))
              );
            } else if (payload.eventType === 'DELETE') {
              const deletedId = (payload.old as { id: string }).id;
              setItems((prev) => prev.filter((it) => it.id !== deletedId));
            }
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'trip_days' },
          (payload) => {
            setLastSyncedAt(new Date());
            if (payload.eventType === 'UPDATE') {
              const updatedDay = payload.new as TripDay;
              setDays((prev) =>
                prev.map((d) => (d.id === updatedDay.id ? { ...d, ...updatedDay } : d))
              );
            } else if (payload.eventType === 'INSERT') {
              const newDay = payload.new as TripDay;
              setDays((prev) => [...prev.filter((d) => d.id !== newDay.id), newDay].sort((a, b) => a.day_number - b.day_number));
            } else if (payload.eventType === 'DELETE') {
              const deletedId = (payload.old as { id: string }).id;
              setDays((prev) => prev.filter((d) => d.id !== deletedId));
            }
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'expenses' },
          (payload) => {
            setLastSyncedAt(new Date());
            if (payload.eventType === 'INSERT') {
              const newExp = payload.new as Expense;
              setExpenses((prev) => [newExp, ...prev.filter((e) => e.id !== newExp.id)]);
            } else if (payload.eventType === 'DELETE') {
              const deletedId = (payload.old as { id: string }).id;
              setExpenses((prev) => prev.filter((e) => e.id !== deletedId));
            } else if (payload.eventType === 'UPDATE') {
              const updatedExp = payload.new as Expense;
              setExpenses((prev) => prev.map((e) => (e.id === updatedExp.id ? updatedExp : e)));
            }
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'booking_deadlines' },
          (payload) => {
            setLastSyncedAt(new Date());
            if (payload.eventType === 'INSERT') {
              const newDl = payload.new as BookingDeadline;
              setDeadlines((prev) => [...prev.filter((d) => d.id !== newDl.id), newDl].sort((a, b) => new Date(a.target_date).getTime() - new Date(b.target_date).getTime()));
            } else if (payload.eventType === 'UPDATE') {
              const updatedDl = payload.new as BookingDeadline;
              setDeadlines((prev) =>
                prev.map((d) => (d.id === updatedDl.id ? { ...d, ...updatedDl } : d))
              );
            } else if (payload.eventType === 'DELETE') {
              const deletedId = (payload.old as { id: string }).id;
              setDeadlines((prev) => prev.filter((d) => d.id !== deletedId));
            }
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'trip_checklist' },
          (payload) => {
            setLastSyncedAt(new Date());
            if (payload.eventType === 'INSERT') {
              const newCl = payload.new as ChecklistItem;
              setChecklist((prev) => [...prev.filter((c) => c.id !== newCl.id), newCl]);
            } else if (payload.eventType === 'UPDATE') {
              const updatedCl = payload.new as ChecklistItem;
              setChecklist((prev) =>
                prev.map((c) => (c.id === updatedCl.id ? { ...c, ...updatedCl } : c))
              );
            } else if (payload.eventType === 'DELETE') {
              const deletedId = (payload.old as { id: string }).id;
              setChecklist((prev) => prev.filter((c) => c.id !== deletedId));
            }
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'saved_hotels' },
          (payload) => {
            setLastSyncedAt(new Date());
            if (payload.eventType === 'INSERT') {
              const newHotel = payload.new as SavedHotel;
              setSavedHotels((prev) => [...prev.filter((h) => h.id !== newHotel.id), newHotel]);
            } else if (payload.eventType === 'UPDATE') {
              const updatedHotel = payload.new as SavedHotel;
              setSavedHotels((prev) =>
                prev.map((h) => (h.id === updatedHotel.id ? { ...h, ...updatedHotel } : h))
              );
            } else if (payload.eventType === 'DELETE') {
              const deletedId = (payload.old as { id: string }).id;
              setSavedHotels((prev) => prev.filter((h) => h.id !== deletedId));
            }
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'wishlist_items' },
          (payload) => {
            setLastSyncedAt(new Date());
            if (payload.eventType === 'INSERT') {
              const newItem = payload.new as WishlistItem;
              setWishlistItems((prev) => [newItem, ...prev.filter((w) => w.id !== newItem.id)]);
            } else if (payload.eventType === 'UPDATE') {
              const updated = payload.new as WishlistItem;
              setWishlistItems((prev) => prev.map((w) => (w.id === updated.id ? { ...w, ...updated } : w)));
            } else if (payload.eventType === 'DELETE') {
              const deletedId = (payload.old as { id: string }).id;
              setWishlistItems((prev) => prev.filter((w) => w.id !== deletedId));
            }
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'meetup_pins' },
          (payload) => {
            setLastSyncedAt(new Date());
            if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
              setMeetupPin(payload.new as MeetupPin);
            } else if (payload.eventType === 'DELETE') {
              setMeetupPin(null);
            }
          }
        )
        .on('broadcast', { event: 'user_profiles_update' }, ({ payload }) => {
          const data = payload as { members?: string[]; userAName?: string; userBName?: string };
          if (Array.isArray(data.members)) {
            const nextMembers = normalizeMembers(data.members);
            setUserProfilesState((prev) => ({
              ...prev,
              members: nextMembers,
              userAName: nextMembers[0],
              userBName: nextMembers[1],
            }));
          }
        })
        .on('broadcast', { event: 'item_completed_toggle' }, ({ payload }) => {
          const { id, is_completed } = payload as { id: string; is_completed: boolean };
          setItems((prev) =>
            prev.map((it) => (it.id === id ? { ...it, is_completed } : it))
          );
        })
        .on('broadcast', { event: 'wishlist_add' }, ({ payload }) => {
          const newItem = payload as WishlistItem;
          setWishlistItems((prev) => {
            if (prev.some((it) => it.id === newItem.id)) return prev;
            return [newItem, ...prev];
          });
        })
        .on('broadcast', { event: 'wishlist_toggle' }, ({ payload }) => {
          const { id, is_purchased } = payload as { id: string; is_purchased: boolean };
          setWishlistItems((prev) =>
            prev.map((it) => (it.id === id ? { ...it, is_purchased } : it))
          );
        })
        .on('broadcast', { event: 'wishlist_delete' }, ({ payload }) => {
          const { id } = payload as { id: string };
          setWishlistItems((prev) => prev.filter((it) => it.id !== id));
        })
        .on('broadcast', { event: 'meetup_pin_update' }, ({ payload }) => {
          setMeetupPin(payload as MeetupPin | null);
        })
        .on('broadcast', { event: 'schedule_cleared' }, () => {
          setItems((prev) =>
            prev.map((it) => ({
              ...it,
              day_id: null,
              time_slot: 'גמיש',
              is_completed: false,
            }))
          );
          setSavedHotels((prev) =>
            prev.map((h) => ({
              ...h,
              assigned_day_numbers: null,
            }))
          );
          setDays((prev) =>
            prev.map((d) => ({
              ...d,
              hotel_name: undefined,
              hotel_name_ja: undefined,
              hotel_address_en: undefined,
              hotel_address_ja: undefined,
              hotel_phone: undefined,
              hotel_booking_ref: undefined,
              hotel_maps_url: undefined,
              notes: '',
            }))
          );
          setLastSyncedAt(new Date());
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            setRealtimeStatus('synced');
          } else if (status === 'CHANNEL_ERROR') {
            setRealtimeStatus('error');
          }
        });

      channelRef.current = channel;
    } catch (err) {
      console.error('Failed to setup Supabase realtime:', err);
      setIsSupabaseConnected(false);
      setRealtimeStatus('error');
    }
  }, []);

  useEffect(() => {
    connectSupabase();

    const handleVisibilityOrOnline = () => {
      if (document.visibilityState === 'visible' || navigator.onLine) {
        connectSupabase();
      }
    };

    window.addEventListener('online', handleVisibilityOrOnline);
    document.addEventListener('visibilitychange', handleVisibilityOrOnline);

    return () => {
      window.removeEventListener('online', handleVisibilityOrOnline);
      document.removeEventListener('visibilitychange', handleVisibilityOrOnline);
      const supabase = getSupabaseClient();
      if (supabase && channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [connectSupabase]);

  // Mutations
  const toggleItemCompleted = useCallback(
    async (itemId: string, currentStatus: boolean) => {
      const nextStatus = !currentStatus;
      setItems((prev) =>
        prev.map((it) => (it.id === itemId ? { ...it, is_completed: nextStatus } : it))
      );

      if (channelRef.current) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'item_completed_toggle',
          payload: { id: itemId, is_completed: nextStatus },
        });
      }

      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          await supabase
            .from('itinerary_items')
            .update({ is_completed: nextStatus, updated_at: new Date().toISOString() })
            .eq('id', itemId);
          setLastSyncedAt(new Date());
        } catch (err) {
          console.error('Failed to update item on Supabase:', err);
        }
      }
    },
    []
  );

  const addItem = useCallback(
    async (newItem: Omit<ItineraryItem, 'id'> & { id?: string }) => {
      const itemWithId: ItineraryItem = {
        ...newItem,
        id: newItem.id || crypto.randomUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setItems((prev) => [...prev, itemWithId]);

      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          await supabase.from('itinerary_items').insert([itemWithId]);
          setLastSyncedAt(new Date());
        } catch (err) {
          console.error('Failed to add item to Supabase:', err);
        }
      }
      return itemWithId;
    },
    []
  );

  const updateItem = useCallback(
    async (item: ItineraryItem) => {
      setItems((prev) => prev.map((it) => (it.id === item.id ? item : it)));

      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          await supabase
            .from('itinerary_items')
            .update({ ...item, updated_at: new Date().toISOString() })
            .eq('id', item.id);
          setLastSyncedAt(new Date());
        } catch (err) {
          console.error('Failed to update item in Supabase:', err);
        }
      }
    },
    []
  );

  const deleteItem = useCallback(
    async (itemId: string) => {
      setItems((prev) => prev.filter((it) => it.id !== itemId));

      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          await supabase.from('itinerary_items').delete().eq('id', itemId);
          setLastSyncedAt(new Date());
        } catch (err) {
          console.error('Failed to delete item from Supabase:', err);
        }
      }
    },
    []
  );

  const updateDay = useCallback(
    async (updatedDay: TripDay) => {
      setDays((prev) => prev.map((d) => (d.id === updatedDay.id ? updatedDay : d)));

      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          await supabase
            .from('trip_days')
            .update(updatedDay)
            .eq('id', updatedDay.id);
          setLastSyncedAt(new Date());
        } catch (err) {
          console.error('Failed to update day in Supabase:', err);
        }
      }
    },
    []
  );

  const addDay = useCallback(
    async (customDay?: Partial<TripDay>) => {
      const lastDay = days[days.length - 1];
      const baseDate = lastDay ? new Date(lastDay.date) : new Date(trip.start_date || '2026-11-06');
      if (lastDay) {
        baseDate.setDate(baseDate.getDate() + 1);
      }
      const nextDateStr = baseDate.toISOString().split('T')[0];
      const nextDayNumber = days.length + 1;

      const newDay: TripDay = {
        id: crypto.randomUUID(),
        trip_id: trip.id,
        day_number: nextDayNumber,
        date: nextDateStr,
        city: customDay?.city || lastDay?.city || 'בנגקוק',
        city_ja: customDay?.city_ja || lastDay?.city_ja || 'กรุงเทพฯ',
        title: customDay?.title || `יום ${nextDayNumber} ב${customDay?.city || lastDay?.city || 'בנגקוק'}`,
        notes: customDay?.notes || '',
        hotel_name: customDay?.hotel_name || lastDay?.hotel_name || '',
        hotel_name_ja: customDay?.hotel_name_ja || lastDay?.hotel_name_ja || '',
        hotel_address_en: customDay?.hotel_address_en || lastDay?.hotel_address_en || '',
        hotel_address_ja: customDay?.hotel_address_ja || lastDay?.hotel_address_ja || '',
        hotel_phone: customDay?.hotel_phone || lastDay?.hotel_phone || '',
        hotel_booking_ref: customDay?.hotel_booking_ref || '',
        hotel_maps_url: customDay?.hotel_maps_url || lastDay?.hotel_maps_url || '',
      };

      setDays((prev) => [...prev, newDay]);
      setTrip((prev) => ({ ...prev, end_date: nextDateStr }));

      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          await supabase.from('trip_days').insert([newDay]);
          await supabase.from('trips').update({ end_date: nextDateStr }).eq('id', trip.id);
          setLastSyncedAt(new Date());
        } catch (err) {
          console.error('Failed to insert day into Supabase:', err);
        }
      }

      return newDay;
    },
    [days, trip]
  );

  const deleteDay = useCallback(
    async (dayId: string) => {
      if (days.length <= 1) {
        alert('לא ניתן למחוק את היום האחרון שנותר בטיול');
        return;
      }

      const remainingDaysRaw = days.filter((d) => d.id !== dayId);
      const updatedItems = items.map((it) =>
        it.day_id === dayId ? { ...it, day_id: null, time_slot: 'גמיש' } : it
      );

      const startDate = new Date(trip.start_date || '2026-11-06');
      const reindexedDays: TripDay[] = remainingDaysRaw.map((day, index) => {
        const curDate = new Date(startDate);
        curDate.setDate(curDate.getDate() + index);
        return {
          ...day,
          day_number: index + 1,
          date: curDate.toISOString().split('T')[0],
        };
      });

      const lastDate = reindexedDays[reindexedDays.length - 1].date;

      setDays(reindexedDays);
      setItems(updatedItems);
      setTrip((prev) => ({ ...prev, end_date: lastDate }));

      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          await supabase
            .from('itinerary_items')
            .update({ day_id: null, time_slot: 'גמיש' })
            .eq('day_id', dayId);
          await supabase.from('trip_days').delete().eq('id', dayId);
          await Promise.all(
            reindexedDays.map((d) =>
              supabase.from('trip_days').update({ day_number: d.day_number + 1000 }).eq('id', d.id)
            )
          );
          await Promise.all(
            reindexedDays.map((d) =>
              supabase
                .from('trip_days')
                .update({
                  day_number: d.day_number,
                  date: d.date,
                })
                .eq('id', d.id)
            )
          );
          await supabase.from('trips').update({ end_date: lastDate }).eq('id', trip.id);
          setLastSyncedAt(new Date());
        } catch (err) {
          console.error('Failed to delete and reindex days in Supabase:', err);
        }
      }
    },
    [days, items, trip]
  );

  const reorderDays = useCallback(
    async (fromIndex: number, toIndex: number) => {
      if (
        fromIndex < 0 ||
        fromIndex >= days.length ||
        toIndex < 0 ||
        toIndex >= days.length ||
        fromIndex === toIndex
      ) {
        return;
      }

      const newOrder = [...days];
      const [movedDay] = newOrder.splice(fromIndex, 1);
      newOrder.splice(toIndex, 0, movedDay);

      const startDate = new Date(trip.start_date || '2026-11-06');
      const reindexedDays: TripDay[] = newOrder.map((day, index) => {
        const curDate = new Date(startDate);
        curDate.setDate(curDate.getDate() + index);
        return {
          ...day,
          day_number: index + 1,
          date: curDate.toISOString().split('T')[0],
        };
      });

      setDays(reindexedDays);

      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          await Promise.all(
            reindexedDays.map((d) =>
              supabase.from('trip_days').update({ day_number: d.day_number + 1000 }).eq('id', d.id)
            )
          );
          await Promise.all(
            reindexedDays.map((d) =>
              supabase
                .from('trip_days')
                .update({
                  day_number: d.day_number,
                  date: d.date,
                })
                .eq('id', d.id)
            )
          );
          setLastSyncedAt(new Date());
        } catch (err) {
          console.error('Failed to update reordered days in Supabase:', err);
        }
      }
    },
    [days, trip]
  );

  const reorderItems = useCallback(
    async (dayId: string, fromIndex: number, toIndex: number) => {
      const dayItems = items
        .filter((it) => it.day_id === dayId)
        .sort((a, b) => a.order_index - b.order_index);

      if (
        fromIndex < 0 ||
        fromIndex >= dayItems.length ||
        toIndex < 0 ||
        toIndex >= dayItems.length ||
        fromIndex === toIndex
      ) {
        return;
      }

      const reorderedList = [...dayItems];
      const [movedItem] = reorderedList.splice(fromIndex, 1);
      reorderedList.splice(toIndex, 0, movedItem);

      const updatedDayItems = reorderedList.map((item, idx) => ({
        ...item,
        order_index: (idx + 1) * 10,
        updated_at: new Date().toISOString(),
      }));

      const otherItems = items.filter((it) => it.day_id !== dayId);
      const newItems = [...otherItems, ...updatedDayItems];
      setItems(newItems);

      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          await Promise.all(
            updatedDayItems.map((item) =>
              supabase
                .from('itinerary_items')
                .update({ order_index: item.order_index, updated_at: item.updated_at })
                .eq('id', item.id)
            )
          );
          setLastSyncedAt(new Date());
        } catch (err) {
          console.error('Failed to update reordered items in Supabase:', err);
        }
      }
    },
    [items]
  );

  const optimizeDayItems = useCallback(
    async (dayId: string): Promise<DayRouteOptimizationResult | null> => {
      const targetDay = days.find((d) => d.id === dayId);
      if (!targetDay) return null;

      const dayItems = items
        .filter((it) => it.day_id === dayId)
        .sort((a, b) => a.order_index - b.order_index);

      if (dayItems.length <= 1) return null;

      const assignedHotel = savedHotels.find((h) =>
        h.assigned_day_numbers?.includes(targetDay.day_number)
      );
      const hotelName = targetDay.hotel_name || assignedHotel?.name;

      const result = optimizeDayRouteOrder(dayItems, hotelName, targetDay.city);

      const otherItems = items.filter((it) => it.day_id !== dayId);
      setItems([...otherItems, ...result.optimizedItems]);

      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          await Promise.all(
            result.optimizedItems.map((item) =>
              supabase
                .from('itinerary_items')
                .update({
                  order_index: item.order_index,
                  time_slot: item.time_slot,
                  updated_at: item.updated_at,
                })
                .eq('id', item.id)
            )
          );
          setLastSyncedAt(new Date());
        } catch (err) {
          console.error('Failed to update optimized items in Supabase:', err);
        }
      }

      return result;
    },
    [days, items, savedHotels]
  );

  const addExpense = useCallback(
    async (expense: Omit<Expense, 'id'>) => {
      const newExp: Expense = {
        ...expense,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
      };
      setExpenses((prev) => [newExp, ...prev]);

      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          await supabase.from('expenses').insert([newExp]);
          setLastSyncedAt(new Date());
        } catch (err) {
          console.error('Failed to insert expense into Supabase:', err);
        }
      }
    },
    []
  );

  const deleteExpense = useCallback(
    async (expenseId: string) => {
      setExpenses((prev) => prev.filter((e) => e.id !== expenseId));

      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          await supabase.from('expenses').delete().eq('id', expenseId);
          setLastSyncedAt(new Date());
        } catch (err) {
          console.error('Failed to delete expense from Supabase:', err);
        }
      }
    },
    []
  );

  const addDeadline = useCallback(
    async (deadline: Omit<BookingDeadline, 'id'> & { id?: string }) => {
      const newDl: BookingDeadline = {
        ...deadline,
        id: deadline.id || crypto.randomUUID(),
        created_at: new Date().toISOString(),
      };
      setDeadlines((prev) =>
        [...prev, newDl].sort(
          (a, b) => new Date(a.target_date).getTime() - new Date(b.target_date).getTime()
        )
      );

      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          await supabase.from('booking_deadlines').insert([newDl]);
          setLastSyncedAt(new Date());
        } catch (err) {
          console.error('Failed to insert deadline into Supabase:', err);
        }
      }
      return newDl;
    },
    []
  );

  const toggleDeadlineBooked = useCallback(
    async (deadlineId: string, currentBookedStatus: boolean) => {
      const nextStatus = !currentBookedStatus;
      const bookedAt = nextStatus ? new Date().toISOString() : undefined;

      setDeadlines((prev) =>
        prev.map((d) =>
          d.id === deadlineId ? { ...d, is_booked: nextStatus, booked_at: bookedAt } : d
        )
      );

      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          await supabase
            .from('booking_deadlines')
            .update({ is_booked: nextStatus, booked_at: bookedAt })
            .eq('id', deadlineId);
          setLastSyncedAt(new Date());
        } catch (err) {
          console.error('Failed to update deadline in Supabase:', err);
        }
      }
    },
    []
  );

  const deleteDeadline = useCallback(
    async (deadlineId: string) => {
      setDeadlines((prev) => prev.filter((d) => d.id !== deadlineId));

      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          await supabase.from('booking_deadlines').delete().eq('id', deadlineId);
          setLastSyncedAt(new Date());
        } catch (err) {
          console.error('Failed to delete deadline from Supabase:', err);
        }
      }
    },
    []
  );

  const addChecklistItem = useCallback(
    async (item: Omit<ChecklistItem, 'id'> & { id?: string }) => {
      const newCl: ChecklistItem = {
        ...item,
        id: item.id || crypto.randomUUID(),
        created_at: new Date().toISOString(),
      };
      setChecklist((prev) => [...prev, newCl]);

      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          await supabase.from('trip_checklist').insert([newCl]);
          setLastSyncedAt(new Date());
        } catch (err) {
          console.error('Failed to insert checklist item into Supabase:', err);
        }
      }
      return newCl;
    },
    []
  );

  const toggleChecklistCompleted = useCallback(
    async (itemId: string, currentStatus: boolean) => {
      const nextStatus = !currentStatus;

      setChecklist((prev) =>
        prev.map((c) => (c.id === itemId ? { ...c, is_completed: nextStatus } : c))
      );

      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          await supabase
            .from('trip_checklist')
            .update({ is_completed: nextStatus })
            .eq('id', itemId);
          setLastSyncedAt(new Date());
        } catch (err) {
          console.error('Failed to update checklist item in Supabase:', err);
        }
      }
    },
    []
  );

  const deleteChecklistItem = useCallback(
    async (itemId: string) => {
      setChecklist((prev) => prev.filter((c) => c.id !== itemId));

      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          await supabase.from('trip_checklist').delete().eq('id', itemId);
          setLastSyncedAt(new Date());
        } catch (err) {
          console.error('Failed to delete checklist item from Supabase:', err);
        }
      }
    },
    []
  );

  const addSavedHotel = useCallback(
    async (hotel: Omit<SavedHotel, 'id'> & { id?: string }) => {
      const newHotel: SavedHotel = {
        ...hotel,
        id: hotel.id || crypto.randomUUID(),
        created_at: new Date().toISOString(),
      };
      setSavedHotels((prev) => [...prev, newHotel]);

      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          await supabase.from('saved_hotels').insert([newHotel]);
          setLastSyncedAt(new Date());
        } catch (err) {
          console.warn('Supabase insert saved_hotels:', err);
        }
      }
      return newHotel;
    },
    []
  );

  const updateSavedHotel = useCallback(
    async (hotel: SavedHotel) => {
      setSavedHotels((prev) => prev.map((h) => (h.id === hotel.id ? hotel : h)));

      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          await supabase.from('saved_hotels').update(hotel).eq('id', hotel.id);
          setLastSyncedAt(new Date());
        } catch (err) {
          console.warn('Supabase update saved_hotels:', err);
        }
      }
    },
    []
  );

  const deleteSavedHotel = useCallback(
    async (hotelId: string) => {
      setSavedHotels((prev) => prev.filter((h) => h.id !== hotelId));

      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          await supabase.from('saved_hotels').delete().eq('id', hotelId);
          setLastSyncedAt(new Date());
        } catch (err) {
          console.warn('Supabase delete saved_hotels:', err);
        }
      }
    },
    []
  );

  const assignHotelToDays = useCallback(
    async (hotelId: string, dayNumbers: number[]) => {
      const hotel = savedHotels.find((h) => h.id === hotelId);
      if (!hotel) return;

      const prevAssigned = hotel.assigned_day_numbers || [];
      const removedDayNumbers = prevAssigned.filter((num) => !dayNumbers.includes(num));

      const updatedHotel: SavedHotel = {
        ...hotel,
        assigned_day_numbers: dayNumbers.length > 0 ? dayNumbers : null,
      };

      await updateSavedHotel(updatedHotel);

      const affectedDays: TripDay[] = [];
      const nextDays = days.map((d) => {
        if (dayNumbers.includes(d.day_number)) {
          const updatedDay: TripDay = {
            ...d,
            hotel_name: hotel.name,
            hotel_name_ja: hotel.name_ja || d.hotel_name_ja,
            hotel_maps_url: hotel.booking_url || d.hotel_maps_url,
          };
          affectedDays.push(updatedDay);
          return updatedDay;
        }
        if (removedDayNumbers.includes(d.day_number) && d.hotel_name === hotel.name) {
          const clearedDay: TripDay = {
            ...d,
            hotel_name: undefined,
            hotel_name_ja: undefined,
            hotel_maps_url: undefined,
          };
          affectedDays.push(clearedDay);
          return clearedDay;
        }
        return d;
      });

      if (affectedDays.length > 0) {
        setDays(nextDays);

        const supabase = getSupabaseClient();
        if (supabase) {
          try {
            await Promise.all(
              affectedDays.map((d) =>
                supabase
                  .from('trip_days')
                  .update({
                    hotel_name: d.hotel_name ?? null,
                    hotel_name_ja: d.hotel_name_ja ?? null,
                    hotel_maps_url: d.hotel_maps_url ?? null,
                  })
                  .eq('id', d.id)
              )
            );
            setLastSyncedAt(new Date());
          } catch (err) {
            console.warn('Supabase update trip_days hotel assignment:', err);
          }
        }
      }
    },
    [savedHotels, days, updateSavedHotel]
  );

  const assignItemToDay = useCallback(
    async (itemId: string, dayId: string, timeSlot?: string) => {
      let finalSlot = timeSlot;
      setItems((prev) =>
        prev.map((it) => {
          if (it.id === itemId) {
            const calculatedSlot =
              finalSlot && finalSlot !== 'גמיש'
                ? finalSlot
                : it.time_slot && it.time_slot !== 'גמיש'
                ? it.time_slot
                : '12:00 - 13:30';
            finalSlot = calculatedSlot;
            return {
              ...it,
              day_id: dayId,
              time_slot: calculatedSlot,
              updated_at: new Date().toISOString(),
            };
          }
          return it;
        })
      );

      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          await supabase
            .from('itinerary_items')
            .update({
              day_id: dayId,
              time_slot: finalSlot,
              updated_at: new Date().toISOString(),
            })
            .eq('id', itemId);
          setLastSyncedAt(new Date());
        } catch (err) {
          console.warn('Supabase assignItemToDay:', err);
        }
      }
    },
    []
  );

  const unassignItem = useCallback(
    async (itemId: string) => {
      setItems((prev) =>
        prev.map((it) => {
          if (it.id === itemId) {
            return {
              ...it,
              day_id: null,
              time_slot: 'גמיש',
              updated_at: new Date().toISOString(),
            };
          }
          return it;
        })
      );

      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          await supabase
            .from('itinerary_items')
            .update({
              day_id: null,
              time_slot: 'גמיש',
              updated_at: new Date().toISOString(),
            })
            .eq('id', itemId);
          setLastSyncedAt(new Date());
        } catch (err) {
          console.warn('Supabase unassignItem:', err);
        }
      }
    },
    []
  );

  const addWishlistItem = useCallback(
    async (item: Omit<WishlistItem, 'id'>) => {
      const newItem: WishlistItem = {
        ...item,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
      };
      setWishlistItems((prev) => [newItem, ...prev]);

      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          await supabase.from('wishlist_items').insert([{ ...newItem, trip_id: trip.id }]);
          setLastSyncedAt(new Date());
        } catch (err) {
          console.warn('Supabase insert wishlist_items:', err);
        }
      }

      if (channelRef.current) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'wishlist_add',
          payload: newItem,
        });
      }
    },
    [trip.id]
  );

  const toggleWishlistItemPurchased = useCallback(
    async (itemId: string, currentStatus: boolean) => {
      const nextStatus = !currentStatus;
      setWishlistItems((prev) =>
        prev.map((it) => (it.id === itemId ? { ...it, is_purchased: nextStatus } : it))
      );

      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          await supabase
            .from('wishlist_items')
            .update({ is_purchased: nextStatus })
            .eq('id', itemId);
          setLastSyncedAt(new Date());
        } catch (err) {
          console.warn('Supabase update wishlist_items:', err);
        }
      }

      if (channelRef.current) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'wishlist_toggle',
          payload: { id: itemId, is_purchased: nextStatus },
        });
      }
    },
    []
  );

  const deleteWishlistItem = useCallback(
    async (itemId: string) => {
      setWishlistItems((prev) => prev.filter((it) => it.id !== itemId));

      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          await supabase.from('wishlist_items').delete().eq('id', itemId);
          setLastSyncedAt(new Date());
        } catch (err) {
          console.warn('Supabase delete wishlist_items:', err);
        }
      }

      if (channelRef.current) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'wishlist_delete',
          payload: { id: itemId },
        });
      }
    },
    []
  );

  const updateMeetupPin = useCallback(
    async (pin: MeetupPin) => {
      setMeetupPin(pin);

      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          await supabase.from('meetup_pins').upsert({
            id: pin.id || '88888888-0001-4000-8000-000000002026',
            trip_id: trip.id,
            spot_name: pin.spot_name,
            scheduled_time: pin.scheduled_time,
            google_maps_url: pin.google_maps_url,
            note: pin.note,
            set_by: pin.set_by,
            is_active: pin.is_active,
            updated_at: new Date().toISOString(),
          });
          setLastSyncedAt(new Date());
        } catch (err) {
          console.warn('Supabase upsert meetup_pins:', err);
        }
      }

      if (channelRef.current) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'meetup_pin_update',
          payload: pin,
        });
      }
    },
    [trip.id]
  );

  // Supports updating all 6 family members
  const updateUserProfiles = useCallback(
    async (input: { members?: string[]; userAName?: string; userBName?: string }) => {
      const nextMembers = input.members
        ? normalizeMembers(input.members)
        : normalizeMembers([
            input.userAName || userProfiles.members[0],
            input.userBName || userProfiles.members[1],
            ...userProfiles.members.slice(2),
          ]);

      setUserProfilesState((prev) => ({
        ...prev,
        members: nextMembers,
        userAName: nextMembers[0],
        userBName: nextMembers[1],
      }));

      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          await supabase
            .from('trips')
            .update({
              family_members: nextMembers,
              user_a_name: nextMembers[0],
              user_b_name: nextMembers[1],
              updated_at: new Date().toISOString(),
            })
            .eq('id', trip.id);
          setLastSyncedAt(new Date());
        } catch (err) {
          console.warn('Supabase update trips family_members:', err);
        }
      }

      if (channelRef.current) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'user_profiles_update',
          payload: {
            members: nextMembers,
            userAName: nextMembers[0],
            userBName: nextMembers[1],
          },
        });
      }
    },
    [trip.id, userProfiles.members]
  );

  const setCurrentDeviceUser = useCallback((user: DeviceUser) => {
    setUserProfilesState((prev) => ({
      ...prev,
      currentDeviceUser: user,
    }));
  }, []);

  const getUserName = useCallback(
    (idOrName?: string) => {
      const members = userProfiles.members || DEFAULT_FAMILY_MEMBERS;
      if (!idOrName) return members[0];
      if (idOrName === 'user_1' || idOrName === 'user_a' || idOrName === 'אני') return members[0];
      if (idOrName === 'user_2' || idOrName === 'user_b' || idOrName === 'אחי') return members[1];
      if (idOrName === 'user_3') return members[2];
      if (idOrName === 'user_4') return members[3];
      if (idOrName === 'user_5') return members[4];
      if (idOrName === 'user_6') return members[5];
      return idOrName;
    },
    [userProfiles.members]
  );

  const isUserA = useCallback(
    (idOrName?: string) => {
      if (!idOrName) return false;
      return idOrName === 'user_1' || idOrName === 'user_a' || idOrName === userProfiles.members[0];
    },
    [userProfiles.members]
  );

  const isUserB = useCallback(
    (idOrName?: string) => {
      if (!idOrName) return false;
      return idOrName === 'user_2' || idOrName === 'user_b' || idOrName === userProfiles.members[1];
    },
    [userProfiles.members]
  );

  const clearSchedule = useCallback(async () => {
    const extraHotelsFromDays: SavedHotel[] = [];
    days.forEach((day) => {
      if (day.hotel_name && day.hotel_name.trim()) {
        const alreadyExists =
          savedHotels.some(
            (h) => h.name.trim().toLowerCase() === day.hotel_name!.trim().toLowerCase()
          ) ||
          extraHotelsFromDays.some(
            (h) => h.name.trim().toLowerCase() === day.hotel_name!.trim().toLowerCase()
          );
        if (!alreadyExists) {
          extraHotelsFromDays.push({
            id: crypto.randomUUID(),
            trip_id: trip.id,
            name: day.hotel_name,
            name_ja: day.hotel_name_ja,
            city: day.city,
            booking_url: day.hotel_maps_url,
            assigned_day_numbers: null,
            created_at: new Date().toISOString(),
          });
        }
      }
    });

    const updatedHotels = [...savedHotels, ...extraHotelsFromDays].map((hotel) => ({
      ...hotel,
      assigned_day_numbers: null,
    }));
    setSavedHotels(updatedHotels);

    const updatedItems = items.map((item) => {
      const parentDay = item.day_id ? days.find((d) => d.id === item.day_id) : undefined;
      const preservedCity =
        item.city ||
        parentDay?.city ||
        inferCityFromItemText(`${item.title} ${item.location_name || ''} ${item.google_maps_url || ''}`) ||
        'פוקט';
      return {
        ...item,
        city: preservedCity,
        day_id: null,
        time_slot: 'גמיש',
        is_completed: false,
        updated_at: new Date().toISOString(),
      };
    });
    setItems(updatedItems);

    const updatedDays = days.map((day) => ({
      ...day,
      hotel_name: undefined,
      hotel_name_ja: undefined,
      hotel_address_en: undefined,
      hotel_address_ja: undefined,
      hotel_phone: undefined,
      hotel_booking_ref: undefined,
      hotel_maps_url: undefined,
      notes: '',
    }));
    setDays(updatedDays);

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase
          .from('itinerary_items')
          .update({
            day_id: null,
            time_slot: 'גמיש',
            is_completed: false,
            updated_at: new Date().toISOString(),
          })
          .eq('trip_id', trip.id);

        if (extraHotelsFromDays.length > 0) {
          await supabase.from('saved_hotels').insert(extraHotelsFromDays);
        }

        await supabase
          .from('saved_hotels')
          .update({ assigned_day_numbers: null })
          .eq('trip_id', trip.id);

        await supabase
          .from('trip_days')
          .update({
            hotel_name: null,
            hotel_name_ja: null,
            hotel_address_en: null,
            hotel_address_ja: null,
            hotel_phone: null,
            hotel_booking_ref: null,
            hotel_maps_url: null,
            notes: '',
          })
          .eq('trip_id', trip.id);

        setLastSyncedAt(new Date());
      } catch (err) {
        console.warn('Supabase clearSchedule error:', err);
      }
    }

    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'schedule_cleared',
        payload: { timestamp: new Date().toISOString() },
      });
    }
  }, [days, items, savedHotels, trip.id]);

  const resetToMockData = useCallback(() => {
    setTrip(INITIAL_TRIP);
    setDays(INITIAL_DAYS);
    setItems(INITIAL_ITEMS);
    setSavedHotels(INITIAL_SAVED_HOTELS);
    setWishlistItems(INITIAL_WISHLIST_ITEMS);
    setMeetupPin(INITIAL_MEETUP_PIN);
    setExpenses(INITIAL_EXPENSES);
    setDeadlines(INITIAL_DEADLINES);
    setChecklist(INITIAL_CHECKLIST);
    setUserProfilesState({
      members: [...DEFAULT_FAMILY_MEMBERS],
      userAName: DEFAULT_FAMILY_MEMBERS[0],
      userBName: DEFAULT_FAMILY_MEMBERS[1],
      currentDeviceUser: 'user_1',
    });
    localStorage.removeItem(STORAGE_KEY_TRIP);
    localStorage.removeItem(STORAGE_KEY_DAYS);
    localStorage.removeItem(STORAGE_KEY_ITEMS);
    localStorage.removeItem(STORAGE_KEY_SAVED_HOTELS);
    localStorage.removeItem(STORAGE_KEY_WISHLIST);
    localStorage.removeItem(STORAGE_KEY_MEETUP_PIN);
    localStorage.removeItem(STORAGE_KEY_EXPENSES);
    localStorage.removeItem(STORAGE_KEY_DEADLINES);
    localStorage.removeItem(STORAGE_KEY_CHECKLIST);
    localStorage.removeItem(STORAGE_KEY_USER_PROFILES);
    localStorage.removeItem(STORAGE_KEY_DEVICE_USER);
  }, []);

  return {
    trip,
    days,
    items,
    savedHotels,
    wishlistItems,
    meetupPin,
    expenses,
    deadlines,
    checklist,
    userProfiles,
    updateUserProfiles,
    setCurrentDeviceUser,
    getUserName,
    isUserA,
    isUserB,
    isSupabaseConnected,
    realtimeStatus,
    lastSyncedAt,
    connectSupabase,
    toggleItemCompleted,
    addItem,
    updateItem,
    deleteItem,
    updateDay,
    addDay,
    deleteDay,
    reorderDays,
    reorderItems,
    optimizeDayItems,
    addExpense,
    deleteExpense,
    addDeadline,
    toggleDeadlineBooked,
    deleteDeadline,
    addChecklistItem,
    toggleChecklistCompleted,
    deleteChecklistItem,
    addSavedHotel,
    updateSavedHotel,
    deleteSavedHotel,
    assignHotelToDays,
    assignItemToDay,
    unassignItem,
    addWishlistItem,
    toggleWishlistItemPurchased,
    deleteWishlistItem,
    updateMeetupPin,
    clearSchedule,
    resetToMockData,
  };
}

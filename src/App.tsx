import { useState } from 'react';
import { ViewMode, ItineraryItem, TripDay, SavedHotel, AiPlacementProposal } from './types';
import { useItineraryRealtime } from './hooks/useItineraryRealtime';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { PlanningView } from './components/PlanningView';
import { TripMapView } from './components/TripMapView';
import { CurrencyModal } from './components/CurrencyModal';
import { TaxiCardModal } from './components/TaxiCardModal';
import { TicketModal } from './components/TicketModal';
import { ItemModal } from './components/ItemModal';
import { DayModal } from './components/DayModal';
import { AiConciergeModal } from './components/AiConciergeModal';
import { AiPlacementModal } from './components/AiPlacementModal';
import { SupabaseSettingsModal } from './components/SupabaseSettingsModal';
import { EmergencyModal } from './components/EmergencyModal';
import { askAiSmartPlacement } from './lib/gemini';
import { Coins, Plus, Car, Sparkles, HeartPulse } from 'lucide-react';

export function App() {
  const {
    trip,
    days,
    items,
    savedHotels,
    wishlistItems,
    meetupPin,
    isSupabaseConnected,
    expenses,
    deadlines,
    checklist,
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
    userProfiles,
    updateUserProfiles,
    setCurrentDeviceUser,
  } = useItineraryRealtime();

  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [currentDayId, setCurrentDayId] = useState<string>(() => days[0]?.id || 'day-1');

  // Modals state
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [isTaxiCardOpen, setIsTaxiCardOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  const [isAiConciergeOpen, setIsAiConciergeOpen] = useState(false);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [initialAiPrompt, setInitialAiPrompt] = useState<string | undefined>(undefined);
  const [selectedTicketItem, setSelectedTicketItem] = useState<ItineraryItem | null>(null);
  const [selectedEditItem, setSelectedEditItem] = useState<ItineraryItem | null>(null);
  const [selectedDayForEdit, setSelectedDayForEdit] = useState<TripDay | null>(null);

  // AI Placement State
  const [isPlacementModalOpen, setIsPlacementModalOpen] = useState(false);
  const [placementProposal, setPlacementProposal] = useState<AiPlacementProposal | null>(null);
  const [isPlacementLoading, setIsPlacementLoading] = useState(false);
  const [placementTarget, setPlacementTarget] = useState<{
    item: ItineraryItem | SavedHotel;
    type: 'attraction' | 'hotel';
  } | null>(null);

  const currentDay = days.find((d) => d.id === currentDayId) || days[0];

  const handleOpenAdd = () => {
    setSelectedEditItem(null);
    setIsItemModalOpen(true);
  };

  const handleOpenEdit = (item: ItineraryItem) => {
    setSelectedEditItem(item);
    setIsItemModalOpen(true);
  };

  const handleSaveItem = (itemData: Partial<ItineraryItem>) => {
    if (selectedEditItem) {
      updateItem({ ...selectedEditItem, ...itemData } as ItineraryItem);
    } else {
      addItem(itemData as Omit<ItineraryItem, 'id'>);
    }
  };

  const handleOpenEditDay = (day: TripDay) => {
    setSelectedDayForEdit(day);
    setIsDayModalOpen(true);
  };

  const handleSaveDay = async (updatedDay: TripDay, applyHotelToSameCity?: boolean) => {
    await updateDay(updatedDay);

    // If user asked to apply hotel info to all other days in the same city
    if (applyHotelToSameCity) {
      const sameCityDays = days.filter(
        (d) => d.id !== updatedDay.id && d.city.trim().toLowerCase() === updatedDay.city.trim().toLowerCase()
      );
      for (const d of sameCityDays) {
        await updateDay({
          ...d,
          city_ja: updatedDay.city_ja || d.city_ja,
          hotel_name: updatedDay.hotel_name,
          hotel_name_ja: updatedDay.hotel_name_ja,
          hotel_address_en: updatedDay.hotel_address_en,
          hotel_address_ja: updatedDay.hotel_address_ja,
          hotel_phone: updatedDay.hotel_phone,
          hotel_booking_ref: updatedDay.hotel_booking_ref,
          hotel_maps_url: updatedDay.hotel_maps_url,
        });
      }
    }
  };

  const handleAddDay = async () => {
    const newDay = await addDay();
    if (newDay) {
      setCurrentDayId(newDay.id);
    }
  };

  const handleDeleteDay = async (dayId: string) => {
    const targetDay = days.find((d) => d.id === dayId);
    if (!targetDay) return;
    const confirmMessage = `האם אתה בטוח שברצונך למחוק את יום ${targetDay.day_number} (${targetDay.city}) ואת כל היעדים המשויכים אליו?`;
    if (window.confirm(confirmMessage)) {
      const currentIndex = days.findIndex((d) => d.id === dayId);
      await deleteDay(dayId);
      const remainingDays = days.filter((d) => d.id !== dayId);
      if (remainingDays.length > 0) {
        const nextIndex = Math.min(currentIndex, remainingDays.length - 1);
        setCurrentDayId(remainingDays[nextIndex].id);
      }
    }
  };

  const handleOpenAiPlacementForHotel = async (hotel: SavedHotel) => {
    setPlacementTarget({ item: hotel, type: 'hotel' });
    setIsPlacementModalOpen(true);
    setIsPlacementLoading(true);
    setPlacementProposal(null);

    try {
      const proposal = await askAiSmartPlacement({
        item: {
          id: hotel.id,
          title: hotel.name,
          title_ja: hotel.name_ja,
          city: hotel.city,
          category: 'hotel',
          notes: hotel.notes,
          cost_jpy: hotel.price_jpy,
          type: 'hotel',
        },
        days,
        items,
      });
      setPlacementProposal(proposal);
    } catch (err) {
      console.warn('AI smart placement error:', err);
    } finally {
      setIsPlacementLoading(false);
    }
  };

  const handleOpenAiPlacementForItem = async (item: ItineraryItem) => {
    setPlacementTarget({ item, type: 'attraction' });
    setIsPlacementModalOpen(true);
    setIsPlacementLoading(true);
    setPlacementProposal(null);

    try {
      const proposal = await askAiSmartPlacement({
        item: {
          id: item.id,
          title: item.title,
          title_ja: item.title_ja,
          city: item.city,
          category: item.category,
          notes: item.notes,
          cost_jpy: item.cost_jpy,
          type: 'attraction',
        },
        days,
        items,
      });
      setPlacementProposal(proposal);
    } catch (err) {
      console.warn('AI smart placement error:', err);
    } finally {
      setIsPlacementLoading(false);
    }
  };

  const handleAcceptPlacement = async (proposal: AiPlacementProposal) => {
    if (proposal.item_type === 'attraction') {
      const targetDay = days.find((d) => d.day_number === proposal.recommended_day_number);
      if (targetDay) {
        await assignItemToDay(proposal.item_id, targetDay.id, proposal.recommended_time_slot);
        setCurrentDayId(targetDay.id);
      }
    } else if (proposal.item_type === 'hotel') {
      const hotel = savedHotels.find((h) => h.id === proposal.item_id);
      if (hotel) {
        const matchingDays = days
          .filter((d) => d.city.includes(hotel.city) || hotel.city.includes(d.city))
          .map((d) => d.day_number);
        const daysToAssign = matchingDays.length > 0 ? matchingDays : [proposal.recommended_day_number];
        await assignHotelToDays(hotel.id, daysToAssign);
      }
    }
    setIsPlacementModalOpen(false);
    setPlacementProposal(null);
    setPlacementTarget(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-hebrew">
      {/* Sticky Header with view mode switch & quick action shortcuts */}
      <Header
        viewMode={viewMode}
        setViewMode={setViewMode}
        onOpenCurrency={() => setIsCurrencyOpen(true)}
        onOpenTaxiCard={() => setIsTaxiCardOpen(true)}
        onOpenEmergency={() => setIsEmergencyOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isSupabaseConnected={isSupabaseConnected}
        realtimeStatus={realtimeStatus}
        userProfiles={userProfiles}
        onRefresh={connectSupabase}
        lastSyncedAt={lastSyncedAt}
      />

      {/* Main Content Area */}
      <main 
        className={viewMode === 'map' ? "flex-1 w-full p-0 overflow-hidden" : "flex-1 max-w-4xl w-full mx-auto px-3 sm:px-4 py-4 sm:py-5 box-border"}
        style={viewMode === 'map' ? {} : { paddingBottom: 'max(140px, calc(env(safe-area-inset-bottom, 0px) + 120px))' }}
      >
        {viewMode === 'dashboard' ? (
          <DashboardView
            days={days}
            currentDayId={currentDayId}
            setCurrentDayId={setCurrentDayId}
            items={items}
            onToggleCompleted={toggleItemCompleted}
            onOpenTicket={(item) => setSelectedTicketItem(item)}
            onOpenTaxiCard={() => setIsTaxiCardOpen(true)}
            onOpenCurrency={() => setIsCurrencyOpen(true)}
            onOpenAddItem={handleOpenAdd}
            meetupPin={meetupPin}
            onUpdateMeetupPin={updateMeetupPin}
            userProfiles={userProfiles}
            onReorderItems={reorderItems}
            onOptimizeDayItems={optimizeDayItems}
            onOpenAiConciergeWithPrompt={(prompt) => {
              setInitialAiPrompt(prompt);
              setIsAiConciergeOpen(true);
            }}
          />
        ) : viewMode === 'planning' ? (
          <PlanningView
            days={days}
            currentDayId={currentDayId}
            setCurrentDayId={setCurrentDayId}
            items={items}
            onToggleCompleted={toggleItemCompleted}
            onOpenAddItem={handleOpenAdd}
            onEditItem={handleOpenEdit}
            onDeleteItem={deleteItem}
            onOpenTicket={(item) => setSelectedTicketItem(item)}
            onOpenTaxiCard={() => setIsTaxiCardOpen(true)}
            expenses={expenses}
            onAddExpense={addExpense}
            onDeleteExpense={deleteExpense}
            defaultRate={trip.default_rate_jpy_ils}
            onEditDay={handleOpenEditDay}
            onAddDay={handleAddDay}
            onDeleteDay={handleDeleteDay}
            onReorderDays={reorderDays}
            onReorderItems={reorderItems}
            onOptimizeDayItems={optimizeDayItems}
            deadlines={deadlines}
            onToggleDeadlineBooked={toggleDeadlineBooked}
            onAddDeadline={addDeadline}
            onDeleteDeadline={deleteDeadline}
            checklist={checklist}
            onToggleChecklistCompleted={toggleChecklistCompleted}
            onAddChecklistItem={addChecklistItem}
            onDeleteChecklistItem={deleteChecklistItem}
            savedHotels={savedHotels}
            onAddHotel={addSavedHotel}
            onUpdateHotel={updateSavedHotel}
            onDeleteHotel={deleteSavedHotel}
            onAssignHotelToDays={assignHotelToDays}
            onAddItemToCatalog={(item) => addItem({ ...item, day_id: null })}
            onAssignItemToDay={assignItemToDay}
            onUnassignItem={unassignItem}
            onOpenAiPlacementForHotel={handleOpenAiPlacementForHotel}
            onOpenAiPlacementForItem={handleOpenAiPlacementForItem}
            wishlistItems={wishlistItems}
            onAddWishlistItem={addWishlistItem}
            onToggleWishlistItemPurchased={toggleWishlistItemPurchased}
            onDeleteWishlistItem={deleteWishlistItem}
            userProfiles={userProfiles}
          />
        ) : (
          <TripMapView
            days={days}
            items={items}
            savedHotels={savedHotels}
            currentDayId={currentDayId}
            onSelectDay={setCurrentDayId}
            onOpenItemModal={handleOpenEdit}
            onAssignItemToDay={assignItemToDay}
            onUnassignItem={unassignItem}
            onOptimizeDayItems={optimizeDayItems}
          />
        )}
      </main>

      {/* Mobile Floating Action Bar (Hidden in Map View to allow full slider visibility) */}
      {viewMode !== 'map' && (
        <div 
          className="fixed left-1/2 -translate-x-1/2 z-30 flex items-center justify-around gap-1 sm:gap-2 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 px-2 sm:px-3 py-1.5 sm:py-2 rounded-full shadow-2xl max-w-[calc(100vw-20px)] w-auto box-border"
          style={{ bottom: 'max(14px, calc(env(safe-area-inset-bottom, 0px) + 10px))' }}
        >
          <button
            onClick={() => setIsCurrencyOpen(true)}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 rounded-full text-[11px] sm:text-xs font-bold transition active:scale-95"
            title="מחשבון באט מהיר"
          >
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden min-[360px]:inline">מחשבון ฿</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 bg-gradient-to-r from-japan-red to-rose-600 text-white rounded-full text-[11px] sm:text-xs font-black shadow-lg hover:opacity-95 transition active:scale-95"
            title="הוסף יעד"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>הוסף</span>
          </button>

          <button
            onClick={() => {
              setInitialAiPrompt(undefined);
              setIsAiConciergeOpen(true);
            }}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 bg-gradient-to-r from-purple-500/20 via-rose-500/20 to-japan-red/20 hover:from-purple-500/30 hover:to-rose-500/30 text-japan-sakura rounded-full text-[11px] sm:text-xs font-black transition active:scale-95 border border-purple-500/30"
            title="קונסיירז' טיול אישי (AI Concierge)"
          >
            <Sparkles className="w-3.5 h-3.5 text-japan-sakura animate-pulse" />
            <span>AI</span>
          </button>

          <button
            onClick={() => setIsEmergencyOpen(true)}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 rounded-full text-[11px] sm:text-xs font-bold transition active:scale-95 border border-rose-500/30"
            title="חירום ובריאות"
          >
            <HeartPulse className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden min-[380px]:inline">חירום</span>
          </button>

          {currentDay?.hotel_name && (
            <button
              onClick={() => setIsTaxiCardOpen(true)}
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 rounded-full text-[11px] sm:text-xs font-bold transition active:scale-95"
              title="כרטיס מונית"
            >
              <Car className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden min-[380px]:inline">מונית</span>
            </button>
          )}
        </div>
      )}

      {/* Modals */}
      <CurrencyModal
        isOpen={isCurrencyOpen}
        onClose={() => setIsCurrencyOpen(false)}
        defaultRate={trip.default_rate_jpy_ils}
      />

      {currentDay && (
        <TaxiCardModal
          isOpen={isTaxiCardOpen}
          onClose={() => setIsTaxiCardOpen(false)}
          day={currentDay}
        />
      )}

      <TicketModal
        isOpen={!!selectedTicketItem}
        onClose={() => setSelectedTicketItem(null)}
        item={selectedTicketItem}
      />

      <ItemModal
        isOpen={isItemModalOpen}
        onClose={() => {
          setIsItemModalOpen(false);
          setSelectedEditItem(null);
        }}
        onSave={handleSaveItem}
        onDelete={deleteItem}
        dayId={currentDayId}
        tripId={trip.id}
        itemToEdit={selectedEditItem}
        days={days}
        onAddDeadline={addDeadline}
      />

      <DayModal
        isOpen={isDayModalOpen}
        onClose={() => {
          setIsDayModalOpen(false);
          setSelectedDayForEdit(null);
        }}
        day={selectedDayForEdit}
        onSaveDay={handleSaveDay}
        existingCities={Array.from(new Set(days.map((d) => d.city).filter(Boolean)))}
      />

      <EmergencyModal
        isOpen={isEmergencyOpen}
        onClose={() => setIsEmergencyOpen(false)}
        userProfiles={userProfiles}
      />

      <AiConciergeModal
        isOpen={isAiConciergeOpen}
        onClose={() => {
          setIsAiConciergeOpen(false);
          setInitialAiPrompt(undefined);
        }}
        currentDay={currentDay}
        items={items}
        onAddItem={addItem}
        initialPrompt={initialAiPrompt}
        onOpenSettings={() => {
          setIsAiConciergeOpen(false);
          setIsSettingsOpen(true);
        }}
      />

      <AiPlacementModal
        isOpen={isPlacementModalOpen}
        onClose={() => {
          setIsPlacementModalOpen(false);
          setPlacementProposal(null);
          setPlacementTarget(null);
        }}
        proposal={placementProposal}
        isLoading={isPlacementLoading}
        days={days}
        itemTitle={
          placementTarget?.type === 'hotel'
            ? (placementTarget.item as SavedHotel).name
            : (placementTarget?.item as ItineraryItem)?.title || ''
        }
        itemTitleJa={
          placementTarget?.type === 'hotel'
            ? (placementTarget.item as SavedHotel).name_ja
            : (placementTarget?.item as ItineraryItem)?.title_ja
        }
        itemCity={
          placementTarget?.type === 'hotel'
            ? (placementTarget.item as SavedHotel).city
            : (placementTarget?.item as ItineraryItem)?.city
        }
        onAccept={handleAcceptPlacement}
      />

      <SupabaseSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        isSupabaseConnected={isSupabaseConnected}
        realtimeStatus={realtimeStatus}
        lastSyncedAt={lastSyncedAt}
        onRefresh={connectSupabase}
        onClearSchedule={clearSchedule}
        userProfiles={userProfiles}
        onUpdateUserProfiles={updateUserProfiles}
        onSetCurrentDeviceUser={setCurrentDeviceUser}
      />
    </div>
  );
}

export default App;

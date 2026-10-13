import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Heart,
  Store,
  Wrench,
  UtensilsCrossed,
  Luggage,
  PawPrint,
  ShoppingCart,
  Calendar as CalendarIcon,
  Sun,
  Moon,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Settings,
  Users,
  UserPlus,
  LogOut,
  RefreshCw,
  User,
  Sparkles,
  MessageSquare,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { CalendarEvent, CalendarViewMode, DayStayInfo, EventCategory, EventSortOption, SortDirection } from '../types/calendar';
import { CATEGORY_CONFIG } from '../utils/calendarUtils';
import { useAuth } from '../context/AuthContext';
import { SelectedDaySummaryWidget } from './SelectedDaySummaryWidget';

interface CalendarHeaderProps {
  currentDate: Date;
  viewMode: CalendarViewMode;
  onViewModeChange: (mode: CalendarViewMode) => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  navLabel: string;
  categoryFilter: EventCategory | 'all';
  onCategoryFilterChange: (cat: EventCategory | 'all') => void;
  partnerFilter: 'all' | 'her' | 'him';
  onPartnerFilterChange: (partner: 'all' | 'her' | 'him') => void;
  sortOption: EventSortOption;
  sortDirection: SortDirection;
  onSortOptionChange: (sort: EventSortOption) => void;
  onToggleSortDirection: () => void;
  onOpenAddModal: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenInviteModal?: () => void;
  onOpenProfileModal?: () => void;
  onOpenWorkspaceModal?: () => void;
  unreadChatCount?: number;
  overdueTasksCount?: number;
  onOpenChat?: () => void;
  selectedDate?: string;
  events?: CalendarEvent[];
  stays?: Record<string, DayStayInfo>;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentDate,
  viewMode,
  onViewModeChange,
  onPrev,
  onNext,
  onToday,
  navLabel,
  categoryFilter,
  onCategoryFilterChange,
  partnerFilter,
  onPartnerFilterChange,
  sortOption,
  sortDirection,
  onSortOptionChange,
  onToggleSortDirection,
  onOpenAddModal,
  isDarkMode,
  onToggleDarkMode,
  onOpenInviteModal,
  onOpenProfileModal,
  onOpenWorkspaceModal,
  unreadChatCount = 0,
  overdueTasksCount = 0,
  onOpenChat,
  selectedDate,
  events,
  stays,
}) => {
  const { 
    currentUser, 
    currentHub, 
    partnerUser, 
    coupleViewLabel, 
    partner1Label, 
    partner2Label, 
    user1Theme, 
    user2Theme, 
    logout, 
    switchUser 
  } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const categoryKeys: EventCategory[] = ['market', 'dinner_date', 'maintenance', 'pets', 'grocery_errand', 'other'];

  const getCategoryIcon = (key: EventCategory) => {
    switch (key) {
      case 'market': return <Store className="w-3 h-3" />;
      case 'dinner_date': return <UtensilsCrossed className="w-3 h-3" />;
      case 'maintenance': return <Wrench className="w-3 h-3" />;
      case 'pets': return <PawPrint className="w-3 h-3" />;
      case 'packing': return <PawPrint className="w-3 h-3" />;
      case 'grocery_errand': return <ShoppingCart className="w-3 h-3" />;
      default: return <CalendarIcon className="w-3 h-3" />;
    }
  };

  // Distinct background colors for category buttons when active or inactive
  const getCategoryButtonClasses = (key: EventCategory, isSelected: boolean) => {
    switch (key) {
      case 'market':
        return isSelected
          ? 'bg-amber-500 dark:bg-yellow-400 text-stone-950 font-bold shadow-2xs'
          : 'bg-amber-100/70 hover:bg-amber-200/80 text-amber-950 dark:bg-yellow-950/40 dark:hover:bg-yellow-900/50 dark:text-yellow-300 border border-amber-300 dark:border-yellow-600/60';
      case 'dinner_date':
        return isSelected
          ? 'bg-rose-600 text-white font-semibold shadow-2xs'
          : 'bg-rose-100/70 hover:bg-rose-200/80 text-rose-950 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 dark:text-rose-300 border border-rose-300 dark:border-rose-500/60';
      case 'maintenance':
        return isSelected
          ? 'bg-emerald-600 text-white font-semibold shadow-2xs'
          : 'bg-emerald-100/70 hover:bg-emerald-200/80 text-emerald-950 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800/60';
      case 'pets':
      case 'packing':
        return isSelected
          ? 'bg-sky-600 text-white font-semibold shadow-2xs'
          : 'bg-sky-100/70 hover:bg-sky-200/80 text-sky-950 dark:bg-sky-950/40 dark:hover:bg-sky-900/50 dark:text-sky-200 border border-sky-300 dark:border-sky-800/60';
      case 'grocery_errand':
        return isSelected
          ? 'bg-purple-600 text-white font-semibold shadow-2xs'
          : 'bg-purple-100/70 hover:bg-purple-200/80 text-purple-950 dark:bg-purple-950/40 dark:hover:bg-purple-900/50 dark:text-purple-200 border border-purple-300 dark:border-purple-800/60';
      case 'other':
        return isSelected
          ? 'bg-stone-700 text-white font-semibold shadow-2xs'
          : 'bg-stone-200/80 hover:bg-stone-300/80 text-stone-900 dark:bg-stone-800 dark:hover:bg-stone-700 dark:text-stone-200 border border-stone-300 dark:border-stone-700';
    }
  };

  return (
    <header className="border-b border-[#e5e0d8] dark:border-[#2d3139] bg-[#fbf9f5]/95 dark:bg-[#181a1e]/95 backdrop-blur-md sticky top-0 z-30 transition-colors">
      {/* Top Bar: Brand ("Shared Life Hub"), View Modes, Day/Night toggle & The ONLY Add Button */}
      <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3">
        
        {/* Title: Shared Life Hub, User, Shared Admin, His & Partner, Workspace */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
          <h1 className="text-lg font-serif font-bold tracking-tight text-stone-900 dark:text-stone-100">
            Shared Life Hub
          </h1>

          {/* User Account Button (e.g. Dustin) */}
          {currentUser && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="relative flex items-center gap-1.5 p-1 pr-2 rounded-lg border border-[#e5e0d8] dark:border-[#353943] bg-white dark:bg-[#202329] hover:bg-stone-50 dark:hover:bg-[#2a2e36] text-xs font-medium cursor-pointer shadow-2xs transition-all"
                title={`Account: ${currentUser.name} (${currentUser.gender})`}
              >
                <div className="relative">
                  <div className={`w-5 h-5 rounded-full ${currentUser.avatarColor || 'bg-purple-600'} text-white flex items-center justify-center font-bold text-[10px]`}>
                    {currentUser.name[0]}
                  </div>

                  {/* Notification badge on avatar */}
                  {unreadChatCount > 0 ? (
                    <span 
                      className="absolute -top-1 -right-1 flex h-3.5 min-w-[14px] px-0.5 items-center justify-center rounded-full bg-emerald-500 text-[8px] font-bold text-white ring-1 ring-white dark:ring-[#202329] shadow-xs"
                      title={`${unreadChatCount} unread chat messages`}
                    >
                      {unreadChatCount > 9 ? '9+' : unreadChatCount}
                    </span>
                  ) : overdueTasksCount > 0 ? (
                    <span 
                      className="absolute -top-1 -right-1 flex h-3.5 min-w-[14px] px-0.5 items-center justify-center rounded-full bg-amber-500 text-[8px] font-bold text-white ring-1 ring-white dark:ring-[#202329] shadow-xs"
                      title={`${overdueTasksCount} overdue tasks`}
                    >
                      {overdueTasksCount > 9 ? '9+' : overdueTasksCount}
                    </span>
                  ) : null}
                </div>

                <span className="max-w-[70px] truncate text-stone-800 dark:text-stone-200 font-semibold text-[11px]">
                  {currentUser.name}
                </span>
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <div 
                  className="absolute left-0 mt-1 w-64 bg-white dark:bg-[#1a1d22] border border-[#e4ded5] dark:border-[#2d3139] rounded-xl shadow-xl py-2 z-50 text-xs animate-in fade-in"
                  onClick={() => setShowUserMenu(false)}
                >
                  <div className="px-3.5 py-2 border-b border-[#e4ded5] dark:border-[#2d3139]">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-stone-900 dark:text-stone-100 truncate">{currentUser.name}</p>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-semibold">{coupleViewLabel}</span>
                    </div>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 capitalize mt-0.5">{currentUser.email}</p>
                  </div>

                  {/* Notification Markers Section inside Profile */}
                  {(unreadChatCount > 0 || overdueTasksCount > 0) && (
                    <div className="px-3 py-2 border-b border-[#e4ded5] dark:border-[#2d3139] bg-stone-50/70 dark:bg-[#1f2229]">
                      <div className="text-[10px] uppercase font-mono tracking-wider text-stone-500 dark:text-stone-400 font-bold mb-1.5">
                        Notifications & Activity
                      </div>
                      <div className="space-y-1.5">
                        {unreadChatCount > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              if (onOpenChat) onOpenChat();
                              else if (onOpenWorkspaceModal) onOpenWorkspaceModal();
                            }}
                            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 cursor-pointer transition-colors"
                          >
                            <div className="flex items-center gap-1.5">
                              <MessageSquare className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                              <span className="font-semibold text-[11px]">Unread Chat Messages</span>
                            </div>
                            <span className="px-1.5 py-0.2 rounded-full bg-emerald-600 text-white font-bold text-[10px]">
                              {unreadChatCount} new
                            </span>
                          </button>
                        )}

                        {overdueTasksCount > 0 && (
                          <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-[11px]">
                            <div className="flex items-center gap-1.5">
                              <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                              <span className="font-medium">Overdue Tasks</span>
                            </div>
                            <span className="px-1.5 py-0.2 rounded-full bg-amber-600 text-white font-bold text-[10px]">
                              {overdueTasksCount}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Day / Night View Switcher (Living in Profile Settings) */}
                  <button
                    type="button"
                    onClick={onToggleDarkMode}
                    className="w-full text-left px-3.5 py-2 hover:bg-stone-100 dark:hover:bg-[#24272f] text-stone-800 dark:text-stone-200 flex items-center justify-between cursor-pointer border-b border-[#e4ded5] dark:border-[#2d3139]"
                  >
                    <div className="flex items-center gap-2">
                      {isDarkMode ? (
                        <Sun className="w-4 h-4 text-amber-400" />
                      ) : (
                        <Moon className="w-4 h-4 text-indigo-500" />
                      )}
                      <div>
                        <div className="font-semibold text-xs">{isDarkMode ? 'Switch to Day View' : 'Switch to Night View'}</div>
                        <div className="text-[10px] text-stone-500 dark:text-stone-400">Preferred view theme</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-stone-100 dark:bg-[#2a2e36] text-stone-600 dark:text-stone-300">
                      {isDarkMode ? 'Night' : 'Day'}
                    </span>
                  </button>

                  {/* Edit Profile & Gender */}
                  {onOpenProfileModal && (
                    <button
                      type="button"
                      onClick={onOpenProfileModal}
                      className="w-full text-left px-3.5 py-2 hover:bg-stone-100 dark:hover:bg-[#24272f] text-stone-700 dark:text-stone-300 flex items-center gap-2 cursor-pointer"
                    >
                      <User className="w-3.5 h-3.5 text-stone-500" />
                      <span>Edit Profile & Gender</span>
                    </button>
                  )}

                  {onOpenInviteModal && (
                    <button
                      type="button"
                      onClick={onOpenInviteModal}
                      className="w-full text-left px-3.5 py-2 hover:bg-stone-100 dark:hover:bg-[#24272f] text-stone-700 dark:text-stone-300 flex items-center gap-2 cursor-pointer"
                    >
                      <UserPlus className="w-3.5 h-3.5 text-stone-500" />
                      <span>Invite Partner / Hub Code</span>
                    </button>
                  )}

                  {partnerUser && (
                    <button
                      type="button"
                      onClick={() => switchUser(partnerUser.id)}
                      className="w-full text-left px-3.5 py-2 hover:bg-stone-100 dark:hover:bg-[#24272f] text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-2 cursor-pointer border-t border-[#e4ded5] dark:border-[#2d3139]"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Switch to {partnerUser.name}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={logout}
                    className="w-full text-left px-3.5 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-2 cursor-pointer border-t border-[#e4ded5] dark:border-[#2d3139]"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Shared Admin Button using the heart shared icon */}
          <button
            type="button"
            onClick={() => onViewModeChange('admin')}
            className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-md transition-all cursor-pointer shadow-2xs ${
              viewMode === 'admin'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-stone-700 dark:text-stone-300 bg-stone-200/70 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700'
            }`}
            title="Open Shared Admin"
          >
            <Heart className={`w-2.5 h-2.5 ${viewMode === 'admin' ? 'text-white fill-white' : 'text-rose-500 fill-rose-500'}`} />
            <span>Shared Admin</span>
          </button>

          {/* Dynamic Couple View reference badge: His & Partner */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-100/70 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800/80 text-[11px] text-purple-900 dark:text-purple-300 font-semibold shadow-2xs">
            <Users className="w-3 h-3 text-purple-600 dark:text-purple-400" />
            <span>{coupleViewLabel}</span>
          </div>

          {/* Workspace Button (Where AI and Google integration items go) */}
          {onOpenWorkspaceModal && (
            <button
              type="button"
              onClick={onOpenWorkspaceModal}
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-md transition-all cursor-pointer shadow-2xs text-stone-700 dark:text-stone-300 bg-purple-100/80 dark:bg-purple-950/60 hover:bg-purple-200 dark:hover:bg-purple-900/60 border border-purple-200 dark:border-purple-800/80"
              title="Open Workspace (AI Calendar Logger, Google Tasks, Gmail & Sync)"
            >
              <Sparkles className="w-3 h-3 text-purple-600 dark:text-purple-400" />
              <span>Workspace</span>
              {unreadChatCount > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </button>
          )}
        </div>

        {/* View Switcher & The ONLY Add Button on the top right */}
        <div className="flex items-center gap-2 flex-wrap">
          
          {/* Segmented View Control - Daily Schedule, Week Flow, Monthly Review, Reflect & Summary */}
          <div className="flex items-center bg-stone-200/60 dark:bg-[#24272f] p-0.5 rounded-lg text-xs font-medium text-stone-600 dark:text-stone-400">
            <button
              type="button"
              onClick={() => onViewModeChange('agenda')}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                viewMode === 'agenda'
                  ? 'bg-white dark:bg-[#2e323c] text-stone-900 dark:text-stone-100 shadow-2xs font-semibold'
                  : 'hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              Daily Schedule
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('week')}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                viewMode === 'week'
                  ? 'bg-white dark:bg-[#2e323c] text-stone-900 dark:text-stone-100 shadow-2xs font-semibold'
                  : 'hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              Week Flow
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('month')}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                viewMode === 'month'
                  ? 'bg-white dark:bg-[#2e323c] text-stone-900 dark:text-stone-100 shadow-2xs font-semibold'
                  : 'hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              Monthly Review
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('reflection')}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                viewMode === 'reflection'
                  ? 'bg-white dark:bg-[#2e323c] text-stone-900 dark:text-stone-100 shadow-2xs font-semibold'
                  : 'hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              Reflect & Summary
            </button>
          </div>

          {/* The ONLY Add Button on the top right */}
          <button
            type="button"
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1 bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 text-xs font-semibold py-1.5 px-3 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Middle Row: Selected Day Pulse & Summary Widget - Below daily schedule selection area and above activity type & sort filter */}
      {viewMode !== 'admin' && selectedDate && events && stays && (
        <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 border-t border-[#e5e0d8] dark:border-[#2d3139] pt-1.5 pb-0.5">
          <SelectedDaySummaryWidget
            selectedDate={selectedDate}
            events={events}
            stays={stays}
            onFilterCategory={onCategoryFilterChange}
            categoryFilter={categoryFilter}
          />
        </div>
      )}

      {/* Secondary Bar: Dynamic Navigation (Day/Week/Month/All Time) & Categories with Matching Background Colors */}
      <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-2 border-t border-[#e5e0d8] dark:border-[#2d3139] flex flex-wrap items-center justify-between gap-3 text-sm">
        
        {/* Top-left Navigation: Stays consistent, functions based on user view (Month, Week, Day, All Time) */}
        <div className="flex items-center gap-2">
          <div className="flex items-center border border-[#e2ddd5] dark:border-[#353943] rounded-lg overflow-hidden bg-white dark:bg-[#202329] shadow-2xs">
            <button
              type="button"
              onClick={onPrev}
              aria-label="Previous period"
              className="p-1 hover:bg-stone-100 dark:hover:bg-[#2a2e36] text-stone-600 dark:text-stone-300 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onNext}
              aria-label="Next period"
              className="p-1 hover:bg-stone-100 dark:hover:bg-[#2a2e36] text-stone-600 dark:text-stone-300 transition-colors border-l border-[#e2ddd5] dark:border-[#353943] cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={onToday}
            className="text-xs font-medium text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white border border-[#e2ddd5] dark:border-[#353943] hover:bg-white dark:hover:bg-[#22252b] px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
          >
            Today
          </button>

          <span className="text-sm font-semibold text-stone-900 dark:text-stone-100 tracking-tight ml-2">
            {navLabel}
          </span>
        </div>

        {/* Filter controls: Category Background Matching + Sort Dropdown + Hers/His View Filter Slider */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          {/* Categories with Background Colors Matching per user instruction */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onCategoryFilterChange('all')}
              className={`text-xs px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                categoryFilter === 'all'
                  ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 font-semibold'
                  : 'bg-stone-100 dark:bg-[#252830] text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-[#2e323c]'
              }`}
            >
              All
            </button>

            {categoryKeys.map((key) => {
              const meta = CATEGORY_CONFIG[key];
              const isSelected = categoryFilter === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onCategoryFilterChange(key)}
                  title={`${meta.shortLabel} (${meta.label})`}
                  className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md transition-all cursor-pointer ${getCategoryButtonClasses(
                    key,
                    isSelected
                  )}`}
                >
                  {getCategoryIcon(key)}
                  <span>{meta.shortLabel}</span>
                </button>
              );
            })}
          </div>

          {/* Sort Dropdown + Direction Toggle Arrow Button */}
          <div className="flex items-center gap-1.5 border-l border-[#e2ddd5] dark:border-[#353943] pl-2 shrink-0">
            <label htmlFor="sort-select" className="text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-wider hidden sm:inline cursor-pointer">
              Sort:
            </label>
            <select
              id="sort-select"
              value={sortOption}
              onChange={(e) => onSortOptionChange(e.target.value as EventSortOption)}
              className="bg-white dark:bg-[#24272f] border border-[#e2ddd5] dark:border-[#353943] text-stone-800 dark:text-stone-200 text-xs rounded-md px-2 py-1 outline-none focus:ring-1 focus:ring-stone-400 cursor-pointer shadow-2xs font-medium"
              title="Select attribute to sort by"
            >
              <option value="time">Time</option>
              <option value="category">Category</option>
              <option value="partner">Lead</option>
              <option value="tasks">Tasks</option>
            </select>

            {/* Direction toggle arrow button */}
            <button
              type="button"
              onClick={onToggleSortDirection}
              title={
                sortDirection === 'none'
                  ? `Natural order (not sorted by ${sortOption === 'time' ? 'time' : sortOption}). Click to sort ascending`
                  : sortDirection === 'asc'
                  ? `Sorted ascending by ${sortOption === 'time' ? 'time' : sortOption}. Click to flip descending`
                  : `Sorted descending by ${sortOption === 'time' ? 'time' : sortOption}. Click to flip ascending`
              }
              className={`p-1 rounded-md border text-xs transition-all cursor-pointer flex items-center justify-center ${
                sortDirection === 'none'
                  ? 'bg-white dark:bg-[#24272f] border-[#e2ddd5] dark:border-[#353943] text-stone-400 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:border-stone-400 shadow-2xs'
                  : 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 border-stone-900 dark:border-stone-100 shadow-xs font-bold ring-1 ring-stone-900 dark:ring-stone-100'
              }`}
              aria-label="Toggle sort order direction"
            >
              {sortDirection === 'none' ? (
                <ArrowUpDown className="w-3.5 h-3.5" />
              ) : sortDirection === 'asc' ? (
                <ArrowUp className="w-3.5 h-3.5" />
              ) : (
                <ArrowDown className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          {/* Dynamic Partner Slider View Filter placed to the right of Sort */}
          <div className="flex items-center gap-1.5 border-l border-[#e2ddd5] dark:border-[#353943] pl-2 shrink-0">
            <div className="flex items-center gap-1.5 bg-[#f5f1e8] dark:bg-[#202329] px-2.5 py-1 rounded-lg border border-[#e4ded5] dark:border-[#2d3139] text-xs shadow-2xs">
              <button
                type="button"
                onClick={() => onPartnerFilterChange(partnerFilter === 'her' ? 'all' : 'her')}
                className={`text-[11px] font-semibold transition-colors cursor-pointer px-1.5 py-0.5 rounded ${
                  partnerFilter === 'her'
                    ? `${user1Theme.activeText} ${user1Theme.activeBg}`
                    : `text-stone-500 dark:text-stone-400 ${user1Theme.hoverText}`
                }`}
                title={`Filter by ${partner1Label}`}
              >
                {partner1Label}
              </button>

              {/* Slider switch */}
              <button
                type="button"
                role="switch"
                aria-label="Toggle partner filter"
                onClick={() => {
                  if (!partnerUser && onOpenInviteModal) {
                    if (partnerFilter === 'all') onPartnerFilterChange('her');
                    else if (partnerFilter === 'her') onOpenInviteModal();
                    else onPartnerFilterChange('all');
                  } else {
                    if (partnerFilter === 'all') onPartnerFilterChange('her');
                    else if (partnerFilter === 'her') onPartnerFilterChange('him');
                    else onPartnerFilterChange('all');
                  }
                }}
                className={`relative inline-flex h-5 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                  partnerFilter === 'her'
                    ? user1Theme.sliderTrack
                    : partnerFilter === 'him'
                    ? user2Theme.sliderTrack
                    : 'bg-stone-300 dark:bg-stone-600'
                }`}
                title={`Current: ${partnerFilter === 'all' ? 'Both of Us' : partnerFilter === 'her' ? partner1Label : partner2Label} (Click to cycle)`}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out mt-0.5 ${
                    partnerFilter === 'her'
                      ? 'translate-x-0.5'
                      : partnerFilter === 'him'
                      ? 'translate-x-6'
                      : 'translate-x-3.25'
                  }`}
                />
              </button>

              {/* Partner 2: If partner joined, shows partner label. If NOT, shows + Invite Partner button! */}
              {partnerUser ? (
                <button
                  type="button"
                  onClick={() => onPartnerFilterChange(partnerFilter === 'him' ? 'all' : 'him')}
                  className={`text-[11px] font-semibold transition-colors cursor-pointer px-1.5 py-0.5 rounded ${
                    partnerFilter === 'him'
                      ? `${user2Theme.activeText} ${user2Theme.activeBg}`
                      : `text-stone-500 dark:text-stone-400 ${user2Theme.hoverText}`
                  }`}
                  title={`Filter by ${partner2Label}`}
                >
                  {partner2Label}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenInviteModal) onOpenInviteModal();
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-700 dark:text-purple-300 hover:text-purple-900 bg-purple-100/90 dark:bg-purple-950/70 hover:bg-purple-200 dark:hover:bg-purple-900/80 px-2 py-0.5 rounded-md border border-purple-300 dark:border-purple-800 transition-all cursor-pointer shadow-2xs"
                  title={`Click to invite partner with code ${currentHub?.inviteCode || ''}`}
                >
                  <Plus className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                  <span>Invite</span>
                  {currentHub?.inviteCode && (
                    <span className="font-mono text-[9px] px-1 py-0.2 rounded bg-purple-200 dark:bg-purple-900 text-purple-900 dark:text-purple-200 font-bold ml-0.5">
                      {currentHub.inviteCode}
                    </span>
                  )}
                </button>
              )}

              <button
                type="button"
                onClick={() => onPartnerFilterChange('all')}
                className={`text-[10px] font-semibold px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
                  partnerFilter === 'all'
                    ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 shadow-2xs'
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
                title="Show both partners"
              >
                Both
              </button>
            </div>
          </div>
        </div>

      </div>
    </header>
  );
};

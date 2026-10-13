import React from 'react';
import { Home } from 'lucide-react';
import { CalendarEvent, DayStayInfo, EventCategory, EventSortOption, SortDirection } from '../types/calendar';
import { CATEGORY_CONFIG, getMonthMatrix, sortEventsForDay, formatTimeRange, formatUsTime } from '../utils/calendarUtils';
import { getMoonPhase } from '../utils/astronomyUtils';
import { useAuth } from '../context/AuthContext';

interface MonthViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  stays: Record<string, DayStayInfo>;
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
  categoryFilter: EventCategory | 'all';
  partnerFilter: 'all' | 'her' | 'him';
  sortOption?: EventSortOption;
  sortDirection?: SortDirection;
}

const WEEKDAYS = [
  { short: 'Mon', full: 'Monday' },
  { short: 'Tue', full: 'Tuesday' },
  { short: 'Wed', full: 'Wednesday' },
  { short: 'Thu', full: 'Thursday' },
  { short: 'Fri', full: 'Friday' },
  { short: 'Sat', full: 'Saturday' },
  { short: 'Sun', full: 'Sunday' },
];

export const MonthView: React.FC<MonthViewProps> = ({
  currentDate,
  events,
  stays,
  selectedDate,
  onSelectDate,
  categoryFilter,
  partnerFilter,
  sortOption = 'time',
  sortDirection = 'none',
}) => {
  const { partner1Label, partner2Label, user1Theme, user2Theme } = useAuth();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const calendarCells = getMonthMatrix(year, month);

  // Filter events based on active category & partner perspective
  const filteredEvents = events.filter((evt) => {
    if (categoryFilter !== 'all' && evt.category !== categoryFilter) return false;
    if (partnerFilter !== 'all') {
      if (partnerFilter === 'her' && evt.assignedTo === 'him') return false;
      if (partnerFilter === 'him' && evt.assignedTo === 'her') return false;
    }
    return true;
  });

  // Group events by dateStr
  const eventsByDate = filteredEvents.reduce<Record<string, CalendarEvent[]>>((acc, evt) => {
    if (!acc[evt.startDate]) acc[evt.startDate] = [];
    acc[evt.startDate].push(evt);
    return acc;
  }, {});

  return (
    <div className="bg-[#fbf9f5] dark:bg-[#1a1d22] rounded-xl border border-[#e4ded5] dark:border-[#2d3139] overflow-hidden shadow-2xs transition-colors">
      {/* Weekday Column Headers starting on Monday */}
      <div className="grid grid-cols-7 border-b border-[#e4ded5] dark:border-[#2d3139] bg-[#f5f2eb] dark:bg-[#1f2228] text-xs font-medium text-stone-500 dark:text-stone-400">
        {WEEKDAYS.map((day) => (
          <div
            key={day.short}
            className="py-2 px-2 sm:px-3 text-center sm:text-left flex items-center justify-between"
          >
            <span>{day.short}</span>
          </div>
        ))}
      </div>

      {/* 7-column Calendar Day Matrix */}
      <div className="grid grid-cols-7 divide-x divide-y divide-[#e4ded5] dark:divide-[#2d3139]">
        {calendarCells.map((cell) => {
          const isSelected = selectedDate === cell.dateStr;
          const dayEvents = sortEventsForDay(eventsByDate[cell.dateStr] || [], sortOption, sortDirection);
          const stayInfo = stays[cell.dateStr];
          const moon = getMoonPhase(cell.date);

          return (
            <div
              key={cell.dateStr}
              onClick={() => onSelectDate(cell.dateStr)}
              className={`min-h-[135px] sm:min-h-[160px] xl:min-h-[180px] p-2 sm:p-2.5 transition-all cursor-pointer relative group flex flex-col justify-between ${
                !cell.isCurrentMonth
                  ? 'bg-[#f3f0e8]/40 dark:bg-[#16181c]/50 text-stone-400 dark:text-stone-600'
                  : 'bg-[#fcfaf6] dark:bg-[#1d2026] hover:bg-[#f6f2ea] dark:hover:bg-[#23272e] text-stone-800 dark:text-stone-200'
              } ${isSelected ? 'ring-2 ring-stone-900 dark:ring-stone-100 ring-inset z-10 bg-[#f5f0e6] dark:bg-[#262a32]' : ''}`}
            >
              <div>
                {/* Day Header Row: Day number + Moon phase + Stay location indicator ("Hers" / "His" / "Home") */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1">
                    {/* Fixed hover issue: in night view, day number stays bright white on hover */}
                    <span
                      className={`text-xs sm:text-sm font-semibold rounded-full w-6 h-6 flex items-center justify-center transition-colors ${
                        cell.isToday
                          ? 'bg-stone-900 dark:bg-white text-white dark:text-stone-950 shadow-2xs font-bold'
                          : cell.isCurrentMonth
                          ? 'text-stone-800 dark:text-stone-200 group-hover:text-stone-950 dark:group-hover:text-white'
                          : 'text-stone-400 dark:text-stone-600'
                      }`}
                    >
                      {cell.dayNum}
                    </span>
                    {cell.isCurrentMonth && (
                      <span
                        title={`${moon.name} (${moon.illumination}% lit) · ${moon.quoteTip}`}
                        className="text-xs opacity-65 group-hover:opacity-100 hover:scale-110 transition-all select-none cursor-help"
                      >
                        {moon.emoji}
                      </span>
                    )}
                  </div>

                  {/* Overnight indicator: Home icon and color coding background without text */}
                  {stayInfo && cell.isCurrentMonth && (
                    <div
                      title={`Stay: ${stayInfo.stayAt === 'our_home' ? 'Our Home' : stayInfo.stayAt === 'her_home' ? partner1Label : partner2Label}`}
                      className={`inline-flex items-center justify-center p-1 rounded transition-colors shadow-2xs ${
                        stayInfo.stayAt === 'our_home'
                          ? 'bg-black text-white dark:bg-stone-900 dark:text-white border border-stone-800'
                          : stayInfo.stayAt === 'her_home'
                          ? user1Theme.badgeBg
                          : user2Theme.badgeBg
                      }`}
                    >
                      <Home className="w-2.5 h-2.5" />
                    </div>
                  )}
                </div>

                {/* Events list with category background color matching */}
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map((evt) => {
                    const cfg = CATEGORY_CONFIG[evt.category];
                    const tasks = evt.tasks || [];
                    const completedTasks = tasks.filter((t) => t.completed).length;
                    const allTasksDone = tasks.length > 0 && completedTasks === tasks.length;

                    return (
                      <div
                        key={evt.id}
                        className={`text-[11px] px-1.5 py-0.5 rounded border transition-colors ${cfg.badgeBg} ${cfg.borderColor} hover:border-stone-400 dark:hover:border-stone-500`}
                      >
                        <div className="flex items-center justify-between gap-1 leading-tight">
                          <span className={`font-medium truncate ${cfg.textColor} ${allTasksDone ? 'line-through opacity-70' : ''}`}>
                            {evt.title}
                          </span>
                        </div>
                        
                        {/* Task numbers and time kept in US format */}
                        <div className="flex items-center justify-between text-[10px] text-stone-500 dark:text-stone-400 font-mono mt-0.5">
                          {evt.startTime && <span>{formatTimeRange(evt.startTime, evt.endTime)}</span>}
                          {tasks.length > 0 && (
                            <span className="font-sans text-[9px] ml-auto">
                              {completedTasks}/{tasks.length}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {dayEvents.length > 3 && (
                    <div className="text-[10px] text-stone-500 dark:text-stone-400 font-medium px-1">
                      + {dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

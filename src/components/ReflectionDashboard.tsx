import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Store, 
  Home, 
  FileText,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { CalendarEvent, DayStayInfo } from '../types/calendar';
import { CATEGORY_CONFIG, formatReadableDate, formatDateToYMD } from '../utils/calendarUtils';
import { useAuth } from '../context/AuthContext';

interface ReflectionDashboardProps {
  events: CalendarEvent[];
  stays: Record<string, DayStayInfo>;
  currentDate: Date;
  selectedDate: string;
  timeframe: 'day' | 'week' | 'month' | 'all';
  onTimeframeChange: (tf: 'day' | 'week' | 'month' | 'all') => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onNavigateToDay: (dateStr: string) => void;
}

export const ReflectionDashboard: React.FC<ReflectionDashboardProps> = ({
  events,
  stays,
  currentDate,
  selectedDate,
  timeframe,
  onTimeframeChange,
  onPrev,
  onNext,
  onToday,
  onNavigateToDay,
}) => {
  const { partner1Label, partner2Label } = useAuth();
  // Compute start/end for week
  const curr = new Date(currentDate);
  const dayOfWeek = (curr.getDay() + 6) % 7;
  const monday = new Date(curr);
  monday.setDate(curr.getDate() - dayOfWeek);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const mondayStr = formatDateToYMD(monday);
  const sundayStr = formatDateToYMD(sunday);
  const monthPrefix = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

  // Filter events based on active timeframe
  const filteredEvents = events.filter((e) => {
    if (timeframe === 'day') {
      return e.startDate === selectedDate;
    }
    if (timeframe === 'week') {
      return e.startDate >= mondayStr && e.startDate <= sundayStr;
    }
    if (timeframe === 'month') {
      return e.startDate.startsWith(monthPrefix);
    }
    return true; // 'all'
  });

  // Calculate individual checklist tasks metrics
  let totalTasksCount = 0;
  let completedTasksCount = 0;

  filteredEvents.forEach((evt) => {
    if (evt.tasks) {
      totalTasksCount += evt.tasks.length;
      completedTasksCount += evt.tasks.filter((t) => t.completed).length;
    }
  });

  const uncompletedTasksCount = totalTasksCount - completedTasksCount;
  const taskCompletionRate = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  // Pop-Up Markets summary
  const marketEvents = filteredEvents.filter((e) => e.category === 'market');
  const totalBoothFees = marketEvents.reduce((sum, e) => sum + (e.marketDetails?.boothFee || 0), 0);
  const totalTargetRevenue = marketEvents.reduce((sum, e) => sum + (e.marketDetails?.targetRevenue || 0), 0);
  const projectedNet = totalTargetRevenue - totalBoothFees;

  // Stays breakdown
  const stayEntries = Object.values(stays).filter((s) => {
    if (timeframe === 'day') return s.date === selectedDate;
    if (timeframe === 'week') return s.date >= mondayStr && s.date <= sundayStr;
    if (timeframe === 'month') return s.date.startsWith(monthPrefix);
    return true;
  });
  const herNights = stayEntries.filter((s) => s.stayAt === 'her_home').length;
  const hisNights = stayEntries.filter((s) => s.stayAt === 'his_home').length;
  const homeNights = stayEntries.filter((s) => s.stayAt === 'our_home').length;

  // Notes from days & events
  const eventsWithNotes = filteredEvents.filter((e) => e.notes && e.notes.trim().length > 0);
  const staysWithNotes = stayEntries.filter((s) => s.notes && s.notes.trim().length > 0);

  // Unfinished individual tasks
  const incompleteTasks: Array<{ title: string; eventTitle: string; date: string; assignedTo?: string }> = [];
  filteredEvents.forEach((e) => {
    if (e.tasks) {
      e.tasks.forEach((t) => {
        if (!t.completed) {
          incompleteTasks.push({
            title: t.title,
            eventTitle: e.title,
            date: e.startDate,
            assignedTo: t.assignedTo || e.assignedTo,
          });
        }
      });
    }
  });

  return (
    <div className="space-y-5">
      {/* Timeframe Selector Bar: Daily / Weekly / Monthly / All Time */}
      <div className="bg-[#fcfaf7] dark:bg-[#1a1d22] rounded-xl border border-[#e4ded5] dark:border-[#2d3139] p-4 shadow-2xs flex flex-wrap items-center justify-between gap-4 transition-colors">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-stone-500 dark:text-stone-400 font-semibold block">
            Couple Reflection & Performance Roll-Up
          </span>
          <h2 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100 mt-0.5">
            {timeframe === 'day'
              ? `Daily: ${formatReadableDate(selectedDate)}`
              : timeframe === 'week'
              ? `Weekly: ${monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${sunday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
              : timeframe === 'month'
              ? `Monthly: ${currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
              : 'All Time: Couple Performance'}
          </h2>
        </div>

        {/* Dynamic Timeframe Selector matching user request (Daily / Weekly / Monthly / All Time) */}
        <div className="flex items-center bg-stone-200/60 dark:bg-[#24272f] p-0.5 rounded-lg text-xs font-medium text-stone-600 dark:text-stone-300">
          <button
            type="button"
            onClick={() => onTimeframeChange('day')}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
              timeframe === 'day'
                ? 'bg-white dark:bg-[#2e323c] text-stone-900 dark:text-stone-100 shadow-2xs font-semibold'
                : 'hover:text-stone-900 dark:hover:text-stone-100'
            }`}
          >
            Daily
          </button>
          <button
            type="button"
            onClick={() => onTimeframeChange('week')}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
              timeframe === 'week'
                ? 'bg-white dark:bg-[#2e323c] text-stone-900 dark:text-stone-100 shadow-2xs font-semibold'
                : 'hover:text-stone-900 dark:hover:text-stone-100'
            }`}
          >
            Weekly
          </button>
          <button
            type="button"
            onClick={() => onTimeframeChange('month')}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
              timeframe === 'month'
                ? 'bg-white dark:bg-[#2e323c] text-stone-900 dark:text-stone-100 shadow-2xs font-semibold'
                : 'hover:text-stone-900 dark:hover:text-stone-100'
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => onTimeframeChange('all')}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
              timeframe === 'all'
                ? 'bg-white dark:bg-[#2e323c] text-stone-900 dark:text-stone-100 shadow-2xs font-semibold'
                : 'hover:text-stone-900 dark:hover:text-stone-100'
            }`}
          >
            All Time
          </button>
        </div>
      </div>

      {/* 4 Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Completed Individual Tasks */}
        <div className="bg-[#fcfaf7] dark:bg-[#1a1d22] rounded-xl border border-[#e4ded5] dark:border-[#2d3139] p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
            <span className="font-medium">Checklist Tasks Finished</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-serif text-stone-900 dark:text-stone-100">
              {completedTasksCount}
            </span>
            <span className="text-xs text-stone-400 font-mono">
              of {totalTasksCount} tasks ({taskCompletionRate}%)
            </span>
          </div>
          <div className="w-full bg-stone-200 dark:bg-stone-800 rounded-full h-1.5 mt-3 overflow-hidden">
            <div
              className="bg-emerald-600 dark:bg-emerald-500 h-full rounded-full transition-all"
              style={{ width: `${taskCompletionRate}%` }}
            />
          </div>
        </div>

        {/* Incomplete Tasks Queue */}
        <div className="bg-[#fcfaf7] dark:bg-[#1a1d22] rounded-xl border border-[#e4ded5] dark:border-[#2d3139] p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
            <span className="font-medium">Unfinished Tasks Queue</span>
            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-serif text-stone-900 dark:text-stone-100">
              {uncompletedTasksCount}
            </span>
            <span className="text-xs text-amber-700 dark:text-amber-400 font-medium">
              Ready to roll forward
            </span>
          </div>
          <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-2">
            Can be copied directly when planning upcoming days.
          </p>
        </div>

        {/* Pop-Up Market Financial Sum */}
        <div className="bg-[#fcfaf7] dark:bg-[#1a1d22] rounded-xl border border-[#e4ded5] dark:border-[#2d3139] p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
            <span className="font-medium">Market Revenue Sum</span>
            <Store className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-stone-900 dark:text-stone-100">
              ${totalTargetRevenue}
            </span>
            <span className="text-xs text-stone-500 dark:text-stone-400">
              ({marketEvents.length} markets)
            </span>
          </div>
          <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-2 flex items-center justify-between">
            <span>Stall Fees: ${totalBoothFees}</span>
            <span className="font-semibold text-emerald-700 dark:text-emerald-400">Net: +${projectedNet}</span>
          </div>
        </div>

        {/* House-to-House Nights */}
        <div className="bg-[#fcfaf7] dark:bg-[#1a1d22] rounded-xl border border-[#e4ded5] dark:border-[#2d3139] p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
            <span className="font-medium">House-to-House Nights</span>
            <Home className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-serif text-stone-900 dark:text-stone-100">
              {herNights + hisNights + homeNights}
            </span>
            <span className="text-xs text-stone-500 dark:text-stone-400">nights tracked</span>
          </div>
          <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-2 flex items-center gap-2 flex-wrap">
            <span className="text-purple-700 dark:text-purple-400 font-medium">{partner1Label}: {herNights}d</span>
            <span>·</span>
            <span className="text-blue-700 dark:text-blue-400 font-medium">{partner2Label}: {hisNights}d</span>
            {homeNights > 0 && (
              <>
                <span>·</span>
                <span className="text-stone-900 dark:text-stone-100 font-bold bg-stone-200/80 dark:bg-stone-800 px-1.5 py-0.2 rounded text-[10px]">Home: {homeNights}d</span>
              </>
            )}
          </div>
        </div>

      </div>

      {/* Two Columns: Unfinished Tasks to Copy + Vendor Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Unfinished Individual Tasks */}
        <div className="bg-[#fcfaf7] dark:bg-[#1a1d22] rounded-xl border border-[#e4ded5] dark:border-[#2d3139] p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#e4ded5] dark:border-[#2d3139]">
              <div>
                <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 font-serif">
                  Unfinished Tasks for this Period
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  Items to roll forward into upcoming days
                </p>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40">
                {incompleteTasks.length} tasks
              </span>
            </div>

            {incompleteTasks.length === 0 ? (
              <div className="py-8 text-center text-xs text-stone-400 dark:text-stone-500">
                All scheduled tasks in this period were completed! 🎉
              </div>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {incompleteTasks.map((t, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg border border-[#e4ded5] dark:border-[#2d3139] bg-white dark:bg-[#202329] flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-medium text-stone-800 dark:text-stone-200">
                        {t.title}
                      </div>
                      <div className="text-[10px] text-stone-400 mt-0.5">
                        {t.eventTitle} · {formatReadableDate(t.date)}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onNavigateToDay(t.date)}
                      className="text-xs font-medium text-stone-700 dark:text-stone-300 hover:text-stone-900 bg-stone-100 dark:bg-[#2a2e36] border border-[#e4ded5] dark:border-[#353943] px-2.5 py-1 rounded shrink-0 cursor-pointer"
                    >
                      View Day
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Pop-Up Market Details Breakdown */}
        <div className="bg-[#fcfaf7] dark:bg-[#1a1d22] rounded-xl border border-[#e4ded5] dark:border-[#2d3139] p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#e4ded5] dark:border-[#2d3139]">
            <div>
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 font-serif">
                Pop-Up Markets Roster & Cost Breakdown
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Stall fees, expected sales revenue, and booth performance
              </p>
            </div>
            <Store className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>

          <div className="space-y-3">
            {marketEvents.length === 0 ? (
              <div className="py-8 text-center text-xs text-stone-400">
                No markets scheduled during this timeframe.
              </div>
            ) : (
              marketEvents.map((market) => (
                <div
                  key={market.id}
                  className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100">
                        {market.title}
                      </h4>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400">
                        {formatReadableDate(market.startDate)} · {market.locationName}
                      </p>
                    </div>
                    <span className="text-[10px] font-mono font-medium px-2 py-0.5 bg-amber-200/60 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 rounded">
                      {market.marketDetails?.boothNumber || 'Stall'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs pt-1 border-t border-amber-200 dark:border-amber-900/40 font-mono">
                    <div>
                      <span className="text-stone-500 dark:text-stone-400 block text-[10px] font-sans">Stall Fee</span>
                      <span className="font-semibold text-stone-800 dark:text-stone-200">
                        ${market.marketDetails?.boothFee || 0}
                      </span>
                    </div>
                    <div>
                      <span className="text-stone-500 dark:text-stone-400 block text-[10px] font-sans">Target Sales</span>
                      <span className="font-semibold text-amber-800 dark:text-amber-300">
                        ${market.marketDetails?.targetRevenue || 0}
                      </span>
                    </div>
                    <div>
                      <span className="text-stone-500 dark:text-stone-400 block text-[10px] font-sans">Net Target</span>
                      <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                        +${(market.marketDetails?.targetRevenue || 0) - (market.marketDetails?.boothFee || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Day Notes & Reflections Stream with Multiline Bullets Preserved */}
      <div className="bg-[#fcfaf7] dark:bg-[#1a1d22] rounded-xl border border-[#e4ded5] dark:border-[#2d3139] p-5 shadow-2xs">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#e4ded5] dark:border-[#2d3139]">
          <div>
            <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 font-serif flex items-center gap-2">
              <FileText className="w-4 h-4 text-stone-600 dark:text-stone-400" />
              Notes Log
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Notes, observations, and requests logged with line breaks & bullets
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {eventsWithNotes.map((evt) => (
            <div key={evt.id} className="p-3.5 rounded-lg border border-[#e4ded5] dark:border-[#2d3139] bg-white dark:bg-[#202329]">
              <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 mb-1.5 pb-1 border-b border-[#f0ece4] dark:border-[#2a2e36]">
                <span className="font-semibold text-stone-800 dark:text-stone-200">{evt.title}</span>
                <span className="font-mono text-[11px]">{formatReadableDate(evt.startDate)}</span>
              </div>
              <p className="text-xs text-stone-700 dark:text-stone-300 whitespace-pre-wrap break-words leading-relaxed font-sans">
                {evt.notes}
              </p>
            </div>
          ))}

          {staysWithNotes.map((stay) => (
            <div key={stay.date} className="p-3.5 rounded-lg border border-purple-200 dark:border-purple-900/40 bg-purple-50/40 dark:bg-purple-950/20">
              <div className="flex items-center justify-between text-xs text-purple-900 dark:text-purple-300 mb-1.5 pb-1 border-b border-purple-200 dark:border-purple-900/40">
                <span className="font-semibold">Overnight @ {stay.label}</span>
                <span className="font-mono text-[11px]">{formatReadableDate(stay.date)}</span>
              </div>
              <p className="text-xs text-stone-700 dark:text-stone-300 whitespace-pre-wrap break-words leading-relaxed font-sans">
                {stay.notes}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

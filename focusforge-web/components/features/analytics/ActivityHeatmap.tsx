'use client';

import type { HeatmapDay } from '@/types/domain.types';

const LEVEL_COLORS = [
  'bg-gray-100 dark:bg-gray-800',
  'bg-indigo-200 dark:bg-indigo-900',
  'bg-indigo-400 dark:bg-indigo-700',
  'bg-indigo-600 dark:bg-indigo-500',
  'bg-indigo-800 dark:bg-indigo-400',
];

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAY_LABELS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

// Parse "YYYY-MM-DD" in LOCAL time (not UTC) to avoid day-of-week shift
function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

interface ActivityHeatmapProps {
  data: HeatmapDay[];
}

export default function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  if (data.length === 0) return null;

  // Group data into week columns (Sun=0 … Sat=6)
  const weeks: (HeatmapDay | null)[][] = [];
  const firstDate = parseLocalDate(data[0].date);
  const startPad = firstDate.getDay(); // 0=Sun

  let week: (HeatmapDay | null)[] = Array(startPad).fill(null);
  for (const day of data) {
    week.push(day);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }

  // Build month label slots — one entry per week column, label only in first week of month
  const monthSlots: (string | null)[] = weeks.map((w) => {
    const firstFilled = w.find(Boolean);
    if (!firstFilled) return null;
    const d = parseLocalDate(firstFilled.date);
    return d.getDate() <= 7 ? MONTHS[d.getMonth()] : null;
  });

  // Cell size + gap (must match the flex gap below)
  const CELL = 12; // w-3 = 12px
  const GAP  = 4;  // gap-1 = 4px
  const SLOT  = CELL + GAP; // 16px per column

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <h3 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Activity Heatmap</h3>
      <div className="overflow-x-auto">
        <div className="inline-flex flex-col" style={{ gap: 4 }}>

          {/* Month labels row */}
          <div className="flex" style={{ gap: GAP, marginLeft: 28 /* day-label spacer */ }}>
            {monthSlots.map((label, wi) => (
              <div
                key={wi}
                className="text-xs text-gray-400 overflow-visible whitespace-nowrap dark:text-gray-500"
                style={{ width: CELL, minWidth: CELL }}
              >
                {label ?? ''}
              </div>
            ))}
          </div>

          {/* Day rows */}
          {DAY_LABELS.map((dayName, dayIdx) => (
            <div key={dayIdx} className="flex items-center" style={{ gap: GAP }}>
              {/* Day label — only Mon / Wed / Fri */}
              <span
                className="text-right text-xs text-gray-400 dark:text-gray-500"
                style={{ width: 24, minWidth: 24, fontSize: 10 }}
              >
                {dayIdx === 1 || dayIdx === 3 || dayIdx === 5 ? dayName : ''}
              </span>

              {/* Cells */}
              {weeks.map((w, wi) => {
                const cell = w[dayIdx];
                if (!cell) {
                  return (
                    <div
                      key={wi}
                      className="rounded-sm bg-transparent"
                      style={{ width: CELL, height: CELL }}
                    />
                  );
                }
                return (
                  <div
                    key={wi}
                    title={`${cell.date}: ${cell.minutes} min · ${cell.tasks} tasks`}
                    className={`rounded-sm ${LEVEL_COLORS[cell.level]} cursor-default`}
                    style={{ width: CELL, height: CELL }}
                  />
                );
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500" style={{ marginLeft: 28 }}>
          <span>Less</span>
          {LEVEL_COLORS.map((c, i) => (
            <div key={i} className={`h-3 w-3 rounded-sm ${c}`} />
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  );
}

'use client';

import type { HeatmapDay } from '@/types/domain.types';

const LEVEL_COLORS = [
  'bg-gray-100',
  'bg-indigo-200',
  'bg-indigo-400',
  'bg-indigo-600',
  'bg-indigo-800',
];

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

interface ActivityHeatmapProps {
  data: HeatmapDay[];
}

export default function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  // Group by week (Sun→Sat columns)
  const weeks: (HeatmapDay | null)[][] = [];
  if (data.length === 0) return null;

  const firstDate = new Date(data[0].date);
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

  // Month labels for column positions
  const monthLabels: { label: string; col: number }[] = [];
  weeks.forEach((w, wi) => {
    const firstFilled = w.find(Boolean);
    if (firstFilled) {
      const d = new Date(firstFilled.date);
      if (d.getDate() <= 7) {
        monthLabels.push({ label: MONTHS[d.getMonth()], col: wi });
      }
    }
  });

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-gray-700">Activity Heatmap</h3>
      <div className="overflow-x-auto">
        <div className="inline-flex flex-col gap-1">
          {/* Month labels row */}
          <div className="flex gap-1">
            <div className="w-6" /> {/* spacer for day labels */}
            <div className="relative h-4" style={{ width: weeks.length * 14 + (weeks.length - 1) * 4 }}>
              {monthLabels.map(({ label, col }) => (
                <span
                  key={`${label}-${col}`}
                  className="absolute text-xs text-gray-400"
                  style={{ left: col * 18 }}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Day rows */}
          {[0, 1, 2, 3, 4, 5, 6].map((dayIdx) => (
            <div key={dayIdx} className="flex items-center gap-1">
              <span className="w-6 text-right text-xs text-gray-400">
                {dayIdx % 2 === 1 ? DAYS[dayIdx] : ''}
              </span>
              {weeks.map((week, wi) => {
                const cell = week[dayIdx];
                if (!cell) {
                  return <div key={wi} className="h-3 w-3 rounded-sm" />;
                }
                return (
                  <div
                    key={wi}
                    title={`${cell.date}: ${cell.minutes} min, ${cell.tasks} tasks`}
                    className={`h-3 w-3 rounded-sm ${LEVEL_COLORS[cell.level]}`}
                  />
                );
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
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

import React from 'react';

interface WorkdayData {
  date: string;
  workingHours: number;
}

interface Props {
  year: number; // full year
  month: number; // 1-12
  data: WorkdayData[];
}

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu'];

export default function WorkdaysTable({ year, month, data }: Props) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const dataMap = React.useMemo(() => {
    const map = new Map<string, number>();
    for (const item of data) {
      map.set(item.date, item.workingHours);
    }
    return map;
  }, [data]);

  const todayStr = new Date().toISOString().split('T')[0];

  const weeks: JSX.Element[] = [];
  let currentWeek: (JSX.Element | null)[] = new Array(5).fill(null);

  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(year, month - 1, d);
    const dateStr = dateObj.toISOString().split('T')[0];
    const dow = dateObj.getDay();
    if (dow >= 5) continue; // skip Fri & Sat

    if (dow === 0 && currentWeek.some((c) => c)) {
      weeks.push(
        <div key={`w-${weeks.length}`} style={{ display: 'contents' }}>
          {currentWeek.map((c, i) => c ?? <div key={i} />)}
        </div>
      );
      currentWeek = new Array(5).fill(null);
    }

    const hours = dataMap.get(dateStr) ?? 0;
    const display = hours === 4 ? '½d' : hours;
    const isToday = dateStr === todayStr;

    currentWeek[dow] = (
      <div
        key={dateStr}
        style={{
          border: '1px solid #ccc',
          padding: '4px',
          textAlign: 'center',
          color: hours === 0 ? '#888' : undefined,
          background: isToday ? '#ffeeba' : undefined,
        }}
      >
        <div>{d}</div>
        <div>{display}</div>
      </div>
    );

    if (dow === 4) {
      weeks.push(
        <div key={`w-${weeks.length}`} style={{ display: 'contents' }}>
          {currentWeek.map((c, i) => c ?? <div key={i} />)}
        </div>
      );
      currentWeek = new Array(5).fill(null);
    }
  }

  if (currentWeek.some((c) => c)) {
    weeks.push(
      <div key={`w-${weeks.length}`} style={{ display: 'contents' }}>
        {currentWeek.map((c, i) => c ?? <div key={i} />)}
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '4px',
      }}
    >
      {weekdays.map((w) => (
        <div key={w} style={{ fontWeight: 'bold', textAlign: 'center' }}>
          {w}
        </div>
      ))}
      {weeks}
    </div>
  );
}

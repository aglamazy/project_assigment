import React from 'react';

interface WorkdayData {
  date: string;
  workingHours: number;
}

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu'];

export default function WorkdaysTable() {
  const now = new Date();
  const [selectedYear, setSelectedYear] = React.useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = React.useState(now.getMonth() + 1); // 1-based
  const [data, setData] = React.useState<WorkdayData[]>([]);

  const todayStr = new Date().toISOString().split('T')[0];

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const years = React.useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => selectedYear - 2 + i);
  }, [selectedYear]);

  React.useEffect(() => {
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    const newData: WorkdayData[] = [];

    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(selectedYear, selectedMonth - 1, d);
      const dow = dateObj.getDay();
      if (dow >= 5) continue; // skip Fri/Sat

      const workingHours = [9, 9, 9, 9, 8][dow] ?? 0;
      const dateStr = dateObj.toISOString().split('T')[0];

      newData.push({ date: dateStr, workingHours });
    }

    setData(newData);
  }, [selectedYear, selectedMonth]);

  const dataMap = React.useMemo(() => {
    const map = new Map<string, number>();
    for (const item of data) {
      map.set(item.date, item.workingHours);
    }
    return map;
  }, [data]);

  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const weeks: JSX.Element[] = [];
  let currentWeek: (JSX.Element | null)[] = new Array(5).fill(null);

  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(selectedYear, selectedMonth - 1, d);
    const dateStr = dateObj.toISOString().split('T')[0];
    const dow = dateObj.getDay();
    if (dow >= 5) continue;

    if (dow === 0 && currentWeek.some((c) => c)) {
      weeks.push(
          <div key={`w-${weeks.length}`} style={{ display: 'contents' }}>
            {currentWeek.map((c, i) => c ?? <div key={i} />)}
          </div>
      );
      currentWeek = new Array(5).fill(null);
    }

    const hours = dataMap.get(dateStr) ?? 0;
    const display = hours === 4 ? '½d' : hours > 0 ? hours : '';
    const isToday = dateStr === todayStr;

    let bg: string | undefined;
    if (isToday) bg = '#ffeeba';
    else if (hours >= 8) bg = '#f0f0f0';
    else if (hours === 4) bg = '#d1ecf1';
    else if (hours === 0) bg = '#f8d7da';

    currentWeek[dow] = (
        <div
            key={dateStr}
            style={{
              border: '1px solid #ddd',
              padding: '6px',
              minHeight: '60px',
              textAlign: 'center',
              background: bg,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '14px',
            }}
        >
          <div style={{ fontWeight: 'bold' }}>{d}</div>
          <div style={{ fontSize: '0.8em', color: '#555' }}>{display}</div>
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
      <div>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '8px',
          marginBottom: '8px',
        }}>
          <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
          >
            {monthNames.map((m, idx) => (
                <option key={m} value={idx + 1}>{m}</option>
            ))}
          </select>
          <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            {years.map((y) => (
                <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '4px',
        }}>
          {weekdays.map((w) => (
              <div key={w} style={{ fontWeight: 'bold', textAlign: 'center' }}>
                {w}
              </div>
          ))}
          {weeks}
        </div>
      </div>
  );
}

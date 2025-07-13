import React from 'react';

const API_BASE = process.env.SERVER_URL || 'http://localhost:3001';

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
    const abort = new AbortController();
    fetch(
      `${API_BASE}/globals/working-days?year=${selectedYear}&month=${String(selectedMonth).padStart(2, '0')}`,
      { signal: abort.signal },
    )
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch working days: ${res.status}`);
        }
        const d: WorkdayData[] = await res.json();
        d.sort((a, b) => a.date.localeCompare(b.date));
        setData(d);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          console.error(err);
          setData([]);
        }
      });
    return () => abort.abort();
  }, [selectedYear, selectedMonth]);

  const totalHours = React.useMemo(
    () => data.reduce((sum, d) => sum + d.workingHours, 0),
    [data],
  );

  const weeks: JSX.Element[] = [];
  let currentWeek: (JSX.Element | null)[] = new Array(5).fill(null);

  for (const item of data) {
    const dateObj = new Date(item.date);
    const dow = dateObj.getDay();
    if (dow >= 5) continue;

    if (dow === 0 && currentWeek.some((c) => c)) {
      weeks.push(
        <div key={`w-${weeks.length}`} style={{ display: 'contents' }}>
          {currentWeek.map((c, i) => c ?? <div key={i} />)}
        </div>,
      );
      currentWeek = new Array(5).fill(null);
    }
    const hours = item.workingHours;
    const dateStr = item.date;
    const dayNum = dateObj.getDate();
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
          <div style={{ fontWeight: 'bold' }}>{dayNum}</div>
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
        <div style={{ marginTop: '8px', fontWeight: 'bold', textAlign: 'right' }}>
          Total: {totalHours} hours
        </div>
      </div>
  );
}

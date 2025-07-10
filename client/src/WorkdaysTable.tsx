import React, { useEffect, useState } from 'react';

interface Holiday {
  date: string;
}

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function WorkdaysTable() {
  const now = new Date();
  const [year, setYear] = useState<number>(now.getFullYear());
  const [month, setMonth] = useState<number>(now.getMonth() + 1); // 1-12
  const [holidays, setHolidays] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/IL`)
      .then((res) => res.json())
      .then((data: Holiday[]) => {
        const dates = new Set<string>(data.map((h) => h.date));
        setHolidays(dates);
      })
      .catch(() => setHolidays(new Set()));
  }, [year]);

  const daysInMonth = new Date(year, month, 0).getDate();
  const rows: JSX.Element[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(year, month - 1, d);
    const dateStr = dateObj.toISOString().split('T')[0];
    if (holidays.has(dateStr)) {
      continue;
    }
    const dayIndex = dateObj.getDay();
    const dayName = weekdays[dayIndex];
    let hours = 0;
    if (dayIndex >= 0 && dayIndex <= 3) {
      hours = 9;
    } else if (dayIndex === 4) {
      hours = 8;
    }
    rows.push(
      <tr key={dateStr}>
        <td>{dateStr}</td>
        <td>{dayName}</td>
        <td>{hours}</td>
      </tr>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '10px' }}>
        <select value={month} onChange={(e) => setMonth(parseInt(e.target.value, 10))}>
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <select value={year} onChange={(e) => setYear(parseInt(e.target.value, 10))}>
          {Array.from({ length: 5 }, (_, i) => now.getFullYear() - 2 + i).map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>
      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ccc', padding: '4px' }}>Date</th>
            <th style={{ border: '1px solid #ccc', padding: '4px' }}>Day</th>
            <th style={{ border: '1px solid #ccc', padding: '4px' }}>Planned Hours</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    </div>
  );
}

import React, { useState } from 'react';

interface Props {
  value: string;
  onChange: (v: string) => void;
}

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu'];
const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export default function AllocationDatePicker({ value, onChange }: Props) {
  const init = value ? new Date(value) : new Date();
  const [year, setYear] = useState(init.getFullYear());
  const [month, setMonth] = useState(init.getMonth() + 1); // 1-based

  const years = Array.from({ length: 5 }, (_, i) => init.getFullYear() - 2 + i);
  const daysInMonth = new Date(year, month, 0).getDate();

  const weeks: (Date | null)[][] = [];
  let current: (Date | null)[] = new Array(5).fill(null);
  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month - 1, day);
    const dow = d.getDay();
    if (dow > 4) continue; // skip Fri/Sat
    if (dow === 0 && current.some((c) => c)) {
      weeks.push(current);
      current = new Array(5).fill(null);
    }
    current[dow] = d;
    if (dow === 4) {
      weeks.push(current);
      current = new Array(5).fill(null);
    }
  }
  if (current.some((c) => c)) weeks.push(current);

  return (
    <div>
      <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
        <select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
          {monthNames.map((m, idx) => (
            <option key={m} value={idx + 1}>
              {m}
            </option>
          ))}
        </select>
        <select value={year} onChange={(e) => setYear(Number(e.target.value))}>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px' }}>
        {dayNames.map((d) => (
          <div key={d} style={{ fontWeight: 'bold', textAlign: 'center' }}>
            {d}
          </div>
        ))}
        {weeks.map((week, i) =>
          week.map((d, idx) => {
            const selected = d && d.toISOString().slice(0, 10) === value;
            return (
              <div
                key={`${i}-${idx}`}
                style={{
                  border: '1px solid #ddd',
                  padding: '4px',
                  minHeight: '30px',
                  textAlign: 'center',
                  cursor: d ? 'pointer' : 'default',
                  background: selected ? '#ffeeba' : undefined,
                }}
                onClick={d ? () => onChange(d.toISOString().slice(0, 10)) : undefined}
              >
                {d ? d.getDate() : ''}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

import React from 'react';
import WorkdaysTable from './WorkdaysTable';

export default function App() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const daysInMonth = new Date(year, month, 0).getDate();
  const sampleData = Array.from({ length: daysInMonth }, (_, i) => {
    const dateObj = new Date(year, month - 1, i + 1);
    const dow = dateObj.getDay();
    const hours = dow >= 0 && dow <= 3 ? 9 : dow === 4 ? 4 : 0;
    return { date: dateObj.toISOString().split('T')[0], workingHours: hours };
  });

  return (
    <div>
      <WorkdaysTable year={year} month={month} data={sampleData} />
    </div>
  );
}

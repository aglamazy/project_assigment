import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import harvestStore, { TeamMember } from './stores/HarvestStore';

interface Allocation {
  id: string;
  team_name: string;
  project_name: string;
  start_date: string;
  end_date: string;
  hours: number | null;
}

const API_BASE = process.env.SERVER_URL || 'http://localhost:3001';

function isoWeekString(date: Date) {
  const target = new Date(date.getTime());
  const dayNr = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.getTime();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
  }
  const week = 1 + Math.round((firstThursday - target.getTime()) / 604800000);
  return `${target.getFullYear()}-W${String(week).padStart(2, '0')}`;
}

function getWeekStartEnd(value: string) {
  const [y, w] = value.split('-W').map(Number);
  const simple = new Date(y, 0, 1 + (w - 1) * 7);
  const dow = simple.getDay();
  const weekStart = new Date(simple);
  if (dow <= 4) weekStart.setDate(simple.getDate() - simple.getDay() + 1);
  else weekStart.setDate(simple.getDate() + 8 - simple.getDay());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  return { start: weekStart, end: weekEnd };
}

export default function WeeklyPlan() {
  const navigate = useNavigate();
  const [teamMembers, setTeamMembers] = useState<TeamMember[] | null>(null);
  const [selectedWeek, setSelectedWeek] = useState(isoWeekString(new Date()));
  const [allocations, setAllocations] = useState<Allocation[]>([]);

  useEffect(() => {
    harvestStore.getTeamMembers().then(setTeamMembers).catch(() => setTeamMembers([]));
  }, []);

  useEffect(() => {
    const abort = new AbortController();
    const { start, end } = getWeekStartEnd(selectedWeek);
    const s = start.toISOString().slice(0, 10);
    const e = end.toISOString().slice(0, 10);
    fetch(`${API_BASE}/allocations?start=${s}&end=${e}`, { signal: abort.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Failed to fetch allocations: ${res.status}`);
        const data: Allocation[] = await res.json();
        setAllocations(data);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          console.error(err);
          setAllocations([]);
        }
      });
    return () => abort.abort();
  }, [selectedWeek]);

  if (teamMembers === null) return <div>Loading...</div>;

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu'];
  const { start } = getWeekStartEnd(selectedWeek);
  const weekStart = new Date(start);
  weekStart.setDate(weekStart.getDate() - 1); // start on Sunday
  const days = dayNames.map((_, idx) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + idx);
    return { date: d, key: d.toISOString().slice(0, 10) };
  });

  const dailyMap: Record<string, Record<string, string[]>> = {};
  allocations.forEach((a) => {
    const aStart = new Date(a.start_date).getTime();
    const aEnd = new Date(a.end_date).getTime();
    days.forEach(({ date, key }) => {
      const t = date.getTime();
      if (t >= aStart && t <= aEnd) {
        if (!dailyMap[a.team_name]) dailyMap[a.team_name] = {};
        if (!dailyMap[a.team_name][key]) dailyMap[a.team_name][key] = [];
        if (!dailyMap[a.team_name][key].includes(a.project_name)) {
          dailyMap[a.team_name][key].push(a.project_name);
        }
      }
    });
  });

  const developers = teamMembers
    .map((m) => m.name)
    .filter((dev) => days.some(({ key }) => (dailyMap[dev]?.[key] || []).length));

  const tableStyle: React.CSSProperties = {
    borderCollapse: 'collapse',
    width: '100%',
  };
  const cellStyle: React.CSSProperties = {
    border: '1px solid #ddd',
    padding: '8px',
    textAlign: 'center',
  };

  return (
    <div>
      <center><h2>Weekly Plan</h2></center>
      <div
        style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}
      >
        <input type="week" value={selectedWeek} onChange={(e) => setSelectedWeek(e.target.value)} />
      </div>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={cellStyle}></th>
            {days.map(({ date }, idx) => (
              <th key={idx} style={cellStyle}>
                {dayNames[idx]} {date.getDate()}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {developers.map((dev) => (
            <tr key={dev}>
              <td style={cellStyle}>{dev}</td>
              {days.map(({ key, date }) => (
                <td key={key} style={cellStyle}>
                  {(dailyMap[dev]?.[key] || []).map((proj) => (
                    <div
                      key={proj}
                      style={{
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        color: '#007bff',
                      }}
                      onClick={() =>
                        navigate(
                          `/project/${encodeURIComponent(proj)}?year=${date.getFullYear()}&month=${date.getMonth() + 1}`,
                        )
                      }
                    >
                      {proj}
                    </div>
                  ))}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


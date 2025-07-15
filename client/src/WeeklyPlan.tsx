import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import harvestStore, { Project, TeamMember } from './stores/HarvestStore';

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
  const [projects, setProjects] = useState<Project[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[] | null>(null);
  const [selectedWeek, setSelectedWeek] = useState(isoWeekString(new Date()));
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const navigate = useNavigate();
  const [hoveredProject, setHoveredProject] = useState<string | null>(null);

  useEffect(() => {
    harvestStore.getProjects().then(setProjects).catch(() => setProjects([]));
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

  const { start, end } = getWeekStartEnd(selectedWeek);
  const startMs = start.getTime();
  const endMs = end.getTime();

  const allocationMap: Record<string, Record<string, number>> = {};
  allocations.forEach((a) => {
    const aStart = new Date(a.start_date).getTime();
    const aEnd = new Date(a.end_date).getTime();
    const s = Math.max(aStart, startMs);
    const e = Math.min(aEnd, endMs);
    if (s > e) return;
    const days = Math.floor((e - s) / 86400000) + 1;
    const hours = (a.hours ?? 8) * days;
    if (!allocationMap[a.team_name]) allocationMap[a.team_name] = {};
    allocationMap[a.team_name][a.project_name] =
      (allocationMap[a.team_name][a.project_name] || 0) + hours;
  });

  const developers = teamMembers
    .map((m) => m.name)
    .filter((dev) => Object.values(allocationMap[dev] || {}).reduce((s, v) => s + v, 0) > 0);

  const allProjects = projects.map((p) => p.name);
  const projectNames = allProjects.filter(
    (proj) => developers.reduce((sum, dev) => sum + (allocationMap[dev]?.[proj] || 0), 0) > 0,
  );

  const totalsPerProject = projectNames.map((proj) =>
    developers.reduce((sum, dev) => sum + (allocationMap[dev]?.[proj] || 0), 0),
  );

  const totalsPerDeveloper = developers.map((dev) =>
    projectNames.reduce((sum, proj) => sum + (allocationMap[dev]?.[proj] || 0), 0),
  );

  const grandTotal = totalsPerProject.reduce((a, b) => a + b, 0);

  const tableStyle: React.CSSProperties = {
    borderCollapse: 'collapse',
    width: '100%',
  };
  const cellStyle: React.CSSProperties = {
    border: '1px solid #ddd',
    padding: '8px',
    textAlign: 'center',
  };
  const headerSpanStyle: React.CSSProperties = {
    textDecoration: 'none',
    cursor: 'pointer',
  };
  const totalStyle: React.CSSProperties = {
    ...cellStyle,
    fontWeight: 'bold',
    background: '#f0f0f0',
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
            {projectNames.map((project) => (
              <th key={project} style={cellStyle}>
                <span
                  style={{
                    ...headerSpanStyle,
                    color: hoveredProject === project ? '#007bff' : undefined,
                  }}
                  onClick={() => navigate(`/project/${encodeURIComponent(project)}`)}
                  onMouseEnter={() => setHoveredProject(project)}
                  onMouseLeave={() => setHoveredProject(null)}
                >
                  {project}
                </span>
              </th>
            ))}
            <th style={totalStyle}>Total</th>
          </tr>
        </thead>
        <tbody>
          {developers.map((dev, idx) => (
            <tr key={dev}>
              <td style={cellStyle}>{dev}</td>
              {projectNames.map((proj) => (
                <td key={proj} style={cellStyle}>{allocationMap[dev]?.[proj] || 0}</td>
              ))}
              <td style={totalStyle}>{totalsPerDeveloper[idx]}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td style={totalStyle}>Total</td>
            {totalsPerProject.map((tot, idx) => (
              <td key={idx} style={totalStyle}>{tot}</td>
            ))}
            <td style={totalStyle}>{grandTotal}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}


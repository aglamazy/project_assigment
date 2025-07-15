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

export default function ResourceMatrix() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[] | null>(null);
  const navigate = useNavigate();
  const [hoveredProject, setHoveredProject] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7),
  );
  const [allocations, setAllocations] = useState<Allocation[]>([]);

  useEffect(() => {
    harvestStore.getProjects().then(setProjects).catch(() => {
      setProjects([]);
    });
    harvestStore.getTeamMembers().then(setTeamMembers).catch(() => {
      setTeamMembers([]);
    });
  }, []);

  useEffect(() => {
    const abort = new AbortController();
    const [year, month] = selectedMonth.split('-').map(Number);
    fetch(`${API_BASE}/allocations?year=${year}&month=${month}`, {
      signal: abort.signal,
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch allocations: ${res.status}`);
        }
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
  }, [selectedMonth]);

  if (teamMembers === null) {
    return <div>Loading...</div>;
  }

  const developers = teamMembers.map((m) => m.name);

  const projectNames = projects.map((p) => p.name);
  const allocationMap: Record<string, Record<string, number>> = {};
  allocations.forEach((a) => {
    const start = new Date(a.start_date);
    const end = new Date(a.end_date);
    const days =
      Math.floor((end.getTime() - start.getTime()) / 86400000) + 1;
    const hours = (a.hours ?? 8) * days;
    if (!allocationMap[a.team_name]) allocationMap[a.team_name] = {};
    allocationMap[a.team_name][a.project_name] =
      (allocationMap[a.team_name][a.project_name] || 0) + hours;
  });

  const totalsPerDeveloper = developers.map((dev) => {
    return projectNames.reduce(
      (sum, proj) => sum + (allocationMap[dev]?.[proj] || 0),
      0,
    );
  });

  const totalsPerProject = projectNames.map((proj) => {
    return developers.reduce(
      (sum, dev) => sum + (allocationMap[dev]?.[proj] || 0),
      0,
    );
  });

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
      <center><h2>Resource Allocation Matrix</h2></center>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        />
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

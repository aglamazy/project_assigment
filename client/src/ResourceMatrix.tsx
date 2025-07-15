import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import harvestStore, { Project, TeamMember } from './stores/HarvestStore';

const allocations: Record<string, Record<string, number>> = {
  Alice: { 'Project 1': 40, 'Project 2': 60 },
  Bob: { 'Project 1': 50, 'Project 2': 30 },
  Charlie: { 'Project 1': 20, 'Project 2': 40 },
};

export default function ResourceMatrix() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[] | null>(null);
  const navigate = useNavigate();
  const [hoveredProject, setHoveredProject] = useState<string | null>(null);
  const [hideEmptyProjects, setHideEmptyProjects] = useState(false);

  useEffect(() => {
    harvestStore.getProjects().then(setProjects).catch(() => {
      setProjects([]);
    });
    harvestStore.getTeamMembers().then(setTeamMembers).catch(() => {
      setTeamMembers([]);
    });
  }, []);

  if (teamMembers === null) {
    return <div>Loading...</div>;
  }

  const developers = teamMembers.map((m) => m.name);

  const allProjectNames = projects.map((p) => p.name);
  const totalsByProject: Record<string, number> = {};
  allProjectNames.forEach((proj) => {
    totalsByProject[proj] = developers.reduce(
      (sum, dev) => sum + (allocations[dev]?.[proj] || 0),
      0,
    );
  });

  const sortedProjectNames = [...allProjectNames].sort((a, b) => {
    const aEmpty = totalsByProject[a] === 0;
    const bEmpty = totalsByProject[b] === 0;
    if (aEmpty && !bEmpty) return 1;
    if (!aEmpty && bEmpty) return -1;
    return a.localeCompare(b);
  });

  const projectNames = hideEmptyProjects
    ? sortedProjectNames.filter((p) => totalsByProject[p] !== 0)
    : sortedProjectNames;

  const totalsPerDeveloper = developers.map((dev) => {
    return projectNames.reduce(
      (sum, proj) => sum + (allocations[dev]?.[proj] || 0),
      0,
    );
  });

  const totalsPerProject = projectNames.map((proj) => totalsByProject[proj]);

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
      <div style={{ marginBottom: '8px' }}>
        <label>
          <input
            type="checkbox"
            checked={hideEmptyProjects}
            onChange={(e) => setHideEmptyProjects(e.target.checked)}
            style={{ marginRight: '4px' }}
          />
          Hide projects with no allocation
        </label>
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
                <td key={proj} style={cellStyle}>{allocations[dev]?.[proj] || 0}</td>
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

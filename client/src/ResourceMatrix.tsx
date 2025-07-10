import React from 'react';

const developers = ['Alice', 'Bob', 'Charlie'];
const projects = ['Project 1', 'Project 2'];

const allocations: Record<string, Record<string, number>> = {
  Alice: { 'Project 1': 40, 'Project 2': 60 },
  Bob: { 'Project 1': 50, 'Project 2': 30 },
  Charlie: { 'Project 1': 20, 'Project 2': 40 },
};

export default function ResourceMatrix() {
  const totalsPerDeveloper = developers.map((dev) => {
    return projects.reduce((sum, proj) => sum + (allocations[dev]?.[proj] || 0), 0);
  });

  const totalsPerProject = projects.map((proj) => {
    return developers.reduce((sum, dev) => sum + (allocations[dev]?.[proj] || 0), 0);
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

  const totalStyle: React.CSSProperties = {
    ...cellStyle,
    fontWeight: 'bold',
    background: '#f0f0f0',
  };

  return (
    <div>
      <h2>Resource Allocation Matrix</h2>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={cellStyle}></th>
            {projects.map((project) => (
              <th key={project} style={cellStyle}>{project}</th>
            ))}
            <th style={totalStyle}>Total</th>
          </tr>
        </thead>
        <tbody>
          {developers.map((dev, idx) => (
            <tr key={dev}>
              <td style={cellStyle}>{dev}</td>
              {projects.map((proj) => (
                <td key={proj} style={cellStyle}>{allocations[dev][proj]}</td>
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

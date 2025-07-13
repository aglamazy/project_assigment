import React from 'react';

const headerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  background: '#f8f8f8',
  padding: '10px 20px',
};

const navStyle: React.CSSProperties = {
  listStyle: 'none',
  display: 'flex',
  gap: '1rem',
  margin: 0,
  padding: 0,
};

const logoStyle: React.CSSProperties = {
  height: '40px',
};

export default function Header() {
  return (
    <header style={headerStyle}>
      <img src="/one-digital.webp" alt="One Digital logo" style={logoStyle} />
      <nav>
        <ul style={navStyle}>
          <li>Monthly plan</li>
          <li>Weekly plan</li>
          <li>Harvest</li>
        </ul>
      </nav>
    </header>
  );
}

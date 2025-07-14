import React from 'react';
import { Link } from 'react-router-dom';

const headerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  background: 'linear-gradient(to right, #00c6ff, #0072ff)',
  padding: '10px 20px',
  minHeight: '64px',
  color: '#fff',
};

const navStyle: React.CSSProperties = {
  listStyle: 'none',
  display: 'flex',
  gap: '1rem',
  margin: 0,
  padding: 0,
  color: '#fff',
};

const logoStyle: React.CSSProperties = {
  height: '40px',
};

export default function Header() {
  return (
    <header style={headerStyle}>
      <Link to="/">
        <img
          src="/one-digital.webp"
          alt="One Digital logo"
          style={logoStyle}
        />
      </Link>
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

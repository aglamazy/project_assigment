import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ResourceMatrix from './ResourceMatrix';
import ProjectAllocationTable from './ProjectAllocationTable';
import Header from './Header';
import Footer from './Footer';

export default function App() {
  return (
    <div>
      <Header />
      <Routes>
        <Route path="/" element={<ResourceMatrix />} />
        <Route
          path="/project/:projectName"
          element={<ProjectAllocationTable />}
        />
      </Routes>
      <Footer />
    </div>
  );
}

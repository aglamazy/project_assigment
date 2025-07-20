import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ResourceMatrix from './pages/ResourceMatrix';
import ProjectAllocationTable from './pages/ProjectAllocationTable';
import WeeklyPlan from './pages/WeeklyPlan';
import Header from './pageParts/Header';
import Footer from './pageParts/Footer';
import DeveloperAssignmentTable from './pages/DeveloperAssignmentTable';

export default function App() {
  return (
    <div>
      <Header />
      <Routes>
        <Route path="/" element={<ResourceMatrix />} />
        <Route path="/weekly" element={<WeeklyPlan />} />
        <Route
          path="/project/:projectName"
          element={<ProjectAllocationTable />}
        />
        <Route
          path="/developer/:developerName"
          element={<DeveloperAssignmentTable />}
        />
      </Routes>
      <Footer />
    </div>
  );
}

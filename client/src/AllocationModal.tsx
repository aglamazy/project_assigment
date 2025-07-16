import React, { useEffect, useState } from 'react';
import { TeamMember } from './stores/HarvestStore';

interface Props {
  show: boolean;
  teamMembers: TeamMember[];
  initial?: { team_name: string; start_date: string; end_date: string };
  projects?: string[];
  initialProject?: string;
  overlapDays?: string[] | null;
  onCancel: () => void;
  onSave: (data: { team_name: string; start_date: string; end_date: string; project_name?: string }) => void;
  onOverride?: () => void;
}

export default function AllocationModal({
  show,
  teamMembers,
  initial,
  projects,
  initialProject,
  overlapDays,
  onCancel,
  onSave,
  onOverride,
}: Props) {
  const [selectedMember, setSelectedMember] = useState(initial?.team_name || '');
  const [startDate, setStartDate] = useState(initial?.start_date || '');
  const [endDate, setEndDate] = useState(initial?.end_date || '');
  const [project, setProject] = useState(initialProject || (projects && projects[0]) || '');

  useEffect(() => {
    if (initial) {
      setSelectedMember(initial.team_name);
      setStartDate(initial.start_date);
      setEndDate(initial.end_date);
    }
  }, [initial]);

  useEffect(() => {
    if (initialProject !== undefined) {
      setProject(initialProject);
    }
  }, [initialProject]);

  if (!show) return null;

  const sortedTeam = [...teamMembers].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ background: '#fff', padding: '20px', minWidth: '300px' }}>
        <h3>{initial ? 'Edit Allocation' : 'Add Allocation'}</h3>
        <div style={{ marginBottom: '8px' }}>
          <label>
            Developer
            <input
              list="team-members-list"
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value)}
              style={{ marginLeft: '8px' }}
            />
            <datalist id="team-members-list">
              {sortedTeam.map((m) => (
                <option key={m.id} value={m.name} />
              ))}
            </datalist>
          </label>
        </div>
        {projects && (
          <div style={{ marginBottom: '8px' }}>
            <label>
              Project
              <input
                list="project-list"
                value={project}
                onChange={(e) => setProject(e.target.value)}
                style={{ marginLeft: '8px' }}
              />
              <datalist id="project-list">
                {projects.map((p) => (
                  <option key={p} value={p} />
                ))}
              </datalist>
            </label>
          </div>
        )}
        <div style={{ marginBottom: '8px' }}>
          <label>
            Start Date
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ marginLeft: '8px' }}
            />
          </label>
        </div>
        <div style={{ marginBottom: '8px' }}>
          <label>
            End Date
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{ marginLeft: '8px' }}
            />
          </label>
        </div>
        {overlapDays && (
          <div style={{ color: 'red', marginBottom: '8px' }}>
            Overlaps on: {overlapDays.join(', ')}
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <button
            onClick={() => {
              onCancel();
            }}
          >
            Cancel
          </button>
          {overlapDays && onOverride ? (
            <button
              onClick={() => {
                onOverride();
              }}
            >
              Override
            </button>
          ) : (
            <button
              onClick={() =>
                onSave({
                  team_name: selectedMember,
                  start_date: startDate,
                  end_date: endDate,
                  project_name: projects ? project : undefined,
                })
              }
            >
              Save
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

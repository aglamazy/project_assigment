import React, {useEffect, useMemo, useState} from 'react';
import {useParams} from 'react-router-dom';
import harvestStore, {TeamMember} from './stores/HarvestStore';
import globalStore from './stores/GlobalStore';

interface Allocation {
    id: string;
    team_name: string;
    date: string;
    hours: number;
}

const API_BASE = process.env.SERVER_URL || 'http://localhost:3001';
export default function ProjectAllocationTable() {
    const {projectName = ''} = useParams<{ projectName?: string }>();
    const now = new Date();
    const [year, setYear] = useState(now.getFullYear());
    const [month, setMonth] = useState(now.getMonth() + 1); // 1-based
    const [allocations, setAllocations] = useState<Allocation[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [editingAllocation, setEditingAllocation] = useState<Allocation | null>(null);
    const [selectedMember, setSelectedMember] = useState('');
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [formDay, setFormDay] = useState(1);
    const [formHours, setFormHours] = useState(0);

    const monthNames = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
    ];

    const years = useMemo(() => {
        return Array.from({length: 5}, (_, i) => now.getFullYear() - 2 + i);
    }, [now]);

    useEffect(() => {
        harvestStore
            .getTeamMembers()
            .then(setTeamMembers)
            .catch(() => setTeamMembers([]));
    }, []);

    useEffect(() => {
        const abort = new AbortController();
        fetch(
            `${API_BASE}/allocations?project=${encodeURIComponent(projectName)}&year=${year}&month=${month}`,
            {signal: abort.signal},
        )
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
    }, [projectName, year, month]);

    const devs = useMemo(() => {
        const set = new Set<string>();
        allocations.forEach((a) => set.add(a.team_name));
        return Array.from(set).sort();
    }, [allocations]);

    const [workingDays, setWorkingDays] = useState<number[]>([]);

    useEffect(() => {
        let cancelled = false;
        globalStore
            .getWorkingDays(year, month)
            .then(() => {
                if (!cancelled) setWorkingDays([...globalStore.working_days]);
            })
            .catch((err) => {
                if (!cancelled) {
                    console.error(err);
                    setWorkingDays([]);
                }
            });
        return () => {
            cancelled = true;
        };
    }, [year, month]);

    const daysInMonth = new Date(year, month, 0).getDate();

    const map = useMemo(() => {
        const m: Record<string, Record<string, Allocation>> = {};
        allocations.forEach((a) => {
            if (!m[a.date]) m[a.date] = {};
            m[a.date][a.team_name] = a;
        });
        return m;
    }, [allocations]);

    const totals = useMemo(() => {
        return devs.map((dev) =>
            allocations
                .filter((a) => a.team_name === dev)
                .reduce((sum, a) => sum + a.hours, 0),
        );
    }, [devs, allocations]);

    function openModal(day: number, dev?: string) {
        const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const existing = dev ? map[date]?.[dev] : undefined;
        setFormDay(day);
        if (existing) {
            setEditingAllocation(existing);
            setSelectedMember(existing.team_name);
            setFormHours(existing.hours);
        } else {
            setEditingAllocation(null);
            setSelectedMember(dev || '');
            setFormHours(0);
        }
        setShowModal(true);
    }

    function saveAllocation() {
        const date = `${year}-${String(month).padStart(2, '0')}-${String(formDay).padStart(2, '0')}`;
        const url = editingAllocation
            ? `${API_BASE}/allocations/${editingAllocation.id}`
            : `${API_BASE}/allocations`;
        const method = editingAllocation ? 'PUT' : 'POST';
        fetch(url, {
            method,
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                team_name: selectedMember,
                project_name: projectName,
                date,
                hours: formHours,
            }),
        })
            .then((res) => {
                if (!res.ok) throw new Error(`Failed to save allocation: ${res.status}`);
            })
            .then(() => {
                setShowModal(false);
                setEditingAllocation(null);
                // refresh
                return fetch(
                    `${API_BASE}/allocations?project=${encodeURIComponent(projectName)}&year=${year}&month=${month}`,
                );
            })
            .then(async (res) => {
                if (!res.ok) throw new Error('Failed to refresh allocations');
                const data: Allocation[] = await res.json();
                setAllocations(data);
            })
            .catch((err) => {
                console.error(err);
            });
    }

    const tableStyle: React.CSSProperties = {
        borderCollapse: 'collapse',
        width: '100%',
    };
    const cellStyle: React.CSSProperties = {
        border: '1px solid #ddd',
        padding: '4px',
        textAlign: 'center',
    };
    const headerStyle: React.CSSProperties = {
        padding: '8px',
    };
    const totalStyle: React.CSSProperties = {
        ...cellStyle,
        fontWeight: 'bold',
        background: '#f0f0f0',
    };

    return (
        <>
            <center><h1>Project Allocation Table</h1></center>
            <div>
                <div style={{display: 'flex', gap: '8px', marginBottom: '8px'}}>
                    <select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
                        {monthNames.map((m, idx) => (
                            <option key={m} value={idx + 1}>
                                {m}
                            </option>
                        ))}
                    </select>
                    <select value={year} onChange={(e) => setYear(Number(e.target.value))}>
                        {years.map((y) => (
                            <option key={y} value={y}>
                                {y}
                            </option>
                        ))}
                    </select>
                    <button onClick={() => openModal(1)}>+ Add Allocation</button>
                </div>

                <table style={tableStyle}>
                    <thead>
                    <tr>
                        <th style={headerStyle}>Day</th>
                        {devs.map((dev) => (
                            <th key={dev} style={headerStyle}>
                                {dev}
                            </th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {workingDays.map((d) => {
                        const date = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                        return (
                            <tr key={d}>
                                <td style={cellStyle}>{d}</td>
                                {devs.map((dev) => (
                                    <td
                                        key={dev}
                                        style={{...cellStyle, cursor: 'pointer'}}
                                        onClick={() => openModal(d, dev)}
                                    >
                                        {map[date]?.[dev]?.hours ?? ''}
                                    </td>
                                ))}
                            </tr>
                        );
                    })}
                    </tbody>
                    <tfoot>
                    <tr>
                        <td style={totalStyle}>Total</td>
                        {totals.map((tot, idx) => (
                            <td key={idx} style={totalStyle}>
                                {tot}
                            </td>
                        ))}
                    </tr>
                    </tfoot>
                </table>

                {showModal && (
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
                        <div style={{background: '#fff', padding: '20px', minWidth: '300px'}}>
                            <h3>{editingAllocation ? 'Edit Allocation' : 'Add Allocation'}</h3>
                            <div style={{marginBottom: '8px'}}>
                                <label>
                                    Developer
                                    <select
                                        value={selectedMember}
                                        onChange={(e) => setSelectedMember(e.target.value)}
                                        style={{marginLeft: '8px'}}
                                    >
                                        <option value="">Select...</option>
                                        {teamMembers.map((m) => (
                                            <option key={m.id} value={m.name}>
                                                {m.name}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            </div>
                            <div style={{marginBottom: '8px'}}>
                                <label>
                                    Day
                                    <input
                                        type="number"
                                        min="1"
                                        max={daysInMonth}
                                        value={formDay}
                                        onChange={(e) => setFormDay(Number(e.target.value))}
                                        style={{marginLeft: '8px'}}
                                    />
                                </label>
                            </div>
                            <div style={{marginBottom: '8px'}}>
                                <label>
                                    Hours
                                    <input
                                        type="number"
                                        value={formHours}
                                        onChange={(e) => setFormHours(Number(e.target.value))}
                                        style={{marginLeft: '8px'}}
                                    />
                                </label>
                            </div>
                            <div style={{display: 'flex', justifyContent: 'flex-end', gap: '8px'}}>
                                <button
                                    onClick={() => {
                                        setShowModal(false);
                                        setEditingAllocation(null);
                                    }}
                                >
                                    Cancel
                                </button>
                                <button onClick={saveAllocation}>Save</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}


import React, {useEffect, useMemo, useState} from 'react';
import {useParams, useLocation} from 'react-router-dom';
import harvestStore, {TeamMember} from './stores/HarvestStore';
import globalStore from './stores/GlobalStore';
import AllocationModal from './AllocationModal';

interface Allocation {
    id: string;
    team_name: string;
    project_name: string;
    start_date: string;
    end_date: string;
    hours: number | null;
}

const API_BASE = process.env.SERVER_URL || 'http://localhost:3001';
export default function ProjectAllocationTable() {
    const {projectName = ''} = useParams<{ projectName?: string }>();
    const {search} = useLocation();
    const params = new URLSearchParams(search);
    const now = new Date();
    const initYear = Number(params.get('year')) || now.getFullYear();
    const initMonth = Number(params.get('month')) || now.getMonth() + 1;
    const [year, setYear] = useState(initYear);
    const [month, setMonth] = useState(initMonth); // 1-based
    const [allocations, setAllocations] = useState<Allocation[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [editingAllocation, setEditingAllocation] = useState<Allocation | null>(null);
    const [overlapDays, setOverlapDays] = useState<string[] | null>(null);
    const [overrideAlloc, setOverrideAlloc] = useState(false);
    const [selectedMember, setSelectedMember] = useState('');
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const sortedTeamMembers = useMemo(
        () => [...teamMembers].sort((a, b) => a.name.localeCompare(b.name)),
        [teamMembers],
    );
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        const paramsUpdate = new URLSearchParams(search);
        const y = Number(paramsUpdate.get('year'));
        const m = Number(paramsUpdate.get('month'));
        if (y) setYear(y);
        if (m) setMonth(m);
    }, [search]);

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

    const expanded = useMemo(() => {
        const arr: (Allocation & { date: string })[] = [];
        allocations.forEach((a) => {
            const start = new Date(a.start_date);
            const end = new Date(a.end_date);
            for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                const day = d.getDate();
                if (globalStore.working_days.includes(day)) {
                    const date = d.toISOString().slice(0, 10);
                    arr.push({ ...a, date });
                }
            }
        });
        return arr;
    }, [allocations]);

    const map = useMemo(() => {
        const m: Record<string, Record<string, Allocation & { date: string }>> = {};
        expanded.forEach((a) => {
            if (!m[a.date]) m[a.date] = {};
            m[a.date][a.team_name] = a;
        });
        return m;
    }, [expanded]);

    const totals = useMemo(() => {
        return devs.map((dev) =>
            expanded
                .filter((a) => a.team_name === dev)
                .reduce((sum, a) => sum + (a.hours ?? 8), 0),
        );
    }, [devs, expanded]);

    function openModal(day: number, dev?: string) {
        const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const existing = dev ? map[date]?.[dev] : undefined;
        if (existing) {
            setEditingAllocation(existing);
            setSelectedMember(existing.team_name);
            setStartDate(existing.start_date);
            setEndDate(existing.end_date);
        } else {
            setEditingAllocation(null);
            setSelectedMember(dev || '');
            setStartDate(date);
            setEndDate(date);
        }
        setOverlapDays(null);
        setOverrideAlloc(false);
        setShowModal(true);
    }

    function saveAllocation(team_name: string, start_date: string, end_date: string, override: boolean) {
        const url = editingAllocation
            ? `${API_BASE}/allocations/${editingAllocation.id}`
            : `${API_BASE}/allocations`;
        const method = editingAllocation ? 'PUT' : 'POST';
        fetch(url, {
            method,
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                team_name,
                project_name: projectName,
                start_date,
                end_date,
                hours: 9,
                override,
            }),
        })
            .then(async (res) => {
                if (!res.ok) throw new Error(`Failed to save allocation: ${res.status}`);
                const data = await res.json().catch(() => ({}));
                if (data.overlapDays) {
                    setOverlapDays(data.overlapDays);
                    return null;
                }
                return data;
            })
            .then(async (data) => {
                if (data === null) return; // overlap warning only
                setShowModal(false);
                setEditingAllocation(null);
                setOverrideAlloc(false);
                setOverlapDays(null);
                const res = await fetch(
                    `${API_BASE}/allocations?project=${encodeURIComponent(projectName)}&year=${year}&month=${month}`,
                );
                if (!res.ok) throw new Error('Failed to refresh allocations');
                const refreshed: Allocation[] = await res.json();
                setAllocations(refreshed);
            })
            .catch((err) => {
                console.error(err);
            });
    }

    function deleteAllocation() {
        if (!editingAllocation) return;
        fetch(`${API_BASE}/allocations/${editingAllocation.id}`, {method: 'DELETE'})
            .then(async (res) => {
                if (!res.ok) throw new Error(`Failed to delete allocation: ${res.status}`);
                setShowModal(false);
                setEditingAllocation(null);
                const refreshedRes = await fetch(
                    `${API_BASE}/allocations?project=${encodeURIComponent(projectName)}&year=${year}&month=${month}`,
                );
                if (!refreshedRes.ok) throw new Error('Failed to refresh allocations');
                const refreshed: Allocation[] = await refreshedRes.json();
                setAllocations(refreshed);
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
            <center>
                <h1>{projectName} assignments</h1>
            </center>
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
                    <button onClick={() => openModal(Math.min(now.getDate(), daysInMonth))}>+ Add Allocation</button>
                </div>

                {allocations.length === 0 ? (
                    <div style={{ marginBottom: '8px', textAlign: 'center', fontWeight: 'bold' }}>
                        דף הקצאת משאבים
                        <br />
                        ניתן להקצות משאב ליום בודד או טווח תאריכים
                    </div>
                ) : (

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
                )}
                {showModal && (
                    <AllocationModal
                        show={showModal}
                        teamMembers={teamMembers}
                        initial={{ team_name: selectedMember, start_date: startDate, end_date: endDate }}
                        overlapDays={overlapDays}
                        onCancel={() => {
                            setShowModal(false);
                            setEditingAllocation(null);
                            setOverrideAlloc(false);
                            setOverlapDays(null);
                        }}
                        onSave={({ team_name, start_date, end_date }) => {
                            setSelectedMember(team_name);
                            setStartDate(start_date);
                            setEndDate(end_date);
                            setOverrideAlloc(false);
                            saveAllocation(team_name, start_date, end_date, false);
                        }}
                        onOverride={() => {
                            setOverrideAlloc(true);
                            saveAllocation(selectedMember, startDate, endDate, true);
                        }}
                    />
                )}
            </div>
        </>
    );
}


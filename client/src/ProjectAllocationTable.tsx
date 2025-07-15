import React, {useEffect, useMemo, useState} from 'react';
import {useParams} from 'react-router-dom';
import harvestStore, {TeamMember} from './stores/HarvestStore';
import globalStore from './stores/GlobalStore';

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
    const now = new Date();
    const [year, setYear] = useState(now.getFullYear());
    const [month, setMonth] = useState(now.getMonth() + 1); // 1-based
    const [allocations, setAllocations] = useState<Allocation[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [editingAllocation, setEditingAllocation] = useState<Allocation | null>(null);
    const [selectedMember, setSelectedMember] = useState('');
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const sortedTeamMembers = useMemo(
        () => [...teamMembers].sort((a, b) => a.name.localeCompare(b.name)),
        [teamMembers],
    );
    const [hideEmptyDevs, setHideEmptyDevs] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

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
        const withAlloc = new Set<string>();
        allocations.forEach((a) => withAlloc.add(a.team_name));
        const allNames = sortedTeamMembers.map((m) => m.name);
        const combined = Array.from(new Set([...allNames, ...withAlloc]));
        combined.sort((a, b) => {
            const aHas = withAlloc.has(a);
            const bHas = withAlloc.has(b);
            if (aHas && !bHas) return -1;
            if (!aHas && bHas) return 1;
            return a.localeCompare(b);
        });
        return hideEmptyDevs ? combined.filter((n) => withAlloc.has(n)) : combined;
    }, [allocations, sortedTeamMembers, hideEmptyDevs]);

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
                const date = d.toISOString().slice(0, 10);
                arr.push({ ...a, date });
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
        setShowModal(true);
    }

    function saveAllocation() {
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
                start_date: startDate,
                end_date: endDate,
                hours: 9,
            }),
        })
            .then((res) => {
                if (!res.ok) throw new Error(`Failed to save allocation: ${res.status}`);
            })
            .then(() => {
                setShowModal(false);
                setEditingAllocation(null);
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
                    <label style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
                        <input
                            type="checkbox"
                            checked={hideEmptyDevs}
                            onChange={(e) => setHideEmptyDevs(e.target.checked)}
                        />
                        Hide developers with no allocation
                    </label>
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
                                    <input
                                        list="team-members-list"
                                        value={selectedMember}
                                        onChange={(e) => setSelectedMember(e.target.value)}
                                        style={{marginLeft: '8px'}}
                                    />
                                    <datalist id="team-members-list">
                                        {sortedTeamMembers.map((m) => (
                                            <option key={m.id} value={m.name} />
                                        ))}
                                    </datalist>
                                </label>
                            </div>
                            <div style={{marginBottom: '8px'}}>
                                <label>
                                    Start Date
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        style={{marginLeft: '8px'}}
                                    />
                                </label>
                            </div>
                            <div style={{marginBottom: '8px'}}>
                                <label>
                                    End Date
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
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


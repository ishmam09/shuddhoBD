import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, DollarSign, Calendar, Save, Edit, X, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5001/api`;

export default function ProjectTimeline() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [project, setProject] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isEdit, setIsEdit] = useState(false);
    const [form, setForm] = useState<any>(null);

    // implementing project data fetch
    const fetchProject = async () => {
        try {
            const res = await fetch(`${API_BASE}/projects/${id}`, { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setProject(data);
                setForm(JSON.parse(JSON.stringify(data))); // deep copy for editing
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProject();
    }, [id]);

    // implementing save changes to backend
    const saveChanges = async () => {
        try {
            const res = await fetch(`${API_BASE}/projects/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(form)
            });
            if (res.ok) {
                setIsEdit(false);
                fetchProject();
            } else {
                const data = await res.json();
                alert(`Error: ${data.message || 'Failed to save changes'}`);
            }
        } catch (err: any) {
            console.error(err);
            alert(`Network Error: ${err.message || 'Could not connect to the server'}`);
        }
    };

    // implementing phase selection logic
    const selectActivePhase = (index: number) => {
        const newPhases = form.phases.map((p: any, i: number) => {
            if (i < index) return { ...p, status: 'past' };
            if (i === index) return { ...p, status: 'current' };
            return { ...p, status: 'future' };
        });
        setForm({ ...form, phases: newPhases });
    };

    if (loading) return <div className="tl-load">Loading...</div>;
    if (!project) return <div className="tl-err">Project not found</div>;

    const isAdmin = user?.role === 'admin';

    return (
        <div className="tl-page">
            <div className="flex justify-between items-center mb-6">
                <button onClick={() => navigate(-1)} className="back-btn mb-0">
                    <ArrowLeft className="w-4 h-4" /> Back to Status
                </button>

                {/* implementing admin action bar */}
                {isAdmin && (
                    <div className="flex gap-3">
                        {!isEdit ? (
                            <button onClick={() => setIsEdit(true)} className="btn-edit">
                                <Edit className="w-4 h-4" /> Edit Timeline
                            </button>
                        ) : (
                            <>
                                <button onClick={() => setIsEdit(false)} className="btn-cancel">
                                    <X className="w-4 h-4" /> Cancel
                                </button>
                                <button onClick={saveChanges} className="btn-save">
                                    <Save className="w-4 h-4" /> Save Changes
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>

            <div className="tl-header">
                <div className="flex justify-between items-start">
                    <h1 className="tl-title tracking-tight">{project.name}</h1>
                    {/* implementing project final status display */}
                    {!isEdit ? (
                        <span className={`tl-status-large ${project.status.includes('completed') ? 'completed' : 'active'}`}>
                            {project.status}
                        </span>
                    ) : (
                        <select 
                            className="tl-status-select"
                            value={form.status}
                            onChange={(e) => setForm({...form, status: e.target.value})}
                        >
                            <option value="planning">Planning</option>
                            <option value="in progress">In Progress</option>
                            <option value="on hold">On Hold</option>
                            <option value="completed">Completed</option>
                        </select>
                    )}
                </div>
                <div className="tl-subtitle">
                    <span className="badge-id">ID: {project.projectId}</span>
                    <span className="badge-loc">Location: {project.location}</span>
                </div>
            </div>

            <div className="tl-container">
                {(isEdit ? form.phases : project.phases).map((phase: any, index: number) => (
                    <div key={index} className={`tl-row ${phase.status}`}>
                        <div className="tl-left">
                            <div className="tl-dot">
                                {phase.status === 'current' && <div className="dot-pulse"></div>}
                            </div>
                            {index !== project.phases.length - 1 && <div className="tl-line"></div>}
                        </div>

                        <div className="tl-right">
                            <div className={`tl-card ${phase.status === 'current' ? 'active' : ''}`}>
                                <div className="tl-top">
                                    {isEdit ? (
                                        <input 
                                            className="tl-input-name" 
                                            value={phase.name}
                                            onChange={(e) => {
                                                const f = {...form};
                                                f.phases[index].name = e.target.value;
                                                setForm(f);
                                            }}
                                        />
                                    ) : (
                                        <h3 className="phase-title">{phase.name}</h3>
                                    )}
                                    <span className={`tl-status ${phase.status}`}>{phase.status}</span>
                                </div>
                                
                                <div className="tl-body">
                                    {isEdit ? (
                                        <div className="tl-edit-grid">
                                            {/* implementing date inputs */}
                                            <div className="tl-edit-box">
                                                <label>Start</label>
                                                <input type="date" value={new Date(phase.start).toISOString().split('T')[0]} onChange={(e) => {
                                                    const f = {...form};
                                                    f.phases[index].start = e.target.value;
                                                    setForm(f);
                                                }} />
                                            </div>
                                            <div className="tl-edit-box">
                                                <label>End</label>
                                                <input type="date" value={new Date(phase.end).toISOString().split('T')[0]} onChange={(e) => {
                                                    const f = {...form};
                                                    f.phases[index].end = e.target.value;
                                                    setForm(f);
                                                }} />
                                            </div>
                                            {/* implementing spent input */}
                                            <div className="tl-edit-box col-span-2">
                                                <label>Amount Spent (৳)</label>
                                                <input type="number" value={phase.spent} onChange={(e) => {
                                                    const f = {...form};
                                                    f.phases[index].spent = Number(e.target.value);
                                                    setForm(f);
                                                }} />
                                            </div>
                                            {/* implementing active phase button */}
                                            <div className="col-span-2 mt-2">
                                                <button 
                                                    onClick={() => selectActivePhase(index)}
                                                    className={`btn-state ${phase.status === 'current' ? 'active' : ''}`}
                                                >
                                                    {phase.status === 'current' ? <><Check className="w-3 h-3"/> Active Stage</> : "Set as Current Stage"}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="tl-info">
                                                <Calendar className="tl-icon" />
                                                <span>{new Date(phase.start).toLocaleDateString()} - {new Date(phase.end).toLocaleDateString()}</span>
                                            </div>
                                            <div className="tl-money">
                                                <DollarSign className="tl-icon text-shuddho-neon" />
                                                <span className="font-bold">Spent: </span>
                                                <span className="money-val">৳{phase.spent.toLocaleString()}</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="tl-footer">
                <div className="total-box">
                    <p className="label">Total Budget</p>
                    <p className="val">৳{project.budget.toLocaleString()}</p>
                </div>
                <div className="total-box">
                    <p className="label">Total Spent</p>
                    <p className={`val ${project.actualCompletion > project.budget ? 'text-shuddho-red' : 'text-shuddho-green'}`}>
                        ৳{(isEdit ? form.phases.reduce((acc: any, p: any) => acc + p.spent, 0) : project.actualCompletion).toLocaleString()}
                    </p>
                </div>
            </div>
        </div>
    );
}

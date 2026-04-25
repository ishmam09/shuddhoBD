import { useState, useEffect } from "react";
import { X, Plus, Trash2, PieChart, Target, Landmark } from "lucide-react";
import { SECTORS_LIST } from "../data/constituencies";

const API_BASE = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5001/api`;

export default function AdminSeatModal({ seat, onClose, onSaved, mode = 'assets' }: { 
    seat?: any, 
    onClose: () => void, 
    onSaved: () => void, 
    mode?: 'assets' | 'profile' 
}) {
    const isEdit = !!seat;

    const [form, setForm] = useState({
        division: "",
        seatName: "",
        mpName: "",
        party: "",
        lastRecordedAsset: "N/A",
        fiveYearBackAsset: "",
        fiveYearGrowthPercentage: 0,
        yearlyAssets: [0, 0, 0, 0, 0] as number[],
        budgetAllocation: 0,
        sectors: {} as Record<string, number>,
        projects: [] as string[],
    });

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (seat) {
            setForm({
                division: seat.division,
                seatName: seat.seatName,
                mpName: seat.mpName,
                party: seat.party,
                lastRecordedAsset: seat.lastRecordedAsset,
                fiveYearBackAsset: "",
                fiveYearGrowthPercentage: seat.fiveYearGrowthPercentage,
                yearlyAssets: seat.yearlyAssets && seat.yearlyAssets.length === 5 ? seat.yearlyAssets : [0, 0, 0, 0, 0],
                budgetAllocation: seat.budgetAllocation || 0,
                sectors: seat.sectors || {},
                projects: seat.projects || [],
            });

            // Fetch private fields that were stripped from public view
            fetch(`${API_BASE}/seats/admin/${seat._id}`, { credentials: "include" })
                .then(res => res.json())
                .then(data => {
                    if (data.fiveYearBackAsset) {
                        setForm(prev => ({ ...prev, fiveYearBackAsset: data.fiveYearBackAsset }));
                    }
                })
                .catch(err => console.error("Failed to load private config:", err));
        } else {
            setForm({
                division: "",
                seatName: "",
                mpName: "",
                party: "",
                lastRecordedAsset: "N/A",
                fiveYearBackAsset: "",
                fiveYearGrowthPercentage: 0,
                yearlyAssets: [0, 0, 0, 0, 0],
                budgetAllocation: 0,
                sectors: {},
                projects: [],
            });
        }
        setImageFile(null);
    }, [seat]);

    // Auto-calculate growth percentage from yearlyAssets
    useEffect(() => {
        const year1 = form.yearlyAssets[0];
        const year5 = form.yearlyAssets[4];

        if (year1 > 0) {
            const growth = ((year5 - year1) / year1) * 100;
            setForm(prev => ({
                ...prev,
                fiveYearGrowthPercentage: parseFloat(growth.toFixed(2))
            }));
        }
    }, [form.yearlyAssets]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const endpoint = isEdit ? `${API_BASE}/seats/${seat._id}` : `${API_BASE}/seats`;
            const method = isEdit ? "PUT" : "POST";

            const res = await fetch(endpoint, {
                method,
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(form)
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to save seat");

            if (imageFile) {
                const formData = new FormData();
                formData.append("image", imageFile);
                const imgRes = await fetch(`${API_BASE}/seats/${data._id}/image`, {
                    method: "POST",
                    credentials: "include",
                    body: formData
                });
                if (!imgRes.ok) throw new Error("Seat saved, but failed to upload candidate image.");
            }

            onSaved();
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        
        if (name === 'lastRecordedAsset') {
            const numericValue = parseFloat(value.match(/[\d.]+/)?.[0] || "0");
            setForm(prev => {
                const newYearly = [...prev.yearlyAssets];
                newYearly[4] = numericValue;
                return {
                    ...prev,
                    lastRecordedAsset: `${numericValue}`,
                    yearlyAssets: newYearly
                };
            });
            return;
        }

        setForm(prev => ({
            ...prev,
            [name]: type === 'number' ? Number(value) : value
        }));
    };

    const handleYearlyChange = (index: number, value: string) => {
        const numericValue = Number(value);
        setForm(prev => {
            const newYearly = [...prev.yearlyAssets];
            newYearly[index] = numericValue;
            
            if (index === 4) {
                return {
                    ...prev,
                    yearlyAssets: newYearly,
                    lastRecordedAsset: `${numericValue}`
                };
            }
            
            return { ...prev, yearlyAssets: newYearly };
        });
    };

    const handleSectorChange = (sector: string, value: string) => {
        const num = Number(value);
        setForm(prev => ({
            ...prev,
            sectors: { ...prev.sectors, [sector]: num }
        }));
    };

    const addProject = () => {
        setForm(prev => ({ ...prev, projects: [...prev.projects, ""] }));
    };

    const updateProject = (idx: number, val: string) => {
        setForm(prev => {
            const next = [...prev.projects];
            next[idx] = val;
            return { ...prev, projects: next };
        });
    };

    const removeProject = (idx: number) => {
        setForm(prev => ({ ...prev, projects: prev.projects.filter((_, i) => i !== idx) }));
    };

    const sectorTotal = SECTORS_LIST.reduce((acc, s) => acc + (form.sectors[s] || 0), 0);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/50 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] z-10">
                <div className="px-8 py-6 border-b border-slate-700/50 bg-slate-800/50 flex items-center justify-between shrink-0">
                    <h2 className="text-xl font-bold text-white">
                        {isEdit ? `Edit ${seat.seatName}` : 'Add New Seat'} 
                        <span className="ml-3 text-[10px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded">
                            {mode === 'assets' ? 'Asset Records' : 'Representative Profile'}
                        </span>
                    </h2>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-xl transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 overflow-y-auto custom-scrollbar flex-1">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Division</label>
                            <input name="division" required value={form.division} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium" placeholder="e.g. Dhaka Division" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Seat Name</label>
                                <input name="seatName" required value={form.seatName} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium" placeholder="e.g. Dhaka-1" disabled={isEdit} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">MP Name</label>
                                <input name="mpName" required value={form.mpName} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium" placeholder="Candidate name" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Political Party</label>
                            <input name="party" required value={form.party} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium" placeholder="e.g. Independent" />
                        </div>

                        <div className="space-y-2 mt-4 pt-6 border-t border-slate-700/50">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex justify-between items-center mb-2">
                                <span>Candidate Photo</span>
                                <span className="text-[10px] text-slate-500 lowercase font-normal">(Optional)</span>
                            </label>
                            
                            <div className="flex items-center gap-6 p-4 bg-slate-800/30 rounded-2xl border border-slate-700/50">
                                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-slate-700 bg-slate-900 flex-shrink-0">
                                    {(imageFile || seat?.candidateImage) ? (
                                        <img 
                                            src={imageFile ? URL.createObjectURL(imageFile) : (seat.candidateImage.startsWith('http') ? seat.candidateImage : `${import.meta.env.VITE_SERVER_URL || "http://localhost:5001"}${seat.candidateImage}`)} 
                                            alt="Preview" 
                                            className="w-full h-full object-cover" 
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs">No Photo</div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        onChange={(e) => setImageFile(e.target.files?.[0] || null)} 
                                        className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-indigo-500/10 file:text-indigo-400 hover:file:bg-indigo-500/20 file:transition-colors file:cursor-pointer" 
                                    />
                                    <p className="text-[10px] text-slate-500 mt-2">Upload a professional portrait (JPG, PNG). Max 5MB.</p>
                                </div>
                            </div>
                        </div>

                        {mode === 'assets' && (
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Last Recorded Asset (Display Text)</label>
                                        <input name="lastRecordedAsset" value={form.lastRecordedAsset} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white font-mono focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" placeholder="e.g. 5.5 Crore BDT" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Growth (%) - Auto Calculated</label>
                                        <input name="fiveYearGrowthPercentage" type="number" required value={form.fiveYearGrowthPercentage} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white font-mono focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" placeholder="e.g. -15 or 40" disabled />
                                    </div>
                                </div>

                                <div className="space-y-4 p-6 bg-slate-800/30 rounded-2xl border border-slate-700/50">
                                    <label className="text-xs font-bold uppercase tracking-wider text-indigo-400">5-Year Asset History (Numeric for Chart)</label>
                                    <div className="grid grid-cols-5 gap-2">
                                        {[1, 2, 3, 4, 5].map((year, idx) => (
                                            <div key={year} className="space-y-1">
                                                <label className="text-[10px] text-slate-500 uppercase font-black text-center block">Year {year}</label>
                                                <input
                                                    type="number"
                                                    value={form.yearlyAssets[idx]}
                                                    onChange={(e) => handleYearlyChange(idx, e.target.value)}
                                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-2 text-white font-mono text-sm text-center focus:outline-none focus:border-indigo-500"
                                                    placeholder="0"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        {mode === 'profile' && (
                            <>
                                {/* --- BUDGET & SECTORS SECTION --- */}
                                <div className="pt-6 border-t border-slate-700/50 space-y-8">
                                    <div className="flex items-center gap-3">
                                        <Landmark className="w-5 h-5 text-indigo-400" />
                                        <h3 className="text-lg font-bold text-white tracking-tight">Financial Allocation</h3>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Allocated Budget (%)</label>
                                        <input type="number" name="budgetAllocation" value={form.budgetAllocation} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white font-mono focus:outline-none focus:border-indigo-500 transition-all" placeholder="e.g. 85" min="0" max="100" />
                                    </div>

                                    <div className="space-y-4 p-6 bg-slate-800/30 rounded-2xl border border-slate-700/50">
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="text-xs font-bold uppercase tracking-wider text-indigo-400">Sector Breakdown (%)</label>
                                            <div className={`px-2 py-1 rounded text-[10px] font-black ${sectorTotal === 100 ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                                Running Total: {sectorTotal}%
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            {SECTORS_LIST.map((sector) => (
                                                <div key={sector} className="space-y-1">
                                                    <label className="text-[10px] text-slate-500 uppercase font-black">{sector}</label>
                                                    <input
                                                        type="number"
                                                        value={form.sectors[sector] || 0}
                                                        onChange={(e) => handleSectorChange(sector, e.target.value)}
                                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-indigo-500"
                                                        placeholder="0"
                                                        min="0"
                                                        max="100"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                        {sectorTotal !== 100 && (
                                            <p className="text-[10px] text-amber-500/70 italic mt-2 text-center">Note: Percentages should Ideally sum to 100% for the pie chart to be accurate.</p>
                                        )}
                                    </div>
                                </div>

                                {/* --- PRIORITY PROJECTS SECTION --- */}
                                <div className="pt-6 border-t border-slate-700/50 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Target className="w-5 h-5 text-emerald-400" />
                                            <h3 className="text-lg font-bold text-white tracking-tight">Priority Projects</h3>
                                        </div>
                                        <button type="button" onClick={addProject} className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20 transition-all">
                                            <Plus className="w-3 h-3" /> Add Project
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        {form.projects.map((project, idx) => (
                                            <div key={idx} className="flex gap-2 group">
                                                <div className="flex-1 relative">
                                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-600">{idx + 1}</span>
                                                    <input
                                                        value={project}
                                                        onChange={(e) => updateProject(idx, e.target.value)}
                                                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-8 pr-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500 transition-all"
                                                        placeholder="Describe project goal..."
                                                    />
                                                </div>
                                                <button type="button" onClick={() => removeProject(idx)} className="p-3 bg-slate-800 text-slate-500 hover:text-rose-400 hover:bg-rose-400/10 rounded-xl transition-all">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                        {form.projects.length === 0 && (
                                            <div className="py-8 border-2 border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center text-slate-600">
                                                <Target className="w-8 h-8 mb-2 opacity-20" />
                                                <p className="text-xs font-medium uppercase tracking-widest opacity-40">No projects added yet</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {error && (
                        <div className="mt-6 mb-2 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex gap-3 text-rose-400 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="mt-8 flex items-center justify-end gap-4 pt-6 border-t border-slate-700/50">
                        <button type="button" onClick={onClose} className="px-5 py-3 rounded-xl font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors">Cancel</button>
                        <button type="submit" disabled={loading} className="px-5 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2">
                            {loading ? "Saving..." : isEdit ? "Update Seat Data" : "Publish Seat Data"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

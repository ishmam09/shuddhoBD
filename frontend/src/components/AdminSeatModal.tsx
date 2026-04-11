import { useState, useEffect } from "react";
import { X, Search } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5001/api`;

export default function AdminSeatModal({ seat, onClose, onSaved }: { seat?: any, onClose: () => void, onSaved: () => void }) {
    const isEdit = !!seat;

    const [form, setForm] = useState({
        division: "",
        seatName: "",
        mpName: "",
        party: "",
        lastRecordedAsset: "N/A",
        fiveYearBackAsset: "",
        fiveYearGrowthPercentage: 0,
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
            });
        }
        setImageFile(null);
    }, [seat]);

    // Auto-calculate growth percentage
    useEffect(() => {
        if (form.lastRecordedAsset && form.fiveYearBackAsset) {
            const currentMatch = form.lastRecordedAsset.match(/[\d.]+/);
            const pastMatch = form.fiveYearBackAsset.match(/[\d.]+/);

            if (currentMatch && pastMatch) {
                const currentNum = parseFloat(currentMatch[0]);
                const pastNum = parseFloat(pastMatch[0]);

                if (pastNum > 0) {
                    const growth = ((currentNum - pastNum) / pastNum) * 100;
                    setForm(prev => ({
                        ...prev,
                        fiveYearGrowthPercentage: parseFloat(growth.toFixed(2))
                    }));
                }
            }
        }
    }, [form.lastRecordedAsset, form.fiveYearBackAsset]);

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
        setForm(prev => ({
            ...prev,
            [name]: type === 'number' ? Number(value) : value
        }));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/50 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] z-10">
                <div className="px-8 py-6 border-b border-slate-700/50 bg-slate-800/50 flex items-center justify-between shrink-0">
                    <h2 className="text-xl font-bold text-white">{isEdit ? `Edit ${seat.seatName}` : 'Add New Seat'}</h2>
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

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Last Recorded Asset</label>
                                <input name="lastRecordedAsset" value={form.lastRecordedAsset} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white font-mono focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" placeholder="e.g. 5.5 Crore BDT" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-rose-400 flex items-center gap-1.5 bg-rose-500/10 px-2 py-1 rounded-md w-fit">Asset 5 Years Back (Private)</label>
                                <input name="fiveYearBackAsset" value={form.fiveYearBackAsset} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white font-mono focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" placeholder="Only visible to Admins" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Growth (%)</label>
                            <input name="fiveYearGrowthPercentage" type="number" required value={form.fiveYearGrowthPercentage} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white font-mono focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" placeholder="e.g. -15 or 40" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex justify-between">
                                <span>Candidate Photo</span>
                                <span className="text-[10px] text-slate-500 lowercase font-normal">(Optional)</span>
                            </label>
                            <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="w-full text-sm text-slate-400 file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-500/10 file:text-indigo-400 hover:file:bg-indigo-500/20 file:transition-colors file:cursor-pointer bg-slate-800/50 border border-slate-700 rounded-xl relative z-10" />
                        </div>
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

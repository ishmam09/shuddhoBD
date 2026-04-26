import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Target, Landmark, PieChart, Shield, ChevronDown, ChevronUp, Camera, User, Edit } from 'lucide-react';
import { constituenciesData } from '../data/constituencies';
import { useAuth } from '../context/AuthContext';
import AdminSeatModal from '../components/AdminSeatModal';

export default function RepresentativeProfile() {
    const { seatId } = useParams();
    const navigate = useNavigate();

    const { user } = useAuth();
    const [dbSeat, setDbSeat] = useState<any>(null);
    const [ctiData, setCtiData] = useState<any>(null);
    const [actualProjects, setActualProjects] = useState<any[]>([]);
    const [showCtiDetails, setShowCtiDetails] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isDownloading, setIsDownloading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const fetchData = async () => {
        try {
            const API_BASE = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5001/api`;

            // Fetch Seat Info
            const seatRes = await fetch(`${API_BASE}/seats`, { credentials: "include" });
            const seatData = await seatRes.json();
            const matched = seatData.find((s: any) => s.order === Number(seatId));
            setDbSeat(matched);

            // Fetch CTI Score
            const ctiRes = await fetch(`${API_BASE}/reports/cti/${seatId}`, { credentials: "include" });
            const cti = await ctiRes.json();
            if (ctiRes.ok) setCtiData(cti);

            // Fetch actual projects for this seat
            const projRes = await fetch(`${API_BASE}/projects`);
            if (projRes.ok) {
                const allProj = await projRes.json();
                setActualProjects(allProj.filter((p: any) => p.seatId === Number(seatId)));
            }

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [seatId]);

    const handleDownloadAudit = async () => {
        try {
            setIsDownloading(true);

            const response = await fetch(`/api/audit/pdf/${seatId}`);

            if (!response.ok) {
                throw new Error('Failed to generate PDF');
            }

            // Get raw binary blob — do NOT call response.json()
            const blob = await response.blob();

            // Create a temporary URL and trigger download
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'CivicAudit.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.error('Download failed:', error);
            alert('Could not download PDF. Please try again.');
        } finally {
            setIsDownloading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !dbSeat) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('image', file);

            const API_BASE = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5001/api`;
            const res = await fetch(`${API_BASE}/seats/${dbSeat._id}/image`, {
                method: 'POST',
                credentials: 'include',
                body: formData
            });

            if (res.ok) {
                const data = await res.json();
                setDbSeat((prev: any) => ({ ...prev, candidateImage: data.candidateImage }));
            } else {
                alert("Failed to upload image. Please try again.");
            }
        } catch (err) {
            console.error("Upload Error:", err);
            alert("An error occurred during upload.");
        } finally {
            setUploading(false);
        }
    };

    const seat = constituenciesData.find(s => s.seatId === Number(seatId));

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px] text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-shuddho-neon mb-4"></div>
                <p className="text-slate-400">Loading representative database profiles...</p>
            </div>
        );
    }

    if (!seat || !dbSeat) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px] text-white space-y-4">
                <h1 className="text-2xl font-bold">Constituency Not Found</h1>
                <button onClick={() => navigate('/dashboard/constituency')} className="text-shuddho-neon hover:underline">
                    Return to Map
                </button>
            </div>
        );
    }

    const rep = seat.representative;
    // Prefer database values if they exist, otherwise fallback to mock data
    const budgetAllocation = dbSeat?.budgetAllocation || rep.budgetAllocation;
    const sectors = (dbSeat?.sectors && Object.keys(dbSeat.sectors).length > 0) ? dbSeat.sectors : rep.sectors;
    const { experience } = rep;

    // Fixed color mapping for the 8 sectors
    const sectorColors = [
        "#3b82f6", // Public Services (Blue)
        "#8b5cf6", // Interest Payments (Violet)
        "#10b981", // Education & Tech (Emerald)
        "#f59e0b", // Transport (Amber)
        "#eab308", // Agriculture (Yellow)
        "#ec4899", // Social Security (Pink)
        "#ef4444", // Health (Red)
        "#64748b"  // Defense (Slate)
    ];

    // Generate conic-gradient string for 8 sectors dynamically
    const sectorEntries = Object.entries(sectors) as [string, number][];
    let cumulativePercent = 0;
    const gradientStops = sectorEntries.map(([_, value], idx) => {
        const start = cumulativePercent;
        cumulativePercent += value;
        const color = sectorColors[idx % sectorColors.length];
        return `${color} ${start}% ${cumulativePercent}%`;
    }).join(", ");

    const pieStyle = {
        background: `conic-gradient(${gradientStops})`
    };

    return (
        <div className="max-w-6xl mx-auto space-y-4 animate-fade-in pl-4 pr-8 pb-12">
            {/* Nav Back Header */}
            <button
                onClick={() => navigate('/dashboard/constituency')}
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-2 group"
            >
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-shuddho-neon/20 group-hover:text-shuddho-neon transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                </div>
                Return to Constituencies Map
            </button>

            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold text-white">Constituency Overview</h1>
                    <div className="flex items-center gap-2 text-shuddho-neon font-medium text-sm bg-shuddho-neon/10 px-3 py-1 rounded-full border border-shuddho-neon/20">
                        <MapPin className="w-4 h-4" />
                        <span>{dbSeat?.seatName || seat.name}</span>
                        <span className="text-slate-400 font-mono scale-90 ml-1">(Seat #{dbSeat?.order || seat.seatId})</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleDownloadAudit}
                        disabled={isDownloading}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg disabled:opacity-50"
                    >
                        {isDownloading ? 'Generating PDF...' : 'Download Civic Audit'}
                    </button>

                    {user?.role === 'admin' && (
                        <button
                            onClick={() => setIsEditModalOpen(true)}
                            className="btn-primary flex items-center gap-2 py-2 px-4 rounded-xl text-sm"
                        >
                            <Edit className="w-4 h-4" />
                            Edit Representative
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* SMALLER PROFILE CARD (LEFT) */}
                <div className="lg:col-span-1">
                    <div className="bg-shuddho-card border border-shuddho-neon/20 shadow-xl rounded-3xl overflow-hidden shadow-shuddho-neon/5 sticky top-24">

                        {/* Background Party Header Color */}
                        <div
                            className="h-24 w-full relative"
                            style={{ backgroundColor: rep.party.color }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-t from-shuddho-card to-transparent" />
                        </div>

                        <div className="px-6 pb-8 relative flex flex-col items-center text-center">

                            {/* Floating Avatar */}
                            <div className="-mt-16 z-10 mb-4 relative group">
                                <div
                                    className="bg-shuddho-bg p-1.5 rounded-full border-4 shadow-lg inline-block relative overflow-hidden"
                                    style={{ borderColor: rep.party.color }}
                                >
                                    {dbSeat?.candidateImage ? (
                                        <img
                                            src={dbSeat.candidateImage.startsWith('http') ? dbSeat.candidateImage : `${import.meta.env.VITE_SERVER_URL || "http://localhost:5001"}${dbSeat.candidateImage}`}
                                            alt={dbSeat?.mpName || rep.name}
                                            className="w-24 h-24 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center">
                                            <User className="w-12 h-12 text-slate-600" />
                                        </div>
                                    )}

                                    {/* Admin Upload Overlay */}
                                    {user?.role === 'admin' && (
                                        <label className={`absolute inset-0 bg-black/60 flex flex-col items-center justify-center cursor-pointer transition-opacity ${dbSeat?.candidateImage ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}>
                                            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                                            <Camera className={`w-6 h-6 text-white ${uploading ? 'animate-pulse' : ''}`} />
                                            <span className="text-[8px] font-bold text-white uppercase tracking-wider mt-1">
                                                {uploading ? 'Wait...' : 'Upload'}
                                            </span>
                                        </label>
                                    )}
                                </div>
                            </div>

                            {/* Info */}
                            <h2 className="text-xl font-bold text-white mb-6">{dbSeat?.mpName || rep.name}</h2>

                            <div className="w-full bg-slate-800/40 p-4 rounded-2xl border border-slate-700/50 mb-0 relative overflow-hidden group">
                                <div
                                    className="absolute inset-0 opacity-10 transition-opacity group-hover:opacity-20"
                                    style={{ backgroundColor: rep.party.color }}
                                />
                                {dbSeat?.partyLogo ? (
                                    <div className="w-12 h-12 mx-auto mb-2 drop-shadow-md rounded-full bg-white/10 p-1 flex items-center justify-center">
                                        <img src={dbSeat.partyLogo} alt={dbSeat.party} className="w-full h-full object-contain" />
                                    </div>
                                ) : (
                                    <div className="text-4xl mb-2 drop-shadow-md">{rep.party.symbol}</div>
                                )}
                                <p className="font-bold text-white">
                                    {dbSeat?.party || rep.party.name}
                                </p>
                            </div>

                            {/* Civic Trust Index (CTI) Widget */}
                            {ctiData && (
                                <div className="w-full mt-4 bg-slate-900 border border-slate-700/50 rounded-2xl p-5 shadow-inner relative overflow-hidden group">
                                    {/* Background decorative shield icon */}
                                    <Shield className={`absolute -right-4 -bottom-4 w-24 h-24 opacity-5 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-12 ${ctiData.status === 'Good' ? 'text-green-500' :
                                            ctiData.status === 'Moderate' ? 'text-amber-500' : 'text-red-500'
                                        }`} />

                                    <div className="relative z-10">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${ctiData.status === 'Good' ? 'bg-green-500/20 text-green-400' :
                                                        ctiData.status === 'Moderate' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'
                                                    }`}>
                                                    <Shield className="w-4 h-4" />
                                                </div>
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Civic Trust Index</span>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${ctiData.status === 'Good' ? 'text-green-500' :
                                                        ctiData.status === 'Moderate' ? 'text-amber-500' : 'text-red-500'
                                                    }`}>
                                                    {ctiData.status}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-baseline gap-1 mb-1">
                                            <span className="text-4xl font-black text-white tracking-tighter">
                                                {ctiData.score}
                                            </span>
                                            <span className="text-slate-500 text-xs font-bold uppercase">/ 100</span>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mb-4">
                                            <div
                                                className={`h-full transition-all duration-1000 ease-out ${ctiData.status === 'Good' ? 'bg-green-500' :
                                                        ctiData.status === 'Moderate' ? 'bg-amber-500' : 'bg-red-500'
                                                    }`}
                                                style={{ width: `${ctiData.score}%` }}
                                            />
                                        </div>



                                        {/* Dropdown / Expandable Section */}
                                        <div className="mt-4 pt-4 border-t border-slate-800">
                                            <button
                                                onClick={() => setShowCtiDetails(!showCtiDetails)}
                                                className="w-full flex items-center justify-between text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-widest"
                                            >
                                                Detailed Analysis
                                                {showCtiDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                            </button>

                                            {showCtiDetails && (
                                                <div className="mt-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                                    <div className="flex items-start gap-3 p-2 bg-slate-800/30 rounded-lg">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                                                        <p className="text-[11px] text-slate-300 leading-tight">
                                                            <span className="font-bold text-white">"{ctiData.breakdown.total}"</span> complaints are submitted
                                                        </p>
                                                    </div>
                                                    <div className="flex items-start gap-3 p-2 bg-slate-800/30 rounded-lg">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                                                        <p className="text-[11px] text-slate-300 leading-tight">
                                                            <span className="font-bold text-white">"{ctiData.breakdown.solved}"</span> Resolved Problems
                                                        </p>
                                                    </div>
                                                    <div className="flex items-start gap-3 p-2 bg-slate-800/30 rounded-lg">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                                                        <p className="text-[11px] text-slate-300 leading-tight">
                                                            <span className="font-bold text-white">"{ctiData.breakdown.ongoing}"</span> Reports are Ongoing
                                                        </p>
                                                    </div>
                                                    <div className="flex items-start gap-3 p-2 bg-slate-800/30 rounded-lg">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                                                        <p className="text-[11px] text-slate-300 leading-tight">
                                                            <span className="font-bold text-white">"{ctiData.breakdown.unresolved}"</span> Unsolved Reports
                                                        </p>
                                                    </div>
                                                    <div className="flex items-start gap-3 p-2 bg-slate-800/30 rounded-lg">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                                                        <p className="text-[11px] text-slate-300 leading-tight">
                                                            <span className="font-bold text-white">"{ctiData.breakdown.projectDelay} days"</span> average project delay
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Full Profile Bar removed to keep tile neat and purely overview focused as requested */}
                        </div>
                    </div>
                </div>

                {/* ANALYTICS SECTION (RIGHT) */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Linear Graph - Budget */}
                    <div className="bg-shuddho-card border border-slate-700/50 rounded-3xl p-6 shadow-xl">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                                <Landmark className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Allocated Budget</h3>
                                <p className="text-sm text-slate-400">Total yearly budget distribution progress</p>
                            </div>
                        </div>

                        <div className="mb-2 flex justify-between items-end">
                            <span className="text-2xl font-bold text-white tracking-tight">{budgetAllocation}%</span>
                            <span className="text-slate-400 text-sm font-medium">Allocated out of total fund</span>
                        </div>

                        {/* Linear Progress Bar */}
                        <div className="h-6 w-full bg-slate-800 rounded-full overflow-hidden shadow-inner border border-slate-700">
                            <div
                                className="h-full bg-gradient-to-r from-blue-600 to-blue-400 relative overflow-hidden transition-all duration-1000 ease-out"
                                style={{ width: `${budgetAllocation}%` }}
                            >
                                {/* Shimmer effect */}
                                <div className="absolute top-0 left-0 right-0 bottom-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[100%] animate-[shimmer_2s_infinite]" />
                            </div>
                        </div>
                    </div>

                    {/* Pie Chart - Sector Breakdown Details */}
                    <div className="bg-shuddho-card border border-slate-700/50 rounded-3xl p-6 shadow-xl">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                <PieChart className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Sector Breakdown</h3>
                                <p className="text-sm text-slate-400">Distribution of allocated budget by sector</p>
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row items-center gap-8">
                            {/* CSS Conic Gradient Pie Chart */}
                            <div className="relative w-56 h-56 rounded-full shadow-[0_0_30px_rgba(0,0,0,0.5)] border-4 border-slate-800 group shrink-0" style={pieStyle}>
                                {/* Overlay glow on hover */}
                                <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-5 transition-opacity" />
                            </div>

                            {/* Legend Grid - 8 items */}
                            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {sectorEntries.map(([name, value], idx) => (
                                    <div key={name} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800/80 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-4 h-4 rounded shadow-md"
                                                style={{ backgroundColor: sectorColors[idx % sectorColors.length] }}
                                            />
                                            <span className="text-white text-sm font-medium">{name}</span>
                                        </div>
                                        <span className="font-bold text-shuddho-neon">{value}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* PROJECTS LIST */}
                    <div className="bg-shuddho-card border border-slate-700/50 rounded-3xl p-6 shadow-xl">
                        <div className="flex items-center gap-3 mb-6 border-b border-slate-700/50 pb-4">
                            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                                <Target className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Projects</h3>
                                <p className="text-sm text-slate-400">Initiatives focused on by the representative ({actualProjects.length})</p>
                            </div>
                        </div>

                        {actualProjects.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {actualProjects.map((project: any, idx: number) => (
                                    <div
                                        key={project._id || idx}
                                        onClick={() => navigate('/dashboard/project-status', { state: { selectedProjectId: project._id } })}
                                        className="flex items-start gap-3 bg-slate-800/30 p-4 rounded-xl border border-slate-700/30 hover:border-shuddho-neon/50 cursor-pointer transition-colors group"
                                    >
                                        <div className="text-shuddho-neon font-bold opacity-50 bg-shuddho-neon/10 w-6 h-6 rounded flex items-center justify-center shrink-0">
                                            {idx + 1}
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <p className="text-slate-200 text-sm leading-snug group-hover:text-white transition-colors">
                                                {project.name}
                                            </p>
                                            <span className={`text-[10px] font-bold uppercase tracking-wider ${project.status === 'completed' ? 'text-emerald-400' :
                                                    project.status === 'in progress' ? 'text-shuddho-neon' :
                                                        project.status === 'on hold' ? 'text-amber-500' : 'text-blue-400'
                                                }`}>
                                                {project.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 bg-slate-800/20 rounded-xl border border-slate-700/30 border-dashed">
                                <p className="text-slate-400 italic">No projects allotted yet.</p>
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {isEditModalOpen && (
                <AdminSeatModal
                    seat={dbSeat}
                    onClose={() => setIsEditModalOpen(false)}
                    onSaved={() => {
                        setIsEditModalOpen(false);
                        fetchData();
                    }}
                    mode="profile"
                />
            )}
        </div>
    );
}

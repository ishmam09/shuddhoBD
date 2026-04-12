import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, MapPin, Target, Landmark, PieChart } from 'lucide-react';
import { constituenciesData } from '../data/constituencies';

export default function RepresentativeProfile() {
    const { seatId } = useParams();
    const navigate = useNavigate();

    const seat = constituenciesData.find(s => s.seatId === Number(seatId));

    if (!seat) {
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
    // @ts-ignore
    const { experience, budgetAllocation, sectors, projects } = rep;

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

            <div className="flex items-center gap-3 mb-6">
                <h1 className="text-3xl font-bold text-white">Constituency Overview</h1>
                <div className="flex items-center gap-2 text-shuddho-neon font-medium text-sm bg-shuddho-neon/10 px-3 py-1 rounded-full border border-shuddho-neon/20">
                    <MapPin className="w-4 h-4" />
                    <span>{seat.name}</span>
                    <span className="text-slate-400 font-mono scale-90 ml-1">(Seat #{seat.seatId})</span>
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
                            <div className="-mt-16 z-10 mb-4">
                                <div
                                    className="bg-shuddho-bg p-1.5 rounded-full border-4 shadow-lg inline-block"
                                    style={{ borderColor: rep.party.color }}
                                >
                                    <img
                                        src={rep.photo}
                                        alt={rep.name}
                                        className="w-24 h-24 rounded-full object-cover"
                                    />
                                </div>
                            </div>

                            {/* Info */}
                            <h2 className="text-xl font-bold text-white mb-1">{rep.name}</h2>
                            <div className="flex items-center justify-center gap-2 text-emerald-400 text-sm mb-4">
                                <span className="font-semibold">{experience} Years of Experience</span>
                            </div>

                            <div className="w-full bg-slate-800/40 p-4 rounded-2xl border border-slate-700/50 mb-6 relative overflow-hidden group">
                                <div
                                    className="absolute inset-0 opacity-10 transition-opacity group-hover:opacity-20"
                                    style={{ backgroundColor: rep.party.color }}
                                />
                                <div className="text-4xl mb-2 drop-shadow-md">{rep.party.symbol}</div>
                                <p className="text-xs text-slate-400 mb-1">Political Affiliation</p>
                                <p className="font-bold text-white">
                                    {rep.party.name}
                                </p>
                            </div>

                            <div className="w-full flex gap-3">
                                <button className="flex-1 py-2.5 bg-shuddho-neon/10 text-shuddho-neon hover:bg-shuddho-neon/20 border border-shuddho-neon/30 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm font-semibold">
                                    <User className="w-4 h-4" /> Full Profile
                                </button>
                            </div>
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

                    {/* PRIORITY PROJECTS LIST */}
                    <div className="bg-shuddho-card border border-slate-700/50 rounded-3xl p-6 shadow-xl">
                        <div className="flex items-center gap-3 mb-6 border-b border-slate-700/50 pb-4">
                            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                                <Target className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Priority Projects</h3>
                                <p className="text-sm text-slate-400">Key initiatives focused on by the representative ({projects?.length || 0})</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {projects && projects.map((project: string, idx: number) => (
                                <div
                                    key={idx}
                                    className="flex items-start gap-3 bg-slate-800/30 p-4 rounded-xl border border-slate-700/30 hover:border-shuddho-neon/50 transition-colors group"
                                >
                                    <div className="text-shuddho-neon font-bold opacity-50 bg-shuddho-neon/10 w-6 h-6 rounded flex items-center justify-center shrink-0">
                                        {idx + 1}
                                    </div>
                                    <p className="text-slate-200 text-sm leading-snug group-hover:text-white transition-colors">
                                        {project}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>

        </div>
    );
}

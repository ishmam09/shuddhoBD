import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, UserSquare2 } from 'lucide-react';

export default function Constituency() {
    const [hoveredSeat, setHoveredSeat] = useState<any>(null);
    const [realSeats, setRealSeats] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSeats = async () => {
            try {
                const API_BASE = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5001/api`;
                const res = await fetch(`${API_BASE}/seats`, { credentials: "include" });
                const data = await res.json();
                setRealSeats(data.sort((a: any, b: any) => a.order - b.order));
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchSeats();
    }, []);

    // Hemicycle configuration
    const rows = 10;
    const centerX = 500;
    const centerY = 450;
    const baseRadius = 120;
    const rowGap = 34;

    const rowRadii = Array.from({ length: rows }, (_, i) => baseRadius + i * rowGap);
    const rowLengths = rowRadii.map(r => r * Math.PI);
    const totalLength = rowLengths.reduce((a, b) => a + b, 0);

    const seatDistribution = rowLengths.map(l => Math.round((l / totalLength) * 300));

    let diff = 300 - seatDistribution.reduce((a, b) => a + b, 0);
    while (diff !== 0) {
        if (diff > 0) {
            seatDistribution[seatDistribution.length - 1]++;
            diff--;
        } else {
            seatDistribution[seatDistribution.length - 1]--;
            diff++;
        }
    }

    const seatPositions: { x: number, y: number, data: any }[] = [];
    let seatIndex = 0;

    seatDistribution.forEach((numSeatsInRow, rowIndex) => {
        const R = rowRadii[rowIndex];
        for (let i = 1; i <= numSeatsInRow; i++) {
            const angle = Math.PI - (i / (numSeatsInRow + 1)) * Math.PI;
            const x = centerX + R * Math.cos(angle);
            const y = centerY - R * Math.sin(angle);
            if (seatIndex < 300) {
                seatPositions.push({
                    x, y, data: realSeats[seatIndex]
                });
                seatIndex++;
            }
        }
    });

    const handleSeatClick = (seat: any) => {
        if (!seat) return;
        navigate(`/dashboard/constituency/${seat.order}`);
    };

    const getPartyColor = (party: string) => {
        if (!party) return "#64748b";
        if (party === "Bangladesh Nationalist Party") return "#2563eb";
        if (party === "Bangladesh Jamaat-e-Islami") return "#16a34a";
        if (party === "National Citizen Party") return "#f59e0b";
        if (party === "Bangladesh Jatiya Party") return "#eab308";
        if (party === "Ganosanhati Andolan") return "#ec4899";
        return "#64748b"; // Independent / Default
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px] text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-shuddho-neon mb-4"></div>
                <p className="text-slate-400">Loading Parliament Matrix...</p>
            </div>
        );
    }

    return (
        <div className="flex gap-8 relative pb-20 max-w-7xl mx-auto w-full">
            <div className="flex-1 w-full relative">
                <header className="mb-8 text-center md:text-left">
                    <h1 className="text-4xl font-bold text-white mb-2">Jatiya Sangsad Configuration</h1>
                    <p className="text-slate-400">
                        Interactive view of all 300 parliamentary constituencies. Hover to see seat information, <span className="text-shuddho-neon">click a seat</span> to view representative details.
                    </p>
                </header>

                <div className="bg-shuddho-card border border-shuddho-border rounded-xl p-8 shadow-xl relative overflow-hidden flex flex-col items-center justify-center w-full">
                    <div className="mb-8 text-center">
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-shuddho-neon to-emerald-400 bg-clip-text text-transparent">300 Seats</h2>
                    </div>

                    <div className="relative w-full max-w-[1200px] aspect-[2/1] mb-8">
                        <svg viewBox="0 0 1000 500" className="w-full h-full drop-shadow-2xl">
                            <path d="M 440 460 L 560 460 L 540 420 L 460 420 Z" fill="#1e293b" stroke="#334155" strokeWidth="2" />
                            <circle cx="500" cy="405" r="10" fill="#64748b" />

                            {seatPositions.map((pos, i) => {
                                const isHovered = hoveredSeat?.order === pos.data?.order;
                                return (
                                    <g
                                        key={i}
                                        className="transition-all duration-300 cursor-pointer group"
                                        onMouseEnter={() => setHoveredSeat(pos.data)}
                                        onMouseLeave={() => setHoveredSeat(null)}
                                        onClick={() => handleSeatClick(pos.data)}
                                    >
                                        <circle
                                            cx={pos.x}
                                            cy={pos.y}
                                            r={isHovered ? "15" : "13"}
                                            fill={isHovered ? getPartyColor(pos.data?.party) : "#334155"}
                                            stroke={isHovered ? "#fff" : "#1e293b"}
                                            strokeWidth="2"
                                            className="transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                                        />
                                        <text
                                            x={pos.x}
                                            y={pos.y}
                                            textAnchor="middle"
                                            dominantBaseline="central"
                                            className="text-[10px] fill-white pointer-events-none font-bold transition-all"
                                            style={{ fontSize: isHovered ? "12px" : "10px" }}
                                        >
                                            {pos.data?.order}
                                        </text>
                                    </g>
                                );
                            })}
                        </svg>

                        {/* Enhanced Tooltip map overlay */}
                        {hoveredSeat && (
                            <div className="absolute top-4 right-4 bg-slate-800 border border-slate-700 p-4 rounded-xl shadow-2xl glassmorphism z-10 w-72 pointer-events-none transform transition-all duration-200 anime-fade-in flex flex-col gap-4">

                                <div className="flex items-center justify-between border-b border-slate-700/50 pb-3">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-shuddho-neon" />
                                        <p className="text-sm font-bold text-white uppercase tracking-widest bg-slate-700/50 px-2 py-0.5 rounded-md">{hoveredSeat.division}</p>
                                    </div>
                                    <span className="font-mono text-shuddho-neon font-semibold px-2 py-1 bg-shuddho-neon/10 rounded">#{hoveredSeat.order}</span>
                                </div>

                                <div className="flex flex-col gap-0.5">
                                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Constituency Name</p>
                                    <p className="text-xl font-black text-white bg-gradient-to-r from-shuddho-neon to-indigo-400 bg-clip-text text-transparent">{hoveredSeat.seatName}</p>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full border-2 border-indigo-500/30 bg-slate-700 shrink-0 overflow-hidden shadow-lg shadow-indigo-500/20">
                                        {hoveredSeat.candidateImage ? (
                                            <img src={hoveredSeat.candidateImage.startsWith('http') ? hoveredSeat.candidateImage : `${import.meta.env.VITE_SERVER_URL || "http://localhost:5001"}${hoveredSeat.candidateImage}`} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-800">
                                                <UserSquare2 className="w-6 h-6 text-slate-400" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Representative</p>
                                        <p className="text-base font-bold text-white truncate">{hoveredSeat.mpName}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 w-full bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/30">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shrink-0 flex items-center justify-center overflow-hidden shadow-inner ring-1 ring-slate-700">
                                        {hoveredSeat.partyLogo ? (
                                            <img src={hoveredSeat.partyLogo} className="w-full h-full object-cover bg-white" />
                                        ) : hoveredSeat.party?.replace(/\s+/g, '').toLowerCase() === 'khelafatmajlish' ? (
                                            <img src="/KhelafatMajlish.png" className="w-full h-full object-cover bg-white" />
                                        ) : (
                                            <span className="text-sm font-black text-white">{hoveredSeat.party?.substring(0, 2).toUpperCase()}</span>
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[9px] text-slate-500 uppercase tracking-widest font-black">Political Party</p>
                                        <p className="text-xs font-bold text-slate-200 truncate pr-2">{hoveredSeat.party}</p>
                                    </div>
                                </div>

                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

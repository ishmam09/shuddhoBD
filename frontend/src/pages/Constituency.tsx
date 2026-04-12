import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { constituenciesData } from '../data/constituencies';

export default function Constituency() {
    const [hoveredSeat, setHoveredSeat] = useState<any>(null);
    const navigate = useNavigate();

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
            // angle from left (PI) to right (0)
            const angle = Math.PI - (i / (numSeatsInRow + 1)) * Math.PI;
            const x = centerX + R * Math.cos(angle);
            const y = centerY - R * Math.sin(angle);
            if (seatIndex < 300) {
                seatPositions.push({
                    x, y, data: constituenciesData[seatIndex]
                });
                seatIndex++;
            }
        }
    });

    const handleSeatClick = (seat: any) => {
        navigate(`/dashboard/constituency/${seat.seatId}`);
    };

    return (
        <div className="flex gap-8 relative pb-20 max-w-7xl mx-auto w-full">

            {/* Main Area config */}
            <div className="flex-1 w-full relative">
                <header className="mb-8 text-center md:text-left">
                    <h1 className="text-4xl font-bold text-white mb-2">Jatiya Sangsad Configuration</h1>
                    <p className="text-slate-400">
                        Interactive view of all 300 parliamentary constituencies. Hover to see seat information, <span className="text-shuddho-neon">click a seat</span> to view representative details.
                    </p>
                </header>

                <div className="bg-shuddho-card border border-shuddho-border rounded-xl p-8 shadow-xl relative overflow-hidden flex flex-col items-center justify-center w-full">

                    {/* Information Header on the chart */}
                    <div className="mb-8 text-center">
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-shuddho-neon to-emerald-400 bg-clip-text text-transparent">300 Seats</h2>
                    </div>

                    {/* Hemicycle SVG Container */}
                    <div className="relative w-full max-w-[1200px] aspect-[2/1] mb-8">
                        <svg viewBox="0 0 1000 500" className="w-full h-full drop-shadow-2xl">
                            {/* Parliament speaker desk graphic at center */}
                            <path d="M 440 460 L 560 460 L 540 420 L 460 420 Z" fill="#1e293b" stroke="#334155" strokeWidth="2" />
                            <circle cx="500" cy="405" r="10" fill="#64748b" />

                            {/* Render all exactly 300 seats */}
                            {seatPositions.map((pos, i) => {
                                const isHovered = hoveredSeat?.seatId === pos.data.seatId;

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
                                            fill={isHovered ? pos.data.representative.party.color : "#334155"}
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
                                            {pos.data.seatId}
                                        </text>
                                    </g>
                                );
                            })}
                        </svg>

                        {/* Tooltip map overlay */}
                        {hoveredSeat && (
                            <div className="absolute top-4 right-4 bg-slate-800 border border-slate-700 p-4 rounded-xl shadow-2xl glassmorphism z-10 w-64 pointer-events-none transform transition-all duration-200 anime-fade-in">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 rounded-full bg-shuddho-neon/20 flex items-center justify-center">
                                        <MapPin className="w-5 h-5 text-shuddho-neon" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 uppercase tracking-wider">Constituency</p>
                                        <p className="text-lg font-bold text-white">{hoveredSeat.name}</p>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-slate-700 flex justify-between items-center text-sm">
                                    <span className="text-slate-400">Seat Number</span>
                                    <span className="font-mono text-shuddho-neon font-semibold px-2 py-1 bg-shuddho-neon/10 rounded">#{hoveredSeat.seatId}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

import { X, TrendingUp, TrendingDown } from "lucide-react";
import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

interface AssetGrowthModalProps {
    seat: any;
    onClose: () => void;
}

export default function AssetGrowthModal({ seat, onClose }: AssetGrowthModalProps) {
    const growthPercent = seat.fiveYearGrowthPercentage || 0;
    const isPositive = growthPercent >= 0;
    
    // Fallback if yearlyAssets is missing or not 5 items
    const yearlyAssets = seat.yearlyAssets && seat.yearlyAssets.length === 5 
        ? seat.yearlyAssets 
        : [0, 0, 0, 0, 0];

    const textSuffix = "৳";

    // Beautiful Pastel Colors
    const pastelColors = [
        'rgba(255, 179, 186, 0.8)', // Pastel Pink
        'rgba(255, 223, 186, 0.8)', // Pastel Peach
        'rgba(255, 255, 186, 0.8)', // Pastel Yellow
        'rgba(186, 255, 201, 0.8)', // Pastel Mint
        'rgba(186, 225, 255, 0.8)'  // Pastel Blue
    ];

    const borderColors = [
        'rgba(255, 107, 129, 1)',
        'rgba(255, 159, 67, 1)',
        'rgba(254, 202, 87, 1)',
        'rgba(29, 209, 161, 1)',
        'rgba(84, 160, 255, 1)'
    ];

    const data = {
        labels: ["Year 1", "Year 2", "Year 3", "Year 4", "Present"],
        datasets: [
            {
                label: "Asset Evaluation",
                data: yearlyAssets,
                backgroundColor: pastelColors,
                borderColor: borderColors,
                borderWidth: 2,
                borderRadius: 12,
                borderSkipped: false,
                hoverBackgroundColor: borderColors,
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                titleColor: '#94a3b8',
                bodyColor: '#ffffff',
                borderColor: 'rgba(51, 65, 85, 0.5)',
                borderWidth: 1,
                padding: 12,
                cornerRadius: 12,
                displayColors: true,
                callbacks: {
                    label: function(context: any) {
                        return ` Value: ${context.parsed.y} ${textSuffix}`;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(51, 65, 85, 0.3)',
                    drawBorder: false,
                },
                ticks: {
                    color: '#94a3b8',
                    font: {
                        family: "'Inter', sans-serif"
                    },
                    callback: function(value: any) {
                        return `${value} ${textSuffix}`;
                    }
                }
            },
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    color: '#ffffff',
                    font: {
                        weight: 'bold' as const,
                        family: "'Inter', sans-serif"
                    }
                }
            }
        },
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
            <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/50 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden z-10 transition-all duration-300">
                <div className="px-8 py-6 border-b border-slate-700/50 bg-slate-800/80 backdrop-blur-xl flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black text-white">5-Year Asset Trajectory</h2>
                        <p className="text-sm font-medium text-slate-400 mt-1">{seat.mpName} • {seat.seatName}</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-xl transition-colors cursor-pointer bg-slate-800 border border-slate-700 hover:border-slate-600 shadow-md">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-8">
                    <div className="flex flex-col md:flex-row gap-6 mb-8 items-center bg-slate-800/30 p-6 rounded-2xl border border-slate-700/50">
                        <div className="flex-1 text-center md:text-left">
                            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">Growth Metric (Year 1 vs Present)</p>
                            <div className="flex items-center justify-center md:justify-start gap-3">
                                {isPositive ? (
                                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                                        <TrendingUp className="w-5 h-5" />
                                    </div>
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                                        <TrendingDown className="w-5 h-5" />
                                    </div>
                                )}
                                <div>
                                    <span className={`text-4xl font-black ${isPositive ? 'text-emerald-400' : 'text-rose-400'} tracking-tighter drop-shadow-md`}>
                                        {isPositive ? '+' : ''}{growthPercent}%
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="h-px w-full md:h-16 md:w-px bg-slate-700"></div>

                        <div className="flex-1 text-center md:text-right">
                            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">Current Stated Value</p>
                            <p className="text-2xl font-mono font-bold text-white tracking-tight drop-shadow-md">
                                {seat.lastRecordedAsset}
                            </p>
                        </div>
                    </div>

                    <div className="h-80 w-full relative">
                        <Bar data={data} options={options} />
                    </div>
                </div>
            </div>
            
            {/* Ambient glow around the modal */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none -z-10`}></div>
        </div>
    );
}

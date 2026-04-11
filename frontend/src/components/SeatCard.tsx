import { TrendingUp, TrendingDown, Minus, Edit2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface SeatCardProps {
    seat: any;
    onEdit: (seat: any) => void;
}

export default function SeatCard({ seat, onEdit }: SeatCardProps) {
    const { user } = useAuth();
    const isGrowth = seat.fiveYearGrowthPercentage > 0;
    const isLoss = seat.fiveYearGrowthPercentage < 0;

    const resolvedPartyLogo = seat.partyLogo
        || (seat.party.replace(/\s+/g, '').toLowerCase() === 'khelafatmajlish' ? '/KhelafatMajlish.png' : null);

    return (
        <div className="bg-slate-800/80 rounded-3xl p-6 border border-slate-700/50 hover:border-indigo-500/40 hover:shadow-[0_8px_30px_rgb(99,102,241,0.15)] transition-all duration-300 group relative backdrop-blur-xl shrink-0 h-auto">
            {user?.role === 'admin' && (
                <button onClick={() => onEdit(seat)} className="absolute top-5 right-5 p-2 bg-slate-700/30 hover:bg-indigo-500 text-slate-300 hover:text-white rounded-xl transition-all opacity-0 group-hover:opacity-100 cursor-pointer shadow-lg z-20">
                    <Edit2 className="w-4 h-4" />
                </button>
            )}

            <div className="mb-5 relative z-10 flex justify-between items-center">
                <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-full border border-indigo-500/20">{seat.division}</span>
                    <h3 className="text-2xl font-extrabold text-white mt-4 mb-2">{seat.seatName}</h3>
                    <h4 className="text-sm font-semibold text-slate-300">{seat.mpName}</h4>
                </div>
                {seat.candidateImage && (
                    <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-indigo-500/50 shrink-0 ml-4 shadow-lg shadow-indigo-500/20">
                        <img src={seat.candidateImage} alt={seat.mpName} className="w-full h-full object-cover" />
                    </div>
                )}
            </div>

            <div className="flex items-center gap-4 mb-6 p-4 rounded-2xl bg-black/30 border border-slate-700/30 relative z-10">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 overflow-hidden shrink-0 flex items-center justify-center shadow-inner ring-2 ring-slate-800">
                    {resolvedPartyLogo ? (
                        <img src={resolvedPartyLogo} alt={seat.party} className="w-full h-full object-cover bg-white" />
                    ) : (
                        <span className="text-sm font-black text-white">{seat.party.substring(0, 2).toUpperCase()}</span>
                    )}
                </div>
                <div className="min-w-0">
                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Political Party</p>
                    <p className="text-sm font-bold text-white truncate pr-2">{seat.party}</p>
                </div>
            </div>

            <div className="space-y-5 relative z-10">
                <div className="bg-slate-900/40 p-4 rounded-2xl border border-slate-700/30">
                    <p className="text-[9px] uppercase font-bold text-slate-500 tracking-widest mb-1.5">Last Recorded Asset</p>
                    <p className="font-mono text-xl font-bold text-white tracking-tight">
                        {seat.lastRecordedAsset}
                        {!seat.lastRecordedAsset.includes('৳') && seat.lastRecordedAsset !== "N/A" && " ৳"}
                    </p>
                </div>

                <div>
                    <p className="text-[9px] uppercase font-bold text-slate-500 tracking-widest mb-2.5">5-Year Growth Trend</p>
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                            <span className={`text-2xl font-black ${isGrowth ? 'text-emerald-400' : isLoss ? 'text-rose-400' : 'text-slate-400'}`}>
                                {isGrowth ? '+' : ''}{seat.fiveYearGrowthPercentage}%
                            </span>
                            <div className={`p-1.5 rounded-lg ${isGrowth ? 'bg-emerald-500/10 text-emerald-400' : isLoss ? 'bg-rose-500/10 text-rose-400' : 'bg-slate-500/10 text-slate-400'}`}>
                                {isGrowth ? <TrendingUp className="w-5 h-5" /> : isLoss ? <TrendingDown className="w-5 h-5" /> : <Minus className="w-5 h-5" />}
                            </div>
                        </div>
                        <div className="h-16 w-full flex items-end gap-1.5 pt-2">
                            {[0.3, 0.45, 0.4, 0.6, isGrowth ? 0.9 : (isLoss ? 0.2 : 0.6)].map((h, i) => (
                                <div key={i} className={`flex-1 rounded-t-md ${isGrowth ? 'bg-gradient-to-t from-emerald-500/20 to-emerald-400/80 shadow-[0_0_10px_rgba(52,211,153,0.3)]' : isLoss ? 'bg-gradient-to-t from-rose-500/20 to-rose-400/80' : 'bg-slate-600/50'}`} style={{ height: `${h * 100}%` }} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            {/* Ambient card glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        </div>
    );
}

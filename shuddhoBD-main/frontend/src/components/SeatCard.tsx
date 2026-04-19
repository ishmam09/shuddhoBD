import { TrendingUp, Edit2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface SeatCardProps {
    seat: any;
    onEdit: (seat: any) => void;
    onViewGrowth?: (seat: any) => void;
}

export default function SeatCard({ seat, onEdit, onViewGrowth }: SeatCardProps) {
    const { user } = useAuth();

    const resolvedPartyLogo = seat.partyLogo
        || (seat.party.replace(/\s+/g, '').toLowerCase() === 'khelafatmajlish' ? '/KhelafatMajlish.png' : null);

    return (
        <div className="bg-slate-800/80 rounded-3xl p-6 border border-slate-700/50 hover:border-indigo-500/40 hover:shadow-[0_8px_30px_rgb(99,102,241,0.15)] transition-all duration-300 group relative backdrop-blur-xl h-full flex flex-col">
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

            {/* Bottom Anchored Meta Block */}
            <div className="mt-auto flex flex-col">
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

                    <div className="mt-4">
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                onViewGrowth && onViewGrowth(seat);
                            }}
                            className="w-full bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 hover:text-indigo-300 border border-indigo-500/30 transition-all font-bold py-3 px-4 rounded-xl flex justify-center items-center gap-2 group-hover:shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                        >
                            <TrendingUp className="w-4 h-4" />
                            Asset Growth
                        </button>
                    </div>
                </div>
            </div>
            {/* Ambient card glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        </div>
    );
}

import { useState } from 'react';
import { X, ShieldCheck, Check, AlertTriangle } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5001/api`;

interface AdminReviewModalProps {
    project: any;
    onClose: () => void;
    onRefresh: () => void;
}

export default function AdminReviewModal({ project, onClose, onRefresh }: AdminReviewModalProps) {
    const [adminNoteInput, setAdminNoteInput] = useState<{ [key: string]: string }>({});
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const handleModerateChallenge = async (challengeId: string, status: 'valid' | 'declined') => {
        setLoadingId(challengeId);
        try {
            const res = await fetch(`${API_BASE}/projects/${project._id}/challenge/${challengeId}/moderate`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ status, adminNote: adminNoteInput[challengeId] || '' })
            });
            if (res.ok) {
                setAdminNoteInput(prev => {
                    const newState = { ...prev };
                    delete newState[challengeId];
                    return newState;
                });
                onRefresh(); 
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingId(null);
        }
    };

    const pendingChallenges = project.challenges?.filter((c: any) => c.status === 'pending') || [];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-3xl max-h-[85vh] bg-slate-900 border border-indigo-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col z-10 animate-fade-in-up">
                
                {/* implementing header */}
                <div className="px-6 py-4 border-b border-indigo-500/20 bg-indigo-500/10 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2 text-indigo-400">
                        <ShieldCheck className="w-5 h-5" />
                        <h2 className="text-lg font-bold">Review Challenges: {project.name}</h2>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* implementing queue container */}
                <div className="p-6 overflow-y-auto space-y-6">
                    {pendingChallenges.length === 0 ? (
                        <div className="text-center py-10 text-slate-500 flex flex-col items-center">
                            <ShieldCheck className="w-12 h-12 mb-3 opacity-20" />
                            <p>No pending challenges for this project.</p>
                        </div>
                    ) : (
                        pendingChallenges.map((challenge: any, idx: number) => (
                            <div key={idx} className="chal-admin-card !mt-0">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="text-slate-200 text-sm leading-relaxed">{challenge.description}</p>
                                        
                                        {challenge.mediaUrls?.length > 0 && (
                                            <div className="chal-media-grid">
                                                {challenge.mediaUrls.map((url: string, i: number) => (
                                                    <img key={i} src={url} alt={`evidence-${i}`} className="chal-media-item" />
                                                ))}
                                            </div>
                                        )}
                                        
                                        <div className="mt-5 border-t border-indigo-500/20 pt-4">
                                            <label className="chal-label mb-2 block text-indigo-400">Official Admin Response</label>
                                            <textarea 
                                                rows={2}
                                                placeholder="Explain the measure being taken..."
                                                className="chal-admin-input !mt-0 resize-none font-medium"
                                                value={adminNoteInput[challenge._id] || ''}
                                                onChange={(e) => setAdminNoteInput({ ...adminNoteInput, [challenge._id]: e.target.value })}
                                            />
                                            <div className="flex justify-end gap-3 mt-4">
                                                <button 
                                                    onClick={() => handleModerateChallenge(challenge._id, 'declined')} 
                                                    disabled={loadingId === challenge._id}
                                                    className="px-5 py-2.5 border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 hover:border-rose-500 rounded-xl text-xs font-bold transition-all flex items-center gap-2 disabled:opacity-50"
                                                >
                                                    <X className="w-4 h-4" /> Decline
                                                </button>
                                                <button 
                                                    onClick={() => handleModerateChallenge(challenge._id, 'valid')} 
                                                    disabled={loadingId === challenge._id}
                                                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2 disabled:opacity-50"
                                                >
                                                    <Check className="w-4 h-4" /> Approve as Valid
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* implementing footer */}
                <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/50 flex justify-end shrink-0">
                    <button onClick={onClose} className="px-5 py-2 border border-slate-700 text-slate-300 hover:bg-slate-800 rounded-xl text-sm font-bold transition-colors">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

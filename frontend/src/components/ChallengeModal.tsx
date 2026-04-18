import React, { useState } from 'react';
import { X, Upload, AlertTriangle } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5001/api`;

interface ChallengeModalProps {
    projectId: string;
    onClose: () => void;
    onSuccess: () => void;
}

export default function ChallengeModal({ projectId, onClose, onSuccess }: ChallengeModalProps) {
    const [description, setDescription] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files);
            if (selectedFiles.length > 5) {
                setError("You can only upload up to 5 media files.");
                return;
            }
            setError(null);
            setFiles(selectedFiles);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!description.trim()) {
            setError("Description is required.");
            return;
        }

        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('description', description);
        files.forEach(file => {
            formData.append('media', file);
        });

        try {
            const res = await fetch(`${API_BASE}/projects/${projectId}/challenge`, {
                method: 'POST',
                body: formData,
                credentials: 'include' // Needed for anon functionality tracking or auth checks
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Failed to submit challenge');
            }

            onSuccess(); // Close modal and potentially refresh or show toast
            onClose();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col z-10 animate-fade-in-up">

                {/* implementing header */}
                <div className="px-6 py-4 border-b border-slate-800 bg-slate-800/30 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-rose-400">
                        <AlertTriangle className="w-5 h-5" />
                        <h2 className="text-lg font-bold">Challenge Progress</h2>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* implementing form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <p className="text-sm text-slate-400 leading-relaxed">
                        If you believe the stated progress of this project is inaccurate, submit an anonymous challenge. Include visual proof (photos/videos) if possible.
                    </p>

                    <div className="chal-input-group">
                        <label className="chal-label">Description / Evidence</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="chal-textarea"
                            rows={4}
                            placeholder="Describe what you observed on site..."
                            required
                        />
                    </div>

                    <div className="chal-input-group">
                        <label className="chal-label">Upload Evidence</label>
                        <div className="chal-file-wrapper relative">
                            <input
                                type="file"
                                multiple
                                accept="image/*,video/*"
                                onChange={handleFileChange}
                                className="chal-file-input absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="chal-file-display border-2 border-dashed border-slate-700 rounded-xl p-4 flex flex-col items-center justify-center text-slate-400 hover:border-indigo-500 hover:text-indigo-400 transition-colors pointer-events-none">
                                <Upload className="w-6 h-6 mb-2" />
                                <span className="text-sm font-semibold">
                                    {files.length > 0 ? `${files.length} file(s) selected` : "Click or drag to select media"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm rounded-lg flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                        <button type="button" onClick={onClose} className="px-4 py-2 font-bold text-slate-400 hover:text-white transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} className="px-5 py-2 font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-lg shadow-rose-600/20 transition-all flex items-center gap-2 disabled:opacity-50">
                            {loading ? "Submitting..." : "Submit Challenge"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

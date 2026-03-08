import { useState, useEffect, useRef } from 'react';
import { MapPin, Plus, X, UploadCloud, ShieldCheck, Check, Ban, Edit2, Trash2, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5001/api`;

export default function Reports() {
    const { user } = useAuth();
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModerationMode, setIsModerationMode] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);

    // Moderation Edit State
    const [editingReport, setEditingReport] = useState<any>(null);
    const [modForm, setModForm] = useState({ category: '', severity: '', severityScore: 0 });

    const [newReport, setNewReport] = useState({ title: '', description: '', location: '' });
    const [images, setImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Detailed View State
    const [selectedReport, setSelectedReport] = useState<any>(null);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const endpoint = isModerationMode ? `${API_BASE}/reports/moderation` : `${API_BASE}/reports`;
            console.log(`[DEBUG] Fetching reports from: ${endpoint}`);
            const res = await fetch(endpoint, {
                credentials: 'include'
            });
            const data = await res.json();
            setReports(data);
        } catch (error) {
            console.error('Failed to fetch reports', error);
        } finally {
            setLoading(false);
        }
    };

    const checkPendingReports = async () => {
        if (user?.role !== 'admin') return;
        try {
            const res = await fetch(`${API_BASE}/reports/moderation`, {
                credentials: 'include'
            });
            const data = await res.json();
            setPendingCount(data.length);
        } catch (error) {
            console.error('Failed to check pending reports', error);
        }
    };

    useEffect(() => {
        fetchReports();
        if (user?.role === 'admin' && !isModerationMode) {
            checkPendingReports();
        }
    }, [isModerationMode]);

    const handleModerate = async (id: string, updateData: any) => {
        const url = `${API_BASE}/reports/moderate/${id}`;
        console.log(`[DEBUG] Attempting moderation at URL: ${url}`, updateData);
        try {
            const res = await fetch(url, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(updateData)
            });
            console.log(`[DEBUG] Moderation response status: ${res.status}`);
            if (res.ok) {
                console.log(`[DEBUG] Moderation SUCCESS`);
                fetchReports();
                setEditingReport(null);
            } else {
                const text = await res.text();
                console.error(`[DEBUG] Moderation FAILED. Status: ${res.status}, Body: ${text.substring(0, 100)}`);
                let errorMsg = 'Unknown error';
                try {
                    const errData = JSON.parse(text);
                    errorMsg = errData.error || errData.message || errorMsg;
                } catch (e) {
                    errorMsg = `Server returned ${res.status} (Non-JSON)`;
                }
                alert(`Moderation failed (${res.status}): ${errorMsg}`);
            }
        } catch (error) {
            console.error('[DEBUG] Moderation Exception:', error);
            alert('A network error occurred during moderation.');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to permanently delete this report? This action cannot be undone.')) return;

        try {
            const res = await fetch(`${API_BASE}/reports/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (res.ok) {
                fetchReports();
                if (!isModerationMode) checkPendingReports();
            } else {
                const data = await res.json();
                alert(`Delete failed: ${data.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('A network error occurred while deleting the report.');
        }
    };

    const openEditModal = (report: any) => {
        setEditingReport(report);
        setModForm({
            category: report.category || 'Uncategorized',
            severity: report.severity || 'Low',
            severityScore: report.severityScore || 0
        });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (images.length + files.length > 5) {
            alert("You can only upload up to 5 files.");
            return;
        }

        const newImages = [...images, ...files].slice(0, 5);
        setImages(newImages);

        const newPreviews = files.map(file => URL.createObjectURL(file));
        setImagePreviews([...imagePreviews, ...newPreviews].slice(0, 5));

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const clearImages = () => {
        setImages([]);
        // Clean up object URLs to prevent memory leaks
        imagePreviews.forEach(url => URL.revokeObjectURL(url));
        setImagePreviews([]);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("title", newReport.title);
            formData.append("description", newReport.description);
            formData.append("location", newReport.location);
            images.forEach(image => {
                formData.append("images", image);
            });

            const res = await fetch(`${API_BASE}/reports`, {
                method: 'POST',
                credentials: 'include',
                body: formData
            });

            if (res.ok) {
                setSubmitSuccess(true);
                setNewReport({ title: '', description: '', location: '' });
                clearImages();
                setTimeout(() => {
                    setIsModalOpen(false);
                    setSubmitSuccess(false);
                    fetchReports();
                }, 3000);
            }
        } catch (error) {
            console.error('Submit failed', error);
        } finally {
            setSubmitting(false);
        }
    };

    const getSeverityColor = (severity: string) => {
        if (severity === 'High') return 'text-shuddho-red';
        if (severity === 'Medium') return 'text-shuddho-orange';
        return 'text-shuddho-green';
    };

    const getCategoryColor = (category: string) => {
        if (category === 'Budget Misuse') return 'bg-shuddho-neon text-black';
        if (category === 'Infrastructure Delay') return 'bg-shuddho-orange text-black';
        if (category === 'Asset Discrepancy') return 'bg-shuddho-teal text-white';
        if (category === 'Power Theft') return 'bg-shuddho-pink text-white';
        return 'bg-slate-700 text-white';
    };

    return (
        <div className="flex flex-col items-center w-full max-w-6xl mx-auto pb-12 relative">
            {/* ... header and filters ... */}
            <div className="text-center mb-10 w-full">
                <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Report Classification & Severity</h1>
                <p className="text-slate-400 text-sm">Auto-categorized reports with risk scoring and flagged keywords</p>
            </div>

            {/* Admin Pending Notification Banner */}
            {user?.role === 'admin' && !isModerationMode && (
                <div className={`w-full mb-6 p-4 rounded-2xl flex items-center justify-between border transition-all ${pendingCount > 0
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-200 shadow-[0_0_20px_rgba(245,158,11,0.1)]'
                    : 'bg-green-500/5 border-green-500/20 text-green-400/60'
                    }`}>
                    <div className="flex items-center gap-3">
                        <ShieldCheck className={`w-5 h-5 ${pendingCount > 0 ? 'text-amber-400 animate-pulse' : 'text-green-500/40'}`} />
                        <div>
                            <p className="text-sm font-bold">
                                {pendingCount > 0
                                    ? `${pendingCount} Report${pendingCount > 1 ? 's' : ''} Pending Verification`
                                    : 'System Clean: No Pending Reports'}
                            </p>
                            <p className="text-[11px] opacity-70">
                                {pendingCount > 0
                                    ? 'Turn on Verification Mode to review and approve these reports.'
                                    : 'All submitted reports have been moderated.'}
                            </p>
                        </div>
                    </div>
                    {pendingCount > 0 && (
                        <button
                            onClick={() => setIsModerationMode(true)}
                            className="bg-amber-500 text-black text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg hover:brightness-110 transition-all"
                        >
                            Quick Review
                        </button>
                    )}
                </div>
            )}

            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row items-center w-full gap-4 mb-8">
                <div className="flex-1 relative w-full">
                    <input
                        type="text"
                        placeholder="Search by Report ID / Keyword / Location"
                        className="w-full bg-shuddho-card border border-shuddho-border rounded-xl px-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-slate-500"
                    />
                </div>

                <select className="bg-shuddho-card border border-shuddho-border rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-slate-500 w-full md:w-36 appearance-none">
                    <option>Category</option>
                </select>

                <select className="bg-shuddho-card border border-shuddho-border rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-slate-500 w-full md:w-36 appearance-none">
                    <option>Severity</option>
                </select>

                {user?.role === 'admin' && (
                    <button
                        onClick={() => setIsModerationMode(!isModerationMode)}
                        className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all border ${isModerationMode
                            ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                            : 'bg-shuddho-card border-shuddho-border text-slate-400 hover:border-slate-500'
                            }`}
                    >
                        <ShieldCheck className={`w-5 h-5 ${isModerationMode ? 'animate-pulse' : ''}`} />
                        {isModerationMode ? 'Verification Mode Active' : 'Enable Verification Mode'}
                    </button>
                )}

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-shuddho-neon text-black font-semibold rounded-xl px-6 py-3 w-full md:w-auto text-sm hover:brightness-110 transition-all flex items-center justify-center gap-2"
                >
                    <Plus className="w-5 h-5" /> New Report
                </button>
            </div>

            {/* Detailed View Modal */}
            {selectedReport && !isModerationMode && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 md:p-8">
                    <div className="bg-shuddho-bg border border-shuddho-border rounded-2xl w-full max-w-4xl overflow-hidden max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-shuddho-border shrink-0 bg-shuddho-card/50">
                            <div>
                                <h2 className="text-2xl font-bold text-white tracking-tight">{selectedReport.title}</h2>
                                <div className="flex items-center gap-3 mt-2 text-xs">
                                    <span className={`px-2 py-0.5 rounded font-bold uppercase ${selectedReport.status === 'Verified' ? 'bg-green-500/20 text-green-400' :
                                        selectedReport.status === 'Rejected' ? 'bg-red-500/20 text-red-400' :
                                            'bg-amber-500/20 text-amber-400'
                                        }`}>
                                        {selectedReport.status}
                                    </span>
                                    <span className="text-slate-400">REF: {selectedReport._id.substring(18).toUpperCase()}</span>
                                    <span className="text-slate-400">•</span>
                                    <span className="text-slate-400">{new Date(selectedReport.createdAt).toLocaleString()}</span>
                                </div>
                            </div>
                            <button onClick={() => setSelectedReport(null)} className="p-2 rounded-full text-slate-400 hover:bg-white/10 hover:text-white transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="md:col-span-2 space-y-6">
                                    <div>
                                        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Description</h3>
                                        <div className="bg-shuddho-card p-5 rounded-xl border border-shuddho-border">
                                            <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">{selectedReport.description}</p>
                                        </div>
                                    </div>

                                    {selectedReport.images && selectedReport.images.length > 0 && (
                                        <div>
                                            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Evidence Attached ({selectedReport.images.length})</h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {selectedReport.images.map((url: string, index: number) => {
                                                    const isVideo = url.match(/\.(mp4|webm|ogg)$/i) || url.includes('video/upload');
                                                    return (
                                                        <div key={index} className="rounded-xl overflow-hidden border border-shuddho-border aspect-video bg-black/40 group">
                                                            {isVideo ? (
                                                                <video
                                                                    src={url.startsWith('http') ? url : `${import.meta.env.VITE_SERVER_URL || "http://localhost:5000"}${url}`}
                                                                    controls
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <img
                                                                    src={url.startsWith('http') ? url : `${import.meta.env.VITE_SERVER_URL || "http://localhost:5000"}${url}`}
                                                                    alt={`Evidence ${index + 1}`}
                                                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500 cursor-zoom-in"
                                                                    onClick={() => window.open(url, '_blank')}
                                                                />
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-6">
                                    <div className="bg-shuddho-card p-5 rounded-xl border border-shuddho-border">
                                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Report Metadata</h3>

                                        <div className="space-y-4">
                                            <div>
                                                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Location</div>
                                                <div className="flex items-start gap-2 text-sm text-white">
                                                    <MapPin className="w-4 h-4 text-shuddho-red shrink-0 mt-0.5" />
                                                    <span>{selectedReport.location}</span>
                                                </div>
                                            </div>

                                            <div className="w-full h-px bg-shuddho-border"></div>

                                            <div>
                                                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Category</div>
                                                <span className={`inline-block px-3 py-1 rounded-sm text-xs font-bold ${getCategoryColor(selectedReport.category)}`}>
                                                    {selectedReport.category}
                                                </span>
                                            </div>

                                            <div className="w-full h-px bg-shuddho-border"></div>

                                            <div>
                                                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Severity Risk</div>
                                                <div className={`${getSeverityColor(selectedReport.severity)} font-black text-lg flex items-baseline gap-2`}>
                                                    {selectedReport.severity}
                                                    <span className="text-xs opacity-60 font-medium">({selectedReport.severityScore}% Risk Score)</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-indigo-900/20 border border-indigo-500/30 p-5 rounded-xl">
                                        <p className="text-xs text-indigo-200/80 leading-relaxed italic">
                                            This report was analyzed and categorized automatically by our AI moderation system to evaluate severity and identify actionable insights.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Cards Grid */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-shuddho-neon mb-4"></div>
                    <p>Fetching Secure Reports...</p>
                </div>
            ) : reports.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed border-shuddho-border rounded-3xl">
                    <p className="text-slate-400">No reports found matching your criteria.</p>
                    {isModerationMode && <p className="text-xs text-indigo-400 mt-2">All pending reports have been verified.</p>}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                    {reports.map((report) => (
                        <div
                            key={report._id}
                            onClick={(e) => {
                                // Prevent opening detailed view if clicking inside the admin action areas
                                const target = e.target as HTMLElement;
                                if (target.closest('button')) return;

                                if (!isModerationMode) {
                                    setSelectedReport(report);
                                }
                            }}
                            className={`group relative bg-shuddho-card border rounded-2xl p-6 flex flex-col transition-all cursor-pointer hover:shadow-[0_10px_30px_rgba(0,0,0,0.3)] ${isModerationMode ? 'border-indigo-500/30 cursor-default' : 'border-shuddho-border hover:border-slate-600'
                                }`}>
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-slate-500 text-[10px] font-mono uppercase tracking-tighter">REF: {report._id.substring(18).toUpperCase()}</span>
                                <div className="flex gap-2">
                                    {isModerationMode && (
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${report.status === 'Verified' ? 'bg-green-500/20 text-green-400' :
                                            report.status === 'Rejected' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                                            }`}>
                                            {report.status}
                                        </span>
                                    )}
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getCategoryColor(report.category)}`}>
                                        {report.category}
                                    </span>
                                </div>
                                {user?.role === 'admin' && (
                                    <button
                                        onClick={() => handleDelete(report._id)}
                                        className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all border border-red-500/20 z-10 relative"
                                        title="System Delete (Permanent)"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            <h3 className="text-lg font-bold text-white mb-2 leading-snug group-hover:text-shuddho-neon transition-colors">{report.title}</h3>

                            {report.images && report.images.length > 0 && (
                                <div className="mb-4 rounded-xl overflow-hidden border border-shuddho-border aspect-video bg-black/20 group-hover:border-slate-500 transition-colors relative">
                                    {report.images.length > 1 && (
                                        <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold text-white z-10 flex items-center gap-1">
                                            <FileText className="w-3 h-3" /> +{report.images.length - 1} Media
                                        </div>
                                    )}
                                    {report.images[0].match(/\.(mp4|webm|ogg)$/i) || report.images[0].includes('video/upload') ? (
                                        <video
                                            src={report.images[0].startsWith('http') ? report.images[0] : `${import.meta.env.VITE_SERVER_URL || "http://localhost:5000"}${report.images[0]}`}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            muted
                                        />
                                    ) : (
                                        <img
                                            src={report.images[0].startsWith('http') ? report.images[0] : `${import.meta.env.VITE_SERVER_URL || "http://localhost:5000"}${report.images[0]}`}
                                            alt={report.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    )}
                                </div>
                            )}

                            <p className="text-slate-400 text-sm flex-1 mb-6 leading-relaxed">
                                {report.description}
                            </p>

                            <div className="mt-auto space-y-3">
                                <div className="flex justify-between items-end">
                                    <div className="space-y-1">
                                        <div className="flex items-center text-xs text-slate-500 gap-1.5">
                                            <MapPin className="w-3 h-3 text-shuddho-red" />
                                            <span>{report.location}</span>
                                        </div>
                                        <div className="text-[10px] text-slate-600">
                                            Reported on {new Date(report.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-0.5">Risk Level</div>
                                        <div className={`${getSeverityColor(report.severity)} font-black text-sm`}>
                                            {report.severityScore}% {report.severity}
                                        </div>
                                    </div>
                                </div>

                                {isModerationMode && (
                                    <div className="pt-4 border-t border-indigo-500/20 grid grid-cols-3 gap-2">
                                        <button
                                            onClick={() => handleModerate(report._id, { status: 'Verified' })}
                                            className="flex flex-col items-center justify-center p-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-all border border-green-500/20"
                                            title="Verify Report"
                                        >
                                            <Check className="w-4 h-4" />
                                            <span className="text-[9px] mt-1 font-bold uppercase">Verify</span>
                                        </button>
                                        <button
                                            onClick={() => openEditModal(report)}
                                            className="flex flex-col items-center justify-center p-2 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-all border border-indigo-500/20"
                                            title="Categorize & Set Severity"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                            <span className="text-[9px] mt-1 font-bold uppercase">Edit</span>
                                        </button>
                                        <button
                                            onClick={() => handleModerate(report._id, { status: 'Rejected' })}
                                            className="flex flex-col items-center justify-center p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all border border-red-500/20"
                                            title="Reject Report"
                                        >
                                            <Ban className="w-4 h-4" />
                                            <span className="text-[9px] mt-1 font-bold uppercase">Reject</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-shuddho-bg border border-shuddho-border rounded-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
                        <div className="flex justify-between items-center p-6 border-b border-shuddho-border shrink-0">
                            <h2 className="text-xl font-bold text-white">Submit New Report</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        {submitSuccess ? (
                            <div className="flex flex-col items-center justify-center py-10 text-center animate-in fade-in zoom-in duration-300">
                                <div className="w-16 h-16 bg-shuddho-neon/20 text-shuddho-neon rounded-full flex items-center justify-center mb-4 border border-shuddho-neon/30">
                                    <Check className="w-10 h-10" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Report Submitted!</h3>
                                <p className="text-slate-400 text-xs max-w-[280px] mx-auto leading-relaxed">
                                    Your report has been successfully uploaded to Cloudinary and processed by our AI system. It is currently <span className="text-shuddho-orange font-bold">Pending Verification</span> by an administrator.
                                </p>
                                <p className="text-[10px] text-slate-500 mt-6 animate-pulse italic">
                                    Modal will close automatically...
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Incident Title</label>
                                    <input
                                        required
                                        type="text"
                                        value={newReport.title}
                                        onChange={e => setNewReport({ ...newReport, title: e.target.value })}
                                        className="w-full bg-shuddho-card border border-shuddho-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-shuddho-neon"
                                        placeholder="e.g. Broken road construction paused"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                                    <textarea
                                        required
                                        rows={4}
                                        value={newReport.description}
                                        onChange={e => setNewReport({ ...newReport, description: e.target.value })}
                                        className="w-full bg-shuddho-card border border-shuddho-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-shuddho-neon resize-none"
                                        placeholder="Include detailed keywords (e.g. bribe, missing equipment, contractor...)"
                                    ></textarea>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Location</label>
                                    <input
                                        required
                                        type="text"
                                        value={newReport.location}
                                        onChange={e => setNewReport({ ...newReport, location: e.target.value })}
                                        className="w-full bg-shuddho-card border border-shuddho-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-shuddho-neon"
                                        placeholder="e.g. Mirpur 1"
                                    />
                                </div>

                                {/* Media Upload UI */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Evidence Files (Max 5, Image/Video)</label>
                                    <div className="mt-1">
                                        {imagePreviews.length > 0 ? (
                                            <div className="space-y-4">
                                                <div className="flex flex-wrap gap-3">
                                                    {imagePreviews.map((url, index) => {
                                                        const isVideo = images[index]?.type.startsWith('video/');
                                                        return (
                                                            <div key={index} className="relative rounded-xl overflow-hidden border border-shuddho-border shadow-lg group w-24 h-24">
                                                                {isVideo ? (
                                                                    <video src={url} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                                                                )}
                                                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            const newImages = [...images];
                                                                            newImages.splice(index, 1);
                                                                            setImages(newImages);

                                                                            const newPreviews = [...imagePreviews];
                                                                            URL.revokeObjectURL(newPreviews[index]);
                                                                            newPreviews.splice(index, 1);
                                                                            setImagePreviews(newPreviews);
                                                                        }}
                                                                        className="bg-red-500/80 text-white rounded-full p-1.5 hover:bg-red-500 transition-colors shadow-lg"
                                                                        title="Remove item"
                                                                    >
                                                                        <X className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                    {imagePreviews.length < 5 && (
                                                        <div
                                                            onClick={() => fileInputRef.current?.click()}
                                                            className="w-24 h-24 rounded-xl border-2 border-dashed border-slate-600 hover:border-shuddho-neon hover:bg-shuddho-neon/5 transition-all flex flex-col items-center justify-center cursor-pointer text-slate-400 group"
                                                        >
                                                            <Plus className="w-6 h-6 group-hover:text-shuddho-neon transition-colors" />
                                                            <span className="text-[10px] mt-1 font-medium group-hover:text-shuddho-neon">Add More</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={clearImages}
                                                    className="px-4 py-2 border border-red-500/30 text-red-500 hover:bg-red-500/10 rounded-lg text-sm font-medium transition-colors w-full flex items-center justify-center gap-2"
                                                >
                                                    <X className="w-4 h-4" /> Remove Media
                                                </button>
                                            </div>
                                        ) : (
                                            <div
                                                onClick={() => fileInputRef.current?.click()}
                                                className="cursor-pointer flex flex-col items-center justify-center w-full h-32 border border-slate-700 border-dashed rounded-xl hover:bg-slate-800/20 hover:border-shuddho-neon/40 transition-all group"
                                            >
                                                <UploadCloud className="w-8 h-8 text-slate-500 mb-2 group-hover:text-shuddho-neon transition-colors" />
                                                <p className="text-xs text-slate-500 font-medium group-hover:text-slate-300">Add Photo/Video Evidence</p>
                                                <p className="text-[10px] text-slate-600 mt-1">Powered by Cloudinary (Max 5 Files)</p>
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleImageChange}
                                            accept="image/*,video/*"
                                            multiple
                                            className="hidden"
                                        />
                                    </div>
                                </div>

                                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 flex items-start gap-3 mt-4">
                                    <div className="p-1 bg-blue-500/20 rounded-md">
                                        <UploadCloud className="w-4 h-4 text-blue-400" />
                                    </div>
                                    <p className="text-xs text-slate-400 leading-relaxed">
                                        <span className="text-blue-400 font-medium">Cloud Storage:</span> All evidence images are securely uploaded to Cloudinary for AI analysis and permanent storage.
                                    </p>
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full bg-shuddho-neon text-black font-bold rounded-lg px-4 py-3 mt-2 hover:brightness-110 transition-all disabled:opacity-50 disabled:grayscale"
                                >
                                    {submitting ? 'Analyzing & Uploading...' : 'Submit Report for AI Analysis'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
            {/* Moderation Edit Modal */}
            {editingReport && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60] flex items-center justify-center p-4">
                    <div className="bg-shuddho-bg border border-indigo-500/30 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
                        <div className="flex justify-between items-center p-6 border-b border-white/5 bg-indigo-500/5">
                            <div>
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <ShieldCheck className="w-5 h-5 text-indigo-400" />
                                    Verify & Categorize
                                </h2>
                                <p className="text-[10px] text-indigo-300/60 uppercase tracking-widest mt-1">Ref: {editingReport._id.substring(18).toUpperCase()}</p>
                            </div>
                            <button onClick={() => setEditingReport(null)} className="text-slate-400 hover:text-white transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Category</label>
                                <select
                                    value={modForm.category}
                                    onChange={(e) => setModForm({ ...modForm, category: e.target.value })}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-all"
                                >
                                    <option value="Uncategorized">Uncategorized</option>
                                    <option value="Budget Misuse">Budget Misuse</option>
                                    <option value="Infrastructure Delay">Infrastructure Delay</option>
                                    <option value="Asset Discrepancy">Asset Discrepancy</option>
                                    <option value="Power Theft">Power Theft</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Severity Impact ({modForm.severityScore}%)</label>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={modForm.severityScore}
                                    onChange={(e) => {
                                        const score = parseInt(e.target.value);
                                        let label = 'Low';
                                        if (score >= 75) label = 'High';
                                        else if (score >= 40) label = 'Medium';
                                        setModForm({ ...modForm, severityScore: score, severity: label });
                                    }}
                                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                />
                                <div className="flex justify-between mt-2 text-[10px] font-bold uppercase tracking-tighter">
                                    <span className="text-green-500">Low Impact</span>
                                    <span className="text-amber-500">Medium Risk</span>
                                    <span className="text-red-500">Critical Threat</span>
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    onClick={() => handleModerate(editingReport._id, {
                                        ...modForm,
                                        status: 'Verified'
                                    })}
                                    className="flex-1 bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20"
                                >
                                    Approve & Verify
                                </button>
                                <button
                                    onClick={() => setEditingReport(null)}
                                    className="px-6 py-3 border border-slate-700 text-slate-400 font-bold rounded-xl hover:bg-slate-800 transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

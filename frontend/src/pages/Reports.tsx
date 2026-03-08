import { useState, useEffect } from 'react';
import { MapPin, Plus, X } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000/api`;

export default function Reports() {
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newReport, setNewReport] = useState({ title: '', description: '', location: '' });

    const fetchReports = async () => {
        try {
            const res = await fetch(`${API_BASE}/reports`);
            const data = await res.json();
            setReports(data);
        } catch (error) {
            console.error('Failed to fetch reports', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_BASE}/reports`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(newReport)
            });
            
            if (res.ok) {
                setNewReport({ title: '', description: '', location: '' });
                setIsModalOpen(false);
                fetchReports(); // Refresh list
            }
        } catch (error) {
            console.error('Submit failed', error);
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
            {/* Header section */}
            <div className="text-center mb-10 w-full">
                <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Report Classification & Severity</h1>
                <p className="text-slate-400 text-sm">Auto-categorized reports with risk scoring and flagged keywords</p>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row items-center w-full gap-4 mb-8">
                <input 
                    type="text" 
                    placeholder="Search by Report ID / Keyword / Location" 
                    className="flex-1 bg-shuddho-card border border-shuddho-border rounded-xl px-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-slate-500 w-full"
                />
                
                <select className="bg-shuddho-card border border-shuddho-border rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-slate-500 w-full md:w-48 appearance-none">
                    <option>Category : All</option>
                </select>

                <select className="bg-shuddho-card border border-shuddho-border rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-slate-500 w-full md:w-48 appearance-none">
                    <option>Severity : All</option>
                </select>

                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-shuddho-neon text-black font-semibold rounded-xl px-6 py-3 w-full md:w-auto text-sm hover:brightness-110 transition-all flex items-center justify-center gap-2"
                >
                    <Plus className="w-5 h-5" /> New Report
                </button>
            </div>

            {/* Cards Grid */}
            {loading ? (
                <div className="text-white py-10">Loading reports...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                    {reports.map((report) => (
                        <div key={report._id} className="bg-shuddho-card border border-shuddho-border rounded-2xl p-6 flex flex-col hover:border-slate-600 transition-colors">
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-slate-400 text-sm font-medium">ID: {report._id.substring(0, 8).toUpperCase()}</span>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getCategoryColor(report.category)}`}>
                                    {report.category}
                                </span>
                            </div>
                            
                            <h3 className="text-lg font-bold text-white mb-2 leading-snug">{report.title}</h3>
                            
                            <p className="text-slate-400 text-sm flex-1 mb-6 leading-relaxed">
                                {report.description}
                            </p>
                            
                            <div className="mt-auto space-y-2 pt-4 border-t border-shuddho-border">
                                <div className="text-sm flex justify-between">
                                    <span className="text-slate-400">Severity: </span>
                                    <span className={`${getSeverityColor(report.severity)} font-medium`}>
                                        {report.severityScore}% ({report.severity})
                                    </span>
                                </div>
                                <div className="flex items-center text-sm text-slate-400 gap-1.5 pt-1">
                                    <MapPin className="w-3.5 h-3.5 text-shuddho-red" />
                                    <span>{report.location} • {new Date(report.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-shuddho-bg border border-shuddho-border rounded-2xl w-full max-w-lg overflow-hidden">
                        <div className="flex justify-between items-center p-6 border-b border-shuddho-border">
                            <h2 className="text-xl font-bold text-white">Submit New Report</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Incident Title</label>
                                <input 
                                    required
                                    type="text" 
                                    value={newReport.title}
                                    onChange={e => setNewReport({...newReport, title: e.target.value})}
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
                                    onChange={e => setNewReport({...newReport, description: e.target.value})}
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
                                    onChange={e => setNewReport({...newReport, location: e.target.value})}
                                    className="w-full bg-shuddho-card border border-shuddho-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-shuddho-neon"
                                    placeholder="e.g. Mirpur 1"
                                />
                            </div>
                            <button 
                                type="submit"
                                className="w-full bg-shuddho-neon text-black font-bold rounded-lg px-4 py-3 mt-4 hover:brightness-110 transition-colors"
                            >
                                Submit Report for AI Analysis
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

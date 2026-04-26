import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { useNews } from '../hooks/useNews';
import NewsCard from '../components/NewsCard';

const API_BASE = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5001/api`;

export default function Dashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState<any>(null);
    const [loadingStats, setLoadingStats] = useState(true);
    const [myReports, setMyReports] = useState<any[]>([]);
    const [loadingReports, setLoadingReports] = useState(true);
    const { articles, loading, error } = useNews();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch(`${API_BASE}/reports/stats`, {
                    credentials: 'include'
                });
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (err) {
                console.error("Failed to fetch dashboard stats:", err);
            } finally {
                setLoadingStats(false);
            }
        };

        const fetchMyReports = async () => {
            if (user?.role !== 'citizen') {
                setLoadingReports(false);
                return;
            }
            try {
                const res = await fetch(`${API_BASE}/reports`, { credentials: 'include' });
                if (res.ok) {
                    const data = await res.json();
                    const mine = data.filter((r: any) => r.author && r.author._id === user.id);
                    setMyReports(mine);
                }
            } catch (err) {
                console.error("Failed to fetch my reports:", err);
            } finally {
                setLoadingReports(false);
            }
        };

        if (user) {
            fetchStats();
            fetchMyReports();
        }
    }, [user]);

    return (
        <div className="flex flex-col items-center w-full max-w-6xl mx-auto pb-12 relative">
            {/* Ambient Glows */}
            <div className="absolute top-0 left-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
            <div className="absolute top-40 right-10 w-96 h-96 bg-shuddho-neon/5 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

            <header className="mb-10 w-full flex justify-between items-end relative z-10">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight text-glow">Overview</h1>
                    <p className="text-slate-400 mt-1">
                        Welcome back, <span className="text-white font-medium">{user?.name}</span>. Here's what's happening today.
                    </p>
                </div>
                {user?.role === 'citizen' && (
                    <button 
                         onClick={() => navigate('/dashboard/news')}
                         className="text-shuddho-neon text-sm font-semibold hover:underline mb-1"
                    >
                        View Full Feed
                    </button>
                )}
            </header>

            {user?.role === 'citizen' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 w-full relative z-10">
                    {/* ... (keep stats as they are) */}
                    <div className="bg-slate-900/40 backdrop-blur-xl p-6 rounded-2xl border border-white/5 shadow-lg hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:border-slate-600 transition-all duration-300 flex flex-col items-center justify-center text-center group">
                        <h3 className="text-slate-400 text-sm font-medium mb-2">My Reports</h3>
                        <span className="text-4xl font-bold text-white group-hover:text-shuddho-neon transition-colors drop-shadow-md">
                            {loadingStats ? (
                                <div className="h-8 w-8 border-2 border-slate-700 border-t-shuddho-neon animate-spin rounded-full"></div>
                            ) : (
                                stats?.myReports || 0
                            )}
                        </span>
                    </div>
                    <div className="bg-slate-900/40 backdrop-blur-xl p-6 rounded-2xl border border-white/5 shadow-lg hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:border-slate-600 transition-all duration-300 flex flex-col items-center justify-center text-center group">
                        <h3 className="text-slate-400 text-sm font-medium mb-2">Projects Followed</h3>
                        <span className="text-4xl font-bold text-white group-hover:text-shuddho-neon transition-colors drop-shadow-md">
                            {loadingStats ? (
                                <div className="h-8 w-8 border-2 border-slate-700 border-t-shuddho-neon animate-spin rounded-full"></div>
                            ) : (
                                stats?.projectsFollowed || 0
                            )}
                        </span>
                    </div>
                    <div className="relative bg-gradient-to-br from-indigo-900 to-purple-900 p-6 rounded-2xl shadow-xl shadow-indigo-900/20 text-white flex flex-col items-start justify-between border border-indigo-500/30 overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="relative z-10">
                            <h3 className="text-indigo-200 text-sm font-medium mb-1">Make an Impact</h3>
                            <p className="text-lg font-semibold leading-tight mb-4">Report an issue in your constituency.</p>
                        </div>
                        <button
                            onClick={() => navigate('/dashboard/anonymous-report')}
                            className="relative z-10 bg-white/10 hover:bg-white/20 transition-colors text-white text-sm font-medium px-4 py-2 rounded-lg w-full text-left flex justify-between items-center backdrop-blur-sm border border-white/10 group-hover:border-white/30"
                        >
                            Submit Report <span className="text-lg group-hover:translate-x-1 transition-transform">&rarr;</span>
                        </button>
                    </div>
                </div>
            )}

            {(user?.role === 'analyst' || user?.role === 'admin') && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 w-full">
                    <div className="bg-shuddho-card p-6 rounded-2xl border border-shuddho-red/30 shadow-sm flex flex-col items-center justify-center text-center">
                        <h3 className="text-shuddho-red text-sm font-medium mb-2">High Severity Reports</h3>
                        <span className="text-4xl font-bold text-shuddho-red">
                            {loadingStats ? (
                                <div className="h-8 w-8 border-2 border-slate-700 border-t-shuddho-red animate-spin rounded-full"></div>
                            ) : (
                                stats?.highSeverity || 0
                            )}
                        </span>
                    </div>
                    <div className="bg-shuddho-card p-6 rounded-2xl border border-shuddho-green/30 shadow-sm flex flex-col items-center justify-center text-center">
                        <h3 className="text-shuddho-green text-sm font-medium mb-2">Verified Claims</h3>
                        <span className="text-4xl font-bold text-shuddho-green">
                            {loadingStats ? (
                                <div className="h-8 w-8 border-2 border-slate-700 border-t-shuddho-green animate-spin rounded-full"></div>
                            ) : (
                                stats?.verified || 0
                            )}
                        </span>
                    </div>
                    <div className="bg-shuddho-card p-6 rounded-2xl border border-shuddho-border shadow-sm flex flex-col items-center justify-center text-center">
                        <h3 className="text-slate-400 text-sm font-medium mb-2">Pending Reviews</h3>
                        <span className="text-4xl font-bold text-white">
                            {loadingStats ? (
                                <div className="h-8 w-8 border-2 border-slate-700 border-t-shuddho-neon animate-spin rounded-full"></div>
                            ) : (
                                stats?.pending || 0
                            )}
                        </span>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">

                <div className="lg:col-span-2">
                    <div className="bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-white/5 p-6 shadow-xl min-h-[500px] w-full relative overflow-hidden flex flex-col hover:border-white/10 transition-colors duration-300">
                         {/* Subtle geometric pattern in background */}
                         <div className="absolute top-0 right-0 w-64 h-64 bg-shuddho-neon/5 blur-[100px] -z-10"></div>
                         
                         <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                             <span className="w-2 h-2 rounded-full bg-shuddho-neon shadow-[0_0_8px_rgba(217,248,75,0.8)]"></span>
                             Recent Activity
                         </h2>
                         <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                             <div className="w-16 h-16 bg-slate-800/30 rounded-full flex items-center justify-center mb-4 border border-dashed border-slate-700/50 relative">
                                 <div className="absolute inset-0 rounded-full border-2 border-slate-700/20 border-t-shuddho-neon/30 animate-spin"></div>
                                 <svg className="w-8 h-8 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                             </div>
                             <p className="text-sm">Waiting for recent activity updates...</p>
                         </div>
                    </div>
                </div>

                {user?.role === 'citizen' && (
                    <div className="lg:col-span-1">
                        <div className="bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-white/5 p-6 shadow-xl min-h-[500px] max-h-[500px] w-full flex flex-col hover:border-white/10 transition-colors duration-300">
                            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]"></span>
                                My Verified Reports
                            </h2>
                            {loadingReports ? (
                                <div className="flex-1 flex flex-col gap-4">
                                    {/* Shimmer Skeletons */}
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="w-full h-20 bg-slate-800/30 rounded-xl relative overflow-hidden border border-slate-700/30">
                                            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
                                        </div>
                                    ))}
                                </div>
                            ) : myReports.length > 0 ? (
                                <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-4 pr-2">
                                    {myReports.map((report, idx) => (
                                        <div key={idx} className="bg-slate-800/30 backdrop-blur-md p-4 rounded-xl border border-white/5 flex flex-col gap-2 hover:border-shuddho-neon/40 hover:-translate-y-0.5 hover:shadow-lg transition-all cursor-pointer group">
                                            <div className="flex justify-between items-start gap-2">
                                                <h3 className="text-white font-medium text-sm line-clamp-1 group-hover:text-shuddho-neon transition-colors" title={report.title}>{report.title}</h3>
                                                <span className={`shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded flex items-center gap-1 ${
                                                    report.resolution === 'Solved' ? 'bg-shuddho-green/10 text-shuddho-green border border-shuddho-green/20' :
                                                    report.resolution === 'Ongoing' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                                                    'bg-shuddho-red/10 text-shuddho-red border border-shuddho-red/20'
                                                }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${
                                                        report.resolution === 'Solved' ? 'bg-shuddho-green shadow-[0_0_5px_rgba(16,185,129,0.8)]' :
                                                        report.resolution === 'Ongoing' ? 'bg-amber-500 shadow-[0_0_5px_rgba(245,158,11,0.8)]' :
                                                        'bg-shuddho-red shadow-[0_0_5px_rgba(239,68,68,0.8)]'
                                                    }`}></span>
                                                    {report.resolution || 'Unsolved'}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-400 line-clamp-2">{report.description}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-center">
                                    <div className="w-16 h-16 bg-slate-800/30 rounded-full flex items-center justify-center mb-4 border border-slate-700/50 shadow-inner">
                                        <svg className="w-6 h-6 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                    </div>
                                    <p className="text-sm font-medium text-slate-400">No verified reports yet.</p>
                                    <p className="text-xs text-slate-500 mt-1">When you submit reports, they'll appear here.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-10 w-full text-left">
                <h2 className="text-xl font-bold text-white mb-4">Latest News</h2>
                {loading && <p className="text-slate-400 text-sm">Loading news...</p>}
                {error && <p className="text-shuddho-red text-sm">{error}</p>}
                {!loading && !error && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {articles.slice(0, 3).map((article, index) => (
                        <NewsCard key={index} title={article.title} link={article.url} image={article.urlToImage || ''} pubDate={article.publishedAt} source={article.source} hideImage={true} />
                    ))}
                    </div>
                )}
            </div>
        </div>
    );
}

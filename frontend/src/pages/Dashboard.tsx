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

        if (user) fetchStats();
    }, [user]);

    return (
        <div className="flex flex-col items-center w-full max-w-6xl mx-auto pb-12">
            <header className="mb-10 w-full flex justify-between items-end">
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 w-full">
                    {/* ... (keep stats as they are) */}
                    <div className="bg-shuddho-card p-6 rounded-2xl border border-shuddho-border shadow-sm flex flex-col items-center justify-center text-center group hover:border-slate-700 transition-colors">
                        <h3 className="text-slate-400 text-sm font-medium mb-2">My Reports</h3>
                        <span className="text-4xl font-bold text-white group-hover:text-shuddho-neon transition-colors">
                            {loadingStats ? (
                                <div className="h-8 w-8 border-2 border-slate-700 border-t-shuddho-neon animate-spin rounded-full"></div>
                            ) : (
                                stats?.myReports || 0
                            )}
                        </span>
                    </div>
                    <div className="bg-shuddho-card p-6 rounded-2xl border border-shuddho-border shadow-sm flex flex-col items-center justify-center text-center group hover:border-slate-700 transition-colors">
                        <h3 className="text-slate-400 text-sm font-medium mb-2">Projects Followed</h3>
                        <span className="text-4xl font-bold text-white group-hover:text-shuddho-neon transition-colors">
                            {loadingStats ? (
                                <div className="h-8 w-8 border-2 border-slate-700 border-t-shuddho-neon animate-spin rounded-full"></div>
                            ) : (
                                stats?.projectsFollowed || 0
                            )}
                        </span>
                    </div>
                    <div className="bg-gradient-to-br from-indigo-900 to-purple-900 p-6 rounded-2xl shadow-md text-white flex flex-col items-start justify-between border border-indigo-800 scale-100 hover:scale-[1.02] transition-transform duration-300">
                        <div>
                            <h3 className="text-indigo-200 text-sm font-medium mb-1">Make an Impact</h3>
                            <p className="text-lg font-semibold leading-tight mb-4">Report an issue in your constituency.</p>
                        </div>
                        <button
                            onClick={() => navigate('/dashboard/anonymous-report')}
                            className="bg-white/10 hover:bg-white/20 transition-colors text-white text-sm font-medium px-4 py-2 rounded-lg w-full text-left flex justify-between items-center backdrop-blur-sm border border-white/10"
                        >
                            Submit Report <span className="text-lg">&rarr;</span>
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
                    <div className="bg-shuddho-card rounded-2xl border border-shuddho-border p-6 shadow-sm min-h-[500px] w-full relative overflow-hidden flex flex-col">
                         {/* Subtle geometric pattern in background */}
                         <div className="absolute top-0 right-0 w-64 h-64 bg-shuddho-neon/5 blur-[100px] -z-10"></div>
                         
                         <h2 className="text-lg font-bold text-white mb-6">Recent Activity</h2>
                         <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                             <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4 border border-dashed border-slate-700">
                                 <svg className="w-8 h-8 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                             </div>
                         </div>
                    </div>
                </div>
            </div>

            <div className="mt-10 w-full text-left">
                <h2 className="text-xl font-bold text-white mb-4">Anti-Corruption News</h2>
                {loading && <p className="text-slate-400 text-sm">Loading news...</p>}
                {error && <p className="text-shuddho-red text-sm">{error}</p>}
                {!loading && !error && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {articles.slice(0, 6).map((article, index) => (
                        <NewsCard key={index} {...article} />
                    ))}
                    </div>
                )}
            </div>
        </div>
    );
}

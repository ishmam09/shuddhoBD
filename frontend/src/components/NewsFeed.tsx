import { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5001/api`;

interface NewsArticle {
    title: string;
    source: string;
    publishedAt: string;
    url: string;
    imageUrl: string;
    sentiment: 'Positive' | 'Negative';
}

export default function NewsFeed() {
    const [news, setNews] = useState<NewsArticle[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<string>('');

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const res = await fetch(`${API_BASE}/news`, {
                    credentials: 'include'
                });
                if (res.ok) {
                    const data = await res.json();
                    setNews(data.articles || []);
                    setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
                }
            } catch (err) {
                console.error("Failed to fetch news:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col gap-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse bg-shuddho-card/50 border border-shuddho-border rounded-xl p-4 h-24"></div>
                ))}
            </div>
        );
    }

    if (news.length === 0) {
        return (
            <div className="text-center py-10 text-slate-500">
                <p>No anti-corruption news available at the moment.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center px-1 mb-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                    Live Updates
                </span>
                <span className="text-[10px] text-slate-600 font-medium italic">
                    Updated at {lastUpdated}
                </span>
            </div>
            <div className="grid grid-cols-1 gap-4">
            {news.map((item, idx) => (
                <a
                    key={idx}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group bg-shuddho-card hover:bg-slate-800/80 border border-shuddho-border hover:border-slate-500 rounded-xl p-4 transition-all flex gap-4 overflow-hidden"
                >
                    <div className="shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-slate-800 border border-white/5">
                        <img 
                            src={item.imageUrl} 
                            alt="" 
                            className="w-full h-full object-cover mix-blend-luminosity group-hover:mix-blend-normal transition-all duration-500"
                        />
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start gap-2">
                                <h4 className="text-sm font-bold text-white line-clamp-2 leading-tight group-hover:text-shuddho-neon transition-colors">
                                    {item.title}
                                </h4>
                                <span className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                    item.sentiment === 'Positive' 
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                }`}>
                                    {item.sentiment}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between mt-2">
                            <span className="text-[11px] text-slate-500 font-medium">
                                {item.source}
                            </span>
                            <span className="text-[10px] text-slate-600">
                                {new Date(item.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </span>
                        </div>
                    </div>
                </a>
            ))}
            </div>
        </div>
    );
}

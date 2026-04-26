import React, { useState, useEffect } from 'react';
import { Newspaper } from 'lucide-react';

interface Article {
  title: string;
  pubDate: string;
  link: string;
  image: string;
  source: string;
}

const News: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const API_BASE = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5001/api`;
        const res = await fetch(`${API_BASE}/news`);

        if (!res.ok) throw new Error('Could not load news');
        const data = await res.json();
        setArticles(data.articles);
      } catch (err) {
        setError('Could not load news');
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  const timeAgo = (dateStr: string) => {
    const pubDate = new Date(dateStr);
    const diffInSeconds = Math.floor((new Date().getTime() - pubDate.getTime()) / 1000);

    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mins ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">Transparency Watch</h1>
        <p className="text-slate-400 text-sm mb-8">
          Tracking the fight against graft, uncovering truth, and holding power to account
        </p>

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-shuddho-card rounded-xl h-[300px] animate-pulse border border-shuddho-border" />
            ))}
          </div>
        )}

        {error && (
          <div className="flex justify-center items-center py-20">
            <p className="text-shuddho-red text-center font-semibold">{error}</p>
          </div>
        )}

        {!loading && !error && articles.length === 0 && (
          <div className="flex justify-center items-center py-20">
            <p className="text-slate-500 text-center font-medium">No recent corruption news found. Check back later.</p>
          </div>
        )}

        {!loading && !error && articles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article, index) => (
              <a
                key={index}
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#0b1121] rounded-xl overflow-hidden border border-slate-800 hover:border-slate-600 transition-colors group flex flex-col h-full"
              >
                {article.image ? (
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                ) : (
                  <div className="w-full h-48 bg-slate-900 flex items-center justify-center">
                    <Newspaper className="w-12 h-12 text-slate-700" />
                  </div>
                )}
                <div className="p-5 flex flex-col flex-1">
                  <span className="text-shuddho-neon text-xs font-bold uppercase tracking-wider mb-2">
                    {article.source}
                  </span>
                  <h2 className="text-white font-bold text-lg leading-snug line-clamp-3 mb-4 group-hover:text-slate-300 transition-colors">
                    {article.title}
                  </h2>
                  <div className="mt-auto">
                    <span className="text-slate-400 text-xs">
                      {timeAgo(article.pubDate)}
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default News;

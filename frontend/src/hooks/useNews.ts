import { useState, useEffect } from 'react';

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  source: string;
}

export const useNews = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const API_BASE = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5001/api`;
        const response = await fetch(`${API_BASE}/news`, { credentials: 'include' });
        if (!response.ok) throw new Error('Failed to fetch news');
        const data = await response.json();
        setArticles(data.articles);
      } catch (err) {
        setError('Could not load news at this time.');
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  return { articles, loading, error };
};

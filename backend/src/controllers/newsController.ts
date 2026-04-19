import { Request, Response } from 'express';
import axios from 'axios';

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  source: string;
}

const fetchFromNewsAPI = async (): Promise<NewsArticle[]> => {
  const res = await axios.get('https://newsapi.org/v2/everything', {
    params: {
      q: 'corruption bangladesh',
      sortBy: 'publishedAt',
      language: 'en',
      pageSize: 20,
      apiKey: process.env.NEWSAPI_KEY,
    },
  });
  return res.data.articles.map((a: any) => ({
    title: a.title,
    description: a.description,
    url: a.url,
    urlToImage: a.urlToImage || null,
    publishedAt: a.publishedAt,
    source: a.source?.name || 'NewsAPI',
  }));
};

const fetchFromGNews = async (): Promise<NewsArticle[]> => {
  const res = await axios.get('https://gnews.io/api/v4/search', {
    params: {
      q: 'corruption bangladesh',
      lang: 'en',
      max: 20,
      token: process.env.GNEWS_KEY,
    },
  });
  return res.data.articles.map((a: any) => ({
    title: a.title,
    description: a.description,
    url: a.url,
    urlToImage: a.image || null,
    publishedAt: a.publishedAt,
    source: a.source?.name || 'GNews',
  }));
};

const fetchFromCurrents = async (): Promise<NewsArticle[]> => {
  const res = await axios.get('https://api.currentsapi.services/v1/search', {
    params: {
      keywords: 'corruption bangladesh',
      apiKey: process.env.CURRENTS_KEY,
    },
  });
  return res.data.news.map((a: any) => ({
    title: a.title,
    description: a.description,
    url: a.url,
    urlToImage: a.image || null,
    publishedAt: a.published,
    source: 'Currents API',
  }));
};

export const getAntiCorruptionNews = async (req: Request, res: Response): Promise<void> => {
  let articles: NewsArticle[] = [];

  // Try all three sources, collect from whichever succeed
  const results = await Promise.allSettled([
    fetchFromNewsAPI(),
    fetchFromGNews(),
    fetchFromCurrents(),
  ]);

  results.forEach((result) => {
    if (result.status === 'fulfilled') {
      articles = [...articles, ...result.value];
    }
  });

  if (articles.length === 0) {
    res.status(503).json({ message: 'All news sources are currently unavailable.' });
    return;
  }

  // Remove duplicates by title, sort by date descending
  const seen = new Set<string>();
  const unique = articles
    .filter((a) => {
      if (!a.title || seen.has(a.title)) return false;
      seen.add(a.title);
      return true;
    })
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  res.status(200).json({ articles: unique });
};

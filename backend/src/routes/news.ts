import express from 'express';
import axios from 'axios';
import Parser from 'rss-parser';
import { ENV } from '../config/env';

const router = express.Router();
const parser = new Parser();

// Simple in-memory cache
let cachedNews: any = null;
let lastFetchTime = 0;
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

// Helper: basic keyword-based sentiment detection
const detectSentiment = (title: string): string => {
    const positiveWords = ['reduce', 'reform', 'improve', 'success', 'transparent', 'oversight', 'digital', 'introduced', 'launch', 'new', 'tackle', 'acc', 'files', 'investigate', 'verification', 'digitized'];
    const negativeWords = ['corruption', 'scam', 'irregularities', 'fraud', 'bribe', 'money laundering', 'embezzlement', 'arrested', 'case', 'filed', 'misuse', 'illegal'];
    
    const titleLower = title.toLowerCase();
    
    // Weighted approach
    let score = 0;
    positiveWords.forEach(word => { if (titleLower.includes(word)) score += 1; });
    negativeWords.forEach(word => { if (titleLower.includes(word)) score -= 1.5; }); // Bias towards negative for corruption news

    return score >= 0 ? 'Positive' : 'Negative';
};

// GET /api/news — Fetch anti-corruption news
router.get('/', async (req, res) => {
    try {
        const apiKey = ENV.newsApiKey;
        const now = Date.now();

        // Use cache if available and not expired
        if (cachedNews && (now - lastFetchTime < CACHE_DURATION)) {
            return res.json(cachedNews);
        }

        let articles: any[] = [];

        // Priority 1: NewsAPI if key is present (unlikely in this context)
        if (apiKey && apiKey !== 'placeholder_key' && apiKey.length > 10) {
            try {
                const response = await axios.get('https://newsapi.org/v2/everything', {
                    params: {
                        q: 'corruption Bangladesh OR "Anti-Corruption Commission" Bangladesh',
                        sortBy: 'publishedAt',
                        language: 'en',
                        apiKey: apiKey
                    }
                });
                articles = response.data.articles.map((article: any) => ({
                    title: article.title,
                    source: article.source.name,
                    publishedAt: article.publishedAt,
                    url: article.url,
                    imageUrl: article.urlToImage || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400",
                    sentiment: detectSentiment(article.title)
                }));
            } catch (apiErr) {
                console.warn('[NEWS API] Direct fetch failed, falling back to RSS.');
            }
        }

        // Priority 2: RSS Feeds (Always reliable and free)
        if (articles.length === 0) {
            const feeds = [
                'https://www.thedailystar.net/news/bangladesh/rss.xml',
                'https://www.dhakatribune.com/rss.xml'
            ];

            for (const feedUrl of feeds) {
                try {
                    const feed = await parser.parseURL(feedUrl);
                    const feedArticles = feed.items.slice(0, 10).map(item => ({
                        title: item.title,
                        source: feed.title || 'BD News',
                        publishedAt: item.pubDate || new Date().toISOString(),
                        url: item.link,
                        imageUrl: (item as any).enclosure?.url || "https://images.unsplash.com/photo-1590424686483-e02fb4890fb6?w=400",
                        sentiment: detectSentiment(item.title || '')
                    }));
                    articles = [...articles, ...feedArticles];
                } catch (feedErr) {
                    console.error(`[RSS ERROR] Failed to fetch from ${feedUrl}`);
                }
            }

            // Filter for corruption-related news if possible, otherwise just show latest
            const corruptionKeywords = ['corruption', 'acc', 'graft', 'scam', 'fraud', 'bribe', 'minister', 'police', 'commission', 'bank'];
            const related = articles.filter(a => 
                corruptionKeywords.some(kw => a.title.toLowerCase().includes(kw))
            );
            
            // If we have enough related news, use them. Otherwise, mix in top news.
            articles = related.length > 2 ? related : articles;
        }

        // Sort by date and limit
        articles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
        articles = articles.slice(0, 10);

        cachedNews = {
            status: 'ok',
            source: articles.length > 0 ? 'Live-Feed' : 'Mock',
            articles: articles.length > 0 ? articles : [
                {
                    title: "ACC Launches Nationwide Anti-Corruption Awareness Campaign",
                    source: "ACC PR",
                    publishedAt: new Date().toISOString(),
                    url: "https://www.acc.org.bd",
                    imageUrl: "https://images.unsplash.com/photo-1590424686483-e02fb4890fb6?w=400",
                    sentiment: "Positive"
                }
            ]
        };
        lastFetchTime = now;

        res.json(cachedNews);
    } catch (err: any) {
        console.error('News implementation error:', err.message);
        res.status(500).json({ error: 'Failed to aggregate news' });
    }
});

export default router;

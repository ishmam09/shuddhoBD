import { Request, Response } from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';
import dotenv from 'dotenv';
dotenv.config();

export const getAntiCorruptionNews = async (req: Request, res: Response): Promise<void> => {
  try {
    const url = 'https://www.tbsnews.net/bangladesh/corruption';
    
    // Fetch HTML with User-Agent
    const { data } = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });

    const $ = cheerio.load(data);
    const articles: any[] = [];

    // Target the typical wrappers for news cards in standard CMS templates
    let blocks = $('.views-row, article, .card, .content-block, .news-item');
    
    // Fallback if none found - find any div that directly wraps a heading with a link
    if (blocks.length === 0) {
      blocks = $('div').filter((i, el) => $(el).find('h2 a, h3 a').length > 0 && $(el).text().trim().length > 10);
    }

    blocks.each((i, element) => {
      if (articles.length >= 6) return;

      const $el = $(element);
      
      // 1. Extract heading (h2 or h3)
      const $heading = $el.find('h2, h3').first();
      if (!$heading.length) return;

      const rawTitle = $heading.text().trim().replace(/\s+/g, ' ');
      if (!rawTitle) return;

      // 2. Extract Link
      const $anchor = $heading.find('a').length ? $heading.find('a').first() : $heading.closest('a');
      let link = $anchor.attr('href') || $el.find('a').first().attr('href') || '';
      if (link && !link.startsWith('http')) {
        link = `https://www.tbsnews.net${link.startsWith('/') ? '' : '/'}${link}`;
      }

      // 3. Extract Image
      const $img = $el.find('img').first();
      let image = $img.attr('data-src') || $img.attr('src') || '';
      if (image && !image.startsWith('http') && !image.startsWith('data:')) {
        image = `https://www.tbsnews.net${image.startsWith('/') ? '' : '/'}${image}`;
      }

      // 4. Extract Date
      const $time = $el.find('time').first();
      let rawDate = $time.attr('datetime') || $time.text().trim() || $el.find('.date, .time, .published-date, .date-display-single').text().trim();
      
      let pubDate = new Date().toISOString(); // Default fallback
      if (rawDate) {
         const parsed = new Date(rawDate);
         if (!isNaN(parsed.getTime())) {
            pubDate = parsed.toISOString();
         }
      }

      // Deduplication check
      const isDuplicate = articles.some(a => a.title.toLowerCase() === rawTitle.toLowerCase() || a.link === link);
      if (isDuplicate) return;

      articles.push({
        title: rawTitle,
        link,
        image,
        pubDate,
        source: 'TBS News' // 5. Hardcoded source
      });
    });

    res.json({ articles });

  } catch (error) {
    console.error("Error fetching or scraping TBS news:", error);
    res.status(500).json({ error: "Could not load news" });
  }
};

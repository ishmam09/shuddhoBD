const axios = require('axios');
const cheerio = require('cheerio');

axios.get('https://www.tbsnews.net/bangladesh/corruption', {headers:{'User-Agent':'Mozilla/5.0'}})
  .then(res => {
    const $ = cheerio.load(res.data);
    const articles = [];
    let blocks = $('.views-row, article, .card, .content-block, .news-item');

    blocks.each((i, element) => {
      if (articles.length >= 6) return;
      const $el = $(element);
      const $heading = $el.find('h2, h3').first();
      if (!$heading.length) return;
      const rawTitle = $heading.text().trim().replace(/\s+/g, ' ');

      const $anchor = $heading.find('a').length ? $heading.find('a').first() : $heading.closest('a');
      let link = $anchor.attr('href') || $el.find('a').first().attr('href') || '';
      if (link && !link.startsWith('http')) link = `https://www.tbsnews.net${link.startsWith('/') ? '' : '/'}${link}`;

      const $img = $el.find('img').first();
      let image = $img.attr('data-src') || $img.attr('src') || '';
      if (image && !image.startsWith('http') && !image.startsWith('data:')) image = `https://www.tbsnews.net${image.startsWith('/') ? '' : '/'}${image}`;

      const $time = $el.find('time').first();
      let rawDate = $time.attr('datetime') || $time.text().trim() || $el.find('.date, .time, .published-date, .date-display-single').text().trim();
      let pubDate = new Date().toISOString();
      if (rawDate) {
         const parsed = new Date(rawDate);
         if (!isNaN(parsed.getTime())) pubDate = parsed.toISOString();
      }

      articles.push({ title: rawTitle, link, image, pubDate });
    });
    console.log(JSON.stringify(articles, null, 2));
  })
  .catch(console.error);

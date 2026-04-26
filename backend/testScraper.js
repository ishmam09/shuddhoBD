const axios = require('axios');
const cheerio = require('cheerio');

axios.get('https://www.tbsnews.net/bangladesh/corruption', {headers:{'User-Agent':'Mozilla/5.0'}})
  .then(res => {
    const $ = cheerio.load(res.data);
    const blocks = $('.views-row, article, .card, .content-block, .news-item');
    console.log('Found blocks:', blocks.length);
    blocks.slice(0, 3).each((i, el) => {
      const $el = $(el);
      const $heading = $el.find('h2, h3').first();
      const rawTitle = $heading.text().trim() || $el.find('.title, h4').text().trim();
      const $anchor = $heading.find('a').length ? $heading.find('a').first() : $el.find('a').first();
      const link = $anchor.attr('href');
      const image = $el.find('img').first().attr('src');
      let pubDate = $el.find('time').attr('datetime') || $el.text().match(/\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}/i)?.[0];
      
      console.log(`\n--- Article ${i+1} ---`);
      console.log('Title:', rawTitle);
      console.log('href:', link);
      console.log('img:', image);
      console.log('pubDate extracted:', pubDate);
    });
  })
  .catch(console.error);

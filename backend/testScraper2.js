const axios = require('axios');
const cheerio = require('cheerio');

axios.get('https://www.tbsnews.net/bangladesh/corruption', {headers:{'User-Agent':'Mozilla/5.0'}})
  .then(res => {
    const $ = cheerio.load(res.data);
    const blocks = $('.views-row, article, .card, .content-block, .news-item, .post');
    if (blocks.length === 0) {
      console.log("NO BLOCKS");
    } else {
      console.log(blocks.first().html());
    }
  })
  .catch(console.error);

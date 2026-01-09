const axios = require('axios');
const cheerio = require('cheerio');

// Example scraper (simplified)
async function scrapeBubbleTeaMenu(url) {
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        // Simple example: collect all drink titles
        const drinks = [];
        $('.drink-item').each((i, el) => {
            drinks.push({
                title: $(el).find('.drink-name').text().trim(),
                base_price: parseFloat($(el).find('.drink-price').text()) || 'unknown'
            });
        });

        return { url, drinks };
    } catch (err) {
        console.error('Scrape error:', err.message);
        return { url, drinks: [], error: err.message };
    }
}

module.exports = { scrapeBubbleTeaMenu };

const { scrapeWithConfig } = require('./genericScraper');
const { findConfig } = require('./configs');

/**
 * Main scraper router - uses config-based system
 * @param {string} url - The URL to scrape
 * @returns {object} - Scraped menu data
 */
async function scrapeBubbleTeaMenu(url) {
    try {
        console.log(`\n=== Scraping: ${url} ===`);
        
        // Find config for this URL
        const config = findConfig(url);
        
        if (!config) {
            console.warn(`No config found for ${url}`);
            return {
                url,
                error: 'Scraper not yet implemented for this site',
                drinks: [],
                series: {}
            };
        }
        
        console.log(`Using config: ${config.name} (${config.structure})`);
        
        // Use generic scraper with config
        const rawData = await scrapeWithConfig(config, url);
        
        return rawData;
        
    } catch (err) {
        console.error('Scrape error:', err.message);
        return {
            url,
            error: err.message,
            drinks: [],
            series: {}
        };
    }
}

module.exports = { scrapeBubbleTeaMenu };

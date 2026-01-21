const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Generic scraper that works with config objects
 * Handles both single-page and multi-page scraping
 * @param {object} config - Site-specific configuration
 * @param {string} baseUrl - Base URL to scrape
 * @returns {object} - Raw scraped data
 */
async function scrapeWithConfig(config, baseUrl) {
    console.log(`Scraping ${config.name} using ${config.structure} structure`);
    
    const cleanBaseUrl = baseUrl.replace(/\/$/, '');
    
    if (config.structure === 'multi-page') {
        return await scrapeMultiPage(config, cleanBaseUrl);
    } else if (config.structure === 'single-page') {
        return await scrapeSinglePage(config, cleanBaseUrl);
    } else {
        throw new Error(`Unknown structure type: ${config.structure}`);
    }
}

/**
 * Scrape a single-page site where all drinks are on one page
 * @param {object} config - Site configuration
 * @param {string} baseUrl - Base URL
 * @returns {object} - Raw scraped data
 */
async function scrapeSinglePage(config, baseUrl) {
    const menuUrl = config.menuUrl ? `${baseUrl}${config.menuUrl}` : baseUrl;
    console.log(`Fetching single page: ${menuUrl}`);
    
    const { data: html } = await axios.get(menuUrl);
    const $ = cheerio.load(html);
    
    const drinks = {};
    
    // Extract drinks using config selectors
    $(config.selectors.drinkContainer).each((i, el) => {
        const name = $(el).find(config.selectors.drinkName).first().text().trim()
            || $(el).text().trim().split('\n')[0];
        
        if (!name || name.length === 0 || name.length > 100) {
            return;
        }
        
        const description = config.selectors.drinkDescription
            ? $(el).find(config.selectors.drinkDescription).first().text().trim()
            : '';
        
        const priceText = config.selectors.drinkPrice
            ? $(el).find(config.selectors.drinkPrice).first().text().trim()
            : '';
        
        const price = priceText ? parseFloat(priceText.replace(/[^0-9.]/g, '')) : null;
        
        drinks[name] = {
            name,
            description,
            price: price || 'unknown',
            base_price: price || 'unknown',
            has_price: !!price
        };
    });
    
    // Group into series (single-page sites usually have one series)
    const seriesName = config.defaultSeriesName || 'Menu';
    const allSeries = {
        [seriesName]: { drinks }
    };
    
    return {
        shop: config.name,
        url: baseUrl,
        series: allSeries,
        toppings: {},
        _meta: {
            seriesCount: 1,
            totalDrinks: Object.keys(drinks).length,
            scrapedAt: new Date().toISOString(),
            structure: 'single-page'
        }
    };
}

/**
 * Scrape a multi-page site where drinks are organized into series pages
 * @param {object} config - Site configuration
 * @param {string} baseUrl - Base URL
 * @returns {object} - Raw scraped data
 */
async function scrapeMultiPage(config, baseUrl) {
    const menuUrl = `${baseUrl}${config.menuIndexUrl}`;
    console.log(`Fetching menu index: ${menuUrl}`);
    
    const { data: indexHtml } = await axios.get(menuUrl);
    const $ = cheerio.load(indexHtml);
    
    // Extract series links
    const seriesLinks = [];
    
    // Try onclick attributes first (for sites like Gong Cha)
    if (config.indexSelectors.onclickPattern) {
        $(config.indexSelectors.seriesContainer).each((i, el) => {
            const onclick = $(el).attr('onclick');
            if (onclick) {
                const match = onclick.match(config.indexSelectors.onclickPattern);
                if (match) {
                    const href = match[1];
                    const name = $(el).find(config.indexSelectors.seriesName).first().text().trim();
                    
                    if (name && !config.excludeSeriesNames?.includes(name.toLowerCase())) {
                        seriesLinks.push({ name, url: href });
                    }
                }
            }
        });
    }
    
    // Fall back to regular links
    if (seriesLinks.length === 0 && config.indexSelectors.seriesLink) {
        $(config.indexSelectors.seriesLink).each((i, el) => {
            const href = $(el).attr('href');
            const name = $(el).text().trim();
            
            if (href && name && !config.excludeSeriesNames?.includes(name.toLowerCase())) {
                const fullUrl = href.startsWith('http') ? href : `${baseUrl}${href}`;
                seriesLinks.push({ name, url: fullUrl });
            }
        });
    }
    
    console.log(`Found ${seriesLinks.length} series links`);
    
    // Scrape each series page
    const allSeries = {};
    
    for (const series of seriesLinks) {
        console.log(`Scraping series: ${series.name} (${series.url})`);
        
        try {
            const { data: seriesHtml } = await axios.get(series.url);
            const $series = cheerio.load(seriesHtml);
            
            const drinks = {};
            
            $series(config.selectors.drinkContainer).each((i, el) => {
                const name = $series(el).find(config.selectors.drinkName).first().text().trim()
                    || $series(el).text().trim().split('\n')[0];
                
                if (!name || name.length === 0 || name.length > 100) {
                    return;
                }
                
                const description = config.selectors.drinkDescription
                    ? $series(el).find(config.selectors.drinkDescription).first().text().trim()
                    : '';
                
                const priceText = config.selectors.drinkPrice
                    ? $series(el).find(config.selectors.drinkPrice).first().text().trim()
                    : '';
                
                const price = priceText ? parseFloat(priceText.replace(/[^0-9.]/g, '')) : null;
                
                drinks[name] = {
                    name,
                    description,
                    price: price || 'unknown',
                    base_price: price || 'unknown',
                    has_price: !!price
                };
            });
            
            if (Object.keys(drinks).length > 0) {
                allSeries[series.name] = { drinks };
            }
            
            // Be respectful to the server
            await new Promise(resolve => setTimeout(resolve, 500));
            
        } catch (err) {
            console.error(`Error scraping series ${series.name}:`, err.message);
        }
    }
    
    return {
        shop: config.name,
        url: baseUrl,
        series: allSeries,
        toppings: {},
        _meta: {
            seriesCount: Object.keys(allSeries).length,
            totalDrinks: Object.values(allSeries).reduce((sum, s) => sum + Object.keys(s.drinks || {}).length, 0),
            scrapedAt: new Date().toISOString(),
            structure: 'multi-page'
        }
    };
}

module.exports = {
    scrapeWithConfig,
    scrapeSinglePage,
    scrapeMultiPage
};

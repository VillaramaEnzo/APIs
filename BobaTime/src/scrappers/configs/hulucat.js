/**
 * HuluCat scraper configuration
 * Structure: Single-page (all drinks on homepage)
 */

module.exports = {
    name: 'HuluCat',
    slug: 'hulucat',
    domains: ['hulucat.co.nz'],
    method: 'cheerio',
    structure: 'single-page',
    
    // Single-page config
    menuUrl: '', // Homepage
    defaultSeriesName: 'Menu',
    
    // Selectors for drinks on homepage
    selectors: {
        drinkContainer: 'a[href*="/menu-detail/"]',
        drinkName: 'h3',
        drinkDescription: 'p',
        drinkPrice: '[class*="price"], .cost',
    }
};

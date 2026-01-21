/**
 * Gong Cha scraper configuration
 * Structure: Multi-page (menu index -> series pages -> drinks)
 */

module.exports = {
    name: 'GongCha',
    slug: 'gongcha',
    domains: ['gongcha.co.nz'],
    method: 'cheerio',
    structure: 'multi-page',
    
    // Multi-page config
    menuIndexUrl: '/web/menu',
    
    indexSelectors: {
        seriesContainer: '.category[onclick]',
        onclickPattern: /window\.location='([^']+)'/,
        seriesName: 'h1',
        seriesLink: null, // Fallback not needed for Gong Cha
    },
    
    excludeSeriesNames: ['topping', 'toppings'],
    
    // Series page selectors
    selectors: {
        drinkContainer: '.product',
        drinkName: 'h3, .product-name, .name',
        drinkDescription: '.description, .desc, p',
        drinkPrice: '.price, .cost, [class*="price"]',
    }
};

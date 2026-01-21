const express = require('express');
const router = express.Router();
const {
    loadLatestMenu,
    loadMenuByDate,
    listSnapshots,
    compareMenus,
    listAvailableShops
} = require('../utils/loadMenu');

/**
 * GET /menus
 * List all available shops
 */
router.get('/', (req, res) => {
    const shops = listAvailableShops();
    res.json({
        shops,
        count: shops.length
    });
});

/**
 * GET /menus/:shop
 * Return full menu JSON for a shop (latest snapshot)
 */
router.get('/:shop', (req, res) => {
    const { shop } = req.params;
    const menu = loadLatestMenu(shop);
    
    if (!menu) {
        return res.status(404).json({
            error: 'Menu not found',
            shop,
            message: `No menu data available for ${shop}`
        });
    }
    
    res.json(menu);
});

/**
 * GET /menus/:shop/snapshots
 * List all available snapshots for a shop
 */
router.get('/:shop/snapshots', (req, res) => {
    const { shop } = req.params;
    const snapshots = listSnapshots(shop);
    
    res.json({
        shop,
        snapshots,
        count: snapshots.length
    });
});

/**
 * GET /menus/:shop/snapshots/:date
 * Get a specific snapshot by date (YYYY-MM-DD)
 */
router.get('/:shop/snapshots/:date', (req, res) => {
    const { shop, date } = req.params;
    const menu = loadMenuByDate(shop, date);
    
    if (!menu) {
        return res.status(404).json({
            error: 'Snapshot not found',
            shop,
            date,
            message: `No snapshot found for ${shop} on ${date}`
        });
    }
    
    res.json(menu);
});

/**
 * GET /series/:shop
 * List all series for a shop
 */
router.get('/series/:shop', (req, res) => {
    const { shop } = req.params;
    const menu = loadLatestMenu(shop);
    
    if (!menu) {
        return res.status(404).json({ error: 'Menu not found', shop });
    }
    
    const series = Object.keys(menu.series || {}).map(name => ({
        name,
        drinkCount: Object.keys(menu.series[name].drinks || {}).length
    }));
    
    res.json({
        shop: menu.shop,
        series,
        count: series.length,
        scraped_at: menu.scraped_at
    });
});

/**
 * GET /drinks/:shop
 * Fetch drinks with optional filters
 * Query params: series, tea_base, seasonal, search
 */
router.get('/drinks/:shop', (req, res) => {
    const { shop } = req.params;
    const { series, tea_base, seasonal, search } = req.query;
    
    const menu = loadLatestMenu(shop);
    
    if (!menu) {
        return res.status(404).json({ error: 'Menu not found', shop });
    }
    
    let drinks = [];
    
    // Collect all drinks
    for (const [seriesName, seriesData] of Object.entries(menu.series || {})) {
        for (const [drinkName, drinkData] of Object.entries(seriesData.drinks || {})) {
            drinks.push({
                series: seriesName,
                name: drinkName,
                ...drinkData
            });
        }
    }
    
    // Apply filters
    if (series) {
        drinks = drinks.filter(d => d.series.toLowerCase() === series.toLowerCase());
    }
    
    if (tea_base) {
        drinks = drinks.filter(d => d.tea_base?.toLowerCase() === tea_base.toLowerCase());
    }
    
    if (seasonal !== undefined) {
        const isSeasonalFilter = seasonal === 'true' || seasonal === '1';
        drinks = drinks.filter(d => !!d.seasonal === isSeasonalFilter);
    }
    
    if (search) {
        const searchLower = search.toLowerCase();
        drinks = drinks.filter(d =>
            d.name.toLowerCase().includes(searchLower) ||
            d.description?.toLowerCase().includes(searchLower)
        );
    }
    
    res.json({
        shop: menu.shop,
        drinks,
        count: drinks.length,
        filters: { series, tea_base, seasonal, search },
        scraped_at: menu.scraped_at
    });
});

/**
 * GET /toppings/:shop
 * Fetch topping list and prices
 */
router.get('/toppings/:shop', (req, res) => {
    const { shop } = req.params;
    const menu = loadLatestMenu(shop);
    
    if (!menu) {
        return res.status(404).json({ error: 'Menu not found', shop });
    }
    
    const toppings = menu.toppings || {};
    
    res.json({
        shop: menu.shop,
        toppings,
        count: Object.keys(toppings).length,
        scraped_at: menu.scraped_at
    });
});

/**
 * GET /changes/:shop
 * Track changes in drinks, prices, or seasonal items
 * Query params: since (YYYY-MM-DD)
 */
router.get('/changes/:shop', (req, res) => {
    const { shop } = req.params;
    const { since } = req.query;
    
    if (!since) {
        return res.status(400).json({
            error: 'Missing required parameter',
            message: 'Please provide "since" query parameter (YYYY-MM-DD)'
        });
    }
    
    const oldMenu = loadMenuByDate(shop, since);
    const newMenu = loadLatestMenu(shop);
    
    if (!oldMenu) {
        return res.status(404).json({
            error: 'Old snapshot not found',
            shop,
            date: since,
            message: `No snapshot found for ${shop} on ${since}`
        });
    }
    
    if (!newMenu) {
        return res.status(404).json({
            error: 'Current menu not found',
            shop
        });
    }
    
    const changes = compareMenus(oldMenu, newMenu);
    
    res.json({
        shop: menu.shop,
        comparison: {
            from: since,
            to: newMenu.scraped_at,
        },
        changes,
        summary: {
            seriesAdded: changes.added.series.length,
            seriesRemoved: changes.removed.series.length,
            drinksAdded: changes.added.drinks.length,
            drinksRemoved: changes.removed.drinks.length,
            drinksModified: changes.modified.drinks.length
        }
    });
});

module.exports = router;

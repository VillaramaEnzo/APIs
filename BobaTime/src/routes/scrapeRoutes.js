const express = require('express');
const router = express.Router();
const { createJob, getJobStatus, updateJob } = require('../jobs/jobManager');
const { scrapeBubbleTeaMenu } = require('../scrappers/bubbleTeaScraper');
const { normalizeMenu } = require('../utils/normalizeMenu');
const saveSnapshot = require('../utils/saveSnapshot');
const { getSupportedDomains } = require('../scrappers/configs');
const loadStoresData = require('../utils/loadData');

router.post('/scrape', async (req, res) => {
    const { urls } = req.body;
    if (!urls || !urls.length) return res.status(400).json({ error: 'No URLs provided' });

    const jobId = createJob(urls);

    // Start async scraping
    (async () => {
        const results = [];
        
        for (const url of urls) {
            try {
                console.log(`\n=== Starting scrape for ${url} ===`);
                
                // Step 1: Scrape the site
                const rawData = await scrapeBubbleTeaMenu(url);
                
                if (rawData.error) {
                    console.error(`Scrape failed for ${url}:`, rawData.error);
                    results.push({
                        url,
                        success: false,
                        error: rawData.error
                    });
                    continue;
                }
                
                // Step 2: Normalize the data
                console.log(`Normalizing data for ${rawData.shop}...`);
                const normalizedData = normalizeMenu(rawData);
                
                // Step 3: Save snapshot to disk
                const shopSlug = rawData.shop.toLowerCase().replace(/\s+/g, '');
                console.log(`Saving snapshot for ${shopSlug}...`);
                const filepath = saveSnapshot(shopSlug, normalizedData);
                
                // Step 4: Add to results
                results.push({
                    url,
                    shop: rawData.shop,
                    success: true,
                    filepath,
                    seriesCount: Object.keys(normalizedData.series || {}).length,
                    totalDrinks: Object.values(normalizedData.series || {})
                        .reduce((sum, s) => sum + Object.keys(s.drinks || {}).length, 0),
                    scrapedAt: normalizedData.scraped_at
                });
                
                console.log(`✓ Successfully scraped and saved ${rawData.shop}`);
                
            } catch (err) {
                console.error(`Error processing ${url}:`, err.message);
                results.push({
                    url,
                    success: false,
                    error: err.message
                });
            }
        }
        
        updateJob(jobId, results);
        console.log(`\n=== Job ${jobId} completed ===`);
    })();

    res.json({ jobId, message: 'Scraping job started' });
});

router.get('/status/:jobId', (req, res) => {
    const status = getJobStatus(req.params.jobId);
    if (!status) return res.status(404).json({ error: 'Job not found' });
    res.json(status);
});

/**
 * POST /scrape/all
 * Scrape all configured stores from stores.json
 */
router.post('/scrape/all', async (req, res) => {
    console.log('\n=== Starting default scrape of all configured stores ===');
    
    // Load stores data
    const storesData = loadStoresData();
    const supportedDomains = getSupportedDomains();
    
    // Collect URLs for all stores that have scrapers
    const urlsToScrape = [];
    
    for (const [country, countryData] of Object.entries(storesData.countries || {})) {
        const stores = countryData.stores || [];
        
        for (const store of stores) {
            // Check if we have a scraper for this domain
            const hasScraper = supportedDomains.some(domain => store.url.includes(domain));
            
            if (hasScraper) {
                urlsToScrape.push({
                    url: store.url,
                    name: store.name,
                    country
                });
            }
        }
    }
    
    if (urlsToScrape.length === 0) {
        return res.status(400).json({
            error: 'No configured stores found',
            message: 'No stores in stores.json have available scrapers',
            supportedDomains
        });
    }
    
    console.log(`Found ${urlsToScrape.length} stores to scrape`);
    
    const jobId = createJob(urlsToScrape.map(s => s.url));
    
    // Start async scraping
    (async () => {
        const results = [];
        
        for (const storeInfo of urlsToScrape) {
            try {
                console.log(`\n=== Scraping ${storeInfo.name} (${storeInfo.country}) ===`);
                
                // Step 1: Scrape the site
                const rawData = await scrapeBubbleTeaMenu(storeInfo.url);
                
                if (rawData.error) {
                    console.error(`Scrape failed for ${storeInfo.name}:`, rawData.error);
                    results.push({
                        url: storeInfo.url,
                        name: storeInfo.name,
                        country: storeInfo.country,
                        success: false,
                        error: rawData.error
                    });
                    continue;
                }
                
                // Step 2: Normalize the data
                const normalizedData = normalizeMenu(rawData);
                
                // Step 3: Save snapshot
                const shopSlug = rawData.shop.toLowerCase().replace(/\s+/g, '');
                const filepath = saveSnapshot(shopSlug, normalizedData);
                
                results.push({
                    url: storeInfo.url,
                    name: storeInfo.name,
                    shop: rawData.shop,
                    country: storeInfo.country,
                    success: true,
                    filepath,
                    seriesCount: Object.keys(normalizedData.series || {}).length,
                    totalDrinks: Object.values(normalizedData.series || {})
                        .reduce((sum, s) => sum + Object.keys(s.drinks || {}).length, 0),
                    scrapedAt: normalizedData.scraped_at
                });
                
                console.log(`✓ Successfully scraped ${storeInfo.name}`);
                
            } catch (err) {
                console.error(`Error processing ${storeInfo.name}:`, err.message);
                results.push({
                    url: storeInfo.url,
                    name: storeInfo.name,
                    country: storeInfo.country,
                    success: false,
                    error: err.message
                });
            }
        }
        
        updateJob(jobId, results);
        
        const successCount = results.filter(r => r.success).length;
        console.log(`\n=== Job ${jobId} completed: ${successCount}/${results.length} successful ===`);
    })();
    
    res.json({
        jobId,
        message: 'Default scrape job started',
        storesQueued: urlsToScrape.length,
        stores: urlsToScrape.map(s => ({ name: s.name, url: s.url, country: s.country }))
    });
});

module.exports = router;

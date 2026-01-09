/**
 * FUTURE CONSIDERATIONS
 * ---------------------
 * Currently, store data is exposed primarily by geographic hierarchy:
 *   /stores
 *   /stores/countries
 *
 * In the future, we may want to support brand-centric access patterns,
 * since a single brand (e.g. "Gong Cha") can exist in multiple countries
 * or regions.
 *
 * Possible future strategies:
 *
 * 1. Query-based filtering
 *    GET /stores?brand=GongCha
 *    GET /stores?brand=GongCha&country=NZ
 *
 *    - Keeps routes minimal
 *    - Requires iterating/normalising data at request time
 *
 * 2. Brand-style endpoints
 *    GET /stores/brands
 *    GET /stores/brands/:brand
 *
 *    - More expressive and discoverable
 *    - Likely requires a derived index (brand -> locations)
 *
 * Both approaches can coexist if/when store data grows in complexity.
 * For now, we intentionally keep the API simple and aligned to the
 * current JSON shape.
 */

const express = require('express');
const router = express.Router();
const loadStoresData = require('../utils/loadData');

const storesData = loadStoresData();

// Helper to ignore _meta when iterating countries
function getValidCountries(data) {
  return Object.fromEntries(
    Object.entries(data.countries || {}).filter(([key]) => key !== '_meta')
  );
}

/**
 * GET /stores/countries
 * List supported countries
 */
router.get('/countries', (req, res) => {
  res.json(Object.keys(getValidCountries(storesData)));
});

/**
 * GET /stores
 * Return full store directory (ignoring _meta)
 */
router.get('/', (req, res) => {
  res.json(getValidCountries(storesData));
});

/**
 * GET /stores/all
 * Flattened list of all stores
 */
router.get('/all', (req, res) => {
  const allStores = [];

  Object.entries(getValidCountries(storesData)).forEach(([country, countryData]) => {
    // Top-level stores
    if (countryData.stores) {
      countryData.stores.forEach(store =>
        allStores.push({ ...store, country })
      );
    }

    // Region-based stores (future-proof)
    Object.entries(countryData).forEach(([key, value]) => {
      if (key === 'stores') return;
      if (value.stores) {
        value.stores.forEach(store =>
          allStores.push({ ...store, country, region: key })
        );
      }
    });
  });

  res.json(allStores);
});

/**
 * GET /stores/:country
 * Get all stores for a country
 */
router.get('/:country', (req, res) => {
  const country = req.params.country.toUpperCase();
  const countryData = getValidCountries(storesData)[country];

  if (!countryData) {
    return res.status(404).json({ message: 'Country not found' });
  }

  if (countryData.stores) {
    return res.json(countryData.stores);
  }

  // If country only has regions
  const regionStores = Object.values(countryData)
    .filter(v => v.stores)
    .flatMap(v => v.stores);

  res.json(regionStores);
});

/**
 * GET /stores/:country/:region
 * Get stores by country + region
 */
router.get('/:country/:region', (req, res) => {
  const country = req.params.country.toUpperCase();
  const region = req.params.region;

  const regionData = getValidCountries(storesData)[country]?.[region];

  if (!regionData || !regionData.stores) {
    return res.status(404).json({ message: 'Region not found' });
  }

  res.json(regionData.stores);
});

module.exports = router;

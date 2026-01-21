# BobaTime API - Usage Guide

## Overview
BobaTime is a bubble tea menu scraping and comparison API. It scrapes menus from various bubble tea stores, normalizes the data, and provides endpoints to query and compare drinks.

## Quick Start

```bash
# Install dependencies
npm install

# Start the server
npm run dev
```

The API will be available at `http://localhost:3000`

## API Endpoints

### Store Directory

#### GET /stores
List all stores grouped by country.

#### GET /stores/countries
List supported countries.

#### GET /stores/:country
Get all stores for a specific country (e.g., `/stores/NZ`).

#### GET /stores/all
Get a flattened list of all stores.

---

### Scraping

#### POST /scrape
Scrape specific URLs.

**Request Body:**
```json
{
  "urls": ["https://gongcha.co.nz", "https://hulucat.co.nz"]
}
```

**Response:**
```json
{
  "jobId": "abc-123-def",
  "message": "Scraping job started"
}
```

#### POST /scrape/all
Scrape all configured stores from stores.json.

**Response:**
```json
{
  "jobId": "xyz-789-ghi",
  "message": "Default scrape job started",
  "storesQueued": 2,
  "stores": [...]
}
```

#### GET /status/:jobId
Check the status of a scraping job.

**Response:**
```json
{
  "status": "completed",
  "urls": [...],
  "result": [
    {
      "url": "https://gongcha.co.nz",
      "shop": "GongCha",
      "success": true,
      "filepath": "/data/gongcha/snapshot-2026-01-21.json",
      "seriesCount": 8,
      "totalDrinks": 108
    }
  ]
}
```

---

### Menu Data

#### GET /menus
List all available shops with menu data.

#### GET /menus/:shop
Get the full menu for a shop (latest snapshot).

**Example:** `/menus/gongcha`

#### GET /menus/:shop/snapshots
List all available snapshots for a shop.

#### GET /menus/:shop/snapshots/:date
Get a specific snapshot by date (YYYY-MM-DD).

**Example:** `/menus/gongcha/snapshots/2026-01-21`

---

### Series

#### GET /series/:shop
List all drink series/categories for a shop.

**Example Response:**
```json
{
  "shop": "GongCha",
  "series": [
    { "name": "Brewed Tea", "drinkCount": 8 },
    { "name": "Milk Tea", "drinkCount": 35 }
  ],
  "count": 8
}
```

---

### Drinks

#### GET /drinks/:shop
Get all drinks for a shop with optional filters.

**Query Parameters:**
- `series` - Filter by series name
- `tea_base` - Filter by tea base (e.g., "Black Tea", "Green Tea")
- `seasonal` - Filter seasonal drinks (true/false)
- `search` - Search in drink names and descriptions

**Examples:**
- `/drinks/gongcha?series=Milk Tea`
- `/drinks/gongcha?tea_base=Black Tea`
- `/drinks/gongcha?search=taro`

---

### Toppings

#### GET /toppings/:shop
Get available toppings and prices for a shop.

---

### Changes

#### GET /changes/:shop?since=YYYY-MM-DD
Compare menu changes between two dates.

**Example:** `/changes/gongcha?since=2026-01-15`

**Response:**
```json
{
  "shop": "GongCha",
  "comparison": {
    "from": "2026-01-15",
    "to": "2026-01-21T12:00:00Z"
  },
  "changes": {
    "added": {
      "series": [],
      "drinks": [...]
    },
    "removed": {
      "series": [],
      "drinks": [...]
    },
    "modified": {
      "drinks": [...]
    }
  },
  "summary": {
    "seriesAdded": 0,
    "drinksAdded": 3,
    "drinksRemoved": 1,
    "drinksModified": 2
  }
}
```

---

## Adding New Scrapers

To add support for a new bubble tea store:

1. Create a config file in `src/scrappers/configs/`:

```javascript
// src/scrappers/configs/newstore.js
module.exports = {
    name: 'NewStore',
    slug: 'newstore',
    domains: ['newstore.co.nz'],
    method: 'cheerio',
    structure: 'single-page', // or 'multi-page'
    
    selectors: {
        drinkContainer: '.drink',
        drinkName: '.name',
        drinkDescription: '.desc',
        drinkPrice: '.price'
    }
};
```

2. The scraper will automatically be available!

---

## Data Schema

Scraped menus are normalized to this schema:

```json
{
  "shop": "GongCha",
  "url": "https://gongcha.co.nz",
  "scraped_at": "2026-01-21T12:00:00Z",
  "series": {
    "Milk Tea": {
      "drinks": {
        "Classic Milk Tea": {
          "tea_base": "Black Tea",
          "description": "Black tea with milk and sugar",
          "base_price": "unknown",
          "has_price": false,
          "upsizes": {},
          "toppings_not_allowed": []
        }
      }
    }
  },
  "toppings": {}
}
```

---

## Supported Stores

Currently supported:
- **Gong Cha** (gongcha.co.nz) - Multi-page scraper
- **HuluCat** (hulucat.co.nz) - Single-page scraper

More stores can be added by creating config files!

# Product Requirements Document (PRD)

## BobaTime ~ Bubble Tea Menu Comparison API

### Overview
BobaTime is a multi-phase API designed to scrape, normalise, and present bubble tea menu data from multiple stores. 

It enables:
- Quick comparison of drinks, sizes, prices, toppings, and upsizes
- Tracking of seasonal drinks and price changes
- Potential for analytics and insights in later stages

The system is structured to evolve from a lightweight local MVP to a cloud-based, user-friendly service, and eventually incorporate analytics and AI for smarter insights


### Vision
Bubble tea stores frequently update their menus, offer seasonal specials, and have varying pricing structures

BobaTime aims to:
- Save time for enthusiasts, franchise owners, or analysts by automating menu collection
- Standardise menu data across stores for easy comparison
- Provide a platform for future analytics, trend tracking, and insights


### Project Phases

#### Phase 1 - MVP: Asynchronous Scraper + Local JSON Storage

**Objectives**
- Users submit a list of store URLS to scrape menus asynchronously 
- Maintain as a simple JSON directory grouped by countrys
- Use directory to run default scrapes without user input
- Normalise drinks into a structured JSON format
- Track seires, tea_base, toppings exceotions, upsizes, and seasonal drinks
- Store data locally in JSON files
- Provide API endpoints for retreival
  

**Core Features**
1. Submitted Jobs
  - POST /scrape recieves a list of URLs
  - Schedules background scraping jobs
  - Returns a Job ID for status tracking
2. Asynchronous Scraper Engine
  - Handles JS-heavy and static sites
  - Fetches menus, parses drinks, sizes, upsizes, prices, toppings, series, tea base, and seasonal flags
  - Detects missing, updated, or new drinks
3. Store Directory Structure 
  - BobaTime maintains a structured directory of bubble tea stores to support multi-country expansion and front-end filtering

```json
{
  "NZ": {
    "stores": [
      { 
        "name": "Gong Cha", 
        "url": "https://gongcha.co.nz/menu" 
      },
      { 
        "name": "Chatime", 
        "url": "https://chatime.co.nz/menu" 
      },
      { 
        "name": "Tiger Sugar", 
        "url": "https://tigersugar.co.nz/menu" 
      },
      { 
        "name": "Yifang Taiwan Fruit Tea", 
        "url": "https://yifangtea.co.nz/menu" 
      },
      { 
        "name": "CoCo Fresh Tea",
        "url": "https://cocotea.co.nz/menu" 
      },
      { 
        "name": "Woobee", 
        "url": "https://woobee.co.nz/menu" 
      },
      { 
        "name": "Taiwan Ten", 
        "url": "https://www.taiwanten.co.nz/menu" 
      },
      { 
        "name": "Don't Yell At Me", 
        "url": "https://dyam.co.nz/menu" 
      },
      ...
    ]
  }
}
```
  - Regions are not required, but can be added later with minimal schema changes
   ```json
   { "NZ": { "Auckland": { "stores": [...] } } }
   ```
  - This store list becomes the master reference for:
    - Default scrapes
    - Testing
    - Analytics Aggregation 

1. Drink Normalisation

- Scrape all available drink metadata even if prices missing
- Mark prices as "unknown" rather than omit them
- Allow future price discovery from other sources (e.g. UberEats, Manual Entry)

```json
{
  "shop": "GongCha",
  "url": "https://gongcha.co.nz/menu",
  "scraped_at": "2025-12-01T14:00:00Z",

  "series": {
    "Brewed Tea": {
      "drinks": {
        "Green Tea": {
          "tea_base": "Green Tea",
          "description": "Classic brewed green tea",
          "base_price": 4.50, // or "unknown",
          "has_price": true, // or false when the website hides pricing
          "upsizes": {"Large": 1.50},
          "toppings_not_allowed": []
        },
        "Lemon Black Tea": {
          "tea_base": "Black Tea",
          "description": "Refreshing black tea with lemon",
          "base_price": 5.00,
          "upsizes": {"Large": 1.50},
          "toppings_not_allowed": ["Pudding"]
        }
      }
    },
    "Milk Tea": {
      "drinks": {
        "Classic Milk Tea": {
          "tea_base": "Black Tea",
          "description": "Black tea with milk and sugar",
          "base_price": 5.00,
          "upsizes": {"Large": 1.50},
          "toppings_not_allowed": []
        }
      }
    },
    "Seasonal Specials": {
      "drinks": {
        "Pumpkin Spice Milk Tea": {
          "tea_base": "Black Tea",
          "description": "Limited-time seasonal flavor",
          "base_price": 5.50,
          "upsizes": {"Large": 1.50},
          "toppings_not_allowed": []
        }
      }
    }
  },

  "toppings": {
    "Pearls": {"price": 0.50},
    "Pudding": {"price": 0.70},
    "Jelly": {"price": 0.70},
    "Aloe Vera": {"price": 0.80},
    "Coconut Jelly": {"price": 0.80},
    ...
  }
}
```

4. Local Data Storage
   - Store each shop's menu in /data/<shop-slug>/snapshot-YYYY-MM-DD.json
5. API Endpoints

| Endpoint                          | Description                                                   |
| ---	                              | ---	                                                          |
| POST /scrape   	                  | Schedule scraping jobs with shop URLs                         |
| GET /status/:jobId  	            | Check scraping progress  	                                    |
| GET /series  	                    | List all series for a shop  	                                |
| GET /drinks  	                    | Fetch drinks; optional filters: series, tea_base, seasonal  	|
| GET /toppings  	                  | Fetch topping list and prices                                 |
| GET /menus  	                    | Return full shop JSON                                         |
| GET /changes?since=YYYY-MM-DD  	  | Track changes in drinks, prices, or seasonal items            |
| GET /stores                       | Lists stores grouped by country                               |
| GET /stores/:country              | Lists stores for a single country (e.g. NZ)                   |
| GET /stores/:country/:region      | Lists stores for a single country by region                   |


#### Phase 2 - Optional Persistent Database

**Objectives**
- Store historical snapshots in cloud or local database (SQLite, PostgreSQL, etc.)
- Default DB contains a curated selection of pre-specified stores
- External users cannot post to internal DB; they can only fetch for testing
- Users can optionally connect their own database for personal projects

**Core Features**
- Track price changes, new drinks, and seasonal specials over time
- Provide the same API endpoints as Phase 1, now connected to the database
- Keep internal DB updated for pre-specified stores with scheduled scrapes

**Database Design Consideration: Multi-Country Support**

The database schema must support:
- Multiple countries
- Optional region tagging
- Unified drink normalisation regardless of store location

Table Example: 

| Table           | Purpose                           |
| ---             | ---                               |
| countries       | List of supported countries       |
| stores          | Store name, country code, URL     |   
| menu_snapshots  | Historical updates                |
| drinks          | Normalised drink entries          |
| toppings        | Store-specific topping categlog   |


#### Phase 3 - Analytics & AI (Future)

**Objectives**
- Analyse trends across drinks, series, tea bases, and toppings
- Detect pricing anomalies or popular drinks across stores
- Optionally integrate AI for
  - Smart scraping (adapting to site layout changes)
  - Suggesting similar drinks across stores
  - Generating insights or reports for franchise owners

**Core Features**
- Enhanced API endpoints for aggregated analytics:
  - /analytics/popular-drinks
  - /analytics/price-trends
  - /analytics/comparisons
- Optional AI layer to improve accuracy and insights over time


### Considerations
1. Cross-store normalisation
  - Series names may vary accross stores; tea_base can help standardise comparisons
2. Toppings
  - Track only toppings_not_allowed for each drink
  - Simplifies data while keeping rules for exceptions
3. Seasonal Drinks
  - Placed in a separate series or marked with seasonal: true
4. Scalability
  - Designed to scale from local JSON storage -> cloud database -> AI-assisted insights
5. Legal & Ethical
  - Scraping public menus is generally low-risk, but respect robots.txt and store terms of use
  - Avoid storing sensitive user data or protected content


### Front-End Use Cases Enabled by the API
In the future client applications, users will be able to:
- Filter drinks by tea type (e.g., "mlik tea", "fruit tea", "oolong")
- Compare stores by
  - Price
  - Distance (if geolocation is added)
  - Ratings (sourced externally, not scraped)
  - Closest top 5 places offering a specific drink type
- Navigate cross-store drink alternatives ("similar drinks" engine in Phase 3)
- BobaTime becomes the analysis layer powering these client apps

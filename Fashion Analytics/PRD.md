# Product Requirements Document (PRD)

## Fashion Product Scraper & Analytics API

## Overview
This product aims to build a multi-phase API that allows users (primarily fashion brand owners or analysts) to 

- Scrape comeptitor product categlogs
- Normalise data
- Store historical snapshots (optional) 
- And eventually extract insights using AI-driven analytics.

The system begins with a lightweight scraper-based MVP (no external databases), evolves into a cloud-backed persistent data store, and ultimately become a trend-analysis intelligence layer.

---


## Vision
Fasion brands constantly change catelogs — items rotate, sell out, go on sale, restock or disappear. 

Brand owners need a way to:
- Track these changes
- Detect trends 
- Comapre competitors
- Maintain a competitive edge.

This API proves a structured foundation for:
- Product scraping
- Catelog Monitoring
- Historical Comparison
- Pricing/Stock trend analysis

The long-term goal: **A Solid Fashion-Focused Analytics Tool** that empowers brand owners and analysts with actionable insights

---


## User Stories

### Retail Manager / Brand Owner
- As a retail manager or brand owner, I want to automatically collect competitor product data from websites in a normalised JSON format, so that I cna quickly analyse pricing, availability, and promotions without spending hours manually visiting stores or scraping websites

### Developer / Data Enthusiast
- As a developer or analyst, I want a flexible API that returns, clean, normalised JSON, so I can integrate it into my own database, dashboards, or analytics pipelines.

---


## Project Phases

### Phase 1 - MVP: Asynchronous Scraper + Local JSON Storage

**Objectives**
- Allow user to submit a list of URLS (brands, collections, product pages)
- Scrape pages asynchrously to avoid timouuts or Cloudflare blocking
- Normalise product data into a consistent JSON structure
- Store resutls in local JSON files (no database yet)
- Allo retrevial through simple API endpoints
- Track timestamps so historical comparison will be possible later

**Core Features**
1. Submitted Jobs
   - Endpoint recieves a list of URLs
   - Schedules background scraping jobs
   - Returns a JOB ID for checking status

2. Asynchronous Scraper Engine
   - Fetches HTML (with fallbacks for JS-heavy sites)
   - Extracts product lists, product details, pagination
   - Detches when a product is missing, updated, or new

3. Product Normalisation
   - Standard JSON structure returend for every product
   ```json
   {
        "title": "Oversized Hoodie",
        "price": 120.00,
        "currency": "USD",
        "category": "hoodie",
        "colors": ["black", "white"],
        "sizes": ["S", "M", "L"],
        "images": ["...", "..."],
        "url": "https://example.com/p/hoodie",
        "brand": "Example Brand",
        "scraped_at": "2025-12-01T10:20:33.000Z"
    }
    ```

1. Local Data Storage
   - Each site gets its own folder
   - /data/
        /brand-slug/
            snapshot-2025-12-01.json
            snapshot-2025-12-02.json

2. Useful API Endpoints (Subject to change)
   - POST /scrape
   - GET /status/:jobId
   - GET /products?brand=xxx
   - GET /products?category=hoodie
   - GET /changes?brand=xxx&since=2025-11-01

**Rationale** 
- Provides immeidate value without requiring infrastrcture
- JSON-first approach allows users to analyse, integrate, or visualise data in any workflow
- Automates competitor monitoring and reduces manual work

### Phase 2 — Persistent Cloud Database + Historical Tracking (User-Facing)

**Objectives**
- Introduce a cloud-backed internal demonstration database with curated product data
- Allows user to fetch test data without storing anything from them
- Provide optional integration for users to connect their own database (BYODB)
- Build toward historical tracking and analytics functionality

**Key Features**

1. Internal Demonstration Database
   - Curated selection of pre-specified URLs maintained by the project owner
   - Periodic scraping keeps this dataset reasonably up-to-date
   - Users can fetch products for testing, filtering, or dashboard integration
   - External POST submissoin do not persist in the internal DB
   - Demonstrates API functionality without requiring user infrastructure

2. Bring-Your-Own-Database (BYODB)
   - Users can optinally connect scraper output to their personal database
     - PostgreSQL / Supabase / MongoDB / SQLite / Firebase / Google Sheets / Notion
   - Users control storage, retention, and schema
   - Adaptors and example code provided for easy integration

3. API as Data Processing Layer
   - Handles scraping, normalisation, and optional deduplication
   - Returns structured data to the internal demo DB or user's personal DB
   - Ensures API remains stateless for external users while demonstrating full functionality

**Rationale** 
- Provides a ready-to-use dataset for experimentation and testing
- Avoids multi-tenant storage issues, data bloat, and legal concerns
- Bridges Stage 1 MVP functionality with Stage 3 analytics capability 

### Phase 3 - Analytics & AI Insights (Internal / Optional User-Facing)

**Objectives**
- Transform raw and historucal scraped data into actionable insights 
- Introduce AI-driven intelligence to imrpove scraping, data normalisation, and reporting
- Enable smarter competitor tracking and trend detection

**Potential Features**

1. AI-Assisted Smart Scraping
   - Enhance scraping process using AI:
     - Parse complex JS-heavy or dynamically loaded pages
     - Detect product cards, tables, or grids reliably even if layouts change
     - Infer missing product attributes (category, colour, size)
     - Validate and normalise scraped data automatically
   - Can leverage existing AI models or a custom-trained model on your own dataset

2. Trend Detection & Historical Analysis
   - Track product lifescycle over time (added, removed, restocked) using timestamps
   - Detect trends across brand, categories, pricing, and promotions
   - Generate historical comparisons and insights

3. Automated AI insights & Reports
   - Summarise competitor activity or catelog changes
   - Generate dashboards or automated reports for users
   - Highlight key insights (e.g. "Most recurring hoodie colours this month", "Price drops detected")

4. Integration with Dashboards
   - Feed AI-processed data to visuaiisation tools (Notion, Tableau, Google Data Studio)
   - Allow advanced users to build custom analytics or recommendation systems

**Rationale**
- AI improves both the scraping reliability and the value of the insights delievered
- Users get clean, normalised data, actionable analysis, and automated competitor intelligence
- Provides a a natural evolution from Stage 1/2 JSON-focused MVP to full-fledged AI-powered analytics

---


## Deployment & Infrastructure Considerations
- Stage 1: Serverless, stateless, lightweight API - no database required
- Stage 2: Internal demo DB + optional user-owned DB adapters for persistence
- Stage 3: Analytics pipeline with AI enrichment, scablable compute as needed

### Security & Reliability 
- HTTPS for all endpoints
- Rate-limiting and throttling to protect target sites
- Logging and monitoring (non-user data only)







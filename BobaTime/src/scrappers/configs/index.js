/**
 * Config registry - auto-discovers all scraper configs
 * Maps domains to their configurations
 */

const fs = require('fs');
const path = require('path');

// Load all config files
const configs = {};
const configFiles = fs.readdirSync(__dirname)
    .filter(file => file.endsWith('.js') && file !== 'index.js');

for (const file of configFiles) {
    const config = require(path.join(__dirname, file));
    
    // Map each domain to this config
    for (const domain of config.domains) {
        configs[domain] = config;
    }
}

/**
 * Find config for a given URL
 * @param {string} url - The URL to find config for
 * @returns {object|null} - Config object or null if not found
 */
function findConfig(url) {
    for (const [domain, config] of Object.entries(configs)) {
        if (url.includes(domain)) {
            return config;
        }
    }
    return null;
}

/**
 * Get all available configs
 * @returns {object} - Map of domains to configs
 */
function getAllConfigs() {
    return configs;
}

/**
 * Get list of supported domains
 * @returns {string[]} - Array of domain names
 */
function getSupportedDomains() {
    return Object.keys(configs);
}

module.exports = {
    findConfig,
    getAllConfigs,
    getSupportedDomains,
    configs
};

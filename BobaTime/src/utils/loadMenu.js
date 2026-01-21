const fs = require('fs');
const path = require('path');

/**
 * Load the latest menu snapshot for a shop
 * @param {string} shopSlug - The shop identifier (e.g., 'gongcha')
 * @returns {object|null} - Menu data or null if not found
 */
function loadLatestMenu(shopSlug) {
    const shopDir = path.join(__dirname, '../../data', shopSlug);
    
    if (!fs.existsSync(shopDir)) {
        return null;
    }
    
    // Get all snapshot files
    const files = fs.readdirSync(shopDir)
        .filter(file => file.startsWith('snapshot-') && file.endsWith('.json'))
        .sort()
        .reverse(); // Most recent first
    
    if (files.length === 0) {
        return null;
    }
    
    const latestFile = path.join(shopDir, files[0]);
    const data = fs.readFileSync(latestFile, 'utf-8');
    return JSON.parse(data);
}

/**
 * Load a specific menu snapshot by date
 * @param {string} shopSlug - The shop identifier
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {object|null} - Menu data or null if not found
 */
function loadMenuByDate(shopSlug, date) {
    const shopDir = path.join(__dirname, '../../data', shopSlug);
    const filename = `snapshot-${date}.json`;
    const filepath = path.join(shopDir, filename);
    
    if (!fs.existsSync(filepath)) {
        return null;
    }
    
    const data = fs.readFileSync(filepath, 'utf-8');
    return JSON.parse(data);
}

/**
 * Get all available snapshots for a shop
 * @param {string} shopSlug - The shop identifier
 * @returns {array} - Array of snapshot info objects
 */
function listSnapshots(shopSlug) {
    const shopDir = path.join(__dirname, '../../data', shopSlug);
    
    if (!fs.existsSync(shopDir)) {
        return [];
    }
    
    const files = fs.readdirSync(shopDir)
        .filter(file => file.startsWith('snapshot-') && file.endsWith('.json'))
        .map(file => {
            const date = file.replace('snapshot-', '').replace('.json', '');
            const filepath = path.join(shopDir, file);
            const stats = fs.statSync(filepath);
            
            return {
                date,
                filename: file,
                filepath,
                size: stats.size,
                modified: stats.mtime
            };
        })
        .sort((a, b) => b.date.localeCompare(a.date)); // Most recent first
    
    return files;
}

/**
 * Compare two menu snapshots and return differences
 * @param {object} oldMenu - Older menu data
 * @param {object} newMenu - Newer menu data
 * @returns {object} - Changes object
 */
function compareMenus(oldMenu, newMenu) {
    const changes = {
        added: { series: [], drinks: [] },
        removed: { series: [], drinks: [] },
        modified: { drinks: [] }
    };
    
    if (!oldMenu || !newMenu) {
        return changes;
    }
    
    const oldSeries = Object.keys(oldMenu.series || {});
    const newSeries = Object.keys(newMenu.series || {});
    
    // Find added/removed series
    changes.added.series = newSeries.filter(s => !oldSeries.includes(s));
    changes.removed.series = oldSeries.filter(s => !newSeries.includes(s));
    
    // Compare drinks within each series
    for (const seriesName of newSeries) {
        if (!oldMenu.series[seriesName]) continue;
        
        const oldDrinks = Object.keys(oldMenu.series[seriesName].drinks || {});
        const newDrinks = Object.keys(newMenu.series[seriesName].drinks || {});
        
        // Find added drinks
        for (const drinkName of newDrinks) {
            if (!oldDrinks.includes(drinkName)) {
                changes.added.drinks.push({
                    series: seriesName,
                    name: drinkName,
                    data: newMenu.series[seriesName].drinks[drinkName]
                });
            } else {
                // Check if drink was modified
                const oldDrink = oldMenu.series[seriesName].drinks[drinkName];
                const newDrink = newMenu.series[seriesName].drinks[drinkName];
                
                if (JSON.stringify(oldDrink) !== JSON.stringify(newDrink)) {
                    changes.modified.drinks.push({
                        series: seriesName,
                        name: drinkName,
                        old: oldDrink,
                        new: newDrink
                    });
                }
            }
        }
        
        // Find removed drinks
        for (const drinkName of oldDrinks) {
            if (!newDrinks.includes(drinkName)) {
                changes.removed.drinks.push({
                    series: seriesName,
                    name: drinkName,
                    data: oldMenu.series[seriesName].drinks[drinkName]
                });
            }
        }
    }
    
    return changes;
}

/**
 * Get all available shops (directories in data folder)
 * @returns {array} - Array of shop slugs
 */
function listAvailableShops() {
    const dataDir = path.join(__dirname, '../../data');
    
    if (!fs.existsSync(dataDir)) {
        return [];
    }
    
    return fs.readdirSync(dataDir)
        .filter(item => {
            const itemPath = path.join(dataDir, item);
            return fs.statSync(itemPath).isDirectory() && item !== 'node_modules';
        })
        .sort();
}

module.exports = {
    loadLatestMenu,
    loadMenuByDate,
    listSnapshots,
    compareMenus,
    listAvailableShops
};

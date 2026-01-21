const fs = require('fs');
const path = require('path');

/**
 * Save a menu snapshot to disk
 * @param {string} shopSlug - The shop identifier (e.g., 'gongcha')
 * @param {object} menuData - The normalized menu data to save
 * @returns {string} - The filepath where the snapshot was saved
 */
function saveSnapshot(shopSlug, menuData) {
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const shopDir = path.join(__dirname, '../../data', shopSlug);
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(shopDir)) {
    fs.mkdirSync(shopDir, { recursive: true });
    console.log(`Created directory: ${shopDir}`);
  }
  
  const filename = `snapshot-${date}.json`;
  const filepath = path.join(shopDir, filename);
  
  // Write the snapshot
  try {
    fs.writeFileSync(filepath, JSON.stringify(menuData, null, 2), 'utf-8');
    console.log(`Saved menu snapshot to ${filepath}`);
    return filepath;
  } catch (err) {
    console.error(`Error writing snapshot to ${filepath}:`, err);
    throw err;
  }
}

module.exports = saveSnapshot;
